package com.sellara.service;

import com.sellara.dto.product.ProductResponse;
import com.sellara.entity.Product;
import com.sellara.entity.User;
import com.sellara.entity.WishlistItem;
import com.sellara.exception.ResourceNotFoundException;
import com.sellara.repository.ProductRepository;
import com.sellara.repository.UserRepository;
import com.sellara.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<ProductResponse> getUserWishlist(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return items.stream()
            .map(item -> ProductResponse.fromEntity(item.getProduct()))
            .collect(Collectors.toList());
    }

    public List<Long> getWishlistedProductIds(Long userId) {
        List<WishlistItem> items = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return items.stream()
            .map(item -> item.getProduct().getId())
            .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleWishlist(Long userId, Long productId) {
        Optional<WishlistItem> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return false; // Removed
        } else {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            wishlistRepository.save(new WishlistItem(user, product));
            return true; // Added
        }
    }
}
