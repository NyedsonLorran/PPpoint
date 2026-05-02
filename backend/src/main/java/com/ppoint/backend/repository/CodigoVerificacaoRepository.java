package com.ppoint.backend.repository;

import com.ppoint.backend.domain.CodigoVerificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface CodigoVerificacaoRepository extends JpaRepository<CodigoVerificacao, UUID> {

    Optional<CodigoVerificacao> findTopByUserIdAndTipoAndUsadoFalseOrderByExpiracaoDesc(
            UUID userId, String tipo);

    @Modifying
    @Transactional
    @Query("UPDATE CodigoVerificacao c SET c.usado = true WHERE c.userId = :userId AND c.tipo = :tipo")
    void invalidarTodos(@Param("userId") UUID userId, @Param("tipo") String tipo);
}