import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MobileAdminHome() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
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

    const handleExportReport = () => {
        const doc = new jsPDF();
        const today = new Date();

        doc.setFontSize(22);
        doc.text('CareerMate - System Report', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Generated on: ${today.toLocaleString()}`, 105, 30, { align: 'center' });

        autoTable(doc, {
            startY: 40,
            head: [['Item', 'Status']],
            body: [
                ['System Health', 'Stable'],
                ['API Services', 'Online'],
                ['Database', 'Connected']
            ],
        });

        doc.save(`CareerMate_Report_Mobile_${today.getTime()}.pdf`);
    };

    return (
        <div className="p-4 pb-24 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">System Status</p>
                        <h2 className="text-2xl font-black text-emerald-400">Stable <i className="fas fa-check-circle ml-1"></i></h2>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center animate-pulse">
                        <i className="fas fa-server text-emerald-400"></i>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">CPU Usage</span>
                        <span className="font-bold">12%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[12%] rounded-full"></div>
                    </div>
                </div>
            </div>

            {loading || !stats ? (
                <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border-l-4 border-blue-500">
                        <p className="text-xs text-slate-500 uppercase font-bold">Người dùng</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border-l-4 border-indigo-500">
                        <p className="text-xs text-slate-500 uppercase font-bold">Việc làm</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.totalJobs}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border-l-4 border-amber-500">
                        <p className="text-xs text-slate-500 uppercase font-bold">Chờ duyệt</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.pendingJobs}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border-l-4 border-emerald-500">
                        <p className="text-xs text-slate-500 uppercase font-bold">Doanh thu</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">Free</p>
                    </div>
                </div>
            )}

            <h3 className="font-black text-slate-800 dark:text-white mt-4 uppercase text-[10px] tracking-widest">Quản trị hệ thống</h3>
            <div className="grid grid-cols-1 gap-3">
                <button
                    onClick={() => navigate('/mobile/users')}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg"><i className="fas fa-users-cog"></i></div>
                        <div className="text-left font-black uppercase text-[10px] tracking-tight text-slate-700 dark:text-slate-300">Quản lý người dùng</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/mobile/job-management')}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg"><i className="fas fa-briefcase"></i></div>
                        <div className="text-left font-black uppercase text-[10px] tracking-tight text-slate-700 dark:text-slate-300">Quản lý việc làm</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/mobile/article-management')}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg"><i className="fas fa-newspaper"></i></div>
                        <div className="text-left font-black uppercase text-[10px] tracking-tight text-slate-700 dark:text-slate-300">Quản lý bài viết</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/mobile/cv-management')}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg"><i className="fas fa-file-invoice"></i></div>
                        <div className="text-left font-black uppercase text-[10px] tracking-tight text-slate-700 dark:text-slate-300">Mẫu CV & Gói cước</div>
                    </div>
                </button>
                <button
                    onClick={() => navigate('/mobile/analytics')}
                    className="w-full flex items-center justify-between p-5 bg-slate-900 rounded-3xl shadow-xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg"><i className="fas fa-chart-line"></i></div>
                        <div className="text-left font-black uppercase text-[10px] tracking-tight text-white">Báo cáo & Phân tích chuyên sâu</div>
                    </div>
                </button>
            </div>

            <div className="pt-4">
                <button
                    onClick={handleExportReport}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <i className="fas fa-file-export"></i> XUẤT BÁO CÁO HỆ THỐNG
                </button>
            </div>
        </div>
    );
}
