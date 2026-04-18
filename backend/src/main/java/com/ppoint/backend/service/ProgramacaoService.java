package com.ppoint.backend.service;

import com.ppoint.backend.domain.Cantor;
import com.ppoint.backend.domain.Dia;
import com.ppoint.backend.domain.Programacao;
import com.ppoint.backend.dto.AdicionarShowDTO;
import com.ppoint.backend.dto.EditarShowDTO;
import com.ppoint.backend.dto.ProgramacaoItemDTO;
import com.ppoint.backend.exception.ResourceNotFoundException;
import com.ppoint.backend.repository.CantorRepository;
import com.ppoint.backend.repository.DiaRepository;
import com.ppoint.backend.repository.ProgramacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class ProgramacaoService {

    private final ProgramacaoRepository programacaoRepository;
    private final CantorRepository cantorRepository;
    private final DiaRepository diaRepository;

    public ProgramacaoService(ProgramacaoRepository programacaoRepository,
                               CantorRepository cantorRepository,
                               DiaRepository diaRepository) {
        this.programacaoRepository = programacaoRepository;
        this.cantorRepository = cantorRepository;
        this.diaRepository = diaRepository;
    }

    // ─── Leitura ───────────────────────────────────────────────────────────────

    public List<ProgramacaoItemDTO> getProgramacaoPorData(LocalDate data) {
        return programacaoRepository.findProgramacaoPorData(data);
    }

    public List<LocalDate> getDiasComProgramacao() {
        return programacaoRepository.findDiasComProgramacao();
    }

    // ─── Edição (somente ADMIN) ─────────────────────────────────────────────────

    @Transactional
    public ProgramacaoItemDTO editarShow(UUID programacaoId, EditarShowDTO dto) {
        Programacao prog = programacaoRepository.findById(programacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de programação não encontrado"));

        UUID cantorId = dto.cantorId() != null ? dto.cantorId() : prog.getCantor().getId();

        if (dto.nomeCantor() != null && !dto.nomeCantor().isBlank()) {
            cantorRepository.updateNome(cantorId, dto.nomeCantor());
        }

        if (dto.horario() != null) {
            prog.setHorario(dto.horario());
            programacaoRepository.save(prog);
        }

        Cantor cantor = cantorRepository.findById(cantorId)
                .orElseThrow(() -> new ResourceNotFoundException("Cantor não encontrado"));

        return new ProgramacaoItemDTO(
                cantor.getId(),
                cantor.getNome(),
                cantor.getFoto(),
                prog.getHorario()
        );
    }

    @Transactional
    public ProgramacaoItemDTO adicionarShow(AdicionarShowDTO dto) {
        Dia dia = diaRepository.findByData(dto.data())
                .orElseGet(() -> {
                    Dia novo = new Dia();
                    novo.setId(dto.data().format(DateTimeFormatter.ISO_LOCAL_DATE));
                    novo.setData(dto.data());
                    return diaRepository.save(novo);
                });

        Cantor cantor;
        if (dto.cantorId() != null) {
            cantor = cantorRepository.findById(dto.cantorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cantor não encontrado"));
        } else {
            cantor = new Cantor();
            cantor.setId(UUID.randomUUID());
            cantor.setNome(dto.nomeCantor());
            cantorRepository.save(cantor);
        }

        Programacao prog = new Programacao();
        prog.setId(UUID.randomUUID());
        prog.setDiaId(dia.getId());
        prog.setCantor(cantor);
        prog.setHorario(dto.horario());
        programacaoRepository.save(prog);

        return new ProgramacaoItemDTO(
                cantor.getId(), cantor.getNome(), cantor.getFoto(), prog.getHorario());
    }

    /**
     * Remove show e o cantor vinculado.
     * Usa query direta para buscar o cantorId sem precisar do LAZY load.
     */
    @Transactional
    public void removerShow(UUID programacaoId) {
        // Busca o cantorId via query direta — evita LazyInitializationException
        UUID cantorId = programacaoRepository.findCantorIdByProgramacaoId(programacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de programação não encontrado"));

        programacaoRepository.deleteById(programacaoId);
        programacaoRepository.flush();

        cantorRepository.deleteById(cantorId);
    }
}