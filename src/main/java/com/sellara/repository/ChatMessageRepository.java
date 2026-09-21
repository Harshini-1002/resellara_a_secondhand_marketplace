package com.sellara.repository;

import com.sellara.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderBySentAtAsc(Long conversationId);

    Optional<ChatMessage> findTopByConversationIdOrderBySentAtDesc(Long conversationId);

    long countByConversationIdAndSenderIdNotAndReadFalse(Long conversationId, Long senderId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE " +
           "(m.conversation.buyer.id = :userId OR m.conversation.seller.id = :userId) " +
           "AND m.sender.id != :userId AND m.read = false")
    long countTotalUnreadForUser(@Param("userId") Long userId);
}