package com.sellara.service;

import com.sellara.dto.chat.ChatMessageResponse;
import com.sellara.dto.chat.ConversationResponse;
import com.sellara.dto.chat.SendMessageRequest;
import com.sellara.entity.ChatMessage;
import com.sellara.entity.Conversation;
import com.sellara.entity.Product;
import com.sellara.entity.User;
import com.sellara.exception.BadRequestException;
import com.sellara.exception.ResourceNotFoundException;
import com.sellara.repository.ChatMessageRepository;
import com.sellara.repository.ConversationRepository;
import com.sellara.repository.ProductRepository;
import com.sellara.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ChatService(ConversationRepository conversationRepository,
                       ChatMessageRepository chatMessageRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ConversationResponse getOrCreateConversation(Long buyerId, Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (product.getSeller().getId().equals(buyerId)) {
            throw new BadRequestException("You cannot start a conversation on your own listing.");
        }

        User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new ResourceNotFoundException("Buyer not found"));

        Optional<Conversation> existing = conversationRepository.findByProductIdAndBuyerId(productId, buyerId);
        Conversation conversation;
        if (existing.isPresent()) {
            conversation = existing.get();
        } else {
            conversation = new Conversation(product, buyer, product.getSeller());
            conversation = conversationRepository.save(conversation);
        }

        Optional<ChatMessage> lastMsg = chatMessageRepository.findTopByConversationIdOrderBySentAtDesc(conversation.getId());
        long unread = chatMessageRepository.countByConversationIdAndSenderIdNotAndReadFalse(conversation.getId(), buyerId);

        return ConversationResponse.fromEntity(
            conversation,
            buyerId,
            lastMsg.map(ChatMessage::getContent).orElse(""),
            lastMsg.map(ChatMessage::getSentAt).orElse(conversation.getCreatedAt()),
            unread
        );
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findUserConversations(userId);
        List<ConversationResponse> results = new ArrayList<>();

        for (Conversation c : conversations) {
            Optional<ChatMessage> lastMsg = chatMessageRepository.findTopByConversationIdOrderBySentAtDesc(c.getId());
            long unread = chatMessageRepository.countByConversationIdAndSenderIdNotAndReadFalse(c.getId(), userId);

            results.add(ConversationResponse.fromEntity(
                c,
                userId,
                lastMsg.map(ChatMessage::getContent).orElse(""),
                lastMsg.map(ChatMessage::getSentAt).orElse(c.getUpdatedAt()),
                unread
            ));
        }

        return results;
    }

    @Transactional
    public List<ChatMessageResponse> getConversationMessages(Long userId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        if (!conversation.getBuyer().getId().equals(userId) && !conversation.getSeller().getId().equals(userId)) {
            throw new BadRequestException("You do not have access to this conversation.");
        }

        List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderBySentAtAsc(conversationId);

        // Mark incoming messages as read
        for (ChatMessage msg : messages) {
            if (!msg.getSender().getId().equals(userId) && !msg.isRead()) {
                msg.setRead(true);
            }
        }
        chatMessageRepository.saveAll(messages);

        return messages.stream()
            .map(m -> ChatMessageResponse.fromEntity(m, userId))
            .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long senderId, Long conversationId, SendMessageRequest req) {
        Conversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new ResourceNotFoundException("Conversation not found with id: " + conversationId));

        if (!conversation.getBuyer().getId().equals(senderId) && !conversation.getSeller().getId().equals(senderId)) {
            throw new BadRequestException("You are not authorized to send messages in this conversation.");
        }

        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChatMessage message = new ChatMessage(conversation, sender, req.getContent().trim());
        ChatMessage saved = chatMessageRepository.save(message);

        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return ChatMessageResponse.fromEntity(saved, senderId);
    }

    public long getTotalUnreadCount(Long userId) {
        return chatMessageRepository.countTotalUnreadForUser(userId);
    }
}