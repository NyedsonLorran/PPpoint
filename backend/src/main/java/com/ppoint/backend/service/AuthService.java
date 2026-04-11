package com.ppoint.backend.service;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.exception.EmailAlreadyRegisteredException;
import com.ppoint.backend.exception.InvalidCredentialsException;
import com.ppoint.backend.exception.ResourceNotFoundException;
import com.ppoint.backend.repository.UserRepository;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository repository;
    private final EncryptionService crypto;
    private final JwtService jwtService;
    private final GoogleAuthService googleAuthService;

    public record LoginResult(String token, String role) {}

    public AuthService(UserRepository repository, EncryptionService crypto, JwtService jwtService, GoogleAuthService googleAuthService) {
        this.repository = repository;
        this.crypto = crypto;
        this.jwtService = jwtService;
        this.googleAuthService = googleAuthService;
    }

    public void register(String username, String email, String password, String confirmPassword) {

        if (!password.equals(confirmPassword)) {
            throw new InvalidCredentialsException("As senhas não conferem");
        }

        if (repository.findByEmail(email).isPresent()) {
            throw new EmailAlreadyRegisteredException("Email já cadastrado");
        }

        User user = new User();
        user.setInstagramUser(username);
        user.setEmail(email);
        user.setPassword(crypto.encrypt(password));
        user.setRole("USER");
        user.setProvider("LOCAL");

        repository.save(user);
    }

    public LoginResult login(String email, String password) {
        User user = repository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (!crypto.compare(password, user.getPassword())) {
            throw new InvalidCredentialsException("Senha inválida");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResult(token, user.getRole());
    }

    public LoginResult googleAuth(String token) {
        var payload = googleAuthService.verify(token);

        if (payload == null) {
            throw new InvalidCredentialsException("Token do Google inválido");
        }

        if (!payload.getEmailVerified()) {
            throw new InvalidCredentialsException("Email do Google não verificado");
        }

        String email = payload.getEmail();
        String googleId = payload.getSubject();

        User user = repository.findByEmail(email).map(existing -> {
            // Se já existe, opcional vincular conta
            if (existing.getGoogleId() == null) {
                existing.setGoogleId(googleId);
                existing.setProvider("GOOGLE");
                return repository.save(existing);
            }
            return existing;
            }).orElseGet(()-> {
            // Cadastro automático
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setGoogleId(googleId);
            newUser.setProvider("GOOGLE");
            newUser.setRole("USER");

            return repository.save(newUser);
        });

        String jwtToken = jwtService.generateToken(user.getEmail());
        return new LoginResult(jwtToken, user.getRole());
    }
}