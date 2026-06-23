import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const HubCard = ({ title, label, icon, color, path, delay }) => (
    <Link
        to={path}
        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center active:scale-95 transition-all animate-slide-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white text-xl shadow-lg mb-4`}>
            <i className={icon}></i>
        </div>
        <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h4>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</span>
    </Link>
);

export default function MobileStudentHome() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="p-6 space-y-10 pb-24 animate-fade-in">
            {/* Minimalist Hero */}
            <section className="pt-4 px-2">
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Premium Experience</span>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">
                    Sẵn sàng cho<br />thành công, {user?.fullName?.split(' ')[0]}?
                </h1>
            </section>

            {/* AI Call to Action */}
            <section className="bg-slate-900 rounded-[3rem] p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <i className="fas fa-magic text-indigo-400 text-xs"></i>
                        <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">AI Matchmaking</span>
                    </div>
                    <h2 className="text-xl font-black text-white leading-tight mb-6">Phân tích CV ngay để mở khóa các vị trí phù hợp nhất cho bạn.</h2>
                    <button
                        onClick={() => navigate('/mobile/cv')}
                        className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                    >
                        TẢI LÊN CV
                    </button>
                </div>
            </section>

            {/* Discovery Grid */}
            <section className="space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Khám phá tiềm năng</h3>
                <div className="grid grid-cols-2 gap-4">
                    <HubCard title="Việc làm" label="Mới nhất" icon="fas fa-briefcase" color="bg-blue-600" path="/mobile/jobs" delay={100} />
                    <HubCard title="Gợi ý" label="Dành cho bạn" icon="fas fa-star" color="bg-amber-400" path="/mobile/recommendations" delay={200} />
                    <HubCard title="Lộ trình" label="AI Career" icon="fas fa-map-signs" color="bg-emerald-500" path="/mobile/roadmap" delay={300} />
                    <HubCard title="Challenges" label="Gamification" icon="fas fa-trophy" color="bg-purple-600" path="/mobile/challenges" delay={400} />
                    <HubCard title="Khóa học" label="Skills Up" icon="fas fa-graduation-cap" color="bg-indigo-500" path="/mobile/courses" delay={500} />
                    <HubCard title="Quiz" label="Hướng nghiệp" icon="fas fa-question-circle" color="bg-rose-500" path="/mobile/quiz" delay={600} />
                </div>
            </section>

            {/* Resource Hub */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Cẩm nang nghề nghiệp</h3>
                </div>
                <div className="space-y-4">
                    <Link to="/mobile/articles" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl active:scale-98 transition-all">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400"><i className="fas fa-newspaper"></i></div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Bài viết & Chia sẻ</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">120+ Tài liệu mới</p>
                        </div>
                        <i className="fas fa-chevron-right text-[10px] text-slate-300"></i>
                    </Link>
                    <Link to="/mobile/companies" className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl active:scale-98 transition-all opacity-80">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400"><i className="fas fa-city"></i></div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase">Danh bạ công ty</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Review & Phúc lợi</p>
                        </div>
                        <i className="fas fa-chevron-right text-[10px] text-slate-300"></i>
                    </Link>
                </div>
            </section>
        </div>
    );
}
