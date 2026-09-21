package com.sellara.dto.chat;

import com.sellara.entity.ChatMessage;
import java.time.LocalDateTime;

public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String content;
    private boolean read;
    private LocalDateTime sentAt;
    private boolean mine;

    public ChatMessageResponse() {}

    public static ChatMessageResponse fromEntity(ChatMessage msg, Long currentUserId) {
        ChatMessageResponse dto = new ChatMessageResponse();
        dto.setId(msg.getId());
        dto.setConversationId(msg.getConversation().getId());
        dto.setSenderId(msg.getSender().getId());
        dto.setSenderName(msg.getSender().getFullName());
        dto.setContent(msg.getContent());
        dto.setRead(msg.isRead());
        dto.setSentAt(msg.getSentAt());
        dto.setMine(msg.getSender().getId().equals(currentUserId));
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public boolean isMine() { return mine; }
    public void setMine(boolean mine) { this.mine = mine; }
}