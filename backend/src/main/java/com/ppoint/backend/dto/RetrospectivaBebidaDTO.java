package com.ppoint.backend.dto;

import java.util.List;

public record RetrospectivaBebidaDTO(
    List<BebidaRankingDTO> top3,
    double totalLitros,
    String fotoTop1
) {
    public record BebidaRankingDTO(
        String bebidaId,
        String nome,
        int quantidade,
        String fotoUrl
    ) {}
}
