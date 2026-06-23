import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileAnalytics() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminDashboardStats();
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-950 min-h-screen animate-fade-in text-white">
            <div className="p-6 pt-12 flex flex-col bg-slate-900 border-b border-white/5 relative overflow-hidden rounded-b-[2.5rem] mb-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <button onClick={() => navigate(-1)} className="text-white/50"><i className="fas fa-arrow-left"></i></button>
                    <h1 className="text-xl font-black uppercase tracking-tight">Hệ thống & Phân tích</h1>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/10 p-5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Server Health</p>
                        <p className="text-xl font-black text-emerald-400 uppercase tracking-tighter">Excellent</p>
                    </div>
                    <div className="bg-white/10 p-5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Uptime</p>
                        <p className="text-xl font-black text-white tracking-tighter">99.9%</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl"></div>
            </div>

            <div className="p-6 space-y-10">
                {/* User Growth Chart Placeholder */}
                <section>
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2 mb-6">Traffic & Tăng trưởng</h3>
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 relative h-64 flex items-end justify-between gap-2 overflow-hidden shadow-xl">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-xl transition-all duration-1000" style={{ height: `${h}%` }}></div>
                        ))}
                        <div className="absolute inset-x-0 bottom-0 py-2 px-8 flex justify-between text-[8px] font-black uppercase text-white/20 tracking-widest">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                </section>

                {/* Key Metrics Grid */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-4"><i className="fas fa-users"></i></div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Tổng User</p>
                        <p className="text-2xl font-black">{stats?.totalUsers || 0}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4"><i className="fas fa-briefcase"></i></div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Việc làm</p>
                        <p className="text-2xl font-black">{stats?.totalJobs || 0}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-col items-center text-center col-span-2">
                        <div className="w-full flex justify-between items-center">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Thông báo hệ thống</p>
                                <p className="text-sm font-bold text-emerald-400 tracking-tight">Mọi dịch vụ đang hoạt động bình thường</p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-pulse"><i className="fas fa-check-shield"></i></div>
                        </div>
                    </div>
                </section>

                <button onClick={() => window.print()} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 mt-4">
                    <i className="fas fa-file-export"></i> Xuất dữ liệu PDF
                </button>
            </div>
        </div>
    );
}
