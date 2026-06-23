import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileMessages() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);

    useEffect(() => {
        loadConversations();
        const convId = searchParams.get('conversationId');
        if (convId) {
            // Find in loaded convs or fetch
            fetchAndSelectConv(convId);
        }

        pollingRef.current = setInterval(() => {
            loadConversations(true);
            if (selectedConv) loadMessages(selectedConv.id, true);
        }, 3000);

        return () => clearInterval(pollingRef.current);
    }, [selectedConv?.id]);

    const loadConversations = async (silent = false) => {
        try {
            const data = await api.getMyConversations();
            setConversations(data || []);
        } catch (e) { }
    };

    const fetchAndSelectConv = async (id) => {
        try {
            const data = await api.getMyConversations();
            const found = data.find(c => c.id === id);
            if (found) setSelectedConv(found);
        } catch (e) { }
    };

    const loadMessages = async (id, silent = false) => {
        try {
            const data = await api.getMessages(id, 0, 50);
            const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(sorted);
            if (!silent) api.markConversationAsRead(id).catch(() => { });
        } catch (e) { }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedConv) return;
        const content = input;
        setInput('');
        try {
            await api.sendMessage(selectedConv.id, content);
            loadMessages(selectedConv.id, true);
        } catch (e) { }
    };

    const getOtherUser = (c) => {
        if (!c || !user) return null;
        return c.participant1?.id === user.id ? c.participant2 : c.participant1;
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // View Logic: If selectedConv exists, show Chat, else show List
    if (selectedConv) {
        const other = getOtherUser(selectedConv);
        return (
            <div className="h-screen bg-slate-50 dark:bg-black flex flex-col fixed inset-0 z-50 animate-fade-in">
                {/* Chat Header */}
                <div className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <button onClick={() => setSelectedConv(null)} className="p-2 text-slate-400"><i className="fas fa-arrow-left"></i></button>
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black overflow-hidden border border-slate-100 dark:border-slate-800">
                        {other?.avatarUrl ? <img src={api.getFileUrl(other.avatarUrl)} className="w-full h-full object-cover" /> : other?.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{other?.fullName}</h3>
                        <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Đang hoạt động</p>
                    </div>
                    <button className="p-2 text-slate-400"><i className="fas fa-ellipsis-v"></i></button>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {messages.map((msg, i) => {
                        const isMe = msg.sender?.id === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-[1.5rem] text-[10px] font-medium leading-relaxed shadow-sm ${isMe
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-800'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 safe-bottom">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-[10px] font-bold dark:text-white focus:ring-2 focus:ring-indigo-600 transition-all"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button type="submit" className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                            <i className="fas fa-paper-plane text-xs"></i>
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Tin nhắn</h1>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-xs text-slate-400 border border-slate-200 dark:border-slate-800">
                    <i className="fas fa-pen"></i>
                </div>
            </div>

            <div className="px-6 space-y-1">
                {conversations.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-comment-slash text-4xl mb-4"></i>
                        <p className="font-bold text-sm">Chưa có liên hệ nào.</p>
                    </div>
                ) : (
                    conversations.map(c => {
                        const other = getOtherUser(c);
                        return (
                            <button
                                key={c.id}
                                onClick={() => { setSelectedConv(c); loadMessages(c.id); }}
                                className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 active:scale-[0.98] transition-all"
                            >
                                <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black overflow-hidden border border-slate-100 dark:border-slate-800">
                                    {other?.avatarUrl ? <img src={api.getFileUrl(other.avatarUrl)} className="w-full h-full object-cover" /> : other?.fullName?.charAt(0)}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{other?.fullName}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold truncate mt-1">Bấm để xem cuộc trò chuyện</p>
                                </div>
                                {c.unreadCount > 0 && <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] font-black text-white">{c.unreadCount}</div>}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
