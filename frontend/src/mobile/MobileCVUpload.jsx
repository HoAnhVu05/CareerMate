import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCVUpload() {
    const navigate = useNavigate();
    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileRef = useRef(null);

    useEffect(() => {
        loadCVs();
    }, []);

    const loadCVs = async () => {
        try {
            setLoading(true);
            const data = await api.getCVs();
            setCvs(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setProgress(30);
            const response = await api.uploadCV(file);
            setProgress(100);
            setTimeout(() => {
                loadCVs();
                setUploading(false);
                setProgress(0);
            }, 600);
        } catch (e) {
            alert("Lỗi tải lên CV.");
            setUploading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 sticky top-[61px] z-40">
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Hồ sơ & CV</h1>
                <button onClick={() => fileRef.current.click()} className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center active:scale-90 transition-transform">
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            <input type="file" ref={fileRef} className="hidden" accept=".pdf,.docx" onChange={handleFile} />

            <div className="p-6 space-y-8">
                {/* Upload Status Card */}
                {uploading && (
                    <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-all animate-bounce-slow">
                        <div className="relative z-10">
                            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Đang quét hồ sơ...</h3>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Hero / Info */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black leading-tight mb-2">Tối ưu hóa Profile<br />bằng AI</h2>
                        <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-6">Tải lên CV để nhận phân tích chi tiết</p>
                        <button onClick={() => fileRef.current.click()} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">TẢI LÊN NGAY</button>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* CV List Section */}
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mb-4 px-2">Danh sách CV đã tải</h3>
                    <div className="space-y-4">
                        {loading && cvs.length === 0 ? (
                            <div className="text-center py-10 animate-pulse text-indigo-600"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
                        ) : cvs.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                <i className="far fa-folder-open text-3xl text-slate-300 mb-4"></i>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Chưa có CV nào.</p>
                            </div>
                        ) : cvs.map((cv, idx) => (
                            <div key={cv.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all">
                                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                                    <i className="fas fa-file-pdf"></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate tracking-tight">{cv.fileName || 'Hồ sơ tuyển dụng'}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{new Date(cv.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate(`/mobile/cv/${cv.id}/analysis`)} className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center text-xs shadow-sm">
                                        <i className="fas fa-chart-pie"></i>
                                    </button>
                                    <button className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center text-xs">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
