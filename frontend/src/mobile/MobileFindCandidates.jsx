import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileFindCandidates() {
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers(0, 50, keyword);
            // Filter only students
            const students = (data.content || data || []).filter(u => u.role === 'STUDENT');
            setCandidates(students);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadData();
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex flex-col bg-slate-900 border-b border-white/5 relative overflow-hidden rounded-b-[2.5rem] mb-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="text-white/50"><i className="fas fa-arrow-left"></i></button>
                    <h1 className="text-xl font-black text-white uppercase tracking-tight">Tìm ứng viên</h1>
                </div>

                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        placeholder="Kỹ năng, tên, học vấn..."
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border-none rounded-2xl text-[10px] font-black uppercase text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
                </form>
            </div>

            <div className="px-6 space-y-4">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse"></div>
                    ))
                ) : candidates.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-user-tie text-4xl mb-4 text-emerald-500"></i>
                        <p className="font-black text-sm uppercase">Không tìm thấy ứng viên.</p>
                    </div>
                ) : (
                    candidates.map((c) => (
                        <div key={c.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 active:scale-[0.98] transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-black text-lg border border-emerald-100 overflow-hidden">
                                {c.avatarUrl ? (
                                    <img src={api.getFileUrl(c.avatarUrl)} className="w-full h-full object-cover" />
                                ) : (
                                    c.fullName?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{c.fullName || c.username}</h4>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Năm 4 • ĐH Bách Khoa</p>
                                <div className="flex gap-1 mt-2">
                                    <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-[6px] font-black text-slate-500 uppercase rounded">JAVA</span>
                                    <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-[6px] font-black text-slate-500 uppercase rounded">REACT</span>
                                </div>
                            </div>
                            <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-indigo-500/30">
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
