package com.sellara.controller;

import com.sellara.dto.common.ApiResponse;
import com.sellara.dto.order.OrderCreateRequest;
import com.sellara.dto.order.OrderResponse;
import com.sellara.dto.order.OrderStatusUpdateRequest;
import com.sellara.security.UserPrincipal;
import com.sellara.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody OrderCreateRequest req
    ) {
        OrderResponse order = orderService.createOrder(principal.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping("/buyer")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getBuyerOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderResponse> orders = orderService.getBuyerOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Buyer orders retrieved", orders));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getSellerOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderResponse> orders = orderService.getSellerOrders(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Seller incoming orders retrieved", orders));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody OrderStatusUpdateRequest req
    ) {
        OrderResponse updated = orderService.updateOrderStatus(principal.getId(), id, req.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updated));
    }
}
