package com.ppoint.backend.controller;

import com.ppoint.backend.dto.ProgramacaoItemDTO;
import com.ppoint.backend.service.ProgramacaoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/programacao")
public class ProgramacaoController {

    private final ProgramacaoService programacaoService;

    public ProgramacaoController(ProgramacaoService programacaoService) {
        this.programacaoService = programacaoService;
    }

    /**
     * GET /programacao?data=2026-06-03
     * Retorna cantores e horários de um dia específico.
     */
    @GetMapping
    public ResponseEntity<List<ProgramacaoItemDTO>> getProgramacao(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        List<ProgramacaoItemDTO> resultado = programacaoService.getProgramacaoPorData(data);
        return ResponseEntity.ok(resultado);
    }

    /**
     * GET /programacao/dias
     * Retorna todos os dias que têm programação cadastrada.
     */
    @GetMapping("/dias")
    public ResponseEntity<List<LocalDate>> getDiasComProgramacao() {
        return ResponseEntity.ok(programacaoService.getDiasComProgramacao());
    }
}
