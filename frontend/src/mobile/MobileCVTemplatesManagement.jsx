import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCVTemplatesManagement() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getCVTemplates('');
            setTemplates(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in text-slate-800 dark:text-white font-sans">
            <div className="p-6 pt-12 flex flex-col bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-[61px] z-40">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                        <h1 className="text-xl font-black uppercase tracking-tight">Thư viện Mẫu CV</h1>
                    </div>
                    <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-transform">
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Tài nguyên hiện có</span>
                    <span className="text-lg font-black text-emerald-600">{templates.length}</span>
                </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-white dark:bg-slate-900 rounded-3xl animate-pulse"></div>
                    ))
                ) : templates.length === 0 ? (
                    <div className="col-span-2 text-center py-20 opacity-50">
                        <i className="fas fa-file-contract text-4xl mb-4 text-slate-300"></i>
                        <p className="font-black text-sm uppercase">Trống.</p>
                    </div>
                ) : (
                    templates.map((t) => (
                        <div key={t.id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group active:scale-[0.98] transition-all relative">
                            <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 relative">
                                {t.previewImageUrl ? (
                                    <img src={t.previewImageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fas fa-file-invoice text-4xl"></i></div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {t.isPremium && <div className="bg-amber-400 text-white text-[8px] font-black px-2 py-1 rounded-lg">PRO</div>}
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <h4 className="text-[9px] font-black uppercase truncate">{t.name}</h4>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[8px] font-black uppercase text-slate-400"><i className="fas fa-edit"></i></button>
                                    <button className="flex-1 py-2 bg-rose-50 rounded-xl text-[8px] font-black uppercase text-rose-500"><i className="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
