package com.ppoint.backend.controller;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.dto.RegistrarDiaDTO;
import com.ppoint.backend.dto.RegistroResponseDTO;
import com.ppoint.backend.dto.RetrospectivaBebidaDTO;
import com.ppoint.backend.dto.RetrospectivaCantorDTO;
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

    /**
     * GET /registros/usuario/bebidas
     * Retorna o top 3 de bebidas mais consumidas e o total de litros do usuário logado.
     * Usado no story de bebidas da retrospectiva.
     */
    @GetMapping("/usuario/bebidas")
    public ResponseEntity<?> getRetrospectivaBebidas(
            @AuthenticationPrincipal User usuario) {

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }

        RetrospectivaBebidaDTO retro = registroService.getRetrospectivaBebidas(usuario.getId());
        return ResponseEntity.ok(retro);
    }

    /**
     * GET /registros/usuario/cantores
     * Retorna o top 3 de cantores mais bem avaliados e a média geral do usuário logado.
     * Usado no story de cantores da retrospectiva.
     */
    @GetMapping("/usuario/cantores")
    public ResponseEntity<?> getRetrospectivaCantores(
            @AuthenticationPrincipal User usuario) {

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");
        }

        RetrospectivaCantorDTO retro = registroService.getRetrospectivaCantores(usuario.getId());
        return ResponseEntity.ok(retro);
    }
}
