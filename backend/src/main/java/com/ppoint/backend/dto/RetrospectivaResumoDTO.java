package com.ppoint.backend.dto;

import java.util.List;

public record RetrospectivaResumoDTO(
    int totalDias,
    List<ShowResumoDTO> topShows,
    BebidaResumoDTO bebidaTop,
    String dupla
) {
    public record ShowResumoDTO(
        String nome,
        double nota
    ) {}

    public record BebidaResumoDTO(
        String nome,
        int quantidade,
        String fotoUrl
    ) {}
}
