package com.ppoint.backend.dto;

import java.time.LocalTime;
import java.util.UUID;

public record ProgramacaoItemDTO(
        UUID cantorId,
        String nome,
        String foto,
        LocalTime horario
) {}
