package com.ppoint.backend.controller;

import com.ppoint.backend.dto.AuthResponseDTO;
import com.ppoint.backend.dto.GoogleTokenDTO;
import com.ppoint.backend.service.AuthService;
import com.ppoint.backend.dto.LoginDTO;
import com.ppoint.backend.dto.RegisterDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public  AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid  @RequestBody RegisterDTO dto) {
        authService.register(dto.username(), dto.email(), dto.password(), dto.confirmPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário criado com sucesso");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO dto) {
        AuthService.LoginResult result = authService.login(dto.email(), dto.password());
        return ResponseEntity.ok(new AuthResponseDTO(result.token(), result.role()));
    }

    @PostMapping("/login/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody GoogleTokenDTO dto) {
        AuthService.LoginResult result = authService.googleAuth(dto.token());
        return ResponseEntity.ok(new AuthResponseDTO(result.token(), result.role()));
    }
}