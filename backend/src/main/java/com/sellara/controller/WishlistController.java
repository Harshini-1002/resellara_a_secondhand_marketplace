package com.sellara.controller;

import com.sellara.dto.common.ApiResponse;
import com.sellara.dto.product.ProductResponse;
import com.sellara.security.UserPrincipal;
import com.sellara.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        List<ProductResponse> wishlist = wishlistService.getUserWishlist(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist retrieved", wishlist));
    }

    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<Long>>> getWishlistedIds(@AuthenticationPrincipal UserPrincipal principal) {
        List<Long> ids = wishlistService.getWishlistedProductIds(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Wishlist IDs retrieved", ids));
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleWishlist(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long productId
    ) {
        boolean isWishlisted = wishlistService.toggleWishlist(principal.getId(), productId);
        String msg = isWishlisted ? "Item added to wishlist" : "Item removed from wishlist";
        return ResponseEntity.ok(ApiResponse.success(msg, Map.of("wishlisted", isWishlisted, "productId", productId)));
    }
}
