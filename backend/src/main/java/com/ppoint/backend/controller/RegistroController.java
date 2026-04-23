package com.ppoint.backend.controller;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.dto.RegistrarDiaDTO;
import com.ppoint.backend.dto.RegistroResponseDTO;
import com.ppoint.backend.service.RegistroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registros")
public class RegistroController {

    private final RegistroService registroService;

    public RegistroController(RegistroService registroService) {
        this.registroService = registroService;
    }

    /**
     * POST /registros
     * Registra o dia do usuário logado.
     */
    @PostMapping
    public ResponseEntity<?> registrarDia(
            @RequestBody RegistrarDiaDTO dto,
            @AuthenticationPrincipal User usuario) {

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }

        try {
            RegistroResponseDTO resposta = registroService.registrarDia(usuario.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }
}
