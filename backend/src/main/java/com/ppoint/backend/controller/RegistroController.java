package com.ppoint.backend.controller;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.dto.RegistrarDiaDTO;
import com.ppoint.backend.dto.RegistroResponseDTO;
import com.ppoint.backend.dto.RetrospectivaBebidaDTO;
import com.ppoint.backend.dto.RetrospectivaCantorDTO;
import com.ppoint.backend.dto.RetrospectivaDiasDTO;
import com.ppoint.backend.dto.RetrospectivaAmigosDTO;
import com.ppoint.backend.dto.RetrospectivaResumoDTO;
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

    /** POST /registros — registra o dia do usuário logado. */
    @PostMapping
    public ResponseEntity<?> registrarDia(
            @RequestBody RegistrarDiaDTO dto,
            @AuthenticationPrincipal User usuario) {

        if (usuario == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");

        try {
            RegistroResponseDTO resposta = registroService.registrarDia(usuario.getId(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    /** GET /registros/usuario/bebidas — top 3 bebidas + total de litros da #1. */
    @GetMapping("/usuario/bebidas")
    public ResponseEntity<?> getRetrospectivaBebidas(
            @AuthenticationPrincipal User usuario) {

        if (usuario == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");

        RetrospectivaBebidaDTO retro = registroService.getRetrospectivaBebidas(usuario.getId());
        return ResponseEntity.ok(retro);
    }

    /** GET /registros/usuario/cantores — top 5 cantores mais bem avaliados. */
    @GetMapping("/usuario/cantores")
    public ResponseEntity<?> getRetrospectivaCantores(
            @AuthenticationPrincipal User usuario) {

        if (usuario == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");

        RetrospectivaCantorDTO retro = registroService.getRetrospectivaCantores(usuario.getId());
        return ResponseEntity.ok(retro);
    }

    /** GET /registros/usuario/dias — total de dias, maior sequência e finais de semana. */
    @GetMapping("/usuario/dias")
    public ResponseEntity<?> getRetrospectivaDias(
            @AuthenticationPrincipal User usuario) {

        if (usuario == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");

        RetrospectivaDiasDTO retro = registroService.getRetrospectivaDias(usuario.getId());
        return ResponseEntity.ok(retro);
    }

    /** GET /registros/usuario/amigos — top 3 acompanhantes mais frequentes. */
    @GetMapping("/usuario/amigos")
    public ResponseEntity<?> getRetrospectivaAmigos(
            @AuthenticationPrincipal User usuario) {

        if (usuario == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");

        RetrospectivaAmigosDTO retro = registroService.getRetrospectivaAmigos(usuario.getId());
        return ResponseEntity.ok(retro);
    }

    /** GET /registros/usuario/resumo — resumão geral para o slide de resumo. */
    @GetMapping("/usuario/resumo")
    public ResponseEntity<?> getRetrospectivaResumo(
            @AuthenticationPrincipal User usuario) {

        if (usuario == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado");

        RetrospectivaResumoDTO retro = registroService.getRetrospectivaResumo(usuario.getId());
        return ResponseEntity.ok(retro);
    }
}