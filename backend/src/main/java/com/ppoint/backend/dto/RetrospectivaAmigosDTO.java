package com.ppoint.backend.dto;

import java.util.List;

public record RetrospectivaAmigosDTO(
    List<AmigoRankingDTO> top3
) {
    public record AmigoRankingDTO(
        String instagram,
        String nome,
        int aparicoes
    ) {}
}
