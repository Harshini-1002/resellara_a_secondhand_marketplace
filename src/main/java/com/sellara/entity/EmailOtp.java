package com.sellara.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_otps", indexes = {
    @Index(name = "idx_otp_email_type", columnList = "email, otp_type")
})
public class EmailOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(name = "hashed_otp", nullable = false)
    private String hashedOtp;

    @Enumerated(EnumType.STRING)
    @Column(name = "otp_type", nullable = false)
    private OtpType otpType;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "resend_available_at", nullable = false)
    private LocalDateTime resendAvailableAt;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts = 0;

    @Column(name = "is_used", nullable = false)
    private boolean used = false;

    public EmailOtp() {
        this.createdAt = LocalDateTime.now();
    }

    public EmailOtp(String email, String hashedOtp, OtpType otpType, int expiryMinutes, int resendCooldownSeconds) {
        this.email = email.toLowerCase().trim();
        this.hashedOtp = hashedOtp;
        this.otpType = otpType;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = this.createdAt.plusMinutes(expiryMinutes);
        this.resendAvailableAt = this.createdAt.plusSeconds(resendCooldownSeconds);
        this.failedAttempts = 0;
        this.used = false;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public boolean canResend() {
        return LocalDateTime.now().isAfter(this.resendAvailableAt);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHashedOtp() { return hashedOtp; }
    public void setHashedOtp(String hashedOtp) { this.hashedOtp = hashedOtp; }

    public OtpType getOtpType() { return otpType; }
    public void setOtpType(OtpType otpType) { this.otpType = otpType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getResendAvailableAt() { return resendAvailableAt; }
    public void setResendAvailableAt(LocalDateTime resendAvailableAt) { this.resendAvailableAt = resendAvailableAt; }

    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}