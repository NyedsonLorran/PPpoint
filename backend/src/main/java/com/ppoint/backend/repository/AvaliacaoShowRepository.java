package com.ppoint.backend.repository;

import com.ppoint.backend.domain.AvaliacaoShow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AvaliacaoShowRepository extends JpaRepository<AvaliacaoShow, UUID> {
    List<AvaliacaoShow> findByRegistroId(UUID registroId);
}
