import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCVTemplateEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        personalInfo: { fullName: '', email: '', phone: '', address: '' },
        education: [{ school: '', degree: '', year: '' }],
        experience: [{ company: '', role: '', period: '' }],
        skills: ''
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getCVTemplateById(id);
            setTemplate(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        alert("CV đã được tạo thành công!");
        navigate('/mobile/cv');
    };

    if (loading) return <div className="p-20 text-center"><i className="fas fa-spinner fa-spin text-4xl text-indigo-600"></i></div>;

    return (
        <div className="pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in relative z-10 text-slate-800 dark:text-white">
            <div className="p-6 pt-12 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-tight">Editor: {template?.name}</h1>
                        <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">Step {step} of 4</p>
                    </div>
                </div>
                <button onClick={handleSave} className="px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[9px] font-black uppercase rounded-xl">Lưu CV</button>
            </div>

            <div className="p-8 space-y-10">
                {step === 1 && (
                    <div className="animate-slide-up">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8">Thông tin cá nhân</h2>
                        <div className="space-y-6">
                            <input type="text" placeholder="Họ và tên" className="w-full p-4 bg-white dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold shadow-sm" />
                            <input type="email" placeholder="Email liên hệ" className="w-full p-4 bg-white dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold shadow-sm" />
                            <input type="tel" placeholder="Số điện thoại" className="w-full p-4 bg-white dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold shadow-sm" />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8">Học vấn</h2>
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                            <input type="text" placeholder="Trường học" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold" />
                            <input type="text" placeholder="Chuyên ngành" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold" />
                            <input type="text" placeholder="Năm tốt nghiệp" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold" />
                        </div>
                        <button className="w-full py-4 mt-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">+ Thêm học vấn</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8">Kinh nghiệm</h2>
                        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                            <input type="text" placeholder="Công ty" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold" />
                            <input type="text" placeholder="Vị trí" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold" />
                            <input type="text" placeholder="Thời gian (VD: 2022 - Nay)" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold" />
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-slide-up">
                        <h2 className="text-xl font-black uppercase tracking-tight mb-8">Kỹ năng & Khác</h2>
                        <textarea rows="6" placeholder="Kỹ năng chuyên môn, ngoại ngữ..." className="w-full p-6 bg-white dark:bg-slate-900 border-none rounded-[2.5rem] text-[10px] font-bold shadow-sm" />
                    </div>
                )}
            </div>

            {/* Bottom Nav Wizard */}
            <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                <div className="bg-slate-900/80 backdrop-blur-xl p-3 rounded-[2rem] flex gap-4 shadow-2xl">
                    <button
                        disabled={step === 1}
                        onClick={() => setStep(step - 1)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-white/10 ${step === 1 && 'opacity-30'}`}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button
                        onClick={() => step < 4 ? setStep(step + 1) : handleSave()}
                        className="flex-1 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                        {step === 4 ? 'Hoàn tất & Lưu' : 'Tiếp theo'}
                    </button>
                </div>
            </div>
        </div>
    );
}
