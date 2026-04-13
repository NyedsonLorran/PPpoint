package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String email;
    private String password;
    private String role;
    private String instagramUser;
    private String provider;
    private String googleId;
}