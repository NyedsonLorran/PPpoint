package com.ppoint.backend.dto;

import java.time.LocalTime;
import java.util.UUID;

/**
 * Igual ao ProgramacaoItemDTO, mas inclui o ID do item de programação.
 * Usado pelo painel admin para identificar qual show está sendo editado.
 */
public record ProgramacaoItemComIdDTO(
        UUID programacaoId,
        UUID cantorId,
        String nome,
        String foto,
        LocalTime horario
) {}
