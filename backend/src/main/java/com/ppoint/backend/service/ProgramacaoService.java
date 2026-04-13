package com.ppoint.backend.service;

import com.ppoint.backend.dto.ProgramacaoItemDTO;
import com.ppoint.backend.repository.ProgramacaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProgramacaoService {

    private final ProgramacaoRepository programacaoRepository;

    public ProgramacaoService(ProgramacaoRepository programacaoRepository) {
        this.programacaoRepository = programacaoRepository;
    }

    /**
     * Retorna a lista de cantores e horários para a data informada.
     */
    public List<ProgramacaoItemDTO> getProgramacaoPorData(LocalDate data) {
        return programacaoRepository.findProgramacaoPorData(data);
    }

    /**
     * Retorna todos os dias que possuem programação cadastrada.
     */
    public List<LocalDate> getDiasComProgramacao() {
        return programacaoRepository.findDiasComProgramacao();
    }
}
