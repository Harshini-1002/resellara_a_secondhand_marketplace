package com.sellara.service;

import com.sellara.dto.product.ProductCreateRequest;
import com.sellara.dto.product.ProductResponse;
import com.sellara.entity.*;
import com.sellara.exception.BadRequestException;
import com.sellara.exception.ResourceNotFoundException;
import com.sellara.repository.CategoryRepository;
import com.sellara.repository.ProductRepository;
import com.sellara.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<ProductResponse> getAllProducts(String query, Long categoryId, Condition condition,
                                               BigDecimal minPrice, BigDecimal maxPrice,
                                               String state, String district, String city,
                                               ProductStatus status) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cleanState = (state != null && !state.trim().isEmpty()) ? state.trim().toLowerCase() : null;
        String cleanDistrict = (district != null && !district.trim().isEmpty()) ? district.trim().toLowerCase() : null;
        String cleanCity = (city != null && !city.trim().isEmpty()) ? city.trim().toLowerCase() : null;
        ProductStatus searchStatus = (status != null) ? status : ProductStatus.AVAILABLE;

        List<Product> products = productRepository.searchProducts(
            cleanQuery, categoryId, condition, minPrice, maxPrice,
            cleanState, cleanDistrict, cleanCity, searchStatus
        );
        return products.stream().map(ProductResponse::fromEntity).collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductResponse.fromEntity(product);
    }

    public List<ProductResponse> getSellerListings(Long sellerId) {
        List<Product> products = productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        return products.stream().map(ProductResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(Long sellerId, ProductCreateRequest req) {
        User seller = userRepository.findById(sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));

        Category category = categoryRepository.findById(req.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + req.getCategoryId()));

        Product product = new Product(
            req.getTitle().trim(),
            req.getDescription().trim(),
            category,
            req.getItemCondition(),
            req.getPrice(),
            req.getOriginalPrice(),
            req.getImageUrl(),
            req.getLocation().trim(),
            seller
        );

        product.setState(req.getState());
        product.setDistrict(req.getDistrict());
        product.setCity(req.getCity());
        product.setPincode(req.getPincode());

        Product saved = productRepository.save(product);
        return ProductResponse.fromEntity(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long sellerId, Long productId, ProductCreateRequest req) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("You are not authorized to update this listing.");
        }

        Category category = categoryRepository.findById(req.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + req.getCategoryId()));

        product.setTitle(req.getTitle().trim());
        product.setDescription(req.getDescription().trim());
        product.setCategory(category);
        product.setItemCondition(req.getItemCondition());
        product.setPrice(req.getPrice());
        product.setOriginalPrice(req.getOriginalPrice());
        if (req.getImageUrl() != null && !req.getImageUrl().trim().isEmpty()) {
            product.setImageUrl(req.getImageUrl().trim());
        }
        product.setLocation(req.getLocation().trim());
        product.setState(req.getState());
        product.setDistrict(req.getDistrict());
        product.setCity(req.getCity());
        product.setPincode(req.getPincode());

        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteProduct(Long sellerId, Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("You are not authorized to delete this listing.");
        }

        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse toggleProductStatus(Long sellerId, Long productId, ProductStatus status) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("You are not authorized to update this listing.");
        }

        product.setStatus(status);
        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }
}