import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCVTemplates() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');

    const categories = [
        { id: '', label: 'Tất cả' },
        { id: 'MODERN', label: 'Hiện đại' },
        { id: 'CREATIVE', label: 'Sáng tạo' },
        { id: 'MINIMAL', label: 'Tối giản' }
    ];

    useEffect(() => {
        loadData();
    }, [category]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getCVTemplates(category);
            setTemplates(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex flex-col bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-[61px] z-40">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Mẫu CV</h1>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setCategory(c.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${category === c.id
                                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-white dark:bg-slate-900 rounded-3xl animate-pulse"></div>
                    ))
                ) : templates.length === 0 ? (
                    <div className="col-span-2 text-center py-20 opacity-50">
                        <i className="fas fa-file-invoice text-4xl mb-4"></i>
                        <p className="font-bold text-sm uppercase">Chưa có mẫu nào.</p>
                    </div>
                ) : (
                    templates.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group active:scale-[0.98] transition-all">
                            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 relative">
                                {t.previewImageUrl ? (
                                    <img src={t.previewImageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <i className="fas fa-file-contract text-4xl mb-2"></i>
                                        <span className="text-[8px] font-black uppercase">Click to preview</span>
                                    </div>
                                )}
                                {t.isPremium && <div className="absolute top-2 right-2 bg-amber-400 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg">PRO</div>}
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900">
                                <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase truncate mb-3">{t.name}</h4>
                                <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">SỬ DỤNG</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
