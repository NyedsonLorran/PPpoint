package com.ppoint.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaDTO(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6, max = 6) String codigo,
        @NotBlank @Size(min = 6) String novaSenha,
        @NotBlank String confirmarSenha
) {}