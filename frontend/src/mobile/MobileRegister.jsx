import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function MobileRegister() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'STUDENT',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { oauthLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.register(formData);
            navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=REGISTRATION`);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider, credential) => {
        setLoading(true);
        setError('');
        try {
            await oauthLogin({
                provider: provider.toUpperCase(),
                credential
            });
            navigate('/mobile/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || `Lỗi đăng ký ${provider}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-8 flex flex-col justify-center animate-fade-in font-sans">
            {/* Header */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-16 h-16 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-6">
                    <i className="fas fa-user-plus text-2xl text-white"></i>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center">
                    Tham gia ngay
                </h1>
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mt-2 text-center">
                    Bắt đầu sự nghiệp của bạn
                </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest animate-shake">
                            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Họ và Tên</label>
                            <div className="relative">
                                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mật khẩu</label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Loại tài khoản</label>
                            <div className="grid grid-cols-2 gap-3 h-14">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                                    className={`rounded-2xl border-none font-black text-[10px] uppercase tracking-widest transition-all ${formData.role === 'STUDENT'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-50 dark:bg-slate-900 text-slate-400'
                                        }`}
                                >
                                    Sinh viên
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
                                    className={`rounded-2xl border-none font-black text-[10px] uppercase tracking-widest transition-all ${formData.role === 'RECRUITER'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-slate-50 dark:bg-slate-900 text-slate-400'
                                        }`}
                                >
                                    Tuyển dụng
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'LẤY MÃ OTP'}
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                            <span className="px-4 bg-white dark:bg-slate-950 text-slate-300 dark:text-slate-600">Hoặc</span>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                handleSocialLogin('Google', credentialResponse.credential);
                            }}
                            onError={() => {
                                setError('Đăng ký Google thất bại');
                            }}
                            theme="outline"
                            size="large"
                            width="312"
                            text="signup_with"
                            shape="pill"
                        />
                    </div>
                </form>

                <div className="text-center pt-6">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                        Đã có tài khoản? <Link to="/mobile/login" className="text-emerald-500">Đăng nhập ngay</Link>
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest italic">Secure Registration Portal v2.0</p>
            </div>
        </div>
    );
}
