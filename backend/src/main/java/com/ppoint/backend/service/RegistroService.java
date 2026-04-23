package com.ppoint.backend.service;

import com.ppoint.backend.domain.AvaliacaoShow;
import com.ppoint.backend.domain.RegistroExperiencia;
import com.ppoint.backend.dto.RegistrarDiaDTO;
import com.ppoint.backend.dto.RegistroResponseDTO;
import com.ppoint.backend.exception.ResourceNotFoundException;
import com.ppoint.backend.repository.AvaliacaoShowRepository;
import com.ppoint.backend.repository.DiaRepository;
import com.ppoint.backend.repository.RegistroExperienciaRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class RegistroService {

    private final RegistroExperienciaRepository registroRepository;
    private final AvaliacaoShowRepository avaliacaoRepository;
    private final DiaRepository diaRepository;

    public RegistroService(RegistroExperienciaRepository registroRepository,
                           AvaliacaoShowRepository avaliacaoRepository,
                           DiaRepository diaRepository) {
        this.registroRepository = registroRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.diaRepository = diaRepository;
    }

    @Transactional
    public RegistroResponseDTO registrarDia(UUID userId, RegistrarDiaDTO dto) {
        // Valida se o dia existe
        String diaId = dto.data();
        diaRepository.findByData(LocalDate.parse(diaId, DateTimeFormatter.ISO_LOCAL_DATE))
                .orElseThrow(() -> new ResourceNotFoundException("Dia não encontrado: " + diaId));

        // Impede registro duplicado no mesmo dia
        if (registroRepository.existsByUserIdAndDiaId(userId, diaId)) {
            throw new IllegalStateException("Você já registrou esse dia!");
        }

        // Salva o registro principal
        RegistroExperiencia registro = new RegistroExperiencia();
        registro.setUserId(userId);
        registro.setDiaId(diaId);
        registro.setAcompanhanteInsta(dto.acompanhanteInsta());
        registro.setFotoUrl(dto.fotoBase64()); // por enquanto salva base64, depois pode virar URL de storage
        registro.setConsumo(dto.consumo());
        registro.setCreatedAt(OffsetDateTime.now());
        registroRepository.save(registro);

        // Salva avaliações dos shows
        if (dto.avaliacoes() != null) {
            dto.avaliacoes().forEach(av -> {
                AvaliacaoShow avaliacao = new AvaliacaoShow();
                avaliacao.setRegistroId(registro.getId());
                avaliacao.setCantorId(av.cantorId());
                avaliacao.setNota(BigDecimal.valueOf(av.nota())); // salva valor exato (0, 0.5, 1, 1.5 ... 5)
                avaliacao.setCreatedAt(OffsetDateTime.now());
                avaliacaoRepository.save(avaliacao);
            });
        }

        return new RegistroResponseDTO(registro.getId(), "Dia registrado com sucesso!");
    }
}
