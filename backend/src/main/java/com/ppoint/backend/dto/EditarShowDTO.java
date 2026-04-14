package com.ppoint.backend.dto;

import java.time.LocalTime;
import java.util.UUID;

/**
 * Payload recebido pelo admin ao editar um item da programação.
 * cantorId  → UUID do cantor já existente na tabela cantores.
 * nomeCantor→ Se cantorId for null, cria/busca cantor pelo nome.
 * horario   → Novo horário do show (HH:mm).
 */
public record EditarShowDTO(
        UUID cantorId,
        String nomeCantor,
        LocalTime horario
) {}
