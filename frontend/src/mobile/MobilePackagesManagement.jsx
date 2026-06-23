import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobilePackagesManagement() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getPackages();
            setPackages(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in text-slate-800 dark:text-white">
            <div className="p-6 pt-12 flex flex-col bg-slate-900 border-b border-white/5 relative overflow-hidden rounded-b-[2.5rem] mb-6 shadow-2xl">
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-white/50"><i className="fas fa-arrow-left"></i></button>
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Quản lý Gói Cước</h1>
                    </div>
                    <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-90 transition-transform">
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
            </div>

            <div className="px-6 space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse"></div>
                    ))
                ) : packages.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-box-open text-4xl mb-4 text-indigo-500"></i>
                        <p className="font-bold text-sm uppercase">Trống.</p>
                    </div>
                ) : (
                    packages.map((pkg) => (
                        <div key={pkg.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between active:scale-[0.98] transition-all relative">
                            <div className="flex-1">
                                <h3 className="text-[12px] font-black uppercase tracking-tight leading-none mb-2">{pkg.name}</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-black">{(pkg.price / 1000).toLocaleString()}k</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{pkg.durationDays} ngày</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center text-xs">
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-xs">
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
