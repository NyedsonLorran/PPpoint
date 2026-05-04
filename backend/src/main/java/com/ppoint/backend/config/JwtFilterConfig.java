package com.ppoint.backend.config;

import com.ppoint.backend.domain.User;
import com.ppoint.backend.repository.UserRepository;
import com.ppoint.backend.service.JwtService;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.io.IOException;

@Component
public class JwtFilterConfig extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtFilterConfig.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtFilterConfig(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                String email = jwtService.validateToken(token);

                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.emptyList()
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                logger.warn("JWT inválido ou expirado: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/auth/email-verification")
            || path.equals("/auth/resend-code")
            || path.equals("/auth/forgot-password")
            || path.equals("/auth/check-reset")
            || path.equals("/auth/reset-password")
            || path.equals("/auth/login")
            || path.equals("/auth/register")
            || path.equals("/auth/login/google");
    }
}