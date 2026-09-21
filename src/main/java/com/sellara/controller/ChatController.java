package com.sellara.controller;

import com.sellara.dto.chat.ChatMessageResponse;
import com.sellara.dto.chat.ConversationResponse;
import com.sellara.dto.chat.SendMessageRequest;
import com.sellara.dto.common.ApiResponse;
import com.sellara.security.UserPrincipal;
import com.sellara.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/conversations")
    public ResponseEntity<ApiResponse<ConversationResponse>> getOrCreateConversation(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam Long productId
    ) {
        ConversationResponse conversation = chatService.getOrCreateConversation(principal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Conversation ready", conversation));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getUserConversations(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ConversationResponse> conversations = chatService.getUserConversations(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved", conversations));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        List<ChatMessageResponse> messages = chatService.getConversationMessages(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved", messages));
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody SendMessageRequest req
    ) {
        ChatMessageResponse message = chatService.sendMessage(principal.getId(), id, req);
        return ResponseEntity.ok(ApiResponse.success("Message sent", message));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
        @AuthenticationPrincipal UserPrincipal principal
    ) {
        long count = chatService.getTotalUnreadCount(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", Map.of("unreadCount", count)));
    }
}