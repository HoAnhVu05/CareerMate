import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileJobRecommendations() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Simulating recommendations by fetching most relevant jobs
            const data = await api.searchJobs('', '', 0, 10);
            setJobs(data.content || data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex flex-col bg-slate-900 border-b border-white/5 relative overflow-hidden rounded-b-[3rem] mb-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight mb-2 relative z-10">Gợi ý việc làm</h1>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] relative z-10">Dựa trên phân tích AI cho Profile của bạn</p>
            </div>

            <div className="px-6 space-y-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse"></div>
                    ))
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-magic text-4xl mb-4 text-indigo-500"></i>
                        <p className="font-black text-sm uppercase">Chưa có gợi ý phù hợp.</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase">Hãy cập nhật CV để AI nhận diện tốt hơn.</p>
                    </div>
                ) : (
                    jobs.map((job, idx) => {
                        const score = Math.floor(Math.random() * 20) + 75; // Mock AI score
                        return (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/mobile/jobs/${job.id}`)}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 px-4 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-bl-[1.5rem]">
                                    MATCH: {score}%
                                </div>

                                <div className="flex gap-4 mb-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 flex items-center justify-center border border-slate-50">
                                        <img src={api.getFileUrl(job.companyLogo) || `https://ui-avatars.com/api/?name=${job.companyName}&background=random`} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-12">
                                        <h3 className="text-[12px] font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{job.title}</h3>
                                        <p className="text-[10px] text-indigo-600 font-bold uppercase mt-1 tracking-widest">{job.companyName}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-4">
                                    <span className="text-[10px] font-bold text-slate-400"><i className="fas fa-map-marker-alt text-rose-500 mr-1"></i> {job.location}</span>
                                    <span className="text-[10px] font-bold text-slate-400"><i className="fas fa-clock text-indigo-400 mr-1"></i> {job.jobType || 'Full-time'}</span>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                    {job.requiredSkills?.slice(0, 3).map((s, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-black rounded-lg uppercase border border-slate-100 dark:border-slate-700">{s}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
