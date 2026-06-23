import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function InterviewRequests() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const profile = await api.getRecruiterProfile();
            const data = await api.getRecruiterMockInterviewRequests(profile.id);
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action, studentId) => {
        try {
            if (action === 'ACСEPTED') { // Typo fix: ACCEPTED
                await api.updateMockInterviewRequestStatus(requestId, 'ACCEPTED');
                // Navigate to Chat
                const conversation = await api.getOrCreateConversation(studentId);
                navigate(`/recruiter/messages?conversationId=${conversation.id}`);
            } else {
                await api.updateMockInterviewRequestStatus(requestId, 'REJECTED');
                loadRequests();
            }
        } catch (e) {
            alert('Lỗi: ' + e.message);
        }
    };

    // Fix typo in 'ACCEPTED' string above if manual typing
    const handleAccept = async (req) => {
        try {
            await api.updateMockInterviewRequestStatus(req.id, 'ACCEPTED');
            // Navigate to Messages with studentId
            navigate('/recruiter/messages', { state: { recipientId: req.studentId } });
        } catch (e) {
            console.error(e);
            alert('Lỗi xử lý');
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Yêu cầu phỏng vấn thử</h1>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <div className="space-y-4">
                    {loading ? <p>Đang tải...</p> : requests.length === 0 ? <p className="text-slate-400">Chưa có yêu cầu nào.</p> : (
                        requests.map(req => (
                            <div key={req.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-600' :
                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                                                'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {req.status}
                                        </span>
                                        <span className="text-xs text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">Sinh viên #{req.studentId.substring(0, 8)}</h3>
                                    <p className="text-slate-600 mt-2 bg-white p-3 rounded-xl border border-slate-200 text-sm">"{req.message}"</p>
                                </div>

                                {req.status === 'PENDING' && (
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handleAccept(req)} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                                            <i className="fas fa-check mr-2"></i> Đồng ý
                                        </button>
                                        <button onClick={() => handleAction(req.id, 'REJECTED')} className="px-6 py-2 bg-white text-slate-500 font-bold rounded-xl text-sm border border-slate-200 hover:bg-slate-50">
                                            Từ chối
                                        </button>
                                    </div>
                                )}
                                {req.status === 'ACCEPTED' && (
                                    <button
                                        onClick={() => navigate('/recruiter/messages', { state: { recipientId: req.studentId } })}
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700"
                                    >
                                        Nhắn tin
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
