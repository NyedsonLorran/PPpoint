package com.ppoint.backend.repository;

import com.ppoint.backend.domain.RegistroExperiencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RegistroExperienciaRepository extends JpaRepository<RegistroExperiencia, UUID> {
    List<RegistroExperiencia> findByUserId(UUID userId);
    boolean existsByUserIdAndDiaId(UUID userId, String diaId);
}
