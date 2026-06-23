import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileNotifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    useEffect(() => {
        loadNotifications();
    }, [page]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await api.getNotifications(page, 20);
            if (page === 0) setNotifications(data.content || []);
            else setNotifications(prev => [...prev, ...(data.content || [])]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
        } catch (e) { }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'NEW_APPLICATION': return { icon: 'fas fa-user-plus', color: 'bg-blue-500' };
            case 'APPLICATION_STATUS_CHANGED': return { icon: 'fas fa-sync-alt', color: 'bg-amber-500' };
            case 'JOB_APPROVED': return { icon: 'fas fa-check-circle', color: 'bg-emerald-500' };
            case 'ARTICLE_PENDING': return { icon: 'fas fa-clock', color: 'bg-indigo-500' };
            default: return { icon: 'fas fa-bell', color: 'bg-slate-400' };
        }
    };

    return (
        <div className="pb-24 animate-fade-in bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="p-6 pt-12 flex items-center justify-between border-b border-slate-100 dark:border-slate-900/50 bg-white dark:bg-slate-900 sticky top-[61px] z-40">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Thông báo</h1>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Đọc tất cả</button>
            </div>

            <div className="p-4 space-y-3">
                {loading && page === 0 ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-3xl animate-pulse"></div>
                    ))
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="far fa-bell text-4xl mb-4"></i>
                        <p className="font-bold text-sm">Chưa có thông báo mới.</p>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const style = getIcon(n.type);
                        const isUnread = n.status === 'UNREAD';
                        return (
                            <div
                                key={n.id}
                                onClick={() => handleMarkRead(n.id)}
                                className={`flex gap-4 p-5 rounded-[2rem] border transition-all ${isUnread
                                    ? 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/30 shadow-md shadow-indigo-500/5'
                                    : 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-60'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm shadow-lg ${style.color}`}>
                                    <i className={style.icon}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-[10px] font-black uppercase tracking-tight leading-tight ${isUnread ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>
                                        {n.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                                        {n.message}
                                    </p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">vừa xong</p>
                                </div>
                                {isUnread && <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/50"></div>}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
