package com.sellara.dto.auth;

import com.sellara.entity.OtpType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OtpSendRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "OTP type is required")
    private OtpType otpType;

    public OtpSendRequest() {}

    public OtpSendRequest(String email, OtpType otpType) {
        this.email = email;
        this.otpType = otpType;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public OtpType getOtpType() { return otpType; }
    public void setOtpType(OtpType otpType) { this.otpType = otpType; }
}