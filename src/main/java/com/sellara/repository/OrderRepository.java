package com.sellara.repository;

import com.sellara.entity.Order;
import com.sellara.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<Order> findByProductSellerIdOrderByCreatedAtDesc(Long sellerId);
    List<Order> findByProductIdAndStatusAndIdNot(Long productId, OrderStatus status, Long orderId);
    List<Order> findByProductIdAndStatus(Long productId, OrderStatus status);
    long countByProductSellerIdAndStatus(Long sellerId, OrderStatus status);
    long countByBuyerId(Long buyerId);
}
