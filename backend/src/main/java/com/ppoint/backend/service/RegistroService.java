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
import com.ppoint.backend.exception.ResourceNotFoundException;
import com.ppoint.backend.repository.AvaliacaoShowRepository;
import com.ppoint.backend.repository.BebidaRepository;
import com.ppoint.backend.repository.CantorRepository;
import com.ppoint.backend.repository.DiaRepository;
import com.ppoint.backend.repository.RegistroExperienciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    /**
     * Calcula o top 3 de bebidas mais consumidas pelo usuário e o total de litros.
     * Retorna também a foto da bebida #1 para exibir no story.
     */
    public RetrospectivaBebidaDTO getRetrospectivaBebidas(UUID userId) {
        List<RegistroExperiencia> registros = registroRepository.findByUserId(userId);

        // Soma consumo total por bebidaId
        Map<String, Integer> totaisPorBebida = new HashMap<>();
        for (RegistroExperiencia reg : registros) {
            if (reg.getConsumo() == null) continue;
            reg.getConsumo().forEach((bebidaId, qtd) ->
                totaisPorBebida.merge(bebidaId, qtd, Integer::sum)
            );
        }

        // Busca bebidas no banco (nome + foto)
        Map<String, Bebida> bebidaMapa = new HashMap<>();
        if (!totaisPorBebida.isEmpty()) {
            List<UUID> ids = totaisPorBebida.keySet().stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());
            bebidaRepository.findAllById(ids).forEach(b ->
                bebidaMapa.put(b.getId().toString(), b)
            );
        }

        // Ordena por quantidade e pega top 3
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

        // Total de litros — volume por bebida extraído do nome
        double totalMl = totaisPorBebida.entrySet().stream().mapToDouble(e -> {
            Bebida b = bebidaMapa.get(e.getKey());
            double ml = extrairVolumeMl(b != null ? b.getNome() : "");
            return ml * e.getValue();
        }).sum();
        double totalLitros = Math.round((totalMl / 1000.0) * 10.0) / 10.0;

        // Foto do top 1
        String fotoTop1 = top3.isEmpty() ? null : top3.get(0).fotoUrl();

        return new RetrospectivaBebidaDTO(top3, totalLitros, fotoTop1);
    }

    /**
     * Calcula o top 3 de cantores mais bem avaliados pelo usuário.
     * Usa a média das notas dadas em cada avaliação de show.
     * Retorna também a foto do cantor #1 para exibir no story.
     */
    public RetrospectivaCantorDTO getRetrospectivaCantores(UUID userId) {
        List<RegistroExperiencia> registros = registroRepository.findByUserId(userId);

        // Para cada avaliação, guarda: cantorId -> {nota, createdAt}
        // Mantém apenas a avaliação mais recente por cantor (caso avaliou mais de uma vez)
        record AvaliacaoInfo(double nota, OffsetDateTime data) {}
        Map<UUID, AvaliacaoInfo> melhorPorCantor = new HashMap<>();

        for (RegistroExperiencia reg : registros) {
            List<AvaliacaoShow> avaliacoes = avaliacaoRepository.findByRegistroId(reg.getId());
            for (AvaliacaoShow av : avaliacoes) {
                double nota = av.getNota().doubleValue();
                OffsetDateTime data = av.getCreatedAt();
                melhorPorCantor.merge(av.getCantorId(), new AvaliacaoInfo(nota, data), (existing, novo) -> {
                    // Mantém o de nota maior; em empate, o mais recente
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

        // Busca cantores no banco (nome + foto)
        Map<UUID, Cantor> cantorMapa = new HashMap<>();
        cantorRepository.findAllById(melhorPorCantor.keySet())
                .forEach(c -> cantorMapa.put(c.getId(), c));

        // Separa os que têm nota 5 dos demais
        List<Map.Entry<UUID, AvaliacaoInfo>> comNota5 = melhorPorCantor.entrySet().stream()
                .filter(e -> e.getValue().nota() == 5.0)
                .sorted((a, b) -> {
                    // Mais recentes primeiro
                    OffsetDateTime da = a.getValue().data();
                    OffsetDateTime db = b.getValue().data();
                    if (da == null && db == null) return 0;
                    if (da == null) return 1;
                    if (db == null) return -1;
                    return db.compareTo(da);
                })
                .collect(Collectors.toList());

        List<Map.Entry<UUID, AvaliacaoInfo>> semNota5 = melhorPorCantor.entrySet().stream()
                .filter(e -> e.getValue().nota() < 5.0)
                .sorted((a, b) -> Double.compare(b.getValue().nota(), a.getValue().nota()))
                .collect(Collectors.toList());

        // Junta: nota 5 (mais recentes) primeiro, depois os demais (maior nota)
        List<Map.Entry<UUID, AvaliacaoInfo>> ordenados = new ArrayList<>(comNota5);
        ordenados.addAll(semNota5);

        List<CantorRankingDTO> top5 = ordenados.stream()
                .limit(5)
                .map(e -> {
                    Cantor c = cantorMapa.get(e.getKey());
                    return new CantorRankingDTO(
                            e.getKey().toString(),
                            c != null ? c.getNome() : "Cantor",
                            e.getValue().nota(),
                            c != null ? c.getFoto() : null
                    );
                })
                .collect(Collectors.toList());

        // Foto do top 1
        String fotoTop1 = top5.isEmpty() ? null : top5.get(0).fotoUrl();

        return new RetrospectivaCantorDTO(top5, fotoTop1);
    }

    /**
     * Extrai o volume em ml do nome da bebida.
     * Exemplos: "Beats 1L" -> 1000, "Beats 269ml" -> 269, "Beats Lata" -> 269 (padrão)
     */
    private double extrairVolumeMl(String nome) {
        if (nome == null) return 269.0;
        String lower = nome.toLowerCase();

        // Padrão "XL" ex: 1L, 2L, 0.5L
        java.util.regex.Matcher mL = java.util.regex.Pattern
                .compile("([\\d]+(?:[.,]\\d+)?)\\s*l\\b").matcher(lower);
        if (mL.find()) {
            double litros = Double.parseDouble(mL.group(1).replace(",", "."));
            return litros * 1000.0;
        }

        // Padrão "Xml" ex: 269ml, 350ml
        java.util.regex.Matcher mMl = java.util.regex.Pattern
                .compile("([\\d]+(?:[.,]\\d+)?)\\s*ml").matcher(lower);
        if (mMl.find()) {
            return Double.parseDouble(mMl.group(1).replace(",", "."));
        }

        // Padrão lata genérica
        return 269.0;
    }
}