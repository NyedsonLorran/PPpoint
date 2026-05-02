package com.ppoint.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaDTO(
        @Email @NotBlank String email
) {}