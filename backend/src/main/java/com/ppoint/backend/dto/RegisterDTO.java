package com.ppoint.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record RegisterDTO(
<<<<<<< HEAD
=======
        String name,
>>>>>>> 89d02faa47ea58d9d92b6fd3ec2f5080c49b8064

        @Email(message = "Email inválido")
        @NotBlank(message = "Email é obrigatório")
        String email,

<<<<<<< HEAD
        @NotBlank(message = "Usuário é obrigatório")
        String username,

        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        @NotBlank(message = "Senha é obrigatória")
        String password,

        @NotBlank(message = "Confirmar senha é obrigatório")
        String confirmPassword
=======
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        @NotBlank(message = "Senha é obrigatória")
        String password
>>>>>>> 89d02faa47ea58d9d92b6fd3ec2f5080c49b8064
) {}