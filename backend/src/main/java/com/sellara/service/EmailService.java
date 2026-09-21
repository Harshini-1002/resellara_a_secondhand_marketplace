package com.sellara.service;

import com.sellara.entity.OtpType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:23r01a05t9@gmail.com}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp, OtpType otpType) {
        String subject = otpType == OtpType.REGISTRATION
            ? "Resellara — Verify Your Email (Registration OTP)"
            : "Resellara — Password Reset & Login OTP";

        String messageBody = String.format(
            "Hello,\n\nYour Resellara verification code is: %s\n\n" +
            "This OTP is valid for 5 minutes. Please do not share this code with anyone.\n\n" +
            "If you did not request this verification code, please ignore this email.\n\n" +
            "Best regards,\nThe Resellara Team",
            otp
        );

        logger.info("Initiating OTP email delivery: type [{}] to recipient <{}>", otpType, toEmail);

        if (mailSender == null) {
            logger.warn("JavaMailSender bean is not initialized. Email to <{}> was not sent.", toEmail);
            return;
        }

        if (mailPassword == null || mailPassword.trim().isEmpty()) {
            logger.warn("RESELLARA_SMTP_PASSWORD environment variable is not configured. Real Gmail SMTP delivery skipped for <{}>.", toEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(messageBody);

            mailSender.send(message);
            logger.info("Successfully dispatched OTP email via Gmail SMTP to <{}> for [{}]", toEmail, otpType);
        } catch (MailAuthenticationException e) {
            logger.error("Gmail SMTP authentication failed for <{}>: Please ensure RESELLARA_SMTP_PASSWORD contains a valid 16-character Google App Password (not your regular Gmail password).", toEmail);
        } catch (Exception e) {
            logger.error("Gmail SMTP error delivering OTP to <{}>: {}", toEmail, e.getMessage());
        }
    }
}