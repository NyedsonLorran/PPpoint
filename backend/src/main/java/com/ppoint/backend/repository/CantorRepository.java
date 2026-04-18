package com.ppoint.backend.repository;

import com.ppoint.backend.domain.Cantor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface CantorRepository extends JpaRepository<Cantor, UUID> {
    Optional<Cantor> findByNomeIgnoreCase(String nome);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE Cantor c SET c.nome = :nome WHERE c.id = :id")
    int updateNome(@Param("id") UUID id, @Param("nome") String nome);
}