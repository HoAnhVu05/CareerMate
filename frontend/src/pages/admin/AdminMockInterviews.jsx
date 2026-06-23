import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function AdminMockInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminMockInterviewHistory();
            setInterviews(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý Phỏng vấn AI</h1>

            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                {loading ? <p>Đang tải...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                                    <th className="p-4">Sinh viên</th>
                                    <th className="p-4">Vị trí công việc</th>
                                    <th className="p-4">Thời gian</th>
                                    <th className="p-4">Điểm số</th>
                                    <th className="p-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {interviews.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">Chưa có dữ liệu</td></tr>
                                ) : (
                                    interviews.map(iv => (
                                        <tr key={iv.id} className="hover:bg-slate-50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                                                        {iv.studentAvatar ? (
                                                            <img src={getFullUrl(iv.studentAvatar)}
                                                                alt="avt" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                                                {iv.studentName?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{iv.studentName || 'Unknown'}</p>
                                                        <p className="font-mono text-[10px] text-slate-500">{iv.studentEmail || iv.studentId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-slate-800">{iv.jobTitle}</td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {new Date(iv.startedAt).toLocaleString()}
                                                <br />
                                                <span className="text-xs opacity-70">
                                                    {iv.completedAt ? `Hoàn thành: ${new Date(iv.completedAt).toLocaleTimeString()}` : 'Chưa hoàn thành'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-black text-lg ${iv.overallScore >= 80 ? 'text-emerald-500' :
                                                    iv.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                    }`}>
                                                    {iv.overallScore || '--'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => setSelectedInterview(iv)}
                                                    className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100"
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedInterview && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedInterview(null)}
                >
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Chi tiết phỏng vấn</h3>
                            <button onClick={() => setSelectedInterview(null)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Công việc</p>
                                    <p className="font-bold text-slate-800">{selectedInterview.jobTitle}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Điểm số</p>
                                    <p className="font-black text-emerald-500 text-xl">{selectedInterview.overallScore || 0}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-black text-slate-800 uppercase tracking-tight mb-2">Nội dung phỏng vấn</h4>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {selectedInterview.transcript ? (
                                        (() => {
                                            try {
                                                const msgs = JSON.parse(selectedInterview.transcript);
                                                return msgs.map((m, i) => (
                                                    <div key={i} className="mb-2">
                                                        <span className={`font-bold ${m.sender === 'AI' ? 'text-indigo-600' : 'text-slate-800'}`}>
                                                            {m.sender}:
                                                        </span>
                                                        <span className="text-slate-600">{m.text}</span>
                                                    </div>
                                                ));
                                            } catch (e) { return selectedInterview.transcript; }
                                        })()
                                    ) : 'Không có nội dung'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
