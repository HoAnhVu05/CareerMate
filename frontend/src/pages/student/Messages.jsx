import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import UserInfoModal from '../../components/UserInfoModal';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'recruiters'

  // Recruiter List State (now for tab, not modal)
  const [recruiterList, setRecruiterList] = useState([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);

  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();

    // Poll for new messages every 3 seconds (faster for chat)
    pollingIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.id, true); // silent load
      }
      loadUnreadCount();
      loadConversations(true); // silent load
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [selectedConversation]); // Re-create poll if selected changes (closure capture)

  // Auto-select conversation from URL or State
  useEffect(() => {
    const initConversation = async () => {
      // Check for recipientId passed via state (from Applications page)
      const stateRecipientId = location.state?.recipientId;
      if (stateRecipientId) {
        try {
          const conv = await api.getOrCreateConversation(stateRecipientId);
          if (conv) {
            setSelectedConversation(conv);
            // Clear state to prevent re-opening if navigated back
            window.history.replaceState({}, document.title);
            return;
          }
        } catch (e) {
          console.error("Failed to init conversation with recipient", e);
        }
      }

      // Check for conversationId in URL
      const conversationId = searchParams.get('conversationId');
      if (conversationId && conversations.length > 0) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation && (!selectedConversation || selectedConversation.id !== conversationId)) {
          setSelectedConversation(conversation);
          setSearchParams({});
        }
      }
    };

    initConversation();
  }, [conversations, searchParams, location.state]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setLoadingConversations(true);
      const data = await api.getMyConversations();

      // Only update if data changed (Simple check to prevent flicker)
      setConversations(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data || [])) return prev;
        return data || [];
      });

      // Load metadata
      const lastMsgs = { ...lastMessages };
      let hasChanges = false;

      // Async metadata loading
      for (const conv of data || []) {
        try {
          // Optimization: Only fetch last message if we don't have it or if the conversation updated recently
          // This assumes conv has an 'updatedAt' or 'lastMessageAt' field we can check against.
          // For now, to stop flicker, we will fetch but check equality before setting.

          // To reduce load, ideally we only fetch if we suspect change.
          // Let's assume we must fetch for now but verify change.
          const info = await api.getMessages(conv.id, 0, 1);
          if (info && info.length > 0) {
            const lastMsgContent = info[info.length - 1].content;
            if (lastMsgs[conv.id] !== lastMsgContent) {
              lastMsgs[conv.id] = lastMsgContent;
              hasChanges = true;
            }
          }
        } catch (e) { }
      }

      if (hasChanges) {
        setLastMessages(prev => ({ ...prev, ...lastMsgs }));
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId, silent = false) => {
    try {
      const data = await api.getMessages(conversationId, 0, 50);
      // Only update if different length to prevent jitter? Or just set.
      // For chat, simpler to just set.
      // Reverse if API returns newest first? Assuming API returns chronological or we sort.
      // Usually chat APIs return newest last or we sort by createdAt.
      // Let's sort to be safe.
      const sorted = (data || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sorted);

      if (!silent) {
        // Mark read
        api.markConversationAsRead(conversationId).catch(() => { });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) { }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedConversation) return;

    const content = input;
    setInput('');
    // Optimistic update
    const tempMsg = {
      id: 'temp-' + Date.now(),
      content: content,
      sender: user,
      createdAt: new Date().toISOString(),
      isTemp: true
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await api.sendMessage(selectedConversation.id, content);
      loadMessages(selectedConversation.id, true);
      // Update sidebar preview
      setLastMessages(prev => ({ ...prev, [selectedConversation.id]: content }));
    } catch (error) {
      console.error('Send failed:', error);
      // Remove temp message?
    }
  };

  const handleDeleteMessages = async () => {
    if (!selectedConversation || !window.confirm('Xóa toàn bộ cuộc trò chuyện này?')) return;
    try {
      await api.deleteAllMessages(selectedConversation.id);
      setMessages([]);
      setLastMessages(prev => ({ ...prev, [selectedConversation.id]: '' }));
    } catch (e) {
      alert('Không thể xóa tin nhắn');
    }
    setShowMenu(false);
  };

  const fetchRecruiters = async () => {
    try {
      setLoadingRecruiters(true);
      const recruiters = await api.getAvailableRecruiters();
      setRecruiterList(recruiters || []);
    } catch (e) {
      console.error("Failed to fetch recruiters", e);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  // Load recruiters when switching to recruiters tab
  useEffect(() => {
    if (activeTab === 'recruiters' && recruiterList.length === 0) {
      fetchRecruiters();
    }
  }, [activeTab]);

  const handleStartNewChat = async (recipientId) => {
    try {
      const conv = await api.getOrCreateConversation(recipientId);
      if (conv) {
        setSelectedConversation(conv);
        // Optimistically add to list if not present
        if (!conversations.find(c => c.id === conv.id)) {
          setConversations(prev => [conv, ...prev]);
        }
        // Switch back to messages tab
        setActiveTab('messages');
      }
    } catch (e) {
      console.error("Failed to start chat", e);
      alert("Không thể bắt đầu cuộc trò chuyện");
    }
  };

  const getOtherUser = (conv) => {
    if (!conv || !user) return null;
    return conv.participant1?.id === user.id ? conv.participant2 : conv.participant1;
  };

  const filteredConversations = conversations.filter(c => {
    const other = getOtherUser(c);
    if (!other) return false;
    return other.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getAvatar = (u) => {
    if (!u?.avatarUrl) return null;
    return api.getFileUrl(u.avatarUrl);
  };

  return (
    <div className="flex h-full bg-white dark:bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-blue-50/20 dark:bg-blue-900/5 pointer-events-none"></div>

      {/* Sidebar List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-20`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Chat</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'messages'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <i className="fas fa-comments mr-2"></i>
              Tin nhắn
            </button>
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${activeTab === 'recruiters'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              <i className="fas fa-user-tie mr-2"></i>
              Chuyên gia
            </button>
          </div>

          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {activeTab === 'messages' ? (
            // Conversations List
            <>
              {loadingConversations ? (
                <div className="space-y-3 p-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>)}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'}
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const other = getOtherUser(conv);
                  const active = selectedConversation?.id === conv.id;
                  const lastMsg = lastMessages[conv.id] || 'Bắt đầu trò chuyện';
                  const avatar = getAvatar(other);

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active
                        ? 'bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      <div className="relative">
                        {avatar ? (
                          <img src={avatar} alt="avt" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {other?.fullName?.[0]}
                          </div>
                        )}
                        {/* Status dot (fake for now) */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className={`text-sm font-bold truncate ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                            {other?.fullName}
                          </h3>
                          <span className="text-[10px] text-gray-400">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${active ? 'text-blue-500/80 dark:text-blue-300/80' : 'text-gray-500 font-medium'}`}>
                          {lastMsg}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          ) : (
            // Recruiters List
            <>
              {loadingRecruiters ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : recruiterList.filter(r => r.fullName?.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <p>{searchTerm ? 'Không tìm thấy kết quả' : 'Hiện chưa có chuyên gia nào.'}</p>
                </div>
              ) : (
                recruiterList
                  .filter(r => r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(recruiter => (
                    <button
                      key={recruiter.id}
                      onClick={() => handleStartNewChat(recruiter.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                    >
                      <div className="relative">
                        {recruiter.avatarUrl ? (
                          <img
                            src={getAvatar(recruiter)}
                            alt={recruiter.fullName}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {recruiter.fullName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 dark:text-white">{recruiter.fullName}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Chuyên gia / Nhà tuyển dụng</p>
                      </div>
                      <div className="ml-auto">
                        <i className="fas fa-comment-alt text-blue-500"></i>
                      </div>
                    </button>
                  ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative bg-white dark:bg-black`}>
        {!selectedConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-blue-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
              <i className="fas fa-paper-plane text-4xl text-blue-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">CareerMate Messenger</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Kết nối trực tiếp với nhà tuyển dụng và cố vấn nghề nghiệp. Chọn một cuộc trò chuyện để bắt đầu.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden mr-2 p-2 -ml-2 text-gray-600 dark:text-gray-300"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {(() => {
                  const other = getOtherUser(selectedConversation);
                  const avatar = getAvatar(other);
                  return (
                    <>
                      <div className="relative">
                        {avatar ? (
                          <img src={avatar} className="w-10 h-10 rounded-full object-cover shadow-sm" alt="avt" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {other?.fullName?.[0]}
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {other?.fullName}
                        </h3>
                        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                          Đang hoạt động
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition"
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 animate-fade-in z-50">
                    <button
                      onClick={() => { setShowUserInfoModal(true); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <i className="fas fa-user text-gray-400"></i> Xem hồ sơ
                    </button>
                    <button
                      onClick={handleDeleteMessages}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                    >
                      <i className="fas fa-trash text-red-400"></i> Xóa tin nhắn
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50 dark:bg-black/50 custom-scrollbar scroll-smooth">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <i className="fas fa-comment-dots text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500 text-sm">Chưa có tin nhắn nào</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender?.id === user?.id;
                  const showAvatar = !isMe && (i === 0 || messages[i - 1].sender?.id !== msg.sender?.id);
                  const otherUser = getOtherUser(selectedConversation);
                  const avatar = getAvatar(otherUser);

                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'justify-end' : ''} group`}>
                      {!isMe && (
                        <div className="w-8 flex-shrink-0 flex items-end">
                          {showAvatar ? (
                            avatar ? (
                              <img src={avatar} className="w-8 h-8 rounded-full shadow-sm" alt="avt" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                                {otherUser?.fullName?.[0]}
                              </div>
                            )
                          ) : <div className="w-8" />}
                        </div>
                      )}

                      <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm relative ${isMe
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                            }`}
                        >
                          {msg.content}
                        </div>
                        <span className={`text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity px-1`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {isMe && (
                        <div className="w-4 flex flex-col justify-end pb-2">
                          {/* Seen indicator, optional */}
                          {i === messages.length - 1 && (
                            <i className="fas fa-check-circle text-[10px] text-blue-500"></i>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSend} className="flex gap-3 items-end max-w-4xl mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('recruiters')}
                  className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                  title="Tìm chuyên gia"
                >
                  <i className="fas fa-user-plus"></i>
                </button>
                <button type="button" className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <i className="fas fa-image"></i>
                </button>

                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center px-4 py-1.5 focus-within:ring-2 ring-blue-500/30 transition-shadow">
                  <input
                    type="text"
                    className="w-full bg-transparent border-none focus:ring-0 py-2.5 text-sm max-h-32 dark:text-white"
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                  />
                  <button type="button" className="p-2 text-gray-400 hover:text-yellow-500 transition">
                    <i className="far fa-smile"></i>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-transform hover:scale-105 shadow-md flex-shrink-0"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </>
        )}
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
