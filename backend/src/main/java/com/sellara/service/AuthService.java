package com.sellara.service;

import com.sellara.dto.auth.*;
import com.sellara.entity.OtpType;
import com.sellara.entity.User;
import com.sellara.exception.BadRequestException;
import com.sellara.exception.ResourceNotFoundException;
import com.sellara.repository.UserRepository;
import com.sellara.security.JwtTokenProvider;
import com.sellara.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Pattern;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailOtpService emailOtpService;

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/])[A-Za-z\\d@$!%*?&#^()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/]{6,}$"
    );

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       EmailOtpService emailOtpService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailOtpService = emailOtpService;
    }

    public void sendOtp(OtpSendRequest request) {
        emailOtpService.sendOtp(request.getEmail(), request.getOtpType());
    }

    public boolean verifyOtp(OtpVerifyRequest request) {
        return emailOtpService.verifyOtp(request.getEmail(), request.getOtp(), request.getOtpType(), false);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("An account with this email already exists. Please log in.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        validatePassword(request.getPassword());

        // Validate OTP and consume it
        emailOtpService.verifyOtp(cleanEmail, request.getOtp(), OtpType.REGISTRATION, true);

        User user = new User(
            cleanEmail,
            passwordEncoder.encode(request.getPassword()),
            request.getFullName().trim(),
            request.getPhone() != null ? request.getPhone().trim() : "",
            request.getCity() != null ? request.getCity().trim() : "",
            request.getRole()
        );

        User savedUser = userRepository.save(user);
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateTokenFromUserDetails(principal);

        return new AuthResponse(
            token,
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getFullName(),
            savedUser.getRole(),
            savedUser.getCity(),
            savedUser.getPhone()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().toLowerCase().trim(),
                request.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getCity(),
            user.getPhone()
        );
    }

    @Transactional
    public AuthResponse loginWithOtp(OtpVerifyRequest request) {
        String cleanEmail = request.getEmail().toLowerCase().trim();

        // Validate and consume OTP
        emailOtpService.verifyOtp(cleanEmail, request.getOtp(), OtpType.FORGOT_PASSWORD, true);

        User user = userRepository.findByEmail(cleanEmail)
            .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + cleanEmail));

        UserPrincipal principal = UserPrincipal.create(user);
        String token = tokenProvider.generateTokenFromUserDetails(principal);

        return new AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getCity(),
            user.getPhone()
        );
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        String cleanEmail = request.getEmail().toLowerCase().trim();

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match.");
        }

        validatePassword(request.getNewPassword());

        // Validate and consume OTP
        emailOtpService.verifyOtp(cleanEmail, request.getOtp(), OtpType.FORGOT_PASSWORD, true);

        User user = userRepository.findByEmail(cleanEmail)
            .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + cleanEmail));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public AuthResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new AuthResponse(
            null,
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.getCity(),
            user.getPhone()
        );
    }

    private void validatePassword(String password) {
        if (password == null || !PASSWORD_PATTERN.matcher(password).matches()) {
            throw new BadRequestException(
                "Password must be at least 6 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
            );
        }
    }
}