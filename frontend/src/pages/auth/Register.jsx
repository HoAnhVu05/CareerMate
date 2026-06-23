import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
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
      const data = await oauthLogin({
        provider: provider.toUpperCase(),
        credential
      });
      const role = data.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || `Lỗi đăng ký ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-white font-sans">

      {/* Left Pane: Ecosystem & Community (Visible on Desktop) */}
      <div className="hidden lg:flex relative flex-col justify-between p-16 xl:p-24 overflow-hidden bg-[#0a0a10]">
        {/* Animated background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24 animate-fade-in">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fas fa-bolt text-white"></i>
            </div>
            <span className="text-xl font-black text-white tracking-tight">CareerMate</span>
          </div>

          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-6xl xl:text-7xl font-black text-white leading-tight tracking-tighter">
              Bứt phá <br />
              mọi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">giới hạn</span>.
            </h1>
            <p className="text-xl text-slate-400 max-w-md leading-relaxed">
              Dẫn đầu tương lai với lộ trình sự nghiệp cá nhân hóa và mạng lưới chuyên nghiệp toàn cầu.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <img key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0a10]" src={`https://i.pravatar.cc/100?u=${i + 100}`} alt="User" />
              ))}
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cùng 10k+ học viên</p>
          </div>
          <div className="h-[1px] w-32 bg-gradient-to-r from-white/10 to-transparent"></div>
        </div>
      </div>

      {/* Right Pane: Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-[#f9fafb] overflow-y-auto">
        <div className="w-full max-w-[460px] animate-fade-in-right py-12">

          <div className="text-left mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Tạo tài khoản mới</h2>
            <p className="text-slate-500 font-medium">Bắt đầu hành trình của bạn ngay hôm nay.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="Nhập đầy đủ họ tên"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="Tạo mật khẩu bảo mật"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Loại tài khoản</label>
                <div className="grid grid-cols-2 gap-3 h-12">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                    className={`rounded-xl border-2 font-bold text-sm transition-all ${formData.role === 'STUDENT'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                  >
                    Sinh viên
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
                    className={`rounded-xl border-2 font-bold text-sm transition-all ${formData.role === 'RECRUITER'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                  >
                    Nhà tuyển dụng
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-900 text-white hover:bg-black transition-all duration-300 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : 'LẤY MÃ OTP'}
            </button>

            <div className="flex justify-center w-full mt-4">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  handleSocialLogin('Google', credentialResponse.credential);
                }}
                onError={() => {
                  setError('Đăng ký Google thất bại');
                }}
                useOneTap
                theme="outline"
                size="large"
                width="460"
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <div className="text-center pt-6">
              <p className="text-sm text-slate-600 font-medium">
                Đã có tài khoản? <Link to="/login" className="text-emerald-600 font-bold hover:underline underline-offset-4 decoration-2">Đăng nhập tại đây</Link>
              </p>
            </div>
          </form>

          <div className="mt-12 text-center lg:text-left">
            <p className="text-xs text-slate-400 font-medium">© 2026 CareerMate. Hệ thống bảo mật CareerMate.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
