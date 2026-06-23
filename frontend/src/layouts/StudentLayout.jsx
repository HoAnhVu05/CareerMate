import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatWidget from '../components/ChatWidget';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';
import api from '../services/api';

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    loadAvatar();

    // Listen for avatar update events
    const handleAvatarUpdate = () => {
      console.log('Avatar update event received, reloading avatar...');
      loadAvatar();
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate);

    // Only reload avatar every 30 seconds (reduced from 5 seconds to save resources)
    // Event listener should handle most updates
    const interval = setInterval(() => {
      loadAvatar();
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const loadAvatar = async () => {
    try {
      // Force refresh to get latest avatar
      const data = await api.getStudentProfile(true);
      if (data && !data.error && data.avatarUrl) {
        let url = api.getFileUrl(data.avatarUrl);
        // Add cache busting timestamp to force reload
        url = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        console.log('Loading avatar URL:', url);
        setAvatarUrl(url);
      } else {
        // Clear avatar if not found
        setAvatarUrl(null);
      }
    } catch (error) {
      // Silently fail for avatar - not critical
      console.debug('Error loading avatar (non-critical):', error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getAvatarUrl = () => {
    if (avatarUrl) return avatarUrl;
    return null;
  };

  const NavItem = ({ to, icon, label, isActive, badge, highlight }) => (
    <Link
      to={to}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
        : highlight
          ? 'bg-gradient-to-r from-amber-200/20 to-yellow-200/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100/30'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
        }`}
    >
      <i className={`${icon} w-5 text-center transition-transform group-hover:scale-110 ${isActive ? 'text-white' : highlight ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500'}`}></i>
      <span className="font-medium">{label}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-pulse">
          {badge}
        </span>
      )}
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full"></div>
      )}
    </Link>
  );

  const getPageTitle = (pathname) => {
    if (pathname.includes('/dashboard')) return 'Tổng quan';
    if (pathname.includes('/jobs')) return 'Việc làm tuyển dụng';
    if (pathname.includes('/applications')) return 'Đơn ứng tuyển';
    if (pathname.includes('/cv-templates')) return 'Kho mẫu CV';
    if (pathname.includes('/cv')) return 'Quản lý CV';
    if (pathname.includes('/roadmap')) return 'Lộ trình phát triển';
    if (pathname.includes('/courses')) return 'Khóa học';
    if (pathname.includes('/articles')) return 'Góc chia sẻ';
    if (pathname.includes('/companies')) return 'Danh sách công ty';
    if (pathname.includes('/challenges')) return 'Thử thách Coding';
    if (pathname.includes('/profile')) return 'Hồ sơ cá nhân';
    if (pathname.includes('/messages')) return 'Tin nhắn';
    if (pathname.includes('/packages')) return 'Gói Premium';
    return 'Student Portal';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300"
      style={{
        backgroundImage: 'radial-gradient(circle at top left, rgba(37, 99, 235, 0.05), transparent 40%), radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.05), transparent 40%)',
        backgroundAttachment: 'fixed'
      }}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col bg-white/70 dark:bg-black/70 backdrop-blur-xl border-r border-white/20 dark:border-white/5 shadow-2xl z-20 transition-all duration-300">
          <div className="h-20 flex items-center px-8 border-b border-gray-100/50 dark:border-gray-800/50">
            <Link to="/student/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                  CM
                </span>
                <div className="absolute inset-0 bg-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  CareerMate
                </span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Student Portal
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Menu</p>

            <NavItem
              to="/student/dashboard"
              icon="fas fa-home"
              label="Tổng quan"
              isActive={isActive('/student/dashboard')}
            />
            <NavItem
              to="/student/jobs"
              icon="fas fa-briefcase"
              label="Việc làm"
              isActive={isActive('/student/jobs')}
            />
            <NavItem
              to="/student/applications"
              icon="fas fa-file-signature"
              label="Đơn ứng tuyển"
              isActive={isActive('/student/applications')}
            />
            <NavItem
              to="/student/cv"
              icon="fas fa-file-alt"
              label="CV của tôi"
              isActive={isActive('/student/cv') || location.pathname.startsWith('/student/cv/')}
            />
            <NavItem
              to="/student/cv-templates"
              icon="fas fa-file-invoice"
              label="Kho mẫu CV"
              isActive={isActive('/student/cv-templates')}
              badge="Hot"
            />

            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-3">Phát triển</p>

            <NavItem
              to="/student/roadmap"
              icon="fas fa-route"
              label="Lộ trình"
              isActive={isActive('/student/roadmap')}
            />
            <NavItem
              to="/student/courses"
              icon="fas fa-graduation-cap"
              label="Khóa học"
              isActive={isActive('/student/courses')}
            />
            <NavItem
              to="/student/challenges"
              icon="fas fa-trophy"
              label="Thử thách"
              isActive={isActive('/student/challenges')}
            />
            <NavItem
              to="/student/articles"
              icon="fas fa-newspaper"
              label="Bài viết"
              isActive={isActive('/student/articles')}
            />
            <NavItem
              to="/student/mock-interview"
              icon="fas fa-video"
              label="Phỏng vấn thử"
              isActive={isActive('/student/mock-interview') || location.pathname.includes('/student/mock-interview')}
            />

            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-3">Khác</p>

            <NavItem
              to="/student/companies"
              icon="fas fa-building"
              label="Công ty"
              isActive={isActive('/student/companies')}
            />
            <NavItem
              to="/student/messages"
              icon="fas fa-comments"
              label="Tin nhắn"
              isActive={isActive('/student/messages')}
            />
            <NavItem
              to="/student/packages"
              icon="fas fa-crown"
              label="Nâng cấp Premium"
              isActive={isActive('/student/packages')}
              highlight={true}
            />
          </nav>

          <div className="p-4 border-t border-gray-100/50 dark:border-gray-800/50 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/5 shadow-sm">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 object-cover shadow-sm"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <span className="text-sm font-bold">{user?.fullName?.charAt(0) || 'S'}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.fullName || 'Sinh viên'}
                </p>
                <Link to="/student/profile" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Xem hồ sơ
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top bar */}
          <header className="h-20 px-6 md:px-8 flex items-center justify-between bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-white/20 dark:border-white/5 z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Link to="/student/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                    CM
                  </div>
                </Link>
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex relative group">
                <input
                  type="text"
                  placeholder="Tìm việc làm, công ty..."
                  className="w-64 pl-10 pr-4 py-2 bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:w-80 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none backdrop-blur-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/student/jobs?search=${e.target.value}`);
                    }
                  }}
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>

              <DarkModeToggle />
              <NotificationBell />
            </div>
          </header>

          <main className={`flex-1 overflow-y-auto custom-scrollbar scroll-smooth ${location.pathname.includes('/student/articles') || location.pathname.includes('/student/messages') ? '' : 'p-6 md:p-8'
            }`}>
            <div className={`max-w-7xl mx-auto animate-fade-in ${location.pathname.includes('/student/messages') ? 'h-full' : ''}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
      <ChatWidget role="STUDENT" />
    </div>
  );
}

