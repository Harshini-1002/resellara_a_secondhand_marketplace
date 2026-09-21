package com.sellara.controller;

import com.sellara.dto.common.ApiResponse;
import com.sellara.dto.review.ReviewCreateRequest;
import com.sellara.dto.review.ReviewResponse;
import com.sellara.dto.review.SellerRatingSummaryResponse;
import com.sellara.security.UserPrincipal;
import com.sellara.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ReviewCreateRequest req
    ) {
        ReviewResponse review = reviewService.createReview(principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Thank you! Your verified purchase review has been submitted.", review));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<SellerRatingSummaryResponse>> getSellerReviews(
        @PathVariable Long sellerId
    ) {
        SellerRatingSummaryResponse summary = reviewService.getSellerRatingSummary(sellerId);
        return ResponseEntity.ok(ApiResponse.success("Seller rating summary retrieved", summary));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewForOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long orderId
    ) {
        Optional<ReviewResponse> review = reviewService.getReviewForOrder(orderId, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(
            review.isPresent() ? "Review retrieved" : "No review submitted for this order yet",
            review.orElse(null)
        ));
    }
}
