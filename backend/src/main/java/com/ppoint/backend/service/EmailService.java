package com.ppoint.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${email.from}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCodigoConfirmacao(String destinatario, String codigo) {
    String assunto = "PP Point — Confirme seu email";
    String corpo = "<p>Seu código de confirmação é:</p>"
                 + "<h1>" + codigo + "</h1>"
                 + "<p>Este código expira em 15 minutos.</p>";
    enviar(destinatario, assunto, corpo);
}

    public void enviarCodigoResetSenha(String destinatario, String codigo) {
    String assunto = "PP Point — Redefinição de senha";
    String corpo = "<p>Seu código de redefinição de senha é:</p>"
                 + "<h1>" + codigo + "</h1>"
                 + "<p>Este código expira em 15 minutos.</p>";
    enviar(destinatario, assunto, corpo);
}

    private void enviar(String destinatario, String assunto, String corpo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(corpo, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage(), e);
        }
    }
}