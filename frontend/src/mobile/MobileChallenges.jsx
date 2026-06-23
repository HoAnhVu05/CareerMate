import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileChallenges() {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState('EXPLORE'); // EXPLORE, MINE, BADGES
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ points: 0, badges: 0, completed: 0 });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [all, my, badges] = await Promise.all([
                api.getChallenges(''),
                api.getMyChallenges().catch(() => []),
                api.getMyBadges().catch(() => [])
            ]);

            if (activeTab === 'EXPLORE') {
                const completedIds = new Set(my.filter(p => p.status === 'COMPLETED').map(p => p.challenge?.id));
                setChallenges(all.filter(c => !completedIds.has(c.id)));
            } else if (activeTab === 'MINE') {
                setChallenges(my.map(p => ({ ...p.challenge, participation: p })));
            } else {
                setChallenges(badges);
            }

            setStats({
                points: my.reduce((s, p) => s + (p.score || 0), 0),
                completed: my.filter(p => p.status === 'COMPLETED').length,
                badges: badges.length
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            {/* Stats Overview */}
            <div className="bg-slate-900 px-6 pt-12 pb-10 rounded-b-[3.5rem] relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl"></div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight mb-6">Thử thách & Huy hiệu</h1>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">XP</p>
                        <p className="text-lg font-black text-white leading-none">{stats.points}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Xong</p>
                        <p className="text-lg font-black text-white leading-none">{stats.completed}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Huy hiệu</p>
                        <p className="text-lg font-black text-white leading-none">{stats.badges}</p>
                    </div>
                </div>
            </div>

            {/* Tab Control */}
            <div className="px-6 mb-6">
                <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex">
                    {['EXPLORE', 'MINE', 'BADGES'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-slate-400'}`}
                        >
                            {tab === 'EXPLORE' ? 'Khám phá' : tab === 'MINE' ? 'Của tôi' : 'Huy hiệu'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Challenge Content */}
            <div className="px-6 space-y-4">
                {loading ? (
                    <div className="text-center py-20 animate-pulse text-indigo-600"><i className="fas fa-spinner fa-spin text-3xl"></i></div>
                ) : activeTab === 'BADGES' ? (
                    <div className="grid grid-cols-2 gap-4">
                        {challenges.length === 0 ? <p className="col-span-2 text-center text-[10px] text-slate-400 py-10">Chưa có huy hiệu nào.</p> :
                            challenges.map((badge, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all">
                                    <div className="text-4xl mb-3">
                                        {badge.category === 'CV' ? '📄' : badge.category === 'INTERVIEW' ? '🎤' : '🏆'}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-tight line-clamp-1">{badge.name}</p>
                                    <p className="text-[8px] font-bold text-indigo-600 uppercase mt-1 tracking-widest">{badge.rarity || 'Common'}</p>
                                </div>
                            ))
                        }
                    </div>
                ) : (
                    challenges.length === 0 ? <p className="text-center text-[10px] text-slate-400 py-20">Không có thử thách nào phù hợp.</p> :
                        challenges.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => navigate(`/mobile/challenges/${c.id}`)}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${c.difficulty === 'HARD' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {c.difficulty || 'MEDIUM'}
                                    </span>
                                    {c.participation?.status === 'COMPLETED' && <i className="fas fa-check-circle text-emerald-500"></i>}
                                </div>
                                <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm leading-tight mb-2">{c.title}</h3>
                                <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">{c.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="flex gap-4">
                                        <span className="text-[10px] font-bold text-slate-400"><i className="fas fa-star text-amber-400 mr-1"></i> {c.points || 0} XP</span>
                                        {c.badge && <span className="text-[10px] font-bold text-slate-400"><i className="fas fa-medal text-purple-400 mr-1"></i> Huy hiệu</span>}
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{c.participation ? 'LÀM LẠI' : 'THAM GIA'}</span>
                                </div>
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}
