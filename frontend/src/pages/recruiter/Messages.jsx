import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import UserInfoModal from '../../components/UserInfoModal';
import { getFullUrl } from '../../utils/apiUtils';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({}); // Store last message for each conversation
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('messages');
  const [studentList, setStudentList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();

    // Poll for new messages every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.id);
      }
      loadUnreadCount();
      loadConversations();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  // Check URL params or navigation state for auto-select conversation
  useEffect(() => {
    console.log('=== Messages Auto-Select Debug ===');
    console.log('Conversations loaded:', conversations.length);
    console.log('Location state:', location.state);

    const conversationId = searchParams.get('conversationId');
    const recipientId = location.state?.recipientId;

    console.log('ConversationId from params:', conversationId);
    console.log('RecipientId from state:', recipientId);

    if (recipientId) {
      console.log('Attempting to find/create conversation with recipientId:', recipientId);

      if (conversations.length === 0) {
        console.log('Conversations not loaded yet, will retry...');
        return;
      }

      // Find or create conversation with this recipient
      const existingConv = conversations.find(conv => {
        const other = getOtherUser(conv);
        const matches = other?.id === recipientId;
        console.log(`Checking conversation ${conv.id}: other user ID = ${other?.id}, matches = ${matches}`);
        return matches;
      });

      if (existingConv && (!selectedConversation || selectedConversation.id !== existingConv.id)) {
        console.log('Found existing conversation:', existingConv.id);
        setSelectedConversation(existingConv);
        // Clear location state after selecting
        navigate(location.pathname, { replace: true, state: {} });
      } else if (!existingConv) {
        console.log('No existing conversation, creating new one...');
        // Create new conversation with this user
        api.getOrCreateConversation(recipientId)
          .then(newConv => {
            console.log('Created new conversation:', newConv.id);
            setSelectedConversation(newConv);
            loadConversations(); // Reload to show new conversation in list
            // Clear location state after selecting
            navigate(location.pathname, { replace: true, state: {} });
          })
          .catch(err => {
            console.error('Error creating conversation:', err);
            alert('Không thể tạo cuộc trò chuyện: ' + (err.response?.data?.error || err.message));
          });
      } else {
        console.log('Conversation already selected');
      }
    } else if (conversationId && conversations.length > 0 && !location.state?.recipientId) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && (!selectedConversation || selectedConversation.id !== conversationId)) {
        setSelectedConversation(conversation);
        // Remove query param after selecting
        setSearchParams({});
      }
    }
  }, [conversations, searchParams, location.state, selectedConversation, setSearchParams, navigate, location.pathname]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await api.getMyConversations();
      setConversations(data || []);

      // Load last message for each conversation to show preview
      const lastMsgs = {};
      const counts = {};
      for (const conv of data || []) {
        try {
          // Load last message (only 1 message, most recent)
          const messages = await api.getMessages(conv.id, 0, 1);
          if (messages && messages.length > 0) {
            // Get the last message (most recent)
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.content) {
              const preview = lastMsg.content.length > 50
                ? lastMsg.content.substring(0, 50) + '...'
                : lastMsg.content;
              lastMsgs[conv.id] = preview;
            }
          }

          // Load unread count
          const unread = await api.getUnreadCountForConversation?.(conv.id) || 0;
          counts[conv.id] = unread;
        } catch (e) {
          console.error(`Error loading data for conversation ${conv.id}:`, e);
          counts[conv.id] = 0;
        }
      }
      setLastMessages(lastMsgs);
      setConversationUnreadCounts(counts);
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

      // Update last message preview if there are messages
      if (data && data.length > 0) {
        const lastMsg = data[data.length - 1];
        if (lastMsg && lastMsg.content) {
          const preview = lastMsg.content.length > 50
            ? lastMsg.content.substring(0, 50) + '...'
            : lastMsg.content;
          setLastMessages(prev => ({ ...prev, [conversationId]: preview }));
        }
      }

      // Mark as read
      try {
        await api.markConversationAsRead(conversationId);
        await loadUnreadCount();
        setConversationUnreadCounts(prev => ({ ...prev, [conversationId]: 0 }));
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
      await loadMessages(selectedConversation.id);

      // Update last message preview immediately
      const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
      setLastMessages(prev => ({ ...prev, [selectedConversation.id]: preview }));

      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi tin nhắn'));
      setInput(content);
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

  const getAvatarUrl = (avatarUrl) => {
    return getFullUrl(avatarUrl);
  };

  const handleViewProfile = () => {
    setShowUserInfoModal(true);
    setShowMenu(false);
  };

  const handleDeleteMessages = async () => {
    if (!selectedConversation) return;

    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ tin nhắn trong cuộc trò chuyện này?')) {
      return;
    }

    try {
      await api.deleteAllMessages(selectedConversation.id);
      setMessages([]);
      setLastMessages(prev => ({ ...prev, [selectedConversation.id]: '' }));
      alert('Đã xóa toàn bộ tin nhắn');
    } catch (error) {
      console.error('Error deleting messages:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa tin nhắn'));
    } finally {
      setShowMenu(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const students = await api.getAvailableStudents();
      setStudentList(students || []);
    } catch (e) {
      console.error("Failed to fetch students", e);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'students' && studentList.length === 0) {
      fetchStudents();
    }
  }, [activeTab]);

  const handleStartNewChat = async (recipientId) => {
    try {
      const conv = await api.getOrCreateConversation(recipientId);
      if (conv) {
        setSelectedConversation(conv);
        if (!conversations.find(c => c.id === conv.id)) {
          setConversations(prev => [conv, ...prev]);
        }
        setActiveTab('messages');
      }
    } catch (e) {
      console.error("Failed to start chat", e);
      alert("Không thể bắt đầu cuộc trò chuyện");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col animate-fade-in">
      {/* Glass Container */}
      <div className="flex-1 bg-white/60 dark:bg-gray-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/5 flex flex-col md:flex-row">

        {/* Conversations List - Left Side */}
        <div className="w-full md:w-[350px] lg:w-[400px] border-r border-gray-100 dark:border-gray-700/50 flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800 dark:to-gray-800">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3 mb-4">
              <i className="fas fa-comments text-blue-500"></i>
              Chat
            </h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'messages'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <i className="fas fa-comments mr-2"></i>
                Tin nhắn
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'students'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <i className="fas fa-user-graduate mr-2"></i>
                Sinh viên
              </button>
            </div>

            {activeTab === 'messages' && unreadCount > 0 && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                {unreadCount} tin nhắn mới
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {activeTab === 'messages' ? (
              <>
                {loadingConversations ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 font-medium">Đang tải cuộc trò chuyện...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-60">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-comment-slash text-3xl text-gray-400"></i>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">Chưa có tin nhắn</p>
                    <p className="text-sm text-gray-500">Hộp thư của bạn đang trống</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    if (!otherUser) return null;
                    const isSelected = selectedConversation?.id === conversation.id;
                    const unreadCount = conversationUnreadCounts[conversation.id] || 0;
                    const avatarUrl = getAvatarUrl(otherUser.avatarUrl);

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleConversationClick(conversation)}
                        className={`w-full p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden text-left ${isSelected
                          ? 'bg-blue-600 shadow-lg shadow-blue-500/30'
                          : 'hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md'
                          }`}
                      >
                        {/* Background decoration for selected */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                        )}

                        <div className="flex items-center gap-4 relative z-10">
                          <div className="relative flex-shrink-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={otherUser.fullName}
                                className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isSelected ? 'border-blue-300' : 'border-white dark:border-gray-700'}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 shadow-sm ${avatarUrl ? 'hidden' : ''
                              } ${isSelected
                                ? 'bg-white/20 text-white border-blue-400'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-500 dark:text-gray-300 border-white dark:border-gray-600'
                              }`}>
                              {otherUser.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            {unreadCount > 0 && !isSelected && (
                              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {otherUser.fullName || 'Người dùng'}
                              </h3>
                              {conversation.lastMessageAt && (
                                <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                  {formatDate(conversation.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs truncate font-medium ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                              {lastMessages[conversation.id] || 'Bắt đầu cuộc trò chuyện...'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            ) : (
              <>
                {loadingStudents ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : studentList.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <p>Hiện chưa có sinh viên nào.</p>
                  </div>
                ) : (
                  studentList.map(student => {
                    const avatarUrl = getAvatarUrl(student.avatarUrl);
                    return (
                      <button
                        key={student.id}
                        onClick={() => handleStartNewChat(student.id)}
                        className="w-full p-4 rounded-2xl hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={student.fullName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm ${avatarUrl ? 'hidden' : ''}`}>
                              {student.fullName?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white">{student.fullName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Sinh viên</p>
                          </div>
                          <div className="ml-auto">
                            <i className="fas fa-comment-alt text-blue-500"></i>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            )}
          </div>
        </div>

        {/* Messages - Right Side */}
        <div className="flex-1 flex flex-col bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                <i className="fas fa-paper-plane text-4xl text-blue-500"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Xin chào, {user?.fullName}!</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin với ứng viên.
              </p>
            </div>
          ) : (
            <>
              {/* Messages Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
                {(() => {
                  const otherUser = getOtherUser(selectedConversation);
                  if (!otherUser) return null;
                  const avatarUrl = getAvatarUrl(otherUser.avatarUrl);
                  return (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={otherUser.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md cursor-pointer hover:scale-105 transition-transform"
                            onClick={handleViewProfile}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md cursor-pointer hover:scale-105 transition-transform ${avatarUrl ? 'hidden' : ''}`}
                          onClick={handleViewProfile}
                        >
                          {otherUser.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" onClick={handleViewProfile}>
                          {otherUser.fullName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                            {otherUser.role === 'STUDENT' ? 'Sinh viên' : 'Nhà tuyển dụng'}
                          </span>
                          {selectedConversation.jobTitle && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 dark:text-blue-400">{selectedConversation.jobTitle}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-white hover:shadow-md hover:text-blue-600 transition-all flex items-center justify-center"
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transform origin-top-right transition-all animation-scale-in z-50">
                      <div className="p-1">
                        <button
                          onClick={handleViewProfile}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            <i className="fas fa-user text-xs"></i>
                          </div>
                          Xem hồ sơ
                        </button>
                        <div className="my-1 border-b border-gray-100 dark:border-gray-800"></div>
                        <button
                          onClick={handleDeleteMessages}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl flex items-center gap-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                            <i className="fas fa-trash-alt text-xs"></i>
                          </div>
                          Xóa cuộc trò chuyện
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/50 dark:bg-gray-900/50">
                {messages.length === 0 ? (
                  <div className="text-center py-20 opacity-60">
                    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-hand-sparkles text-4xl text-blue-400"></i>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium text-lg">Bắt đầu cuộc trò chuyện</p>
                    <p className="text-gray-500">Gửi lời chào để bắt đầu kết nối!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMyMessage = msg.sender?.id === user?.id;
                    const showAvatar = !isMyMessage && (index === 0 || messages[index - 1].sender?.id !== msg.sender?.id);

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} items-end gap-3 group`}
                      >
                        {!isMyMessage && (
                          <div className="w-8 flex-shrink-0">
                            {showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {msg.sender?.fullName?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[70%] relative px-5 py-3 shadow-sm text-sm leading-relaxed transition-all hover:shadow-md ${isMyMessage
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm'
                            }`}
                        >
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          <div className={`text-[10px] mt-1 font-medium flex items-center justify-end gap-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                            {isMyMessage && <i className="fas fa-check-double text-[9px] opacity-70"></i>}
                          </div>
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 ${isMyMessage ? 'order-first' : ''}`}>
                          {/* Placeholder for future actions like reply/react */}
                        </div>
                      </div>
                    );
                  })
                )}

                {loading && (
                  <div className="flex justify-start items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <i className="fas fa-ellipsis-h text-gray-400 text-xs"></i>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700/50">
                <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-3xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center flex-shrink-0"
                    title="Đính kèm file (Demo)"
                  >
                    <i className="fas fa-paperclip"></i>
                  </button>

                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-gray-800 dark:text-white placeholder-gray-400 resize-none max-h-32 min-h-[44px]"
                    rows={1}
                    disabled={loading}
                    style={{ height: 'auto', minHeight: '44px' }}
                  />

                  <div className="flex items-center gap-1 pb-1">
                    <button
                      type="button"
                      className="w-9 h-9 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <i className="far fa-smile"></i>
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95 ${!input.trim()
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'
                        }`}
                    >
                      {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                    </button>
                  </div>
                </form>
                <div className="text-center mt-2">
                  <p className="text-[10px] text-gray-400">Nhấn Enter để gửi, Shift + Enter để xuống dòng</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Info Modal */}
      {selectedConversation && (
        <UserInfoModal
          isOpen={showUserInfoModal}
          onClose={() => setShowUserInfoModal(false)}
          user={getOtherUser(selectedConversation)}
          userRole={getOtherUser(selectedConversation)?.role}
        />
      )}
    </div>
  );
}
