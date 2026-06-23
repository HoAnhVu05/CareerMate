import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get('email');
    const otp = new URLSearchParams(location.search).get('otp');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await api.resetPassword({ email, otp, newPassword: password });
            alert('Đổi mật khẩu thành công! Bây giờ bạn có thể đăng nhập.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-white font-sans">

            {/* Left Pane: Access Branding */}
            <div className="hidden lg:flex relative flex-col justify-between p-16 xl:p-24 overflow-hidden bg-[#0a1128]">
                {/* Glow Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/5 rounded-full blur-[120px]"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-24 animate-fade-in">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-xl">
                            <i className="fas fa-lock-open text-xl"></i>
                        </div>
                        <span className="text-xl font-black text-white tracking-tight">Quản lý Truy cập</span>
                    </div>

                    <div className="space-y-8 animate-fade-in-up">
                        <h1 className="text-6xl xl:text-7xl font-black text-white leading-tight tracking-tighter">
                            Thiết lập <br />
                            mật khẩu <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">mới</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                            Sắp hoàn tất rồi. Hãy thiết lập mật khẩu mới an toàn để truy cập lại vào không gian làm việc CareerMate của bạn.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-[0.35em]">Làm mới thông tin bảo mật</p>
                </div>
            </div>

            {/* Right Pane: Reset Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-[#f9fafb]">
                <div className="w-full max-w-[420px] animate-fade-in-right py-12">

                    <div className="text-left mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Mật khẩu mới</h2>
                        <p className="text-slate-500 font-medium">Vui lòng đặt mật khẩu mới mạnh mẽ.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                                    placeholder="Tối thiểu 8 ký tự"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium"
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-slate-900 text-white hover:bg-black transition-all duration-300 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4"
                        >
                            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'CẬP NHẬT MẬT KHẨU'}
                        </button>
                    </form>

                    <div className="text-center mt-12 pt-8 border-t border-slate-200">
                        <Link to="/login" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Hủy và quay về trang chủ</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
