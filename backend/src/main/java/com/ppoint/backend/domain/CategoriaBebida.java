package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "categorias_bebida")
public class CategoriaBebida {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String nome;

    @OneToMany(mappedBy = "categoria", fetch = FetchType.EAGER)
    private List<Bebida> bebidas;
}
