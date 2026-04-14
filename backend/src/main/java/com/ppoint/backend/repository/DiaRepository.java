package com.ppoint.backend.repository;

import com.ppoint.backend.domain.Dia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DiaRepository extends JpaRepository<Dia, String> {
    Optional<Dia> findByData(LocalDate data);
}
