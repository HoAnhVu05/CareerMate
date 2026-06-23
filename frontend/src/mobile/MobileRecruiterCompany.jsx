import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileRecruiterCompany() {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getRecruiterProfile();
            if (data.company) setCompany(data.company);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            // In real app, this would call updateCompany endpoint
            alert("Thông tin công ty đã được cập nhật!");
        } catch (e) {
            alert("Lỗi lưu thông tin.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-indigo-600"><i className="fas fa-circle-notch fa-spin text-4xl"></i></div>;

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in relative z-10">
            <div className="p-6 pt-12 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Cài đặt Công ty</h1>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-10">
                {/* Branding Block */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 bg-white rounded-3xl p-3 flex items-center justify-center shadow-lg">
                            <img src={company?.logoUrl || `https://ui-avatars.com/api/?name=${company?.name}&background=random`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-black uppercase tracking-tight leading-tight">{company?.name || 'Chưa cập nhật'}</h2>
                            <button type="button" className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-2">Thay đổi Logo</button>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl"></div>
                </div>

                <div className="space-y-8">
                    <section>
                        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">Thông tin liên hệ</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Tên công ty</label>
                                <input type="text" defaultValue={company?.name} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Website</label>
                                <input type="text" defaultValue={company?.website} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Email hỗ trợ</label>
                                <input type="email" defaultValue={company?.email} className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-bold dark:text-white" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">Hồ sơ văn hóa</h3>
                        <textarea rows="4" defaultValue={company?.description} className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-[10px] font-bold dark:text-white resize-none" placeholder="Giới thiệu về tầm nhìn và môi trường làm việc..." />
                    </section>
                </div>

                <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest"
                    >
                        {saving ? <i className="fas fa-circle-notch fa-spin"></i> : 'LƯU HỒ SƠ CÔNG TY'}
                    </button>
                </div>
            </form>
        </div>
    );
}
