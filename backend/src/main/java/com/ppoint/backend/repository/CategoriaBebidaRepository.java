package com.ppoint.backend.repository;

import com.ppoint.backend.domain.CategoriaBebida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoriaBebidaRepository extends JpaRepository<CategoriaBebida, UUID> {
}
