package com.sellara.repository;

import com.sellara.entity.Condition;
import com.sellara.entity.Product;
import com.sellara.entity.ProductStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithPessimisticLock(@Param("id") Long id);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:itemCondition IS NULL OR p.itemCondition = :itemCondition) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:state IS NULL OR LOWER(p.state) = LOWER(:state)) AND " +
           "(:district IS NULL OR LOWER(p.district) = LOWER(:district)) AND " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city)) AND " +
           "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(
        @Param("query") String query,
        @Param("categoryId") Long categoryId,
        @Param("itemCondition") Condition itemCondition,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("state") String state,
        @Param("district") String district,
        @Param("city") String city,
        @Param("status") ProductStatus status
    );

    long countBySellerId(Long sellerId);
    long countBySellerIdAndStatus(Long sellerId, ProductStatus status);
}