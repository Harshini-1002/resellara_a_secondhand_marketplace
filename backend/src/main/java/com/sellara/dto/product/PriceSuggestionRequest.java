package com.sellara.dto.product;

import com.sellara.entity.Condition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PriceSuggestionRequest {
    private Long categoryId;
    private String categoryName;
    private String title;

    @NotNull(message = "Original purchase price is required")
    @DecimalMin(value = "1.0", message = "Original price must be positive")
    private BigDecimal originalPrice;

    @NotNull(message = "Age in months is required")
    @Min(value = 0, message = "Age cannot be negative")
    private Integer ageInMonths;

    @NotNull(message = "Condition is required")
    private Condition itemCondition;

    public PriceSuggestionRequest() {}

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public Integer getAgeInMonths() { return ageInMonths; }
    public void setAgeInMonths(Integer ageInMonths) { this.ageInMonths = ageInMonths; }

    public Condition getItemCondition() { return itemCondition; }
    public void setItemCondition(Condition itemCondition) { this.itemCondition = itemCondition; }
}