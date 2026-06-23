import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getFullUrl } from '../utils/apiUtils';

export default function UserChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      loadUnreadCount();
      // Poll for new messages every 5 seconds
      pollingIntervalRef.current = setInterval(() => {
        if (selectedConversation) {
          loadMessages(selectedConversation.id);
        }
        loadUnreadCount();
      }, 5000);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, selectedConversation]);

  useEffect(() => {
    if (isOpen && selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await api.getMyConversations();
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.getMessages(conversationId, 0, 100);
      setMessages(data || []);
      // Mark as read
      try {
        await api.markConversationAsRead(conversationId);
        await loadUnreadCount();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !selectedConversation) return;

    const content = input;
    setInput('');
    setLoading(true);

    try {
      await api.sendMessage(selectedConversation.id, content);
      // Reload messages
      await loadMessages(selectedConversation.id);
      // Reload conversations to update last message time
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi tin nhắn'));
      setInput(content); // Restore input
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation) => {
    if (!conversation || !user) return null;
    if (conversation.participant1?.id === user.id) {
      return conversation.participant2;
    }
    return conversation.participant1;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Load unread count on mount
  useEffect(() => {
    loadUnreadCount();
    // Poll unread count every 30 seconds when widget is closed
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Chat Button - Bottom Right, Above AI Chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center relative"
        aria-label="Mở nhắn tin"
        title="Nhắn tin"
      >
        {isOpen ? (
          <i className="fas fa-times text-xl"></i>
        ) : (
          <>
            <i className="fas fa-comments text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">Tin nhắn</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Conversations List / Messages */}
          {!selectedConversation ? (
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {loadingConversations ? (
                <div className="p-4 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="mt-2 text-gray-600 text-sm">Đang tải...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="fas fa-comments text-gray-400 text-4xl mb-2"></i>
                  <p className="text-gray-600 text-sm">Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    if (!otherUser) return null;
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleConversationClick(conversation)}
                        className="w-full p-4 hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {otherUser.avatarUrl ? (
                              <img
                                src={getFullUrl(otherUser.avatarUrl)}
                                alt={otherUser.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              otherUser.fullName?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {otherUser.fullName || 'Người dùng'}
                            </p>
                            {conversation.lastMessageAt && (
                              <p className="text-xs text-gray-500">
                                {formatDate(conversation.lastMessageAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Messages Header */}
              <div className="border-b border-gray-200 p-3 bg-white flex items-center justify-between">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-600 hover:text-gray-900 mr-2"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {(() => {
                    const otherUser = getOtherUser(selectedConversation);
                    if (!otherUser) return null;
                    return (
                      <>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {otherUser.avatarUrl ? (
                            <img
                              src={getFullUrl(otherUser.avatarUrl)}
                              alt={otherUser.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            otherUser.fullName?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {otherUser.fullName || 'Người dùng'}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-sm">Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMyMessage = msg.sender?.id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            isMyMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                          <div className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                    title="Gửi tin nhắn"
                  >
                    {loading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
