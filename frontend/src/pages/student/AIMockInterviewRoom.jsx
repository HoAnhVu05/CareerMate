import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AIMockInterviewRoom() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]); // { sender: 'AI'|'USER', text: '', feedback: null }
    const [currentInput, setCurrentInput] = useState('');
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [jobInfo, setJobInfo] = useState(null);
    const [sending, setSending] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime] = useState(new Date());

    // Stats
    const [scores, setScores] = useState([]); // List of scores per answer

    const messagesEndRef = useRef(null);

    useEffect(() => {
        startInterview();
    }, [jobId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const startInterview = async () => {
        try {
            setLoading(true);
            const profile = await api.getStudentProfile();
            // Start interview
            // Assuming startAIMockInterview returns { questions: [...], jobId, jobTitle ... }
            let session;
            if (jobId === 'custom') {
                if (!location.state?.customRole) {
                    navigate('/student/mock-interview');
                    return;
                }
                const { title, desc } = location.state.customRole;
                session = await api.startCustomAIMockInterview(title, desc);
            } else {
                session = await api.startAIMockInterview(jobId, JSON.stringify(profile));
            }

            setJobInfo({ title: session.jobTitle, id: session.jobId });

            // Parse questions if they are string, or array
            let qs = [];
            if (session.questions && Array.isArray(session.questions)) {
                qs = session.questions;
            } else if (session.questions && typeof session.questions === 'object' && session.questions.questions) {
                qs = session.questions.questions;
            }

            setQuestions(qs);

            // Initial Greeting
            setMessages([
                {
                    sender: 'AI',
                    text: `Xin chào ${user?.fullName || 'bạn'}! Tôi là trợ lý AI chuyên nghiệp. Hôm nay tôi sẽ phỏng vấn bạn cho vị trí ${session.jobTitle}. Chúng ta sẽ đi qua ${qs.length} câu hỏi. Hãy trả lời thật tự tin nhé!`
                },
                {
                    sender: 'AI',
                    text: `Câu hỏi 1: ${qs[0]?.question}`
                }
            ]);

        } catch (e) {
            console.error(e);
            alert('Không thể bắt đầu phỏng vấn: ' + e.message);
            navigate('/student/mock-interview');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!currentInput.trim() || sending) return;

        const answerText = currentInput;
        setMessages(prev => [...prev, { sender: 'USER', text: answerText }]);
        setCurrentInput('');
        setSending(true);

        try {
            // Evaluate answer
            const currentQ = questions[currentQIndex];
            const evaluation = await api.evaluateAIAnswer(currentQ.question, answerText, jobInfo.title);

            // Save score
            const score = evaluation.score || 0; // 0-100 or 0-10
            setScores(prev => [...prev, score]);

            // Show feedback (optional, maybe summaries later, or immediate)
            // Let's show a brief "AI đang nhận xét..." then next question

            // Construct next step
            const nextIndex = currentQIndex + 1;

            setTimeout(() => {
                const feedbackMsg = {
                    sender: 'AI',
                    isFeedback: true,
                    text: `Đánh giá: ${score}/100. ${evaluation.feedback || 'Tốt.'}`,
                    feedbackDetails: evaluation
                };

                setMessages(prev => [...prev, feedbackMsg]);

                if (nextIndex < questions.length) {
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            sender: 'AI',
                            text: `Câu hỏi ${nextIndex + 1}: ${questions[nextIndex].question}`
                        }]);
                        setCurrentQIndex(nextIndex);
                        setSending(false);
                    }, 1500);
                } else {
                    // Finish
                    setTimeout(() => {
                        finishInterview(scores.concat(score));
                        setSending(false);
                    }, 1500);
                }
            }, 1000);

        } catch (e) {
            console.error(e);
            setMessages(prev => [...prev, { sender: 'AI', text: 'Xin lỗi, có lỗi xảy ra khi xử lý câu trả lời. Hãy thử lại.' }]);
            setSending(false);
        }
    };

    const finishInterview = async (finalScores = scores) => {
        if (isFinished) return;
        setIsFinished(true);

        // Calculate average
        const total = finalScores.reduce((a, b) => a + b, 0);
        const avg = finalScores.length ? Math.round(total / finalScores.length) : 0;

        const conclusionMsg = {
            sender: 'AI',
            text: `Chúng ta đã hoàn tất bài phỏng vấn! Điểm trung bình của bạn là ${avg}/100. Cảm ơn bạn đã tham gia. Bạn có thể xem lại lịch sử phỏng vấn tại trang cá nhân.`
        };

        setMessages(prev => [...prev, conclusionMsg]);

        // Save to backend
        try {
            const profile = await api.getStudentProfile();
            // Construct current messages for transcript (including the last one)
            const currentMessages = [...messages, conclusionMsg];
            const transcript = JSON.stringify(currentMessages);

            await api.finishAIMockInterview({
                studentId: profile.userId,
                jobId: jobInfo.id,
                jobTitle: jobInfo.title,
                startedAt: startTime.toISOString(),
                completedAt: new Date().toISOString(),
                overallScore: avg,
                totalQuestions: questions.length,
                answeredQuestions: finalScores.length,
                status: 'COMPLETED',
                transcript: transcript
            });

            console.log('Interview history saved successfully');
        } catch (e) {
            console.error('Error saving interview history:', e);
        }
    };

    const handleBack = () => {
        navigate('/student/mock-interview');
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <i className="fas fa-brain fa-spin text-6xl text-indigo-500 mb-6"></i>
            <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">Đang chuẩn bị phòng phỏng vấn...</h2>
            <p className="text-white/50 mt-2">AI đang đọc mô tả công việc</p>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-black">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/student/mock-interview')} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <i className="fas fa-arrow-left text-slate-500"></i>
                    </button>
                    <div>
                        <h1 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Phỏng vấn: {jobInfo?.title}
                        </h1>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Powered by Gemini AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!isFinished && (
                        <button
                            onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn kết thúc phỏng vấn ngay bây giờ?')) {
                                    finishInterview();
                                }
                            }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors uppercase tracking-wider border border-red-100 dark:border-red-900/30"
                        >
                            <i className="fas fa-stop mr-2"></i> Kết thúc
                        </button>
                    )}
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
                        Câu hỏi {Math.min(currentQIndex + 1, questions.length)}/{questions.length}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.sender === 'USER'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : msg.isFeedback
                                ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-slate-800 dark:text-slate-200'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-700'
                            }`}>
                            {msg.sender === 'AI' && !msg.isFeedback && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">AI</div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Recruiter</span>
                                </div>
                            )}

                            <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>

                            {msg.isFeedback && (
                                <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-700/30 flex gap-2">
                                    <span className="text-xs font-bold text-amber-600">
                                        <i className="fas fa-star mr-1"></i> Feedback
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5">
                {!isFinished ? (
                    <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] p-1.5 flex items-center border border-transparent focus-within:border-blue-500 transition-all">
                            <textarea
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                                disabled={sending}
                                placeholder={sending ? "AI đang suy nghĩ..." : "Nhập câu trả lời của bạn..."}
                                className="w-full bg-transparent border-none focus:ring-0 text-sm p-3 max-h-32 min-h-[3rem] resize-none dark:text-white"
                                rows={1}
                            />
                            <button
                                type="button"
                                className="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors flex items-center justify-center"
                                disabled
                            >
                                <i className="fas fa-microphone"></i>
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!currentInput.trim() || sending}
                            className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {sending ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                        </button>
                    </form>
                ) : (
                    <div className="max-w-4xl mx-auto flex flex-col items-center py-4">
                        <button
                            onClick={handleBack}
                            className="px-8 py-3 bg-indigo-600 text-white font-black uppercase rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1"
                        >
                            <i className="fas fa-arrow-left mr-2"></i> Quay lại trang chủ
                        </button>
                    </div>
                )}
                {!isFinished && (
                    <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                        Nhấn Enter để gửi. Shift+Enter để xuống dòng.
                    </p>
                )}
            </div>
        </div>
    );
}
