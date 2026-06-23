import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCompanies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [activeIndustry, setActiveIndustry] = useState('');

    const industries = [
        { value: '', label: 'Tất cả' },
        { value: 'Information Technology', label: 'IT' },
        { value: 'Fintech', label: 'Tài chính' },
        { value: 'E-commerce', label: 'TMĐT' },
        { value: 'Education', label: 'Giáo dục' },
        { value: 'Marketing', label: 'Marketing' },
    ];

    useEffect(() => {
        loadCompanies();
    }, [activeIndustry]);

    const loadCompanies = async (search = '') => {
        try {
            setLoading(true);
            const data = await api.getCompanies(0, 50, search || keyword);
            let results = data.content || [];
            if (activeIndustry) {
                results = results.filter(c => c.industry === activeIndustry);
            }
            setCompanies(results);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setKeyword(val);
        if (val.length > 2 || val.length === 0) {
            loadCompanies(val);
        }
    };



    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            {/* Header */}
            <div className="sticky top-[61px] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 px-1">Công ty</h1>

                <div className="relative mb-4">
                    <input
                        type="text"
                        value={keyword}
                        onChange={handleSearch}
                        placeholder="Tìm công ty ưu tú..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-700 dark:text-white"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className="fas fa-building"></i>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
                    {industries.map((ind, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndustry(ind.value)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeIndustry === ind.value
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}
                        >
                            {ind.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="p-4 space-y-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-5 animate-pulse flex gap-4">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                            <div className="flex-1 space-y-2 pt-2">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                            </div>
                        </div>
                    ))
                ) : companies.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-city text-4xl mb-4"></i>
                        <p className="font-bold text-sm">Chưa có công ty nào phù hợp.</p>
                    </div>
                ) : (
                    companies.map((company) => (
                        <div
                            key={company.id}
                            onClick={() => navigate(`/mobile/companies/${company.id}`)}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800/50 flex gap-4 active:scale-95 transition-all"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 p-3 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
                                <img
                                    src={api.getFileUrl(company.logoUrl) || `https://ui-avatars.com/api/?name=${company.name}&background=random`}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm leading-tight truncate">{company.name}</h3>
                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">{company.industry || 'Đa ngành'}</p>

                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                        <i className="fas fa-map-marker-alt text-rose-500"></i> {company.headquarters || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                        <i className="fas fa-star text-amber-400"></i> {company.averageRating?.toFixed(1) || '0.0'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <i className="fas fa-chevron-right text-slate-200 text-xs"></i>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
