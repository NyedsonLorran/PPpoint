package com.ppoint.backend.dto;

import java.util.List;
import java.util.Map;

public record RegistrarDiaDTO(
        String data,                        // "2026-06-06"
        String acompanhanteInsta,           // "@usuario"
        String fotoBase64,                  // base64 da foto
        Map<String, Integer> consumo,       // { "uuid-bebida": quantidade }
        List<AvaliacaoShowDTO> avaliacoes   // [{ cantorId, nota }]
) {}
