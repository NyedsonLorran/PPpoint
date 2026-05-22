package com.ppoint.backend.service;

import com.ppoint.backend.domain.AvaliacaoShow;
import com.ppoint.backend.domain.Bebida;
import com.ppoint.backend.domain.Cantor;
import com.ppoint.backend.domain.RegistroExperiencia;
import com.ppoint.backend.dto.RegistrarDiaDTO;
import com.ppoint.backend.dto.RegistroResponseDTO;
import com.ppoint.backend.dto.RetrospectivaBebidaDTO;
import com.ppoint.backend.dto.RetrospectivaBebidaDTO.BebidaRankingDTO;
import com.ppoint.backend.dto.RetrospectivaCantorDTO;
import com.ppoint.backend.dto.RetrospectivaCantorDTO.CantorRankingDTO;
import com.ppoint.backend.dto.RetrospectivaDiasDTO;
import com.ppoint.backend.dto.RetrospectivaAmigosDTO;
import com.ppoint.backend.dto.RetrospectivaAmigosDTO.AmigoRankingDTO;
import com.ppoint.backend.dto.RetrospectivaResumoDTO;
import com.ppoint.backend.dto.RetrospectivaResumoDTO.ShowResumoDTO;
import com.ppoint.backend.dto.RetrospectivaResumoDTO.BebidaResumoDTO;
import com.ppoint.backend.exception.ResourceNotFoundException;
import com.ppoint.backend.repository.AvaliacaoShowRepository;
import com.ppoint.backend.repository.BebidaRepository;
import com.ppoint.backend.repository.CantorRepository;
import com.ppoint.backend.repository.DiaRepository;
import com.ppoint.backend.repository.RegistroExperienciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RegistroService {

    private final RegistroExperienciaRepository registroRepository;
    private final AvaliacaoShowRepository avaliacaoRepository;
    private final DiaRepository diaRepository;
    private final BebidaRepository bebidaRepository;
    private final CantorRepository cantorRepository;

    public RegistroService(RegistroExperienciaRepository registroRepository,
                           AvaliacaoShowRepository avaliacaoRepository,
                           DiaRepository diaRepository,
                           BebidaRepository bebidaRepository,
                           CantorRepository cantorRepository) {
        this.registroRepository = registroRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.diaRepository = diaRepository;
        this.bebidaRepository = bebidaRepository;
        this.cantorRepository = cantorRepository;
    }

    // =========================================================
    // REGISTRAR DIA
    // =========================================================

    @Transactional
    public RegistroResponseDTO registrarDia(UUID userId, RegistrarDiaDTO dto) {
        String diaId = dto.data();
        diaRepository.findByData(LocalDate.parse(diaId, DateTimeFormatter.ISO_LOCAL_DATE))
                .orElseThrow(() -> new ResourceNotFoundException("Dia não encontrado: " + diaId));

        if (registroRepository.existsByUserIdAndDiaId(userId, diaId)) {
            throw new IllegalStateException("Você já registrou esse dia!");
        }

        RegistroExperiencia registro = new RegistroExperiencia();
        registro.setUserId(userId);
        registro.setDiaId(diaId);
        registro.setAcompanhanteInsta(dto.acompanhanteInsta());
        registro.setFotoUrl(dto.fotoBase64());
        registro.setConsumo(dto.consumo());
        registro.setCreatedAt(OffsetDateTime.now());
        registroRepository.save(registro);

        if (dto.avaliacoes() != null) {
            dto.avaliacoes().forEach(av -> {
                AvaliacaoShow avaliacao = new AvaliacaoShow();
                avaliacao.setRegistroId(registro.getId());
                avaliacao.setCantorId(av.cantorId());
                avaliacao.setNota(BigDecimal.valueOf(av.nota()));
                avaliacao.setCreatedAt(OffsetDateTime.now());
                avaliacaoRepository.save(avaliacao);
            });
        }

        return new RegistroResponseDTO(registro.getId(), "Dia registrado com sucesso!");
    }

    // =========================================================
    // RETROSPECTIVA BEBIDAS
    // =========================================================

    public RetrospectivaBebidaDTO getRetrospectivaBebidas(UUID userId) {
        List<RegistroExperiencia> registros = registroRepository.findByUserId(userId);

        Map<String, Integer> totaisPorBebida = new HashMap<>();
        for (RegistroExperiencia reg : registros) {
            if (reg.getConsumo() == null) continue;
            reg.getConsumo().forEach((bebidaId, qtd) ->
                totaisPorBebida.merge(bebidaId, qtd, Integer::sum)
            );
        }

        Map<String, Bebida> bebidaMapa = new HashMap<>();
        if (!totaisPorBebida.isEmpty()) {
            List<UUID> ids = totaisPorBebida.keySet().stream()
                    .map(UUID::fromString).collect(Collectors.toList());
            bebidaRepository.findAllById(ids).forEach(b ->
                bebidaMapa.put(b.getId().toString(), b)
            );
        }

        List<BebidaRankingDTO> top3 = totaisPorBebida.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(e -> {
                    Bebida b = bebidaMapa.get(e.getKey());
                    return new BebidaRankingDTO(
                            e.getKey(),
                            b != null ? b.getNome() : "Bebida",
                            e.getValue(),
                            b != null ? b.getFoto() : null
                    );
                })
                .collect(Collectors.toList());

        double totalMl = totaisPorBebida.entrySet().stream().mapToDouble(e -> {
            Bebida b = bebidaMapa.get(e.getKey());
            double ml = extrairVolumeMl(b != null ? b.getNome() : "");
            return ml * e.getValue();
        }).sum();
        double totalLitros = Math.round((totalMl / 1000.0) * 10.0) / 10.0;

        String fotoTop1 = top3.isEmpty() ? null : top3.get(0).fotoUrl();
        return new RetrospectivaBebidaDTO(top3, totalLitros, fotoTop1);
    }

    // =========================================================
    // RETROSPECTIVA CANTORES
    // =========================================================

    public RetrospectivaCantorDTO getRetrospectivaCantores(UUID userId) {
        List<RegistroExperiencia> registros = registroRepository.findByUserId(userId);

        record AvaliacaoInfo(double nota, OffsetDateTime data) {}
        Map<UUID, AvaliacaoInfo> melhorPorCantor = new HashMap<>();

        for (RegistroExperiencia reg : registros) {
            List<AvaliacaoShow> avaliacoes = avaliacaoRepository.findByRegistroId(reg.getId());
            for (AvaliacaoShow av : avaliacoes) {
                double nota = av.getNota().doubleValue();
                OffsetDateTime data = av.getCreatedAt();
                melhorPorCantor.merge(av.getCantorId(), new AvaliacaoInfo(nota, data), (existing, novo) -> {
                    if (novo.nota() > existing.nota()) return novo;
                    if (novo.nota() == existing.nota() && novo.data() != null && existing.data() != null
                            && novo.data().isAfter(existing.data())) return novo;
                    return existing;
                });
            }
        }

        if (melhorPorCantor.isEmpty()) {
            return new RetrospectivaCantorDTO(List.of(), null);
        }

        Map<UUID, Cantor> cantorMapa = new HashMap<>();
        cantorRepository.findAllById(melhorPorCantor.keySet())
                .forEach(c -> cantorMapa.put(c.getId(), c));

        List<Map.Entry<UUID, AvaliacaoInfo>> comNota5 = melhorPorCantor.entrySet().stream()
                .filter(e -> e.getValue().nota() == 5.0)
                .sorted((a, b) -> {
                    OffsetDateTime da = a.getValue().data();
                    OffsetDateTime db = b.getValue().data();
                    if (da == null && db == null) return 0;
                    if (da == null) return 1;
                    if (db == null) return -1;
                    return db.compareTo(da);
                }).collect(Collectors.toList());

        List<Map.Entry<UUID, AvaliacaoInfo>> semNota5 = melhorPorCantor.entrySet().stream()
                .filter(e -> e.getValue().nota() < 5.0)
                .sorted((a, b) -> Double.compare(b.getValue().nota(), a.getValue().nota()))
                .collect(Collectors.toList());

        List<Map.Entry<UUID, AvaliacaoInfo>> ordenados = new ArrayList<>(comNota5);
        ordenados.addAll(semNota5);

        List<CantorRankingDTO> top5 = ordenados.stream().limit(5)
                .map(e -> {
                    Cantor c = cantorMapa.get(e.getKey());
                    return new CantorRankingDTO(
                            e.getKey().toString(),
                            c != null ? c.getNome() : "Cantor",
                            e.getValue().nota(),
                            c != null ? c.getFoto() : null
                    );
                }).collect(Collectors.toList());

        String fotoTop1 = top5.isEmpty() ? null : top5.get(0).fotoUrl();
        return new RetrospectivaCantorDTO(top5, fotoTop1);
    }

    // =========================================================
    // RETROSPECTIVA DIAS
    // =========================================================

    public RetrospectivaDiasDTO getRetrospectivaDias(UUID userId) {
        List<RegistroExperiencia> registros = registroRepository.findByUserId(userId);

        int totalDias = registros.size();

        // Extrai datas únicas e ordena
        List<LocalDate> datas = registros.stream()
                .map(r -> LocalDate.parse(r.getDiaId(), DateTimeFormatter.ISO_LOCAL_DATE))
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        // Maior sequência consecutiva
        int maiorSequencia = 0;
        int sequenciaAtual = datas.isEmpty() ? 0 : 1;
        for (int i = 1; i < datas.size(); i++) {
            if (datas.get(i).equals(datas.get(i - 1).plusDays(1))) {
                sequenciaAtual++;
            } else {
                maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);
                sequenciaAtual = 1;
            }
        }
        maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);

        // Finais de semana (sábado ou domingo)
        long finaisDeSemana = datas.stream()
                .filter(d -> d.getDayOfWeek() == DayOfWeek.SATURDAY
                          || d.getDayOfWeek() == DayOfWeek.SUNDAY)
                .count();

        return new RetrospectivaDiasDTO(totalDias, maiorSequencia, (int) finaisDeSemana);
    }

    // =========================================================
    // RETROSPECTIVA AMIGOS
    // =========================================================

    public RetrospectivaAmigosDTO getRetrospectivaAmigos(UUID userId) {
        List<RegistroExperiencia> registros = registroRepository.findByUserId(userId);

        // Conta aparições por instagram do acompanhante
        Map<String, Integer> contagemPorInsta = new HashMap<>();
        for (RegistroExperiencia reg : registros) {
            String insta = reg.getAcompanhanteInsta();
            if (insta != null && !insta.isBlank()) {
                String normalizado = insta.trim().toLowerCase().replaceAll("^@", "");
                contagemPorInsta.merge(normalizado, 1, Integer::sum);
            }
        }

        List<AmigoRankingDTO> top3 = contagemPorInsta.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(3)
                .map(e -> new AmigoRankingDTO(e.getKey(), e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return new RetrospectivaAmigosDTO(top3);
    }

    // =========================================================
    // RETROSPECTIVA RESUMO (agrega tudo num único endpoint)
    // =========================================================

    public RetrospectivaResumoDTO getRetrospectivaResumo(UUID userId) {
        // Dias
        RetrospectivaDiasDTO dias = getRetrospectivaDias(userId);

        // Bebida top 1
        RetrospectivaBebidaDTO bebidas = getRetrospectivaBebidas(userId);
        BebidaResumoDTO bebidaTop = null;
        if (!bebidas.top3().isEmpty()) {
            var b = bebidas.top3().get(0);
            bebidaTop = new BebidaResumoDTO(b.nome(), b.quantidade(), b.fotoUrl());
        }

        // Shows top 3
        RetrospectivaCantorDTO cantores = getRetrospectivaCantores(userId);
        List<ShowResumoDTO> topShows = cantores.top5().stream()
                .limit(3)
                .map(c -> new ShowResumoDTO(c.nome(), c.nota()))
                .collect(Collectors.toList());

        // Dupla (acompanhante mais frequente)
        RetrospectivaAmigosDTO amigos = getRetrospectivaAmigos(userId);
        String dupla = amigos.top3().isEmpty() ? null : amigos.top3().get(0).instagram();

        return new RetrospectivaResumoDTO(dias.totalDias(), topShows, bebidaTop, dupla);
    }

    // =========================================================
    // UTILITÁRIOS
    // =========================================================

    private double extrairVolumeMl(String nome) {
        if (nome == null) return 269.0;
        String lower = nome.toLowerCase();

        java.util.regex.Matcher mL = java.util.regex.Pattern
                .compile("([\\d]+(?:[.,]\\d+)?)\\s*l\\b").matcher(lower);
        if (mL.find()) {
            return Double.parseDouble(mL.group(1).replace(",", ".")) * 1000.0;
        }

        java.util.regex.Matcher mMl = java.util.regex.Pattern
                .compile("([\\d]+(?:[.,]\\d+)?)\\s*ml").matcher(lower);
        if (mMl.find()) {
            return Double.parseDouble(mMl.group(1).replace(",", "."));
        }

        return 269.0;
    }
}
