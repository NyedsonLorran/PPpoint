package com.ppoint.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

<<<<<<< HEAD
=======
    private String instagramUser;

>>>>>>> 89d02faa47ea58d9d92b6fd3ec2f5080c49b8064
    @Column(unique = true)
    private String email;
    private String password;
    private String role;
<<<<<<< HEAD
    private String instagramUser;
    private String provider;
    private String googleId;

    // GETTERS E SETTERS ↓↓↓

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getInstagramUser() {
        return instagramUser;
    }

    public void setInstagramUser(String instagramUser) {
        this.instagramUser = instagramUser;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }
=======
    private String provider;
    private String googleId;
    private String picture;

>>>>>>> 89d02faa47ea58d9d92b6fd3ec2f5080c49b8064
}