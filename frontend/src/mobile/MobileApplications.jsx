import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    const tabs = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'PENDING', label: 'Chờ duyệt' },
        { id: 'INTERVIEW', label: 'Phỏng vấn' },
        { id: 'SELECTED', label: 'Đã trúng tuyển' }
    ];

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setLoading(true);
            const data = await api.getStudentApplications();
            setApplications(data || []);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredApplications = () => {
        if (activeTab === 'ALL') return applications;
        return applications.filter(app => app.status === activeTab);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'INTERVIEW': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'SELECTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredApps = getFilteredApplications();

    return (
        <div className="pb-24 animate-fade-in">
            {/* Header / Tabs */}
            <div className="sticky top-[61px] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="p-4">
                    <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Hồ sơ của tôi</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Theo dõi tiến độ ứng tuyển</p>
                </div>

                <div className="flex px-4 pb-2 gap-4 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap pb-2 text-xs font-black uppercase tracking-wider transition-all relative ${activeTab === tab.id
                                ? 'text-indigo-600'
                                : 'text-slate-400'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-bounce"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Application List */}
            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center p-20"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i></div>
                ) : filteredApps.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <i className="fas fa-file-invoice text-2xl"></i>
                        </div>
                        <p className="text-slate-400 font-bold text-sm tracking-tight">Chưa có hồ sơ nào trong trạng thái này.</p>
                    </div>
                ) : (
                    filteredApps.map((app) => (
                        <div key={app.id} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/50 shadow-sm">
                            <div className="flex gap-4 mb-4">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700">
                                    <img
                                        src={api.getFileUrl(app.job.companyLogo) || `https://ui-avatars.com/api/?name=${app.job.companyName}&background=random`}
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-800 dark:text-white line-clamp-1 leading-tight">{app.job.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{app.job.companyName}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase h-fit ${getStatusStyle(app.status)}`}>
                                    {app.status}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <i className="far fa-clock text-slate-300 text-xs"></i>
                                    <span className="text-[10px] font-bold text-slate-400">Nộp ngày {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <button
                                    onClick={() => navigate(`/mobile/jobs/${app.job.id}`)}
                                    className="text-xs font-black text-indigo-600 uppercase tracking-wider active:scale-95 transition-transform"
                                >
                                    Xem tin <i className="fas fa-chevron-right ml-1"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* CTA for Search */}
            <div className="p-8 text-center bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[3rem] mx-4 mt-8 border border-indigo-100/50 dark:border-indigo-900/30">
                <i className="fas fa-rocket text-indigo-400 text-2xl mb-4"></i>
                <h4 className="font-black text-slate-800 dark:text-white uppercase mb-2">Muốn nộp thêm hồ sơ?</h4>
                <p className="text-xs text-slate-500 mb-6">Hàng ngàn việc làm khác đang chờ bạn khám phá.</p>
                <button
                    onClick={() => navigate('/mobile/jobs')}
                    className="w-full py-3 bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white rounded-2xl font-black text-xs shadow-md active:scale-[0.98] transition-all"
                >
                    TÌM VIỆC NGAY
                </button>
            </div>
        </div>
    );
}
