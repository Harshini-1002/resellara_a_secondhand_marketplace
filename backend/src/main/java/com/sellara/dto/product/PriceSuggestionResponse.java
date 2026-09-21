package com.sellara.dto.product;

import java.math.BigDecimal;

public class PriceSuggestionResponse {
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal suggestedPrice;
    private Integer depreciationPercent;
    private String explanation;
    private boolean aiPowered;

    public PriceSuggestionResponse() {}

    public PriceSuggestionResponse(BigDecimal minPrice, BigDecimal maxPrice, BigDecimal suggestedPrice,
                                   Integer depreciationPercent, String explanation, boolean aiPowered) {
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.suggestedPrice = suggestedPrice;
        this.depreciationPercent = depreciationPercent;
        this.explanation = explanation;
        this.aiPowered = aiPowered;
    }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public BigDecimal getSuggestedPrice() { return suggestedPrice; }
    public void setSuggestedPrice(BigDecimal suggestedPrice) { this.suggestedPrice = suggestedPrice; }

    public Integer getDepreciationPercent() { return depreciationPercent; }
    public void setDepreciationPercent(Integer depreciationPercent) { this.depreciationPercent = depreciationPercent; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public boolean isAiPowered() { return aiPowered; }
    public void setAiPowered(boolean aiPowered) { this.aiPowered = aiPowered; }
}