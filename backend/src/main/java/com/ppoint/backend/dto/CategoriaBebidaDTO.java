package com.ppoint.backend.dto;

import java.util.List;
import java.util.UUID;

public record CategoriaBebidaDTO(UUID id, String nome, List<BebidaDTO> bebidas) {}
