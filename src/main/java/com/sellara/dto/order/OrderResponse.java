package com.sellara.dto.order;

import com.sellara.entity.Order;
import com.sellara.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderResponse {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productImageUrl;
    private BigDecimal productListedPrice;
    private BigDecimal offerPrice;
    private OrderStatus status;
    private String deliveryAddress;
    private String contactPhone;
    private String notes;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private Long sellerId;
    private String sellerName;
    private LocalDateTime createdAt;

    public OrderResponse() {}

    public static OrderResponse fromEntity(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        if (order.getProduct() != null) {
            dto.setProductId(order.getProduct().getId());
            dto.setProductTitle(order.getProduct().getTitle());
            dto.setProductImageUrl(order.getProduct().getImageUrl());
            dto.setProductListedPrice(order.getProduct().getPrice());
            if (order.getProduct().getSeller() != null) {
                dto.setSellerId(order.getProduct().getSeller().getId());
                dto.setSellerName(order.getProduct().getSeller().getFullName());
            }
        }
        dto.setOfferPrice(order.getOfferPrice());
        dto.setStatus(order.getStatus());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setContactPhone(order.getContactPhone());
        dto.setNotes(order.getNotes());
        if (order.getBuyer() != null) {
            dto.setBuyerId(order.getBuyer().getId());
            dto.setBuyerName(order.getBuyer().getFullName());
            dto.setBuyerEmail(order.getBuyer().getEmail());
        }
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public BigDecimal getProductListedPrice() { return productListedPrice; }
    public void setProductListedPrice(BigDecimal productListedPrice) { this.productListedPrice = productListedPrice; }

    public BigDecimal getOfferPrice() { return offerPrice; }
    public void setOfferPrice(BigDecimal offerPrice) { this.offerPrice = offerPrice; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
