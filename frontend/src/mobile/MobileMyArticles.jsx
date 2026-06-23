import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileMyArticles() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getMyArticles();
            setArticles(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex flex-col bg-slate-900 border-b border-white/5 relative overflow-hidden rounded-b-[2.5rem] mb-6 shadow-2xl">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-white/50"><i className="fas fa-arrow-left"></i></button>
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Bài viết của tôi</h1>
                    </div>
                    <button onClick={() => navigate('/mobile/articles/create')} className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-transform">
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
                <div className="flex gap-4 relative z-10">
                    <div className="flex-1 bg-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-white/50 uppercase">Đã đăng</p>
                        <p className="text-lg font-black text-white">{articles.length}</p>
                    </div>
                    <div className="flex-1 bg-white/10 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-white/50 uppercase">Lượt xem</p>
                        <p className="text-lg font-black text-white">1.2k</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="px-6 space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse"></div>
                    ))
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-newspaper text-4xl mb-4 text-indigo-500"></i>
                        <p className="font-bold text-sm uppercase">Chưa có bài viết nào.</p>
                        <button onClick={() => navigate('/mobile/articles/create')} className="text-[10px] font-black text-indigo-600 uppercase mt-4 underline">Viết bài đầu tiên</button>
                    </div>
                ) : (
                    articles.map((art) => (
                        <div key={art.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4 active:scale-[0.98] transition-all overflow-hidden relative">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0">
                                    <img src={art.thumbnail || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate tracking-tight mb-1">{art.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{art.status}</span>
                                        <span className="text-[8px] text-slate-400 font-bold uppercase">{new Date(art.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 border-t border-slate-50 dark:border-slate-800 pt-4">
                                <button onClick={() => navigate(`/mobile/articles/${art.id}`)} className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Xem bài</button>
                                <button className="flex-1 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-[8px] font-black uppercase tracking-widest text-indigo-600">Sửa bài</button>
                                <button className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-500 text-xs">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
