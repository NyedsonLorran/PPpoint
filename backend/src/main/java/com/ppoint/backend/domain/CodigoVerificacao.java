package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "codigos_verificacao")
public class CodigoVerificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 6)
    private String codigo;

    @Column(nullable = false, length = 20)
    private String tipo; // "REGISTRO" ou "RESET_SENHA"

    @Column(nullable = false)
    private OffsetDateTime expiracao;

    @Column(nullable = false)
    private boolean usado = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}