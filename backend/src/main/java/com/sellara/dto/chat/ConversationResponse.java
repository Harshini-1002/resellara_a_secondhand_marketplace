package com.sellara.dto.chat;

import com.sellara.entity.Conversation;
import com.sellara.entity.ProductStatus;
import com.sellara.entity.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ConversationResponse {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productImageUrl;
    private BigDecimal productPrice;
    private ProductStatus productStatus;
    private Long otherUserId;
    private String otherUserName;
    private String otherUserRole;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;

    public ConversationResponse() {}

    public static ConversationResponse fromEntity(Conversation c, Long currentUserId, String lastMsg, LocalDateTime lastMsgTime, long unread) {
        ConversationResponse dto = new ConversationResponse();
        dto.setId(c.getId());
        if (c.getProduct() != null) {
            dto.setProductId(c.getProduct().getId());
            dto.setProductTitle(c.getProduct().getTitle());
            dto.setProductImageUrl(c.getProduct().getImageUrl());
            dto.setProductPrice(c.getProduct().getPrice());
            dto.setProductStatus(c.getProduct().getStatus());
        }

        User otherUser = c.getBuyer().getId().equals(currentUserId) ? c.getSeller() : c.getBuyer();
        dto.setOtherUserId(otherUser.getId());
        dto.setOtherUserName(otherUser.getFullName());
        dto.setOtherUserRole(otherUser.getRole().name());

        dto.setLastMessage(lastMsg);
        dto.setLastMessageTime(lastMsgTime != null ? lastMsgTime : c.getUpdatedAt());
        dto.setUnreadCount(unread);
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public BigDecimal getProductPrice() { return productPrice; }
    public void setProductPrice(BigDecimal productPrice) { this.productPrice = productPrice; }

    public ProductStatus getProductStatus() { return productStatus; }
    public void setProductStatus(ProductStatus productStatus) { this.productStatus = productStatus; }

    public Long getOtherUserId() { return otherUserId; }
    public void setOtherUserId(Long otherUserId) { this.otherUserId = otherUserId; }

    public String getOtherUserName() { return otherUserName; }
    public void setOtherUserName(String otherUserName) { this.otherUserName = otherUserName; }

    public String getOtherUserRole() { return otherUserRole; }
    public void setOtherUserRole(String otherUserRole) { this.otherUserRole = otherUserRole; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public LocalDateTime getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
}