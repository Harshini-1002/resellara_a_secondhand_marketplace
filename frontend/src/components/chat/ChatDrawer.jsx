import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { chatApi } from '../../api/chatApi';
import { formatCurrency } from '../../utils/formatters';
import {
  X,
  Send,
  ArrowLeft,
  MessageCircle,
  Clock,
  CheckCheck,
  Check,
  Package,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function formatChatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return timeStr;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
}

export default function ChatDrawer() {
  const {
    isOpen,
    closeChat,
    conversations,
    activeConversation,
    selectConversation,
    backToList,
    refreshConversations,
    refreshUnreadCount,
  } = useChat();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Poll / fetch messages for active conversation
  useEffect(() => {
    if (!isOpen || !activeConversation) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await chatApi.getMessages(activeConversation.id);
        if (res?.data && isMounted) {
          setMessages(res.data);
          refreshUnreadCount();
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    setLoadingMessages(true);
    fetchMessages().finally(() => {
      if (isMounted) setLoadingMessages(false);
    });

    const interval = setInterval(fetchMessages, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, activeConversation?.id, refreshUnreadCount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Refresh conversation list whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      refreshConversations();
      refreshUnreadCount();
    }
  }, [isOpen, refreshConversations, refreshUnreadCount]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !activeConversation || sending) return;

    setInputText('');
    setSending(true);

    try {
      const res = await chatApi.sendMessage(activeConversation.id, text);
      if (res?.data) {
        setMessages((prev) => [...prev, res.data]);
        refreshConversations();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={closeChat}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Active Conversation View */}
        {activeConversation ? (
          <>
            {/* Header with Back button, product snapshot & close */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={backToList}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition p-1 -ml-1 rounded-lg hover:bg-slate-200/60"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>All Chats</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {activeConversation.otherUserName}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold capitalize">
                    {activeConversation.otherUserRole?.replace('ROLE_', '').toLowerCase()}
                  </span>
                  <button
                    onClick={closeChat}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info Banner */}
              {activeConversation.productId && (
                <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                  {activeConversation.productImageUrl ? (
                    <img
                      src={activeConversation.productImageUrl}
                      alt={activeConversation.productTitle}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {activeConversation.productTitle}
                    </p>
                    <p className="text-xs font-black text-emerald-600">
                      {formatCurrency(activeConversation.productPrice)}
                    </p>
                  </div>
                  <Link
                    to={`/products/${activeConversation.productId}`}
                    onClick={closeChat}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="View product details"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-xs text-slate-400">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Start the conversation!</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Ask about condition, price negotiation, availability, or delivery details.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.mine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.mine
                          ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{formatChatTime(msg.sentAt)}</span>
                      {msg.mine && (
                        msg.read ? (
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Check className="w-3 h-3 text-slate-400" />
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-transparent focus:border-emerald-500 rounded-full outline-none transition"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full shadow-sm hover:shadow transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Conversation List View */
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Messages</h2>
                  <p className="text-[11px] text-slate-400">Your buyer & seller chats</p>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No messages yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Browse listings on Resellara and click "Chat with Seller" to discuss offers and condition.
                  </p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c)}
                    className="w-full p-3.5 text-left hover:bg-slate-50 transition flex items-start gap-3 group relative"
                  >
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        {c.otherUserName ? c.otherUserName[0].toUpperCase() : 'U'}
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {c.otherUserName}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {formatChatTime(c.lastMessageTime)}
                        </span>
                      </div>

                      {/* Product snippet */}
                      {c.productTitle && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 truncate">
                          <span className="font-medium text-emerald-700 truncate">
                            {c.productTitle}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-slate-700 flex-shrink-0">
                            {formatCurrency(c.productPrice)}
                          </span>
                        </div>
                      )}

                      {/* Last Message */}
                      <p className={`text-xs truncate ${c.unreadCount > 0 ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                        {c.lastMessage || 'Click to start chatting'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
