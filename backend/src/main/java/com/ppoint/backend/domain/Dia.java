package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "dias")
@Getter
@Setter
public class Dia {

    @Id
    private String id; 

    @Column(nullable = false)
    private LocalDate data;
}