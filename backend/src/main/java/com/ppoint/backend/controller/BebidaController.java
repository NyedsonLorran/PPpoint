package com.ppoint.backend.controller;

import com.ppoint.backend.dto.BebidaDTO;
import com.ppoint.backend.dto.CategoriaBebidaDTO;
import com.ppoint.backend.repository.CategoriaBebidaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bebidas")
public class BebidaController {

    private final CategoriaBebidaRepository categoriaRepository;

    public BebidaController(CategoriaBebidaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    /**
     * GET /bebidas
     * Retorna todas as categorias com suas bebidas — endpoint público.
     */
    @GetMapping
    public ResponseEntity<List<CategoriaBebidaDTO>> getBebidas() {
        List<CategoriaBebidaDTO> resultado = categoriaRepository.findAll().stream()
                .map(cat -> new CategoriaBebidaDTO(
                        cat.getId(),
                        cat.getNome(),
                        cat.getBebidas().stream()
                                .map(b -> new BebidaDTO(b.getId(), b.getNome()))
                                .toList()
                ))
                .toList();

        return ResponseEntity.ok(resultado);
    }
}
