package com.sellara.dto.order;

import com.sellara.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class OrderStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private OrderStatus status;

    public OrderStatusUpdateRequest() {}

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
}
