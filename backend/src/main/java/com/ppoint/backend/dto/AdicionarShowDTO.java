package com.ppoint.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Payload para adicionar um novo show a um dia.
 * data      → Data do dia (yyyy-MM-dd).
 * cantorId  → UUID do cantor existente (opcional; usa nomeCantor se null).
 * nomeCantor→ Nome do cantor (usado para criar cantor se cantorId for null).
 * horario   → Horário do show (HH:mm).
 */
public record AdicionarShowDTO(
        LocalDate data,
        UUID cantorId,
        String nomeCantor,
        LocalTime horario
) {}
