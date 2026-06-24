import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import UserInfoModal from '../../components/UserInfoModal';
import { getFullUrl } from '../../utils/apiUtils';

export default function Messages() {
  const { user } = useAuth();
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadRecruiters();

    pollingIntervalRef.current = setInterval(() => {
      if (conversation) {
        loadMessages(conversation.id);
      }
      loadRecruiters();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversation]);

  useEffect(() => {
    if (conversation) {
      loadMessages(conversation.id);
    }
  }, [conversation]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRecruiters = async () => {
    try {
      setLoadingRecruiters(true);
      const data = await api.getAllRecruiters();
      setRecruiters(data || []);

      const conversations = await api.getAdminConversations();
      const lastMsgs = {};

      for (const recruiter of data || []) {
        const conv = conversations?.find(c =>
          (c.participant1?.id === recruiter.id || c.participant2?.id === recruiter.id)
        );

        if (conv) {
          try {
            const msgs = await api.getAdminMessages(conv.id, 0, 1);
            if (msgs && msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              if (lastMsg && lastMsg.content) {
                const preview = lastMsg.content.length > 30
                  ? lastMsg.content.substring(0, 30) + '...'
                  : lastMsg.content;
                lastMsgs[recruiter.id] = preview;
              }
            }
          } catch (e) { }
        }
      }
      setLastMessages(lastMsgs);
    } catch (error) {
      console.error('Error loading recruiters:', error);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.getAdminMessages(conversationId, 0, 100);
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleRecruiterClick = async (recruiter) => {
    setSelectedRecruiter(recruiter);
    try {
      const conv = await api.getOrCreateAdminConversation(recruiter.id);
      setConversation(conv);
      await loadMessages(conv.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể tạo cuộc trò chuyện'));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !conversation) return;

    const content = input;
    setInput('');
    setLoading(true);

    try {
      await api.sendAdminMessage(conversation.id, content);
      await loadMessages(conversation.id);

      if (selectedRecruiter) {
        const preview = content.length > 30 ? content.substring(0, 30) + '...' : content;
        setLastMessages(prev => ({ ...prev, [selectedRecruiter.id]: preview }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi tin nhắn'));
      setInput(content);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = (typeof dateString === 'string' && !dateString.includes('Z') && !dateString.includes('+') && !/-\d{2}:\d{2}$/.test(dateString))
      ? new Date(dateString + 'Z')
      : new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarUrl = (avatarUrl) => {
    return getFullUrl(avatarUrl);
  };

  const handleDeleteMessages = async () => {
    if (!conversation) return;
    if (!window.confirm('Xóa vĩnh viễn lịch sử trò chuyện này?')) return;

    try {
      await api.deleteAllMessages(conversation.id);
      setMessages([]);
      if (selectedRecruiter) setLastMessages(prev => ({ ...prev, [selectedRecruiter.id]: '' }));
    } catch (error) {
      console.error('Error deleting messages:', error);
    } finally {
      setShowMenu(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] animate-fade-in flex gap-6 pb-6">
      {/* Sidebar List */}
      <div className="w-[380px] flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden shrink-0">
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm">
              <i className="fas fa-comment-dots"></i>
            </div>
            Hỗ trợ DN
          </h2>
          <div className="mt-6 relative group">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-indigo-500"></i>
            <input
              type="text"
              placeholder="Tìm kiếm đối tác..."
              className="w-full pl-12 pr-6 py-4 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/30 rounded-[1.5rem] text-sm outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {loadingRecruiters && recruiters.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang kết nối...</p>
            </div>
          ) : recruiters.map((recruiter) => (
            <button
              key={recruiter.id}
              onClick={() => handleRecruiterClick(recruiter)}
              className={`w-full p-6 rounded-[2rem] transition-all flex items-center gap-4 group ${selectedRecruiter?.id === recruiter.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl'
                : 'hover:bg-indigo-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-sm">
                  {recruiter.avatarUrl ? (
                    <img src={getAvatarUrl(recruiter.avatarUrl)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-black">
                      {recruiter.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500"></div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-black text-sm uppercase tracking-wider line-clamp-1">{recruiter.fullName}</p>
                <p className={`text-[10px] font-bold mt-0.5 line-clamp-1 opacity-60`}>
                  {lastMessages[recruiter.id] || 'Sẵn sàng hỗ trợ'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden relative">
        {!selectedRecruiter ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 animate-fade-in text-center">
            <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-[3rem] flex items-center justify-center text-indigo-600 text-4xl mb-8 animate-bounce transition-all duration-[3000ms]">
              <i className="fas fa-satellite-dish"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Trung tâm điều phối hỗ trợ</h3>
            <p className="text-slate-500 font-medium max-w-sm">Chọn một đối tác doanh nghiệp từ danh sách bên trái để bắt đầu hỗ trợ hoặc trao đổi chuyên sâu.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-10 py-6 border-b border-white/20 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 overflow-hidden shadow-sm">
                  {selectedRecruiter.avatarUrl ? (
                    <img src={getAvatarUrl(selectedRecruiter.avatarUrl)} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-indigo-600">
                      {selectedRecruiter.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs leading-none mb-1.5">{selectedRecruiter.fullName}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trực tuyến</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUserInfoModal(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <i className="fas fa-info-circle"></i>
                </button>
                <button
                  onClick={handleDeleteMessages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
              {messages.map((msg, idx) => {
                const isMe = msg.sender?.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-scale-in`} style={{ animationDelay: `${idx * 20}ms` }}>
                    <div className={`max-w-[75%] space-y-2`}>
                      <div className={`px-6 py-4 rounded-[2rem] shadow-sm text-sm font-medium ${isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-white dark:border-slate-700 rounded-tl-none'
                        }`}>
                        {msg.content}
                      </div>
                      <div className={`text-[9px] font-black uppercase tracking-widest px-2 ${isMe ? 'text-right text-indigo-400' : 'text-slate-400'}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-8">
              <form onSubmit={handleSend} className="relative flex items-center gap-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-white/50 dark:border-slate-700/50 p-2 pl-4 shadow-xl focus-within:border-indigo-500/50 transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Viết phản hồi hỗ trợ..."
                  className="flex-1 bg-transparent py-4 text-sm font-medium outline-none dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center text-lg shadow-xl shadow-slate-900/10 hover:shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-30"
                >
                  <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {showUserInfoModal && selectedRecruiter && (
        <UserInfoModal
          isOpen={showUserInfoModal}
          onClose={() => setShowUserInfoModal(false)}
          user={selectedRecruiter}
          userRole="RECRUITER"
        />
      )}
    </div>
  );
}

