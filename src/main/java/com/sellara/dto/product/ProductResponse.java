package com.sellara.dto.product;

import com.sellara.entity.Condition;
import com.sellara.entity.Product;
import com.sellara.entity.ProductStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private Condition itemCondition;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private String imageUrl;
    private String location;
    private String state;
    private String district;
    private String city;
    private String pincode;
    private ProductStatus status;
    private Long sellerId;
    private String sellerName;
    private String sellerCity;
    private LocalDateTime createdAt;

    public ProductResponse() {}

    public static ProductResponse fromEntity(Product p) {
        ProductResponse dto = new ProductResponse();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
            dto.setCategorySlug(p.getCategory().getSlug());
        }
        dto.setItemCondition(p.getItemCondition());
        dto.setPrice(p.getPrice());
        dto.setOriginalPrice(p.getOriginalPrice());
        if (p.getOriginalPrice() != null && p.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0 && p.getPrice() != null) {
            BigDecimal diff = p.getOriginalPrice().subtract(p.getPrice());
            if (diff.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal pct = diff.divide(p.getOriginalPrice(), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                dto.setDiscountPercentage(pct.intValue());
            }
        }
        dto.setImageUrl(p.getImageUrl());
        dto.setLocation(p.getLocation());
        dto.setState(p.getState());
        dto.setDistrict(p.getDistrict());
        dto.setCity(p.getCity());
        dto.setPincode(p.getPincode());
        dto.setStatus(p.getStatus());
        if (p.getSeller() != null) {
            dto.setSellerId(p.getSeller().getId());
            dto.setSellerName(p.getSeller().getFullName());
            dto.setSellerCity(p.getSeller().getCity());
        }
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategorySlug() { return categorySlug; }
    public void setCategorySlug(String categorySlug) { this.categorySlug = categorySlug; }

    public Condition getItemCondition() { return itemCondition; }
    public void setItemCondition(Condition itemCondition) { this.itemCondition = itemCondition; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public Integer getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(Integer discountPercentage) { this.discountPercentage = discountPercentage; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerCity() { return sellerCity; }
    public void setSellerCity(String sellerCity) { this.sellerCity = sellerCity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}