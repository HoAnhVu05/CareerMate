import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileJobList() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const categories = ['Tất cả', 'IT', 'Marketing', 'Sales', 'Thiết kế', 'Kinh doanh', 'Giáo dục'];

    useEffect(() => {
        loadJobs();
    }, [activeCategory]);

    const loadJobs = async (searchKeyword = '') => {
        try {
            setLoading(true);
            const response = await api.searchJobs(
                searchKeyword || (activeCategory !== 'Tất cả' ? activeCategory : ''),
                '', // location
                0,  // page
                20  // size
            );
            setJobs(response.content || []);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setKeyword(val);
        // Basic debounce effect if needed, but for now simple 
        if (val.length > 2 || val.length === 0) {
            loadJobs(val);
        }
    };

    return (
        <div className="pb-24 animate-fade-in">
            {/* Search Header */}
            <div className="sticky top-[61px] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                    <input
                        type="text"
                        value={keyword}
                        onChange={handleSearch}
                        placeholder="Tìm theo chức danh, kỹ năng..."
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className="fas fa-search"></i>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 -mx-1 px-1">
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${activeCategory === cat
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Content */}
            <div className="p-4 space-y-4">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-50 dark:border-slate-700/50 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 px-10">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <i className="fas fa-search-minus text-3xl"></i>
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase">Không tìm thấy kết quả</h3>
                        <p className="text-sm text-slate-500 mt-2">Hãy thử đổi từ khóa hoặc bộ lọc khác để tìm kiếm cơ hội nhé!</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => navigate(`/mobile/jobs/${job.id}`)}
                            className="bg-white dark:bg-slate-800 rounded-[2rem] p-5 border border-slate-50 dark:border-slate-700/50 shadow-sm active:scale-[0.98] active:shadow-none transition-all duration-300 relative group"
                        >
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-2 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={api.getFileUrl(job.companyLogo) || `https://ui-avatars.com/api/?name=${job.companyName || 'C'}&background=random`}
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-slate-800 dark:text-white leading-tight line-clamp-1 group-active:text-indigo-600 transition-colors">{job.title}</h3>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{job.companyName}</p>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-100/50 dark:border-emerald-800/30">
                                            <i className="fas fa-money-bill-wave mr-1"></i> {job.salaryRange || 'Thỏa thuận'}
                                        </div>
                                        <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                                            <i className="fas fa-map-marker-alt mr-1"></i> {job.location || 'Remote'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
