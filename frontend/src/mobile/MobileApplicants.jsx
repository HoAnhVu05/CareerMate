import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileApplicants() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedJobId) loadApplicants(selectedJobId);
    }, [selectedJobId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getMyJobs(0, 100);
            const list = data.content || data || [];
            setJobs(list);
            if (list.length > 0) setSelectedJobId(list[0].id);
        } catch (e) { } finally {
            if (!selectedJobId) setLoading(false);
        }
    };

    const loadApplicants = async (id) => {
        try {
            setLoading(true);
            const data = await api.getJobApplicants(id, 0, 100);
            setApplicants(data.content || data || []);
        } catch (e) { } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (appId, status) => {
        try {
            await api.updateApplicationStatus(appId, status, '');
            loadApplicants(selectedJobId);
        } catch (e) { }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex items-center justify-between border-b border-slate-100 dark:border-slate-900/50 bg-white dark:bg-slate-900 sticky top-[61px] z-40">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Ứng viên</h1>
                <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">{applicants.length} Tổng số</p>
            </div>

            {/* Job Selector Carousel */}
            <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                {jobs.map(j => (
                    <button
                        key={j.id}
                        onClick={() => setSelectedJobId(j.id)}
                        className={`whitespace-nowrap px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedJobId === j.id
                            ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                    >
                        {j.title}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse"></div>
                    ))
                ) : applicants.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-user-clock text-4xl mb-4"></i>
                        <p className="font-bold text-sm">Chưa có ứng viên mới.</p>
                    </div>
                ) : (
                    applicants.map(app => (
                        <div key={app.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all overflow-hidden relative">
                            {/* AI Badge Top Right */}
                            {app.matchScore && (
                                <div className="absolute top-0 right-0 px-4 py-2 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-bl-[1.5rem]">
                                    MATCH: {parseFloat(app.matchScore).toFixed(0)}%
                                </div>
                            )}

                            <div className="flex gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-slate-200">
                                    {app.student?.user?.fullName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[12px] font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{app.student?.user?.fullName || 'Ứng viên'}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ứng tuyển • {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button onClick={() => updateStatus(app.id, 'VIEWED')} className="py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">Đã xem</button>
                                <button onClick={() => updateStatus(app.id, 'INTERVIEW')} className="py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">Phỏng vấn</button>
                                <button onClick={() => updateStatus(app.id, 'OFFERED')} className="py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Đề nghị</button>
                                <button onClick={() => updateStatus(app.id, 'REJECTED')} className="py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100">Từ chối</button>
                            </div>

                            <button className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <i className="far fa-eye"></i> XEM CHI TIẾT HỒ SƠ
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
