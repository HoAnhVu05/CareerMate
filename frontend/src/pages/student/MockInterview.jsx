import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function MockInterview() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('AI'); // AI or HUMAN
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    // AI State
    const [aiHistory, setAiHistory] = useState([]);

    // Recruiter State
    const [recruiters, setRecruiters] = useState([]);
    const [requests, setRequests] = useState([]);
    const [selectedRecruiter, setSelectedRecruiter] = useState('');
    const [bookingMessage, setBookingMessage] = useState('');
    const [searchRecruiter, setSearchRecruiter] = useState('');
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customRole, setCustomRole] = useState({ title: '', desc: '' });

    const SUGGESTED_ROLES = [
        { title: 'Frontend Developer', desc: 'Phát triển giao diện người dùng bằng React, Vue hoặc Angular.' },
        { title: 'Backend Developer', desc: 'Xây dựng hệ thống máy chủ, API và cơ sở dữ liệu.' },
        { title: 'Fullstack Developer', desc: 'Phát triển cả giao diện và hệ thống máy chủ.' },
        { title: 'Data Scientist', desc: 'Phân tích dữ liệu và xây dựng mô hình học máy.' },
        { title: 'Mobile Developer', desc: 'Phát triển ứng dụng di động iOS hoặc Android.' }
    ];

    useEffect(() => {
        loadJobs();
        if (activeTab === 'AI') {
            loadAiHistory();
        } else {
            loadRecruiterData();
        }
    }, [activeTab]);

    const loadJobs = async () => {
        try {
            const data = await api.getJobs(0, 50); // Fetch top 50 jobs
            setJobs(data.content || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadAiHistory = async () => {
        try {
            // Need to get student ID from somewhere. 
            // Assuming we can get it from user profile or context if stored.
            // But api.getAIMockInterviewHistory requires studentID.
            // Let's first fetch user profile to get ID if user.id is not it (user.id is normally account id).
            // Actually, for now, let's try using user.id. If backend expects Student profile ID, we might need a lookup.
            // In User Service, User is the base.
            // For now, let's assume user.id works or we need to fetch profile.
            // Let's fetch profile first to be safe.
            const profile = await api.getStudentProfile();
            const data = await api.getAIMockInterviewHistory(profile.userId); // Use userId for matching history
            setAiHistory(data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadRecruiterData = async () => {
        try {
            // Fetch recruiters (search companies and get their recruiters?)
            // This is tricky as we don't have "getAllRecruiters" for students.
            // For prototype, let's fetch companies, and for each company get recruiter? Too slow.
            // Let's just list "Requests" first.
            const profile = await api.getStudentProfile();
            const myRequests = await api.getMyMockInterviewRequests(profile.id);
            setRequests(myRequests);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSearchRecruiter = async () => {
        try {
            setLoading(true);
            const experts = await api.getExpertRecruiters();

            const validRecruiters = experts.map(exp => ({
                id: exp.id,
                name: exp.name || 'Chuyên gia',
                company: exp.companyName || 'Tự do'
            }));

            setRecruiters(validRecruiters);
        } catch (e) {
            console.error('Error loading experts:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleStartAI = (jobOrRole) => {
        if (typeof jobOrRole === 'string') {
            // It's a jobId
            navigate(`/student/mock-interview/ai/${jobOrRole}`);
        } else {
            // It's a custom role object {title, desc}
            navigate(`/student/mock-interview/ai/custom`, { state: { customRole: jobOrRole } });
        }
    };

    const handleBookRecruiter = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // using user.id for chat compatibility
            await api.requestMockInterview(selectedRecruiter, bookingMessage, user.id);
            alert('Đã gửi yêu cầu phỏng vấn!');
            setBookingMessage('');
            setSelectedRecruiter('');
            loadRecruiterData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.error || e.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Phỏng vấn thử & Luyện tập</h1>

            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('AI')}
                    className={`pb-3 px-4 text-sm font-bold uppercase transition-all border-b-2 ${activeTab === 'AI' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <i className="fas fa-robot mr-2"></i> Phỏng vấn với AI
                </button>
                <button
                    onClick={() => setActiveTab('HUMAN')}
                    className={`pb-3 px-4 text-sm font-bold uppercase transition-all border-b-2 ${activeTab === 'HUMAN' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    <i className="fas fa-user-tie mr-2"></i> Với chuyên gia
                </button>
            </div>

            {activeTab === 'AI' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <i className="fas fa-brain text-9xl"></i>
                            </div>
                            <h2 className="text-3xl font-black uppercase mb-4">Luyện phỏng vấn AI</h2>
                            <p className="text-white/80 mb-8 max-w-lg">
                                Chọn một vị trí công việc bạn quan tâm và để AI của CareerMate đóng vai nhà tuyển dụng phỏng vấn bạn. Nhận đánh giá chi tiết ngay lập tức.
                            </p>

                            <div className="grid gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2 mb-8">
                                {jobs.length === 0 ? (
                                    <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/20">
                                        <p className="text-xs text-white/50 italic text-center">Đang tải việc làm thực tế...</p>
                                    </div>
                                ) : (
                                    jobs.map(job => (
                                        <div key={job.id} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl cursor-pointer transition-all border border-white/5 flex justify-between items-center group"
                                            onClick={() => handleStartAI(job.id)}
                                        >
                                            <div>
                                                <h4 className="font-bold text-sm text-white">{job.title}</h4>
                                                <p className="text-[10px] opacity-70 mt-1 uppercase font-bold tracking-widest text-indigo-300">{job.companyName}</p>
                                            </div>
                                            <button className="w-8 h-8 rounded-full bg-white text-indigo-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                                                <i className="fas fa-play text-xs"></i>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold uppercase tracking-widest text-xs text-white/50">Gợi ý vị trí phổ biến</h3>
                                    <button
                                        onClick={() => setShowCustomModal(true)}
                                        className="text-[10px] font-black uppercase text-indigo-300 hover:text-white transition-colors"
                                    >
                                        <i className="fas fa-plus mr-1"></i> Tự nhập vị trí
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {SUGGESTED_ROLES.map((role, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleStartAI(role)}
                                            className="bg-indigo-800/40 hover:bg-indigo-700/60 p-4 rounded-2xl cursor-pointer transition-all border border-indigo-700/50 flex flex-col justify-between group"
                                        >
                                            <div>
                                                <h4 className="font-bold text-sm text-indigo-100 group-hover:text-white transition-colors">{role.title}</h4>
                                                <p className="text-[10px] text-white/40 mt-1 line-clamp-1">{role.desc}</p>
                                            </div>
                                            <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <span className="text-[10px] font-black uppercase text-white">Bắt đầu <i className="fas fa-arrow-right ml-1"></i></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Role Modal */}
                    {showCustomModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Tự nhập vị trí</h3>
                                    <button onClick={() => setShowCustomModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                                        <i className="fas fa-times text-slate-400"></i>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Vị trí công việc</label>
                                        <input
                                            type="text"
                                            value={customRole.title}
                                            onChange={e => setCustomRole({ ...customRole, title: e.target.value })}
                                            placeholder="Ví dụ: AI Engineer, UI Designer..."
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mô tả ngắn (tùy chọn)</label>
                                        <textarea
                                            value={customRole.desc}
                                            onChange={e => setCustomRole({ ...customRole, desc: e.target.value })}
                                            placeholder="Ghi chú về công việc hoặc yêu cầu đặc biệt..."
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium dark:text-white h-24 resize-none"
                                        />
                                    </div>
                                    <button
                                        disabled={!customRole.title.trim()}
                                        onClick={() => {
                                            handleStartAI(customRole);
                                            setShowCustomModal(false);
                                        }}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase rounded-2xl transition-all shadow-xl shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none mt-4"
                                    >
                                        Bắt đầu luyện tập
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Lịch sử luyện tập</h3>
                            <div className="space-y-4">
                                {aiHistory.length === 0 ? (
                                    <p className="text-center text-slate-400 text-xs py-10">Chưa có lịch sử phỏng vấn.</p>
                                ) : (
                                    aiHistory.map((h, i) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">
                                                    {h.jobTitle || 'Phỏng vấn'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(h.startedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <div className="text-xs">
                                                    <span className="font-bold text-slate-500">Điểm số:</span>
                                                    <span className={`ml-2 font-black text-lg ${h.overallScore >= 80 ? 'text-emerald-500' : h.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {h.overallScore || '--'}
                                                    </span>
                                                </div>
                                                <button className="text-xs font-bold text-indigo-600 hover:underline">Chi tiết</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* HUMAN TAB */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6">Đặt lịch phỏng vấn</h3>

                            <form onSubmit={handleBookRecruiter} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn Nhà Tuyển Dụng</label>
                                    {recruiters.length === 0 && <p className="text-xs text-slate-400 mb-2">Đang tải danh sách từ việc làm...</p>}
                                    <select
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={selectedRecruiter}
                                        onChange={e => setSelectedRecruiter(e.target.value)}
                                        onClick={recruiters.length === 0 ? handleSearchRecruiter : undefined}
                                        required
                                    >
                                        <option value="">-- Chọn chuyên gia --</option>
                                        {recruiters.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} ({r.company})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lời nhắn / Mong muốn</label>
                                    <textarea
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500 dark:text-white h-32 resize-none"
                                        placeholder="Tôi muốn phỏng vấn thử vị trí Java Backend..."
                                        value={bookingMessage}
                                        onChange={e => setBookingMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white font-black uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                                    {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Gửi yêu cầu'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6">Yêu cầu của bạn</h3>

                            <div className="space-y-4">
                                {requests.length === 0 ? (
                                    <p className="text-center text-slate-400 py-10">Chưa có yêu cầu nào.</p>
                                ) : (
                                    requests.map(req => (
                                        <div key={req.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' :
                                                        req.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                            'bg-yellow-100 text-yellow-600'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="font-bold text-slate-700 dark:text-slate-300">Gửi tới: {req.recruiterName || 'Chuyên gia'}</p>
                                                <p className="text-xs text-slate-500 mt-1 italic">"{req.message}"</p>
                                            </div>
                                            {req.status === 'ACCEPTED' && (
                                                <button onClick={() => navigate('/student/messages')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                                                    <i className="fas fa-comment-dots mr-2"></i> Nhắn tin
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
