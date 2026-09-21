package com.sellara.dto.product;

import com.sellara.entity.Condition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProductCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Condition is required")
    private Condition itemCondition;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "1.0", message = "Price must be at least 1.0")
    private BigDecimal price;

    private BigDecimal originalPrice;

    private String imageUrl;

    @NotBlank(message = "Location/City is required")
    private String location;

    private String state;
    private String district;
    private String city;
    private String pincode;

    public ProductCreateRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Condition getItemCondition() { return itemCondition; }
    public void setItemCondition(Condition itemCondition) { this.itemCondition = itemCondition; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

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
}