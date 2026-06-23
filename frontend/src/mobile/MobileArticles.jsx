import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileArticles() {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [activeCategory, setActiveCategory] = useState('');

    const categories = [
        { value: '', label: 'Tất cả' },
        { value: 'CAREER', label: 'Sự nghiệp' },
        { value: 'SKILLS', label: 'Kỹ năng' },
        { value: 'TECHNOLOGY', label: 'Công nghệ' },
        { value: 'INTERVIEW', label: 'Phỏng vấn' },
        { value: 'CV', label: 'Tiểu sử' },
    ];

    useEffect(() => {
        loadArticles();
    }, [activeCategory]);

    const loadArticles = async (search = '') => {
        try {
            setLoading(true);
            const data = await api.getArticles(search || keyword, activeCategory);
            setArticles(data.content || data || []);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setKeyword(val);
        if (val.length > 2 || val.length === 0) {
            loadArticles(val);
        }
    };



    return (
        <div className="pb-24 animate-fade-in bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div className="sticky top-[61px] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 px-1">Cộng đồng</h1>

                <div className="relative mb-4">
                    <input
                        type="text"
                        value={keyword}
                        onChange={handleSearch}
                        placeholder="Tìm bài viết, kiến thức..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className="fas fa-search"></i>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveCategory(cat.value)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat.value
                                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 dark:border-white'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Feed */}
            <div className="p-4 space-y-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-sm animate-pulse">
                            <div className="h-48 bg-slate-100 dark:bg-slate-800"></div>
                            <div className="p-5 space-y-3">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="far fa-newspaper text-4xl mb-4"></i>
                        <p className="font-bold text-sm">Chưa có bài viết nào phù hợp.</p>
                    </div>
                ) : (
                    articles.map((article, index) => (
                        <div
                            key={article.id}
                            onClick={() => navigate(`/mobile/articles/${article.id}`)}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800/50 active:scale-[0.98] transition-all duration-300"
                        >
                            {article.thumbnailUrl && (
                                <div className="h-52 relative overflow-hidden">
                                    <img
                                        src={api.getFileUrl(article.thumbnailUrl)}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-tighter border border-white/30">
                                            {article.category || 'TIN TỨC'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-0.5 border border-slate-200">
                                        <img
                                            src={api.getFileUrl(article.author?.avatarUrl) || `https://ui-avatars.com/api/?name=${article.author?.fullName || 'A'}&background=random`}
                                            className="w-full h-full rounded-full object-cover"
                                            alt="Author"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{article.author?.fullName || 'Admin'}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400">
                                        <i className="far fa-eye mr-1"></i> {article.viewsCount || 0}
                                    </div>
                                </div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-2 line-clamp-2">{article.title}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{article.excerpt}</p>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="flex items-center gap-4 text-slate-400 text-xs">
                                        <span className="flex items-center gap-1"><i className="far fa-comment"></i> {article.commentsCount || 0}</span>
                                        <span className="flex items-center gap-1"><i className="far fa-heart"></i> {article.likesCount || 0}</span>
                                    </div>
                                    <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Đọc tiếp <i className="fas fa-arrow-right ml-1"></i></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
