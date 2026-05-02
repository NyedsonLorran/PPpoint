package com.ppoint.backend.controller;

import com.ppoint.backend.dto.AuthResponseDTO;
import com.ppoint.backend.dto.GoogleTokenDTO;
import com.ppoint.backend.service.AuthService;
import com.ppoint.backend.dto.LoginDTO;
import com.ppoint.backend.dto.RegisterDTO;
import com.ppoint.backend.dto.EsqueciSenhaDTO;
import com.ppoint.backend.dto.RedefinirSenhaDTO;
import com.ppoint.backend.dto.VerificarCodigoDTO;
import com.ppoint.backend.exception.EmailAlreadyRegisteredException;
import com.ppoint.backend.exception.InvalidCredentialsException;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;






@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public  AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid  @RequestBody RegisterDTO dto) {
        try {
            authService.register(dto.username(), dto.email(), dto.email(), dto.confirmPassword());
            return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("message", "Código de verificação enviado para " + dto.email()));
        } catch (EmailAlreadyRegisteredException e) {
            if ("EMAIL_PENDENTE_VERIFICACAO".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.ACCEPTED)
                        .body(Map.of("message", "Código reenviado para " + dto.email(), "pendente", true));

            }
            
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/email-verification")
    public ResponseEntity<AuthResponseDTO> verificarEmail(@Valid @RequestBody VerificarCodigoDTO dto) {
        AuthService.LoginResult result = authService.verificarEmail(dto.email(), dto.codigo());
        return ResponseEntity.ok(new AuthResponseDTO(result.token(), result.role()));
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> reenviarCodigo(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String tipo = body.getOrDefault("tipo", "REGISTRO");
        authService.reenviarCodigo(email, tipo);
        return ResponseEntity.ok(Map.of("message", "Código reenviado com sucesso"));
    }
        

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO dto) {
        try {
            AuthService.LoginResult result = authService.login(dto.email(), dto.password());
            return ResponseEntity.ok(new AuthResponseDTO(result.token(), result.role())); 
        } catch (InvalidCredentialsException e) {
            if ("EMAIL_NAO_VERIFICADO".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "EMAIL_NAO_VERIFICADO", "email", dto.email()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody GoogleTokenDTO dto) {
        AuthService.LoginResult result = authService.googleAuth(dto.token());
        return ResponseEntity.ok(new AuthResponseDTO(result.token(), result.role()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> esqueciSenha(@Valid @RequestBody EsqueciSenhaDTO dto) {
        authService.solicitarResetSenha(dto.email());
        return ResponseEntity.ok(Map.of("message", "Código enviado para " + dto.email()));
    }

    @PostMapping("/check-reset")
    public ResponseEntity<?> verificarReset(@Valid @RequestBody VerificarCodigoDTO dto) {
        authService.verificarCodigoReset(dto.email(), dto.codigo());
        return ResponseEntity.ok(Map.of("message", "Código válido"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponseDTO> redefinirSenha(@Valid @RequestBody RedefinirSenhaDTO dto) {
        AuthService.LoginResult result = authService.redefinirSenha(
                dto.email(), dto.codigo(), dto.novaSenha(), dto.confirmarSenha());
        return ResponseEntity.ok(new AuthResponseDTO(result.token(), result.role()));
    }
}