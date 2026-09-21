package com.sellara.service;

import com.sellara.entity.EmailOtp;
import com.sellara.entity.OtpType;
import com.sellara.exception.BadRequestException;
import com.sellara.repository.EmailOtpRepository;
import com.sellara.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmailOtpService(EmailOtpRepository emailOtpRepository,
                           UserRepository userRepository,
                           EmailService emailService) {
        this.emailOtpRepository = emailOtpRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void sendOtp(String email, OtpType otpType) {
        String cleanEmail = email.toLowerCase().trim();

        if (otpType == OtpType.REGISTRATION) {
            if (userRepository.existsByEmail(cleanEmail)) {
                throw new BadRequestException("An account with this email already exists. Please log in.");
            }
        }

        // Check if there is an active OTP with cooldown
        Optional<EmailOtp> latestOtp = emailOtpRepository
            .findTopByEmailAndOtpTypeAndUsedFalseOrderByCreatedAtDesc(cleanEmail, otpType);

        if (latestOtp.isPresent()) {
            EmailOtp existing = latestOtp.get();
            if (!existing.canResend() && !existing.isExpired()) {
                long remainingSeconds = Duration.between(LocalDateTime.now(), existing.getResendAvailableAt()).toSeconds();
                throw new BadRequestException("Please wait " + Math.max(1, remainingSeconds) + " seconds before requesting a new OTP.");
            }
        }

        // Generate 6-digit OTP
        int code = 100000 + secureRandom.nextInt(900000);
        String rawOtp = String.valueOf(code);
        String hashedOtp = hashOtp(rawOtp);

        // Save OTP entity: 5 minutes expiry, 60 seconds resend cooldown
        EmailOtp otpEntity = new EmailOtp(cleanEmail, hashedOtp, otpType, 5, 60);
        emailOtpRepository.save(otpEntity);

        // Send OTP via EmailService
        emailService.sendOtpEmail(cleanEmail, rawOtp, otpType);
    }

    @Transactional
    public boolean verifyOtp(String email, String rawOtp, OtpType otpType, boolean markUsed) {
        String cleanEmail = email.toLowerCase().trim();

        EmailOtp otpEntity = emailOtpRepository
            .findTopByEmailAndOtpTypeAndUsedFalseOrderByCreatedAtDesc(cleanEmail, otpType)
            .orElseThrow(() -> new BadRequestException("No active verification code found for this email. Please request an OTP."));

        if (otpEntity.isExpired()) {
            throw new BadRequestException("Your OTP has expired. Please request a new one.");
        }

        if (otpEntity.getFailedAttempts() >= 5) {
            otpEntity.setUsed(true);
            emailOtpRepository.save(otpEntity);
            throw new BadRequestException("Too many incorrect attempts. This code has been locked. Please request a new OTP.");
        }

        String hashedInput = hashOtp(rawOtp);
        if (!hashedInput.equals(otpEntity.getHashedOtp())) {
            otpEntity.setFailedAttempts(otpEntity.getFailedAttempts() + 1);
            emailOtpRepository.save(otpEntity);
            int remaining = 5 - otpEntity.getFailedAttempts();
            throw new BadRequestException("Incorrect OTP. " + remaining + " attempts remaining.");
        }

        if (markUsed) {
            otpEntity.setUsed(true);
            emailOtpRepository.save(otpEntity);
        }

        return true;
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}