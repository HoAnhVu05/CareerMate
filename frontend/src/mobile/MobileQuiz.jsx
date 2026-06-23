import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MobileQuiz() {
    const navigate = useNavigate();
    const [quizType, setQuizType] = useState(null); // 'career' | 'skills'
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [result, setResult] = useState(null);

    const questions = {
        career: [
            { q: "Bạn thích làm việc như thế nào?", o: ["Độc lập", "Nhóm", "Lãnh đạo", "Sáng tạo"] },
            { q: "Môi trường mong muốn?", o: ["Văn phòng", "Remote", "Startup", "Ổn định"] },
            { q: "Ưu tiên hàng đầu?", o: ["Lương", "Phát triển", "Cân bằng", "Ý nghĩa"] }
        ],
        skills: [
            { q: "Kỹ năng lập trình của bạn?", o: ["Mới bắt đầu", "Cơ bản", "Trung bình", "Expert"] },
            { q: "Kinh nghiệm thực tế?", o: ["Chưa có", "Ít", "Trung bình", "Nhiều"] },
            { q: "Khả năng giao tiếp?", o: ["Tự tin", "Khá", "Bình thường", "Cần luyện"] }
        ]
    };

    const handleSelect = (idx) => {
        const currentQ = questions[quizType];
        const newAns = [...answers, idx];
        setAnswers(newAns);

        if (step < currentQ.length - 1) {
            setStep(step + 1);
        } else {
            setResult(Math.floor(Math.random() * 20) + 80); // Mock score 80-100
        }
    };

    if (result) return (
        <div className="h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-10 animate-fade-in">
            <div className="w-40 h-40 bg-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-black mb-8 shadow-2xl shadow-indigo-500/50 animate-bounce-slow">
                {result}%
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase text-center leading-tight mb-4">Kết Quả Đánh Giá</h2>
            <p className="text-xs text-slate-500 text-center font-medium leading-relaxed mb-10">
                Định hướng của bạn rất tiềm năng! Dựa trên kết quả này, AI đã mở khóa thêm 12 vị trí việc làm phù hợp.
            </p>
            <button
                onClick={() => navigate('/mobile/jobs')}
                className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
                XEM GỢI Ý NGAY
            </button>
            <button onClick={() => { setQuizType(null); setStep(0); setResult(null); setAnswers([]); }} className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">LÀM LẠI</button>
        </div>
    );

    if (!quizType) return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            <div className="p-6 pt-12 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Kiểm tra năng lực</h1>
            </div>

            <div className="p-6 space-y-6">
                <div onClick={() => setQuizType('career')} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-6"><i className="fas fa-compass"></i></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Định hướng sự nghiệp</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tìm ra con đường phù hợp nhất</p>
                </div>
                <div onClick={() => setQuizType('skills')} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6"><i className="fas fa-magic"></i></div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Đánh giá kỹ năng</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kiểm tra mức độ sẵn sàng cho công việc</p>
                </div>
            </div>
        </div>
    );

    const q = questions[quizType][step];

    return (
        <div className="h-screen bg-slate-900 flex flex-col p-8 animate-fade-in relative z-50">
            <div className="flex justify-between items-center mb-12">
                <button onClick={() => setQuizType(null)} className="text-white/50"><i className="fas fa-times"></i></button>
                <div className="px-4 py-1 bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">Question {step + 1}/3</div>
                <div className="w-6"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-black text-white uppercase leading-tight tracking-tight mb-12">{q.q}</h2>
                <div className="space-y-4">
                    {q.o.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] text-left text-white font-black uppercase text-[10px] tracking-widest active:bg-indigo-600 active:border-indigo-600 transition-all"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full bg-white/10 h-1.5 rounded-full mt-10 overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${((step + 1) / 3) * 100}%` }}></div>
            </div>
        </div>
    );
}
