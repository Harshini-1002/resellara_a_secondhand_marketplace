package com.sellara.service;

import com.sellara.dto.review.ReviewCreateRequest;
import com.sellara.dto.review.ReviewResponse;
import com.sellara.dto.review.SellerRatingSummaryResponse;
import com.sellara.entity.Order;
import com.sellara.entity.OrderStatus;
import com.sellara.entity.Review;
import com.sellara.entity.User;
import com.sellara.exception.BadRequestException;
import com.sellara.exception.ResourceNotFoundException;
import com.sellara.repository.OrderRepository;
import com.sellara.repository.ReviewRepository;
import com.sellara.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         OrderRepository orderRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse createReview(Long buyerId, ReviewCreateRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + req.getOrderId()));

        // Enforce: Only the verified buyer of that specific order can submit the review
        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new AccessDeniedException("You are not authorized to review this order. Only the verified buyer can review.");
        }

        // Enforce: Order must be in COMPLETED status
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Reviews can only be submitted for COMPLETED orders. Current order status: " + order.getStatus());
        }

        // Enforce: One review per completed order
        if (reviewRepository.existsByOrderId(req.getOrderId())) {
            throw new BadRequestException("This order has already been reviewed. Only one review per order is permitted.");
        }

        // Validate rating range
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }

        Review review = new Review(
            order,
            order.getBuyer(),
            order.getProduct().getSeller(),
            order.getProduct(),
            req.getRating(),
            req.getComment() != null ? req.getComment().trim() : ""
        );

        Review saved = reviewRepository.save(review);
        return ReviewResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public SellerRatingSummaryResponse getSellerRatingSummary(Long sellerId) {
        User seller = userRepository.findById(sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        Double avg = reviewRepository.getAverageRatingBySellerId(sellerId);
        long count = reviewRepository.countBySellerId(sellerId);
        List<ReviewResponse> reviews = reviewRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
            .stream()
            .map(ReviewResponse::fromEntity)
            .collect(Collectors.toList());

        return new SellerRatingSummaryResponse(sellerId, seller.getFullName(), avg, count, reviews);
    }

    @Transactional(readOnly = true)
    public Optional<ReviewResponse> getReviewForOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Allow only buyer or seller of the order to view order-specific review details
        if (!order.getBuyer().getId().equals(userId) && !order.getProduct().getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("You are not authorized to view the review for this order.");
        }

        return reviewRepository.findByOrderId(orderId).map(ReviewResponse::fromEntity);
    }
}
