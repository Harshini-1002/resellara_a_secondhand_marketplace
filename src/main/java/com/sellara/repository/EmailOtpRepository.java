package com.sellara.repository;

import com.sellara.entity.EmailOtp;
import com.sellara.entity.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findTopByEmailAndOtpTypeAndUsedFalseOrderByCreatedAtDesc(String email, OtpType otpType);
    List<EmailOtp> findByEmail(String email);
    void deleteByEmail(String email);
}