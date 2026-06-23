import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileRecruiterHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeJobs: 0,
        successfulHires: 0,
        upcomingInterviews: 0,
        newApplications: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // 1. Get Recruiter Profile to get ID
            const profile = await api.getRecruiterProfile();
            if (profile && profile.id) {
                // 2. Get Stats from Job Service
                const data = await api.getRecruiterJobStats(profile.id);
                setStats(data);
            }
        } catch (error) {
            console.error("Error loading recruiter stats:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 pb-24 space-y-6">
            <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-500/30">
                <p className="text-indigo-100 text-sm font-medium mb-1">Tổng quan hiển thị</p>
                <h2 className="text-3xl font-black mb-6">Hello, Recruiter!</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                        <i className="fas fa-briefcase text-2xl mb-2 opacity-80"></i>
                        <div className="text-2xl font-bold">{stats.activeJobs}</div>
                        <div className="text-xs text-indigo-100">Tin đang chạy</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                        <i className="fas fa-users text-2xl mb-2 opacity-80"></i>
                        <div className="text-2xl font-bold">{stats.newApplications}</div>
                        <div className="text-xs text-indigo-100">Ứng viên mới</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                        <i className="fas fa-calendar-alt text-2xl mb-2 opacity-80"></i>
                        <div className="text-2xl font-bold">{stats.upcomingInterviews}</div>
                        <div className="text-xs text-indigo-100">Phỏng vấn</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
                        <i className="fas fa-check-circle text-2xl mb-2 opacity-80"></i>
                        <div className="text-2xl font-bold">{stats.successfulHires}</div>
                        <div className="text-xs text-indigo-100">Tuyển thành công</div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.3em] mb-4 px-2">Điều hành tuyển dụng</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => navigate('/mobile/post-job')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fas fa-plus"></i></div>
                        <span className="font-black text-[10px] uppercase tracking-tight text-slate-700 dark:text-slate-300">Đăng tin mới</span>
                    </button>
                    <button onClick={() => navigate('/mobile/find-candidates')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fas fa-search-dollar"></i></div>
                        <span className="font-black text-[10px] uppercase tracking-tight text-slate-700 dark:text-slate-300">Săn ứng viên</span>
                    </button>
                    <button onClick={() => navigate('/mobile/company')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fas fa-city"></i></div>
                        <span className="font-black text-[10px] uppercase tracking-tight text-slate-700 dark:text-slate-300">Hồ sơ công ty</span>
                    </button>
                    <button onClick={() => navigate('/mobile/articles/my')} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 active:scale-95 transition-all">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl shadow-sm"><i className="fas fa-feather-alt"></i></div>
                        <span className="font-black text-[10px] uppercase tracking-tight text-slate-700 dark:text-slate-300">Viết bài mới</span>
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Tin tức tuyển dụng</h3>
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex gap-4">
                    <div className="text-orange-500 text-2xl"><i className="fas fa-lightbulb"></i></div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Mẹo tuyển dụng hiệu quả</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cách tối ưu hóa tin đăng để thu hút ứng viên Gen Z...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
