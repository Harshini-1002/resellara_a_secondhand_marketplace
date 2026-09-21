import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatApi } from '../api/chatApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await chatApi.getUnreadCount();
      if (res?.data?.unreadCount !== undefined) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // silent catch for background polling
    }
  }, [isAuthenticated]);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      return;
    }
    try {
      const res = await chatApi.getUserConversations();
      if (res?.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      fetchUnreadCount();
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 8000);
      return () => clearInterval(interval);
    } else {
      setConversations([]);
      setActiveConversation(null);
      setUnreadCount(0);
      setIsOpen(false);
    }
  }, [isAuthenticated, fetchConversations, fetchUnreadCount]);

  const openChat = async (conversationId = null, productId = null) => {
    if (!isAuthenticated) {
      toast.error('Please log in to chat');
      return;
    }
    setIsOpen(true);

    if (productId) {
      setLoading(true);
      try {
        const res = await chatApi.getOrCreateConversation(productId);
        if (res?.data) {
          setActiveConversation(res.data);
          await fetchConversations();
          await fetchUnreadCount();
        }
      } catch (err) {
        toast.error(err.message || 'Could not start conversation');
      } finally {
        setLoading(false);
      }
    } else if (conversationId) {
      const existing = conversations.find((c) => c.id === conversationId);
      if (existing) {
        setActiveConversation(existing);
      }
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const selectConversation = (conv) => {
    setActiveConversation(conv);
  };

  const backToList = () => {
    setActiveConversation(null);
    fetchConversations();
    fetchUnreadCount();
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        conversations,
        activeConversation,
        selectConversation,
        backToList,
        unreadCount,
        refreshConversations: fetchConversations,
        refreshUnreadCount: fetchUnreadCount,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
