import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileRoadmap() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Role Selection, 2: Skills Input, 3: Roadmap View
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [formData, setFormData] = useState({ targetRole: '', currentSkills: '' });

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setStep(3);
            const data = await api.getCareerRoadmap(formData.currentSkills, formData.targetRole);
            setRoadmap(data);
        } catch (error) {
            console.error(error);
            setStep(1);
            alert("Lỗi khi tạo lộ trình.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-white dark:bg-slate-950 min-h-screen animate-fade-in relative">
            {/* Minimal Header */}
            <div className="p-6 pt-12 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/50">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Roadmap</h1>
                {step < 3 && <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Bước {step}/2</p>}
                {step === 3 && (
                    <button onClick={() => { setStep(1); setRoadmap(null); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                        Tạo lại
                    </button>
                )}
            </div>

            {/* Content Wizard */}
            <div className="p-8">
                {step === 1 && (
                    <div className="animate-slide-up">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl mb-8 shadow-xl shadow-indigo-500/30">
                            <i className="fas fa-bullseye"></i>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-4">Bạn muốn trở thành ai trong tương lai?</h2>
                        <p className="text-xs text-slate-500 mb-10 leading-relaxed font-medium">Chúng tôi sẽ xây dựng lộ trình học tập tối ưu dựa trên mục tiêu nghề nghiệp của bạn.</p>

                        <input
                            type="text"
                            placeholder="Ví dụ: Senior Frontend Developer"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 transition-all mb-8"
                            value={formData.targetRole}
                            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                        />

                        <button
                            disabled={!formData.targetRole}
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-30"
                        >
                            TIẾP TỤC <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <button onClick={() => setStep(1)} className="mb-6 text-slate-400"><i className="fas fa-arrow-left"></i></button>
                        <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white text-2xl mb-8 shadow-xl shadow-emerald-500/30">
                            <i className="fas fa-tools"></i>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-4">Kỹ năng hiện tại của bạn là gì?</h2>
                        <p className="text-xs text-slate-500 mb-10 leading-relaxed font-medium">Liệt kê các kỹ năng (cách nhau bằng dấu phẩy) để AI so sánh lỗ hổng kiến thức.</p>

                        <textarea
                            rows="4"
                            placeholder="Java, ReactJS, Git..."
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold placeholder-slate-400 focus:ring-2 focus:ring-indigo-600 transition-all mb-8 resize-none"
                            value={formData.currentSkills}
                            onChange={(e) => setFormData({ ...formData, currentSkills: e.target.value })}
                        />

                        <button
                            disabled={!formData.currentSkills}
                            onClick={handleGenerate}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-30"
                        >
                            TẠO LỘ TRÌNH AI <i className="fas fa-magic ml-2"></i>
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        {loading ? (
                            <div className="text-center py-20 flex flex-col items-center">
                                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">AI ĐANG SUY NGHĨ...</h3>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold">Quá trình này có thể mất vài giây.</p>
                            </div>
                        ) : roadmap && (
                            <div className="space-y-10">
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian dự kiến</p>
                                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg">{roadmap.timeline || '4 tháng'}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">Chúng tôi đã phân tích <span className="text-indigo-600 font-black">{roadmap.skillsGap?.length || 0} lỗ hổng kiến thức</span> cần được bù đắp.</p>
                                </div>

                                <div className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-12">
                                    {roadmap.steps?.map((s, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-white dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                                {idx + 1}
                                            </div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-2 leading-tight">{s.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">{s.description}</p>

                                            <div className="flex flex-wrap gap-2">
                                                {s.skills?.map((sk, i) => (
                                                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[8px] font-black rounded uppercase tracking-tighter">
                                                        {sk}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
