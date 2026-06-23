import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCVAnalysis() {
    const { cvId } = useParams();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [cvId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.analyzeCV(cvId);
            setAnalysis(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-500';
    };

    if (loading) return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
            <h3 className="text-white font-black text-xs uppercase tracking-[0.4em]">AI Đang Phân Tích</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase mt-4 tracking-widest">Vui lòng đợi trong giây lát...</p>
        </div>
    );

    if (!analysis) return <div className="p-10 text-center uppercase font-black">Lỗi tải dữ liệu.</div>;

    const score = analysis.score || 0;

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in relative">
            <div className="p-6 pt-12 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Insights</h1>
            </div>

            <div className="p-6 space-y-10">
                {/* Visual Score Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-50 dark:text-slate-800" />
                            <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (score / 100 * 440)} strokeLinecap="round" className={`${getScoreColor(score)} transition-all duration-1000`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">/ 100 PTS</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Đánh Giá Hồ Sơ</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Hệ thống đã quét 1,200+ tiêu chí tuyển dụng</p>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-800/30">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm mb-4">
                            <i className="fas fa-arrow-up"></i>
                        </div>
                        <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Điểm Mạnh</h3>
                        <p className="text-[14px] font-black text-slate-800 dark:text-white leading-tight">{analysis.strengths?.length || 0} Yếu tố nổi bật</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-[2.5rem] border border-rose-100/50 dark:border-rose-800/30">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm mb-4">
                            <i className="fas fa-exclamation"></i>
                        </div>
                        <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Cần Sửa</h3>
                        <p className="text-[14px] font-black text-slate-800 dark:text-white leading-tight">{analysis.weaknesses?.length || 0} Lỗ hổng cần tối ưu</p>
                    </div>
                </div>

                {/* Suggestions Feed */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Gợi ý từ AI Advisor</h3>
                    {(analysis.suggestions || analysis.recommendations || []).map((s, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 items-start">
                            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center text-[10px] mt-1 shrink-0">
                                <i className="fas fa-magic"></i>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{s}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/mobile/jobs')}
                    className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                    TÌM VIỆC THEO HỒ SƠ <i className="fas fa-arrow-right ml-2 text-[10px]"></i>
                </button>
            </div>
        </div>
    );
}
