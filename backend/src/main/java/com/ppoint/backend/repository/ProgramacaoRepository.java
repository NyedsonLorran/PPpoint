package com.ppoint.backend.repository;

import com.ppoint.backend.domain.Programacao;
import com.ppoint.backend.dto.ProgramacaoItemDTO;
import com.ppoint.backend.dto.ProgramacaoItemComIdDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ProgramacaoRepository extends JpaRepository<Programacao, UUID> {

    /**
     * Busca programação de uma data, retornando cantor e horário.
     */
    @Query("""
            SELECT new com.ppoint.backend.dto.ProgramacaoItemDTO(
                p.cantor.id,
                p.cantor.nome,
                p.cantor.foto,
                p.horario
            )
            FROM Programacao p
            JOIN Dia d ON d.id = p.diaId
            WHERE d.data = :data
            ORDER BY p.horario ASC
            """)
    List<ProgramacaoItemDTO> findProgramacaoPorData(@Param("data") LocalDate data);

    /**
     * Mesmo que acima, mas inclui o ID do item de programação (para o admin editar).
     */
    @Query("""
            SELECT new com.ppoint.backend.dto.ProgramacaoItemComIdDTO(
                p.id,
                p.cantor.id,
                p.cantor.nome,
                p.cantor.foto,
                p.horario
            )
            FROM Programacao p
            JOIN Dia d ON d.id = p.diaId
            WHERE d.data = :data
            ORDER BY p.horario ASC
            """)
    List<ProgramacaoItemComIdDTO> findProgramacaoComIdPorData(@Param("data") LocalDate data);

    /**
     * Busca todos os dias que têm programação, ordenados por data.
     */
    @Query("""
            SELECT DISTINCT d.data
            FROM Programacao p
            JOIN Dia d ON d.id = p.diaId
            ORDER BY d.data ASC
            """)
    List<LocalDate> findDiasComProgramacao();
}
