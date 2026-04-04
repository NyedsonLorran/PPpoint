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

/*Passo a passo para teste:
1 - Registro de novo usuário:
    POST http://localhost:8080/auth/register
    Em Body adicionar:
    {
        "name": "Matheus",
        "email": "matheus@email.com",
        "password": "123456"
    }

    Resposta esperada: 200 ok
    Usuário registrado no banco de dados

2 - Login do usuário:
    POST http://localhost:8080/auth/login

    Resposta esperada: 200 ok junto com token do usuário

3 - GET http://localhost:8080/test
    Em Authorization marcar como Bearer token
    em seguida colar 'token do usuário' no campo de token

    Reposta esperada: API rodando!
*/

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
        String token = authService.login(dto.email(), dto.password());
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }

    @PostMapping("/login/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody GoogleTokenDTO dto) {
        String token = authService.googleAuth(dto.token());
        return ResponseEntity.ok(new AuthResponseDTO(token));
    }
}