package com.sellara.dto.review;

import java.util.List;

public class SellerRatingSummaryResponse {

    private Long sellerId;
    private String sellerName;
    private Double averageRating;
    private Long totalReviews;
    private List<ReviewResponse> recentReviews;

    public SellerRatingSummaryResponse() {}

    public SellerRatingSummaryResponse(Long sellerId, String sellerName, Double averageRating, Long totalReviews, List<ReviewResponse> recentReviews) {
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.averageRating = averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0;
        this.totalReviews = totalReviews != null ? totalReviews : 0L;
        this.recentReviews = recentReviews;
    }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0;
    }

    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }

    public List<ReviewResponse> getRecentReviews() { return recentReviews; }
    public void setRecentReviews(List<ReviewResponse> recentReviews) { this.recentReviews = recentReviews; }
}
