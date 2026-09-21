package com.sellara.dto.review;

import com.sellara.entity.Review;
import java.time.LocalDateTime;

public class ReviewResponse {

    private Long id;
    private Long orderId;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private Long productId;
    private String productTitle;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewResponse() {}

    public static ReviewResponse fromEntity(Review r) {
        ReviewResponse resp = new ReviewResponse();
        resp.setId(r.getId());
        resp.setOrderId(r.getOrder() != null ? r.getOrder().getId() : null);
        resp.setBuyerId(r.getBuyer() != null ? r.getBuyer().getId() : null);
        resp.setBuyerName(r.getBuyer() != null ? r.getBuyer().getFullName() : "Anonymous Buyer");
        resp.setSellerId(r.getSeller() != null ? r.getSeller().getId() : null);
        resp.setSellerName(r.getSeller() != null ? r.getSeller().getFullName() : "Seller");
        resp.setProductId(r.getProduct() != null ? r.getProduct().getId() : null);
        resp.setProductTitle(r.getProduct() != null ? r.getProduct().getTitle() : "Item");
        resp.setRating(r.getRating());
        resp.setComment(r.getComment());
        resp.setCreatedAt(r.getCreatedAt());
        return resp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
