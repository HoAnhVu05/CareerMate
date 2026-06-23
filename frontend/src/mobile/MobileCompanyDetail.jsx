import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCompanyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recruiter, setRecruiter] = useState(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getCompany(id);
            setCompany(data);

            const ratingData = await api.getCompanyRatings(id);
            setRatings(Array.isArray(ratingData) ? ratingData : ratingData.content || []);

            const recData = await api.getCompanyRecruiter(id);
            setRecruiter(recData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleContact = async () => {
        if (!recruiter?.user?.id) return;
        try {
            const conversation = await api.getOrCreateConversation(recruiter.user.id);
            navigate(`/mobile/messages?conversationId=${conversation.id}`);
        } catch (error) {
            console.error(error);
        }
    };



    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600"><i className="fas fa-circle-notch fa-spin text-3xl"></i></div>;
    if (!company) return <div className="p-10 text-center">Không tìm thấy công ty.</div>;

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in">
            {/* Cover / Header */}
            <div className="h-44 bg-gradient-to-br from-indigo-600 to-purple-700 relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
            </div>

            {/* Profile Info Overlay */}
            <div className="px-6 -mt-12 relative z-10">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-24 h-24 -mt-16 bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                            <img
                                src={api.getFileUrl(company.logoUrl) || `https://ui-avatars.com/api/?name=${company.name}&background=random`}
                                alt="Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 text-[10px] font-black rounded-lg border border-amber-100 flex items-center gap-1">
                                <i className="fas fa-star"></i> {company.averageRating?.toFixed(1) || '0.0'}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">{company.name}</h1>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2 uppercase tracking-wide">{company.industry || 'Đa ngành'}</p>

                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Quy mô</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{company.companySize || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Trụ sở</p>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{company.headquarters || 'Việt Nam'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="px-8 mt-10 space-y-8">
                <section>
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="w-1 h-3 bg-indigo-600 rounded-full"></div> Giới thiệu
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {company.description || 'Thông tin công ty đang được cập nhật.'}
                    </p>
                </section>

                {/* Ratings Feed */}
                <section>
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1 h-3 bg-amber-400 rounded-full"></div> Đánh giá ({ratings.length})
                    </h3>
                    <div className="space-y-4">
                        {ratings.length === 0 ? (
                            <p className="text-[10px] italic text-slate-400">Chưa có đánh giá nào từ cộng đồng.</p>
                        ) : (
                            ratings.map((rate) => (
                                <div key={rate.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-[8px] font-black text-indigo-600 flex items-center justify-center overflow-hidden">
                                                {rate.student?.user?.avatarUrl ? (
                                                    <img src={api.getFileUrl(rate.student.user.avatarUrl)} className="w-full h-full object-cover" />
                                                ) : (
                                                    rate.student?.user?.fullName?.charAt(0) || 'U'
                                                )}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{rate.student?.user?.fullName || 'Ẩn danh'}</span>
                                        </div>
                                        <div className="flex text-[8px] text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`fas fa-star ${i < rate.rating ? 'opacity-100' : 'opacity-20'}`}></i>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{rate.reviewText}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* Bottom Contact Hook */}
            {recruiter && (
                <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                    <button
                        onClick={handleContact}
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-[0.98] transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-white/10"
                    >
                        <i className="fas fa-comment-dots"></i> LIÊN HỆ NHÀ TUYỂN DỤNG
                    </button>
                </div>
            )}
        </div>
    );
}
