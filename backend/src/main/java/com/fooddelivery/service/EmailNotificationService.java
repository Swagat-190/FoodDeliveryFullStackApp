package com.fooddelivery.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${notification.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${notification.email.from:noreply@bytesoul.app}")
    private String fromEmail;

    @Async
    public void sendEmailAsync(String toEmail, String subject, String body) {
        if (!emailEnabled || toEmail == null || toEmail.isBlank()) {
            return;
        }

        if (mailSender == null) {
            log.info("[EMAIL_NOTIFY] JavaMailSender not configured. to={} subject={}", toEmail, subject);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("[EMAIL_NOTIFY] Sent email to {}", toEmail);
        } catch (Exception ex) {
            log.warn("[EMAIL_NOTIFY] Failed sending email to {}. reason={}", toEmail, ex.getMessage());
        }
    }
}
