package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "programacao")
public class Programacao {

    @Id
    private UUID id;

    @Column(name = "dia_id")
    private String diaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cantor_id")
    private Cantor cantor;

    private LocalTime horario;
}