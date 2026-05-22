package com.ppoint.backend.repository;

import com.ppoint.backend.domain.Bebida;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BebidaRepository extends JpaRepository<Bebida, UUID> {
}
