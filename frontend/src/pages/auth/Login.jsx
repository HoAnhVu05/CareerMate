import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
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
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
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
      const role = data.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || `Lỗi đăng nhập ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-white font-sans">

      {/* Left Pane: Branding & Vision (Visible on Desktop) */}
      <div className="hidden lg:flex relative flex-col justify-between p-16 xl:p-24 overflow-hidden bg-[#5f33e1]">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24 animate-fade-in">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-lg">
              <span className="text-xl font-black text-[#5f33e1]">C</span>
            </div>
            <span className="text-xl font-black text-white tracking-tight">CareerMate</span>
          </div>

          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-6xl xl:text-7xl font-black text-white leading-tight tracking-tighter">
              Chìa khóa <br />
              mở cửa <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">tương lai</span>.
            </h1>
            <p className="text-xl text-indigo-100/80 max-w-md leading-relaxed">
              Nền tảng phát triển sự nghiệp toàn diện, kết nối việc làm thông minh và mạng lưới chuyên gia toàn cầu.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <img key={i} className="w-10 h-10 rounded-full border-2 border-[#5f33e1]" src={`https://i.pravatar.cc/100?u=${i + 50}`} alt="User" />
            ))}
          </div>
          <p className="text-sm font-medium text-indigo-100/60 uppercase tracking-widest">Được tin dùng bởi 10k+ chuyên gia</p>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-[#f9fafb]">
        <div className="w-full max-w-[420px] animate-fade-in-right">

          {/* Logo for Mobile */}
          <div className="lg:hidden flex justify-center mb-12">
            <div className="w-12 h-12 rounded-xl bg-[#5f33e1] flex items-center justify-center shadow-xl">
              <span className="text-2xl font-black text-white">C</span>
            </div>
          </div>

          <div className="text-left mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Chào mừng trở lại</h2>
            <p className="text-slate-500 font-medium">Vui lòng nhập thông tin để đăng nhập.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-semibold animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5f33e1] focus:ring-4 focus:ring-[#5f33e1]/10 transition-all font-medium"
                  placeholder="Nhập email của bạn"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mật khẩu</label>
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-[#5f33e1] hover:text-[#4d29b8] transition-colors">Quên mật khẩu?</Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#5f33e1] focus:ring-4 focus:ring-[#5f33e1]/10 transition-all font-medium"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#5f33e1] focus:ring-[#5f33e1]" />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">Ghi nhớ đăng nhập</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#5f33e1] text-white hover:bg-[#4d29b8] transition-all duration-300 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : 'Đăng nhập'}
            </button>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  console.log('=== GOOGLE LOGIN SUCCESS ===');
                  console.log('Credential:', credentialResponse.credential);
                  handleSocialLogin('Google', credentialResponse.credential);
                }}
                onError={() => {
                  console.error('=== GOOGLE LOGIN FAILED ===');
                  setError('Đăng nhập Google thất bại');
                }}
                useOneTap
                theme="outline"
                size="large"
                width="420"
                text="continue_with"
                shape="rectangular"
              />
            </div>

            <div className="text-center pt-6">
              <p className="text-sm text-slate-600 font-medium">
                Chưa có tài khoản? <Link to="/register" className="text-[#5f33e1] font-bold hover:underline underline-offset-4 decoration-2">Đăng ký miễn phí</Link>
              </p>
            </div>
          </form>

          {/* Footer Copyright */}
          <div className="mt-12 text-center lg:text-left">
            <p className="text-xs text-slate-400 font-medium">© 2026 CareerMate. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
