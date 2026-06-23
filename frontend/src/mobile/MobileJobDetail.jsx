import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileJobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        loadJob();
    }, [id]);

    const loadJob = async () => {
        try {
            setLoading(true);
            const data = await api.getJobById(id);
            setJob(data);
        } catch (error) {
            console.error('Error loading job details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        try {
            setApplying(true);
            // In a real app, this would show a "CV Selection" bottom sheet
            // For now, let's assume we use the primary CV
            await api.applyForJob(id, { note: "Applied from CareerMate Mobile App" });
            alert("Chúc mừng! Đơn ứng tuyển của bạn đã được gửi thành công.");
            navigate('/mobile/applications');
        } catch (error) {
            console.error('Apply failed:', error);
            alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải chi tiết...</p>
            </div>
        );
    }

    if (!job) return <div className="p-10 text-center">Không tìm thấy thông tin việc làm.</div>;

    return (
        <div className="pb-32 animate-fade-in relative">
            {/* Header Image / Pattern */}
            <div className="h-40 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
            </div>

            {/* Profile Overlay */}
            <div className="px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-20 h-20 -mt-16 bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-lg border border-slate-50 dark:border-slate-800 flex items-center justify-center">
                            <img
                                src={api.getFileUrl(job.companyLogo) || `https://ui-avatars.com/api/?name=${job.companyName || 'C'}&background=random`}
                                alt="Company"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 active:text-rose-500 active:scale-90 transition-all">
                            <i className="far fa-heart text-xl"></i>
                        </button>
                    </div>

                    <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{job.title}</h1>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2 uppercase tracking-wide">{job.companyName}</p>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mức lương</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.salaryRange || 'Thỏa thuận'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa điểm</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.location || 'Remote'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hình thức</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.type || 'Toàn thời gian'}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hết hạn</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">30 ngày nữa</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs-style Detail */}
            <div className="mt-8 px-8 space-y-8">
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Mô tả công việc</h3>
                    </div>
                    <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line prose dark:prose-invert max-w-none">
                        {job.description}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Yêu cầu ứng viên</h3>
                    </div>
                    <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-line prose dark:prose-invert max-w-none">
                        {job.requirements || 'Vui lòng liên hệ nhà tuyển dụng để biết thêm chi tiết.'}
                    </div>
                </section>

                {/* Company Info */}
                <section className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/30">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm mb-4">Về công ty</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-2">
                            <img
                                src={api.getFileUrl(job.companyLogo) || `https://ui-avatars.com/api/?name=${job.companyName || 'C'}&background=random`}
                                alt="Comp"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{job.companyName}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Startup Công nghệ</p>
                        </div>
                    </div>
                    <button className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-600 dark:text-slate-400 active:scale-95 transition-transform">
                        XEM TRANG CÔNG TY
                    </button>
                </section>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-20 left-0 right-0 p-4 z-50 animate-slide-up">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-3 shadow-2xl border border-white/20 dark:border-slate-700/50 flex gap-4">
                    <button
                        onClick={handleApply}
                        disabled={applying}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {applying ? (
                            <i className="fas fa-circle-notch fa-spin"></i>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i> ỨNG TUYỂN NGAY
                            </>
                        )}
                    </button>
                    <button className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm active:scale-95 transition-transform">
                        <i className="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
