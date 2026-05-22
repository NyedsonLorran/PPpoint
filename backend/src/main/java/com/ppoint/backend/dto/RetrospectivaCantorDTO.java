package com.ppoint.backend.dto;

import java.util.List;

public record RetrospectivaCantorDTO(
    List<CantorRankingDTO> top5,
    String fotoTop1
) {
    public record CantorRankingDTO(
        String cantorId,
        String nome,
        double nota,
        String fotoUrl
    ) {}
}
