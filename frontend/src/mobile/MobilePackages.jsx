import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobilePackages() {
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getPackages();
            setPackages(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-950 min-h-screen animate-fade-in relative z-[100]">
            <div className="p-6 pt-12 flex items-center gap-4 border-b border-white/5 bg-slate-900 sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="text-white/50"><i className="fas fa-times"></i></button>
                <h1 className="text-xl font-black text-white uppercase tracking-tight">Nâng cấp tài khoản</h1>
            </div>

            <div className="p-6 space-y-8">
                <div className="text-center py-6">
                    <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter mb-2">Mở khóa<br />full tiềm năng</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Chọn gói phù hợp để đẩy nhanh sự nghiệp</p>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-20"><i className="fas fa-spinner fa-spin text-white text-2xl"></i></div>
                    ) : packages.map((pkg, idx) => (
                        <div key={pkg.id} className={`p-8 rounded-[3rem] border transition-all relative overflow-hidden ${pkg.isPremium || idx === 1
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-2xl shadow-indigo-500/30'
                            : 'bg-slate-900 border-white/10 text-slate-300'}`}>

                            {idx === 1 && (
                                <div className="absolute top-0 right-0 bg-white text-indigo-600 text-[8px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">PHỔ BIẾN</div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-black uppercase tracking-tight">{pkg.name}</h3>
                                <div className="flex items-baseline mt-2">
                                    <span className="text-3xl font-black">{(pkg.price / 1000).toLocaleString()}k</span>
                                    <span className="text-[10px] font-black uppercase opacity-60 ml-1">/ {pkg.durationDays} ngày</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10">
                                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                                    <i className="fas fa-check-circle opacity-60"></i> AI Match Score
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide">
                                    <i className="fas fa-check-circle opacity-60"></i> CV Phân tích sâu
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide opacity-50">
                                    <i className="fas fa-check-circle"></i> Chat không giới hạn
                                </li>
                            </ul>

                            <button className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all ${pkg.isPremium || idx === 1
                                ? 'bg-white text-indigo-600'
                                : 'bg-indigo-600 text-white'}`}>
                                CHỌN GÓI NÀY
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-8 text-center opacity-40">
                    <p className="text-[8px] font-bold text-white uppercase tracking-widest">Đảm bảo thanh toán an toàn 100% qua VnPay & Momo</p>
                </div>
            </div>
        </div>
    );
}
