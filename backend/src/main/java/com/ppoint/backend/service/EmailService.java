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
        String corpo = """
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                    <h2 style="color: #991710;">PP Point</h2>
                    <p>Seu código de confirmação é:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                                color: #991710; text-align: center; padding: 20px 0;">
                        %s
                    </div>
                    <p style="color: #666;">Este código expira em 15 minutos.</p>
                    <p style="color: #666; font-size: 12px;">
                        Se você não criou uma conta no PP Point, ignore este email.
                    </p>
                </div>
                """.formatted(codigo);

        enviar(destinatario, assunto, corpo);
    }

    public void enviarCodigoResetSenha(String destinatario, String codigo) {
        String assunto = "PP Point — Redefinição de senha";
        String corpo = """
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                    <h2 style="color: #991710;">PP Point</h2>
                    <p>Você solicitou a redefinição de senha. Seu código é:</p>
                    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                                color: #991710; text-align: center; padding: 20px 0;">
                        %s
                    </div>
                    <p style="color: #666;">Este código expira em 15 minutos.</p>
                    <p style="color: #666; font-size: 12px;">
                        Se você não solicitou isso, ignore este email.
                    </p>
                </div>
                """.formatted(codigo);

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