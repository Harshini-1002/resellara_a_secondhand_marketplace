package com.sellara.controller;

import com.sellara.dto.common.ApiResponse;
import com.sellara.dto.product.PriceSuggestionRequest;
import com.sellara.dto.product.PriceSuggestionResponse;
import com.sellara.dto.product.ProductCreateRequest;
import com.sellara.dto.product.ProductResponse;
import com.sellara.entity.Condition;
import com.sellara.entity.ProductStatus;
import com.sellara.security.UserPrincipal;
import com.sellara.service.PriceSuggestionService;
import com.sellara.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final PriceSuggestionService priceSuggestionService;

    public ProductController(ProductService productService,
                             PriceSuggestionService priceSuggestionService) {
        this.productService = productService;
        this.priceSuggestionService = priceSuggestionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Condition condition,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) String state,
        @RequestParam(required = false) String district,
        @RequestParam(required = false) String city
    ) {
        List<ProductResponse> products = productService.getAllProducts(
            query, categoryId, condition, minPrice, maxPrice, state, district, city, ProductStatus.AVAILABLE
        );
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product details retrieved", product));
    }

    @PostMapping("/price-suggestion")
    public ResponseEntity<ApiResponse<PriceSuggestionResponse>> getPriceSuggestion(@Valid @RequestBody PriceSuggestionRequest req) {
        PriceSuggestionResponse suggestion = priceSuggestionService.calculateSuggestedPrice(req);
        return ResponseEntity.ok(ApiResponse.success("Price suggestion calculated", suggestion));
    }

    @GetMapping("/seller/my-listings")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
        List<ProductResponse> listings = productService.getSellerListings(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Seller listings retrieved", listings));
    }

    @PostMapping("/seller")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody ProductCreateRequest req
    ) {
        ProductResponse created = productService.createProduct(principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Product listed successfully", created));
    }

    @PutMapping("/seller/{id}")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody ProductCreateRequest req
    ) {
        ProductResponse updated = productService.updateProduct(principal.getId(), id, req);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/seller/{id}")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        productService.deleteProduct(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PatchMapping("/seller/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleProductStatus(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestParam ProductStatus status
    ) {
        ProductResponse updated = productService.toggleProductStatus(principal.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Product status updated", updated));
    }
}