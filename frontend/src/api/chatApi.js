import axiosClient from './axiosClient';

export const chatApi = {
  getOrCreateConversation: (productId) =>
    axiosClient.post(`/chat/conversations?productId=${productId}`),

  getUserConversations: () =>
    axiosClient.get('/chat/conversations'),

  getMessages: (conversationId) =>
    axiosClient.get(`/chat/conversations/${conversationId}/messages`),

  sendMessage: (conversationId, content) =>
    axiosClient.post(`/chat/conversations/${conversationId}/messages`, { content }),

  getUnreadCount: () =>
    axiosClient.get('/chat/unread-count'),
};