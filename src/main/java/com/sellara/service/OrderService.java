package com.sellara.service;

import com.sellara.dto.order.OrderCreateRequest;
import com.sellara.dto.order.OrderResponse;
import com.sellara.entity.*;
import com.sellara.exception.BadRequestException;
import com.sellara.exception.ResourceNotFoundException;
import com.sellara.repository.ChatMessageRepository;
import com.sellara.repository.ConversationRepository;
import com.sellara.repository.OrderRepository;
import com.sellara.repository.ProductRepository;
import com.sellara.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        ConversationRepository conversationRepository,
                        ChatMessageRepository chatMessageRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    @Transactional
    public OrderResponse createOrder(Long buyerId, OrderCreateRequest req) {
        User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new ResourceNotFoundException("Buyer not found with id: " + buyerId));

        Product product = productRepository.findByIdWithPessimisticLock(req.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + req.getProductId()));

        if (product.getStatus() != ProductStatus.AVAILABLE) {
            throw new BadRequestException("This item is no longer available for offers or orders (Current status: " + product.getStatus() + ").");
        }

        if (product.getSeller().getId().equals(buyerId)) {
            throw new BadRequestException("You cannot place an order on your own listing.");
        }

        Order order = new Order(
            buyer,
            product,
            req.getOfferPrice(),
            req.getDeliveryAddress().trim(),
            req.getContactPhone().trim(),
            req.getNotes() != null ? req.getNotes().trim() : ""
        );

        Order saved = orderRepository.save(order);
        return OrderResponse.fromEntity(saved);
    }

    public List<OrderResponse> getBuyerOrders(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)
            .stream()
            .map(OrderResponse::fromEntity)
            .collect(Collectors.toList());
    }

    public List<OrderResponse> getSellerOrders(Long sellerId) {
        return orderRepository.findByProductSellerIdOrderByCreatedAtDesc(sellerId)
            .stream()
            .map(OrderResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long sellerId, Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getProduct().getSeller().getId().equals(sellerId)) {
            throw new BadRequestException("You are not authorized to update this order.");
        }

        Product product = productRepository.findByIdWithPessimisticLock(order.getProduct().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + order.getProduct().getId()));

        OrderStatus previousStatus = order.getStatus();

        if (newStatus == OrderStatus.ACCEPTED) {
            // Concurrency & availability check
            if (product.getStatus() != ProductStatus.AVAILABLE) {
                throw new BadRequestException("Cannot accept this offer: The item is no longer available (Current status: " + product.getStatus() + ").");
            }

            // Reserve the product for this accepted order
            order.setStatus(OrderStatus.ACCEPTED);
            product.setStatus(ProductStatus.RESERVED);
            productRepository.save(product);

            // Auto-reject and decline competing pending offers for the same product
            List<Order> otherPendingOrders = orderRepository.findByProductIdAndStatusAndIdNot(product.getId(), OrderStatus.PENDING, orderId);
            for (Order pending : otherPendingOrders) {
                pending.setStatus(OrderStatus.REJECTED);
                orderRepository.save(pending);
                sendNotificationChat(pending.getProduct(), pending.getBuyer(), product.getSeller(),
                    "ℹ️ Another buyer's offer was accepted for this item. Your offer of ₹" + pending.getOfferPrice() + " has been declined.");
            }

            // In-chat notification to winning buyer
            sendNotificationChat(product, order.getBuyer(), product.getSeller(),
                "🎉 Your offer of ₹" + order.getOfferPrice() + " has been ACCEPTED! The item is now RESERVED for you. Please coordinate pickup or delivery details.");

        } else if (newStatus == OrderStatus.COMPLETED) {
            if (previousStatus != OrderStatus.ACCEPTED) {
                throw new BadRequestException("Only an accepted/reserved order can be marked as completed.");
            }
            order.setStatus(OrderStatus.COMPLETED);
            product.setStatus(ProductStatus.SOLD);
            productRepository.save(product);

            sendNotificationChat(product, order.getBuyer(), product.getSeller(),
                "✅ Purchase COMPLETED! The item has been marked as SOLD. You can now leave a verified review and rating for this seller.");

        } else if (newStatus == OrderStatus.REJECTED) {
            order.setStatus(OrderStatus.REJECTED);

            // If the order was previously ACCEPTED and product was RESERVED or PENDING_SALE, restore product to AVAILABLE!
            if (previousStatus == OrderStatus.ACCEPTED && (product.getStatus() == ProductStatus.RESERVED || product.getStatus() == ProductStatus.PENDING_SALE)) {
                product.setStatus(ProductStatus.AVAILABLE);
                productRepository.save(product);

                sendNotificationChat(product, order.getBuyer(), product.getSeller(),
                    "⚠️ The reserved order has been CANCELLED. The item has been restored to AVAILABLE status for other buyers.");
            } else {
                sendNotificationChat(product, order.getBuyer(), product.getSeller(),
                    "❌ Your offer of ₹" + order.getOfferPrice() + " was declined by the seller.");
            }
        } else {
            order.setStatus(newStatus);
        }

        Order updated = orderRepository.save(order);
        return OrderResponse.fromEntity(updated);
    }

    private void sendNotificationChat(Product product, User buyer, User seller, String content) {
        try {
            Conversation conv = conversationRepository.findByProductIdAndBuyerId(product.getId(), buyer.getId())
                .orElseGet(() -> conversationRepository.save(new Conversation(product, buyer, seller)));
            ChatMessage message = new ChatMessage(conv, seller, content);
            chatMessageRepository.save(message);
        } catch (Exception e) {
            logger.warn("Could not send automated in-chat notification: {}", e.getMessage());
        }
    }
}
