import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileUserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers(0, 50, keyword);
            setUsers(data.content || data || []);
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
                    <h1 className="text-xl font-black text-white uppercase tracking-tight">Quản lý User</h1>
                </div>

                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        placeholder="Tìm theo tên / Email..."
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border-none rounded-2xl text-[10px] font-black uppercase text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/40"></i>
                </form>
            </div>

            <div className="px-6 space-y-4">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-[2rem] animate-pulse"></div>
                    ))
                ) : users.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <i className="fas fa-user-slash text-4xl mb-4"></i>
                        <p className="font-bold text-sm">Không tìm thấy user.</p>
                    </div>
                ) : (
                    users.map((u) => (
                        <div key={u.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 active:scale-[0.98] transition-all">
                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-indigo-600 border border-slate-100 dark:border-slate-700">
                                {u.fullName?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{u.fullName || u.username}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{u.role}</span>
                                    <span className="text-[8px] text-slate-400 font-bold truncate max-w-[120px]">{u.email}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    <i className={`fas ${u.status === 'ACTIVE' ? 'fa-check' : 'fa-ban'}`}></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
