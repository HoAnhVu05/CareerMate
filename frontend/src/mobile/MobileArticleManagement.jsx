import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileArticleManagement() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    const tabs = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'PENDING', label: 'Chờ duyệt' },
        { id: 'PUBLISHED', label: 'Đã đăng' }
    ];

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getArticles({ page: 0, size: 50 });
            setArticles(data.content || data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in text-slate-800 dark:text-white">
            <div className="p-6 pt-12 flex flex-col bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-[61px] z-40">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                    <h1 className="text-xl font-black uppercase tracking-tight">Quản lý Bài Viết</h1>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === t.id
                                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-4">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse"></div>
                    ))
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-file-alt text-4xl mb-4 text-indigo-500"></i>
                        <p className="font-black text-sm uppercase">Không có bài viết.</p>
                    </div>
                ) : (
                    articles.map((art) => (
                        <div key={art.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4 active:scale-[0.98] transition-all overflow-hidden relative">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0">
                                    <img src={art.thumbnail || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[11px] font-black uppercase truncate tracking-tight mb-2 leading-tight">{art.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{art.authorName || 'Admin'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                                <span className={`text-[8px] font-black px-2 py-1 rounded uppercase bg-emerald-50 text-emerald-600`}>
                                    PUBLISHED
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/mobile/articles/${art.id}`)} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-[10px]">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
