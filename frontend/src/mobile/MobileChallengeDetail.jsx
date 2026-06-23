import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileChallengeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [participation, setParticipation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [c, parts] = await Promise.all([
                api.getChallenge(id),
                api.getMyChallenges().catch(() => [])
            ]);
            setChallenge(c);
            const myPart = parts.find(p => p.challenge?.id === id);
            setParticipation(myPart);
            if (myPart) setAnswer(myPart.answer || '');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const result = await api.participateChallenge(id, { answer });
            alert(result.status === 'COMPLETED' ? "Chúc mừng! Bạn đã hoàn thành thử thách!" : "Đã nộp bài thành công!");
            loadData();
        } catch (e) {
            alert("Lỗi khi nộp bài.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center animate-pulse"><i className="fas fa-trophy text-4xl text-indigo-200"></i></div>;
    if (!challenge) return <div className="p-20 text-center">Không tìm thấy thử thách.</div>;

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in relative z-10 text-slate-800 dark:text-white">
            <div className="p-6 pt-12 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
                <button onClick={() => navigate(-1)} className="text-slate-400 group-active:scale-90 transition-transform"><i className="fas fa-arrow-left"></i></button>
                <h1 className="text-lg font-black uppercase tracking-tight truncate flex-1">{challenge.title}</h1>
            </div>

            <div className="p-8 space-y-10">
                {/* Hero / Category */}
                <header className="space-y-4">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg shadow-indigo-500/20">{challenge.category}</span>
                    <h2 className="text-2xl font-black leading-tight uppercase tracking-tighter">{challenge.title}</h2>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl flex items-center justify-center text-xs"><i className="fas fa-star"></i></div>
                            <span className="text-[10px] font-black uppercase text-slate-400">{challenge.points} XP</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl flex items-center justify-center text-xs"><i className="fas fa-tachometer-alt"></i></div>
                            <span className="text-[10px] font-black uppercase text-slate-400">{challenge.difficulty}</span>
                        </div>
                    </div>
                </header>

                {/* Instructions */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hướng dẫn thực hiện</h3>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-xs font-medium leading-relaxed prose dark:prose-invert max-w-none shadow-sm" dangerouslySetInnerHTML={{ __html: challenge.instructions }} />
                </section>

                {/* Submission Form / Result */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bài làm của bạn</h3>
                    </div>
                    {participation?.status === 'COMPLETED' ? (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 text-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-3xl text-emerald-500 shadow-sm mx-auto mb-4"><i className="fas fa-check-circle"></i></div>
                            <h4 className="text-xs font-black uppercase text-emerald-600 mb-2">Thử thách đã hoàn thành!</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Điểm số: {participation.score}/100</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <textarea
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-[11px] font-bold dark:text-white leading-relaxed resize-none shadow-sm"
                                placeholder="Nhập câu trả lời hoặc nội dung bài làm tại đây..."
                                rows="8"
                                required
                            />
                            <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    {submitting ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-paper-plane"></i> NỘP BÀI THỬ THÁCH</>}
                                </button>
                            </div>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
}
