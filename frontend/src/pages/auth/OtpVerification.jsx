import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';

export default function OtpVerification() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');
    const type = new URLSearchParams(location.search).get('type') || 'REGISTRATION';

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [email, navigate]);

    const handleChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) return;
        const newOtp = [...otp];
        const char = value.slice(-1);
        newOtp[index] = char;
        setOtp(newOtp);
        if (char && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').trim();
        if (!/^\d{6}$/.test(data)) return;
        const digits = data.split('');
        setOtp(digits);
        document.getElementById('otp-5')?.focus();
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) return;
        setError('');
        setLoading(true);
        try {
            await api.verifyOtp(email, otpCode, type);
            if (type === 'PASSWORD_RESET') {
                navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpCode}`);
            } else {
                alert('Đăng ký tài khoản thành công! Bây giờ bạn có thể đăng nhập.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-white font-sans">

            {/* Left Pane: Security Branding */}
            <div className="hidden lg:flex relative flex-col justify-between p-16 xl:p-24 overflow-hidden bg-[#07070c]">
                {/* Abstract backlights */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-[120px]"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-24 animate-fade-in">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shadow-xl">
                            <i className="fas fa-shield-halved text-xl"></i>
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">Trung tâm Bảo mật</span>
                    </div>

                    <div className="space-y-8 animate-fade-in-up">
                        <h1 className="text-6xl xl:text-7xl font-black text-white leading-tight tracking-tighter">
                            Xác minh <br />
                            danh tính <br />
                            của bạn.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn để bảo vệ tài khoản chuyên nghiệp này.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-[0.35em]">Phiên đăng nhập đã được mã hóa</p>
                </div>
            </div>

            {/* Right Pane: OTP Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-[#f9fafb]">
                <div className="w-full max-w-[440px] animate-fade-in-right py-12">

                    <div className="text-left mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Kiểm tra email</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Mã xác thực đã được gửi đến <br />
                            <span className="text-slate-900 font-black">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between gap-2 sm:gap-3">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`otp-${idx}`}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    onPaste={idx === 0 ? handlePaste : undefined}
                                    className="w-full h-14 sm:h-18 bg-white border border-slate-200 rounded-xl text-center text-3xl font-black text-slate-900 focus:outline-none focus:border-[#5f33e1] focus:ring-4 focus:ring-[#5f33e1]/10 transition-all shadow-sm select-all"
                                />
                            ))}
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mã hết hạn sau <span className="text-[#5f33e1] animate-pulse">{formatTime(timer)}</span></p>
                            <button type="button" className="text-xs font-bold text-[#5f33e1] hover:underline underline-offset-4 decoration-2 transition-all">Chưa nhận được mã? Gửi lại</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full h-12 bg-[#5f33e1] text-white hover:bg-[#4d29b8] transition-all duration-300 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'XÁC MINH NGAY'}
                        </button>
                    </form>

                    <div className="text-center mt-12 pt-8 border-t border-slate-200">
                        <Link to="/login" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Quay lại Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
