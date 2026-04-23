package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "avaliacoes_shows")
public class AvaliacaoShow {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "registro_id", nullable = false)
    private UUID registroId;

    @Column(name = "cantor_id", nullable = false)
    private UUID cantorId;

    @Column(precision = 3, scale = 1)
    private BigDecimal nota;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
