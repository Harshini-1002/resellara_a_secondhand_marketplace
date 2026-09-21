package com.sellara.service;

import com.sellara.dto.product.PriceSuggestionRequest;
import com.sellara.dto.product.PriceSuggestionResponse;
import com.sellara.entity.Condition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PriceSuggestionService {

    private static final Logger logger = LoggerFactory.getLogger(PriceSuggestionService.class);

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public PriceSuggestionResponse calculateSuggestedPrice(PriceSuggestionRequest req) {
        BigDecimal orig = req.getOriginalPrice();
        int ageMonths = req.getAgeInMonths() != null ? req.getAgeInMonths() : 6;
        Condition condition = req.getItemCondition() != null ? req.getItemCondition() : Condition.GOOD;
        String category = req.getCategoryName() != null ? req.getCategoryName().toLowerCase() : "";

        // 1. Base Annual Category Depreciation Rate
        double annualDepreciationRate;
        if (category.contains("mobile") || category.contains("phone")) {
            annualDepreciationRate = 0.25;
        } else if (category.contains("electronic") || category.contains("laptop")) {
            annualDepreciationRate = 0.22;
        } else if (category.contains("vehicle") || category.contains("bike") || category.contains("car")) {
            annualDepreciationRate = 0.15;
        } else if (category.contains("furniture")) {
            annualDepreciationRate = 0.12;
        } else if (category.contains("fashion") || category.contains("apparel")) {
            annualDepreciationRate = 0.30;
        } else if (category.contains("book") || category.contains("hobbies")) {
            annualDepreciationRate = 0.18;
        } else {
            annualDepreciationRate = 0.20;
        }

        // 2. Age decay factor (monthly compound decay)
        double monthlyRate = annualDepreciationRate / 12.0;
        double ageFactor = Math.pow(1.0 - monthlyRate, ageMonths);
        // Floor at 20% residual salvage value
        ageFactor = Math.max(0.20, ageFactor);

        // 3. Condition factor
        double conditionFactor;
        switch (condition) {
            case LIKE_NEW:
                conditionFactor = 0.95;
                break;
            case EXCELLENT:
                conditionFactor = 0.85;
                break;
            case GOOD:
                conditionFactor = 0.72;
                break;
            case FAIR:
            default:
                conditionFactor = 0.55;
                break;
        }

        // 4. Combined Resale Value
        double combinedMultiplier = ageFactor * conditionFactor;
        double calculatedPrice = orig.doubleValue() * combinedMultiplier;

        // Round to clean Indian Rupee numbers (nearest 50 or 100)
        double roundedMid = Math.max(100.0, Math.round(calculatedPrice / 50.0) * 50.0);
        double minPrice = Math.max(50.0, Math.round((roundedMid * 0.92) / 50.0) * 50.0);
        double maxPrice = Math.round((roundedMid * 1.08) / 50.0) * 50.0;

        int depPct = (int) Math.round((1.0 - (roundedMid / orig.doubleValue())) * 100);
        depPct = Math.max(5, Math.min(95, depPct));

        String explanation = String.format(
            "Estimated based on %d month%s of usage (~%.1f%% annual tech decay) and %s condition rating (%d%% overall depreciation from original retail price).",
            ageMonths,
            ageMonths == 1 ? "" : "s",
            annualDepreciationRate * 100,
            condition.name().replace('_', ' ').toLowerCase(),
            depPct
        );

        return new PriceSuggestionResponse(
            BigDecimal.valueOf(minPrice).setScale(2, RoundingMode.HALF_UP),
            BigDecimal.valueOf(maxPrice).setScale(2, RoundingMode.HALF_UP),
            BigDecimal.valueOf(roundedMid).setScale(2, RoundingMode.HALF_UP),
            depPct,
            explanation,
            false // rule-based depreciation model
        );
    }
}