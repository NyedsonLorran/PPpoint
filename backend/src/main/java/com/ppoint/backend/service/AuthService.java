package com.ppoint.backend.service;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.domain.CodigoVerificacao;
import com.ppoint.backend.exception.EmailAlreadyRegisteredException;
import com.ppoint.backend.exception.InvalidCredentialsException;
import com.ppoint.backend.exception.ResourceNotFoundException;
import com.ppoint.backend.repository.UserRepository;
import com.ppoint.backend.repository.CodigoVerificacaoRepository;

import java.time.OffsetDateTime;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;;

@Service
public class AuthService {

    private final UserRepository repository;
    private final EncryptionService crypto;
    private final JwtService jwtService;
    private final GoogleAuthService googleAuthService;
    private final CodigoVerificacaoRepository codigoVerificacaoRepository;
    private final EmailService emailService;

    public record LoginResult(String token, String role, String nome) {}

    public AuthService(UserRepository repository, EncryptionService crypto, 
        JwtService jwtService, GoogleAuthService googleAuthService,
        CodigoVerificacaoRepository codigoVerificacaoRepository, EmailService emailService) {
        this.repository = repository;
        this.crypto = crypto;
        this.jwtService = jwtService;
        this.googleAuthService = googleAuthService;
        this.codigoVerificacaoRepository = codigoVerificacaoRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void register(String username, String email, String password, String confirmPassword) {

        if (!password.equals(confirmPassword)) {
            throw new InvalidCredentialsException("As senhas não conferem");
        }

        repository.findByEmail(email).ifPresent(u -> {
            if (u.isEmailVerified()) {
                throw new EmailAlreadyRegisteredException("Email já cadastrado");
            }
            // Se Usuário existe mas não verficou pode reenviar
            codigoVerificacaoRepository.invalidarTodos(u.getId(), "REGISTRO");
            gerarEEnviarCodigo(u, "REGISTRO");
            throw new EmailAlreadyRegisteredException("EMAIL_PENDENTE_VERIFICACAO"); 
        });

        User user = new User();
        user.setName(username);
        user.setEmail(email);
        user.setPassword(crypto.encrypt(password));
        user.setRole("USER");
        user.setProvider("LOCAL");
        user.setEmailVerified(false);

        repository.save(user);

        gerarEEnviarCodigo(user, "REGISTRO");
    }

    // Verificar E-mail
    @Transactional
    public LoginResult verificarEmail(String email, String codigoInformado) {
        User user = repository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (user.isEmailVerified()) {
            throw new InvalidCredentialsException("Email já verificado");
        }

        validarCodigo(user.getId(), codigoInformado, "REGISTRO");

        user.setEmailVerified(true);
        repository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResult(token, user.getRole(), user.getName());
    }

    // Login
    public LoginResult login(String email, String password) {
        User user = repository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (!crypto.compare(password, user.getPassword())) {
            throw new InvalidCredentialsException("Senha inválida");
        }

        if (!user.isEmailVerified()) {
            throw new InvalidCredentialsException("EMAIL_NAO_VERIFICADO");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResult(token, user.getRole(), user.getName());
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
        String name = (String) payload.get("name");

        User user = repository.findByEmail(email).map(existing -> {
            // Se já existe, opcional vincular conta
            if (existing.getGoogleId() == null) {
                existing.setGoogleId(googleId);
                existing.setProvider("GOOGLE");
                existing.setName((String) payload.get("name"));
                existing.setEmailVerified(true);
                return repository.save(existing);
            }
            return existing;
            }).orElseGet(()-> {
            // Cadastro automático
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setGoogleId(googleId);
            newUser.setProvider("GOOGLE");
            newUser.setName(name);
            newUser.setRole("USER");
            newUser.setEmailVerified(true);

            return repository.save(newUser);
        });

        String jwtToken = jwtService.generateToken(user.getEmail());
        return new LoginResult(jwtToken, user.getRole(), user.getName());
    }

    // Esqueci senha
    @Transactional
    public void solicitarResetSenha(String email) {
        User user = repository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        // Precisa??
        if ("GOOGLE".equals(user.getProvider())) {
            throw new InvalidCredentialsException("Esta conta usa login com Google");
        }

        codigoVerificacaoRepository.invalidarTodos(user.getId(), "RESET_SENHA");
        gerarEEnviarCodigo(user, "RESET_SENHA");
    }

    public void verificarCodigoReset(String email, String codigoInformado) {
        User user = repository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        CodigoVerificacao codigo = codigoVerificacaoRepository
            .findTopByUserIdAndTipoAndUsadoFalseOrderByExpiracaoDesc(user.getId(), "RESET_SENHA")
            .orElseThrow(() -> new InvalidCredentialsException("Código inválido ou expirado"));

        if (OffsetDateTime.now().isAfter(codigo.getExpiracao())) {
            throw new InvalidCredentialsException("Código expirado");
        }

        if (!codigo.getCodigo().equals(codigoInformado)) {
            throw new InvalidCredentialsException("Código incorreto");
        }
    }

    @Transactional
    public LoginResult redefinirSenha(String email, String codigoInformado, String novaSenha, String confirmarSenha) {
        if (!novaSenha.equals(confirmarSenha)) {
            throw new InvalidCredentialsException("As senhas não conferem");
        }

        if (novaSenha.length() < 6) {
            throw new InvalidCredentialsException("A senha deve ter no mínimo 6 caracteres");
        }

        User user = repository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        validarCodigo(user.getId(), codigoInformado, "RESET_SENHA");

        user.setPassword(crypto.encrypt(novaSenha));
        repository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResult(token, user.getRole(), user.getName());


    }

    // Reenvio de código 
    @Transactional
    public void reenviarCodigo(String email, String tipo) {
        User user = repository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        codigoVerificacaoRepository.invalidarTodos(user.getId(), tipo);
        gerarEEnviarCodigo(user, tipo);
    }

    // Helpers
    private void gerarEEnviarCodigo(User user, String tipo) {
        String codigo = String.format("%06d", new Random().nextInt(999999));

        CodigoVerificacao cv = new CodigoVerificacao();
        cv.setUserId(user.getId());
        cv.setCodigo(codigo);
        cv.setTipo(tipo);
        cv.setExpiracao(OffsetDateTime.now().plusMinutes(15));
        cv.setUsado(false);
        cv.setCreatedAt(OffsetDateTime.now());
        codigoVerificacaoRepository.save(cv);

        if ("REGISTRO".equals(tipo)) {
            emailService.enviarCodigoConfirmacao(user.getEmail(), codigo);
        } else {
            emailService.enviarCodigoResetSenha(user.getEmail(), codigo);
        }
            
    }

    private void validarCodigo(UUID userId, String codigoInformado, String tipo) {
        CodigoVerificacao codigo = codigoVerificacaoRepository
                                    .findTopByUserIdAndTipoAndUsadoFalseOrderByExpiracaoDesc(userId, tipo)
                                    .orElseThrow(() -> new InvalidCredentialsException("Código inválido"));
        
        if (OffsetDateTime.now().isAfter(codigo.getExpiracao())) {
            throw new InvalidCredentialsException("Código expirado");
        }

        if (!codigo.getCodigo().equals(codigoInformado)) {
            throw new InvalidCredentialsException("Código incorreto");
        }

        codigo.setUsado(true);
        codigoVerificacaoRepository.save(codigo);
    }
    
}