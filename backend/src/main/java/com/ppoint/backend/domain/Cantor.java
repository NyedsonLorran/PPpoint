package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "cantores")
public class Cantor {

    @Id
    private UUID id;

    private String nome;
    private String foto;
}