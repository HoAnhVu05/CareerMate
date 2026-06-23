import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const FeatureCard = ({ title, icon, color, path, navigate, delay }) => (
    <div
        onClick={() => navigate(path)}
        className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all animate-slide-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white text-lg shadow-lg mb-3`}>
            <i className={icon}></i>
        </div>
        <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight">{title}</span>
    </div>
);

export default function MobileDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ jobs: 0, courses: 0, articles: 0 });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Simplified stats for mobile dashboard
            const jobs = await api.getJobs(0, 1);
            setStats(prev => ({ ...prev, jobs: jobs.totalElements || 0 }));
        } catch (e) { }
    };

    return (
        <div className="p-6 space-y-10 pb-24 animate-fade-in">
            {/* Hero Greeting */}
            <section className="pt-4">
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Chào buổi sáng</span>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                    Chào, {user?.fullName?.split(' ')[0] || 'Member'}! 👋
                </h1>
                <p className="text-xs text-slate-400 font-bold uppercase mt-2 tracking-widest">Hôm nay bạn muốn học gì?</p>
            </section>

            {/* Feature Grid */}
            <section className="grid grid-cols-3 gap-4">
                <FeatureCard title="Bài viết" icon="fas fa-newspaper" color="bg-indigo-600" path="/mobile/articles" navigate={navigate} delay={100} />
                <FeatureCard title="Khóa học" icon="fas fa-graduation-cap" color="bg-purple-600" path="/mobile/courses" navigate={navigate} delay={200} />
                <FeatureCard title="Lộ trình" icon="fas fa-map-signs" color="bg-emerald-500" path="/mobile/roadmap" navigate={navigate} delay={300} />
                <FeatureCard title="Thử thách" icon="fas fa-trophy" color="bg-amber-400" path="/mobile/challenges" navigate={navigate} delay={400} />
                <FeatureCard title="Công ty" icon="fas fa-city" color="bg-rose-500" path="/mobile/companies" navigate={navigate} delay={500} />
                <FeatureCard title="Việc làm" icon="fas fa-briefcase" color="bg-blue-600" path="/mobile/jobs" navigate={navigate} delay={600} />
            </section>

            {/* AI Recommendation Hook */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <span className="px-3 py-1 bg-white/10 text-white text-[8px] font-black uppercase rounded-lg mb-4 inline-block">Mới nhất từ AI</span>
                    <h2 className="text-xl font-black text-white leading-tight mb-4">Gợi ý việc làm phù hợp với Profile của bạn</h2>
                    <button
                        onClick={() => navigate('/mobile/jobs')}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                    >
                        XEM NGAY
                    </button>
                </div>
            </section>

            {/* Quick Stats / Feed Preview */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Hoạt động gần đây</h3>
                    <button className="text-[10px] font-bold text-slate-400 uppercase">Xem tất cả</button>
                </div>

                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-tight">Hoàn thành bài học</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Giới thiệu về Java • 2h trước</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 opacity-50">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                            <i className="fas fa-briefcase"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-tight">Đã nộp đơn ứng tuyển</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">VNG Corporation • Hôm qua</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
