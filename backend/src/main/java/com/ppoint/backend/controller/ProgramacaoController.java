package com.ppoint.backend.controller;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.dto.AdicionarShowDTO;
import com.ppoint.backend.dto.EditarShowDTO;
import com.ppoint.backend.dto.ProgramacaoItemComIdDTO;
import com.ppoint.backend.dto.ProgramacaoItemDTO;
import com.ppoint.backend.repository.ProgramacaoRepository;
import com.ppoint.backend.service.ProgramacaoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/programacao")
public class ProgramacaoController {

    private final ProgramacaoService programacaoService;
    private final ProgramacaoRepository programacaoRepository;

    public ProgramacaoController(ProgramacaoService programacaoService,
                                  ProgramacaoRepository programacaoRepository) {
        this.programacaoService = programacaoService;
        this.programacaoRepository = programacaoRepository;
    }

    // ─── Endpoints públicos ─────────────────────────────────────────────────────

    /**
     * GET /programacao?data=2026-06-03
     * Retorna cantores e horários de um dia (sem ID — uso público).
     */
    @GetMapping
    public ResponseEntity<List<ProgramacaoItemDTO>> getProgramacao(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(programacaoService.getProgramacaoPorData(data));
    }

    /**
     * GET /programacao/dias
     * Retorna todos os dias que têm programação cadastrada.
     */
    @GetMapping("/dias")
    public ResponseEntity<List<LocalDate>> getDiasComProgramacao() {
        return ResponseEntity.ok(programacaoService.getDiasComProgramacao());
    }

    // ─── Endpoints exclusivos ADMIN ─────────────────────────────────────────────

    /**
     * GET /programacao/admin?data=2026-06-03
     * Igual ao GET público, mas inclui o programacaoId em cada item.
     * Requer role ADMIN.
     */
    @GetMapping("/admin")
    public ResponseEntity<List<ProgramacaoItemComIdDTO>> getProgramacaoAdmin(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @AuthenticationPrincipal User usuario) {

        verificarAdmin(usuario);
        return ResponseEntity.ok(programacaoRepository.findProgramacaoComIdPorData(data));
    }

    /**
     * PUT /programacao/admin/{id}
     * Edita cantor e/ou horário de um show existente.
     * Requer role ADMIN.
     */
    @PutMapping("/admin/{id}")
    public ResponseEntity<ProgramacaoItemDTO> editarShow(
            @PathVariable UUID id,
            @RequestBody EditarShowDTO dto,
            @AuthenticationPrincipal User usuario) {

        verificarAdmin(usuario);
        return ResponseEntity.ok(programacaoService.editarShow(id, dto));
    }

    /**
     * POST /programacao/admin
     * Adiciona um novo show a um dia.
     * Requer role ADMIN.
     */
    @PostMapping("/admin")
    public ResponseEntity<ProgramacaoItemDTO> adicionarShow(
            @RequestBody AdicionarShowDTO dto,
            @AuthenticationPrincipal User usuario) {

        verificarAdmin(usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(programacaoService.adicionarShow(dto));
    }

    /**
     * DELETE /programacao/admin/{id}
     * Remove um show da programação.
     * Requer role ADMIN.
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> removerShow(
            @PathVariable UUID id,
            @AuthenticationPrincipal User usuario) {

        verificarAdmin(usuario);
        programacaoService.removerShow(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private void verificarAdmin(User usuario) {
        if (usuario == null || !"ADMIN".equals(usuario.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito a administradores");
        }
    }
}
