import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';

export default function MobileLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, oauthLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(email, password);
            const role = data.user.role;
            if (role === 'STUDENT') navigate('/mobile/dashboard');
            else if (role === 'RECRUITER') navigate('/mobile/dashboard');
            else if (role === 'ADMIN') navigate('/mobile/dashboard');
            else navigate('/mobile/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider, credential) => {
        setLoading(true);
        setError('');
        try {
            const data = await oauthLogin({
                provider: provider.toUpperCase(),
                credential
            });
            navigate('/mobile/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || `Lỗi đăng nhập ${provider}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-8 flex flex-col justify-center animate-fade-in font-sans">
            {/* Header / Logo */}
            <div className="flex flex-col items-center mb-12">
                <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-6">
                    <i className="fas fa-rocket text-2xl text-white"></i>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center">
                    CareerMate
                </h1>
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mt-2">
                    Premium Mobile App
                </p>
            </div>

            {/* Login Form */}
            <div className="space-y-8">
                <div className="text-left">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Chào mừng</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Đăng nhập để tiếp tục</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest animate-shake">
                            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mật khẩu</label>
                                <Link to="/forgot-password" title="Quên mật khẩu?" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Quên?</Link>
                            </div>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[12px] font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'ĐĂNG NHẬP'}
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
                                setError('Đăng nhập Google thất bại');
                            }}
                            theme="outline"
                            size="large"
                            width="312"
                            text="continue_with"
                            shape="pill"
                        />
                    </div>
                </form>

                <div className="text-center pt-8">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                        Chưa có tài khoản? <Link to="/mobile/register" className="text-indigo-600 dark:text-indigo-400">Đăng ký ngay</Link>
                    </p>
                </div>
            </div>

            {/* Decorative element */}
            <div className="fixed -bottom-24 -right-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
    );
}
