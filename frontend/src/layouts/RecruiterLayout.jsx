import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatWidget from '../components/ChatWidget';
import { getFullUrl } from '../utils/apiUtils';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';

export default function RecruiterLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    // Similar avatar loading logic could be added here if Recruiter has avatar
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon, label, isActive, highlight, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
        : highlight
          ? 'bg-gradient-to-r from-amber-200/20 to-yellow-200/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100/30'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
        }`}
    >
      <i className={`${icon} w-5 text-center transition-transform group-hover:scale-110 ${isActive ? 'text-white' : highlight ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500'}`}></i>
      <span className="font-medium">{label}</span>
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-l-full"></div>
      )}
    </Link>
  );

  const getPageTitle = (pathname) => {
    if (pathname.includes('/dashboard')) return 'Tổng quan';
    if (pathname.includes('/post-job')) return 'Đăng tin tuyển dụng';
    if (pathname.includes('/applicants')) return 'Quản lý ứng viên';
    if (pathname.includes('/find-candidates')) return 'Tìm ứng viên';
    if (pathname.includes('/company')) return 'Hồ sơ công ty';
    if (pathname.includes('/profile')) return 'Hồ sơ cá nhân';
    if (pathname.includes('/articles')) return 'Bài viết & Chia sẻ';
    if (pathname.includes('/messages')) return 'Tin nhắn';
    return 'Recruiter Portal';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300"
      style={{
        backgroundImage: 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.05), transparent 40%), radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.05), transparent 40%)',
        backgroundAttachment: 'fixed'
      }}>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {showMobileSidebar && (
          <div 
            className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 transition-all animate-fade-in"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside className={`md:hidden fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-white/20 dark:border-white/5 shadow-2xl z-40 flex flex-col transition-transform duration-300 transform ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100/50 dark:border-gray-800/50">
            <Link to="/recruiter/dashboard" className="flex items-center gap-3" onClick={() => setShowMobileSidebar(false)}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold shadow-lg">
                CM
              </span>
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  CareerMate
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Recruiter Portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Đóng menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Quản lý chung</p>

            <NavItem
              to="/recruiter/dashboard"
              icon="fas fa-chart-line"
              label="Tổng quan"
              isActive={isActive('/recruiter/dashboard')}
              onClick={() => setShowMobileSidebar(false)}
            />
            <NavItem
              to="/recruiter/company/view"
              icon="fas fa-building"
              label="Hồ sơ công ty"
              isActive={isActive('/recruiter/company') || isActive('/recruiter/company/view') || isActive('/recruiter/company/edit')}
              onClick={() => setShowMobileSidebar(false)}
            />

            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-3">Tuyển dụng</p>

            <NavItem
              to="/recruiter/post-job"
              icon="fas fa-plus-circle"
              label="Đăng tin mới"
              isActive={isActive('/recruiter/post-job')}
              highlight={true}
              onClick={() => setShowMobileSidebar(false)}
            />
            <NavItem
              to="/recruiter/applicants"
              icon="fas fa-users"
              label="Ứng viên"
              isActive={isActive('/recruiter/applicants')}
              onClick={() => setShowMobileSidebar(false)}
            />
            <NavItem
              to="/recruiter/find-candidates"
              icon="fas fa-search"
              label="Tìm ứng viên"
              isActive={isActive('/recruiter/find-candidates')}
              onClick={() => setShowMobileSidebar(false)}
            />
            <NavItem
              to="/recruiter/mock-requests"
              icon="fas fa-video"
              label="Phỏng vấn thử"
              isActive={isActive('/recruiter/mock-requests')}
              onClick={() => setShowMobileSidebar(false)}
            />

            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-3">Cộng đồng</p>

            <NavItem
              to="/recruiter/articles"
              icon="fas fa-newspaper"
              label="Bài viết của tôi"
              isActive={isActive('/recruiter/articles')}
              onClick={() => setShowMobileSidebar(false)}
            />
            <NavItem
              to="/recruiter/messages"
              icon="fas fa-comments"
              label="Tin nhắn"
              isActive={isActive('/recruiter/messages')}
              onClick={() => setShowMobileSidebar(false)}
            />
          </nav>

          <div className="p-4 border-t border-gray-100/50 dark:border-gray-800/50 bg-white/30 dark:bg-black/20">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/5 shadow-sm group hover:shadow-md transition-all duration-300">
              <Link to="/recruiter/profile" className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setShowMobileSidebar(false)}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={getFullUrl('/users/' + user.avatarUrl)}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                        e.target.parentElement.innerHTML = `<span class="text-sm font-bold">${user?.fullName?.charAt(0) || 'R'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold">{user?.fullName?.charAt(0) || 'R'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                    {user?.fullName || 'Nhà tuyển dụng'}
                  </p>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 group-hover:underline">
                    Hồ sơ cá nhân
                  </span>
                </div>
              </Link>
              <button
                onClick={() => {
                  setShowMobileSidebar(false);
                  handleLogout();
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                title="Đăng xuất"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex w-72 flex-col bg-white/70 dark:bg-black/70 backdrop-blur-xl border-r border-white/20 dark:border-white/5 shadow-2xl z-20 transition-all duration-300">
          <div className="h-20 flex items-center px-8 border-b border-gray-100/50 dark:border-gray-800/50">
            <Link to="/recruiter/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  CM
                </span>
                <div className="absolute inset-0 bg-emerald-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  CareerMate
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Recruiter Portal
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Quản lý chung</p>

            <NavItem
              to="/recruiter/dashboard"
              icon="fas fa-chart-line"
              label="Tổng quan"
              isActive={isActive('/recruiter/dashboard')}
            />
            <NavItem
              to="/recruiter/company/view"
              icon="fas fa-building"
              label="Hồ sơ công ty"
              isActive={isActive('/recruiter/company') || isActive('/recruiter/company/view') || isActive('/recruiter/company/edit')}
            />

            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-3">Tuyển dụng</p>

            <NavItem
              to="/recruiter/post-job"
              icon="fas fa-plus-circle"
              label="Đăng tin mới"
              isActive={isActive('/recruiter/post-job')}
              highlight={true}
            />
            <NavItem
              to="/recruiter/applicants"
              icon="fas fa-users"
              label="Ứng viên"
              isActive={isActive('/recruiter/applicants')}
            />
            <NavItem
              to="/recruiter/find-candidates"
              icon="fas fa-search"
              label="Tìm ứng viên"
              isActive={isActive('/recruiter/find-candidates')}
            />
            <NavItem
              to="/recruiter/mock-requests"
              icon="fas fa-video"
              label="Phỏng vấn thử"
              isActive={isActive('/recruiter/mock-requests')}
            />

            <p className="px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-6 mb-3">Cộng đồng</p>

            <NavItem
              to="/recruiter/articles"
              icon="fas fa-newspaper"
              label="Bài viết của tôi"
              isActive={isActive('/recruiter/articles')}
            />
            <NavItem
              to="/recruiter/messages"
              icon="fas fa-comments"
              label="Tin nhắn"
              isActive={isActive('/recruiter/messages')}
            />
          </nav>

          <div className="p-4 border-t border-gray-100/50 dark:border-gray-800/50 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-black/50 border border-white/40 dark:border-white/5 shadow-sm group hover:shadow-md transition-all duration-300">
              <Link to="/recruiter/profile" className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={getFullUrl('/users/' + user.avatarUrl)}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                        e.target.parentElement.innerHTML = `<span class="text-sm font-bold">${user?.fullName?.charAt(0) || 'R'}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold">{user?.fullName?.charAt(0) || 'R'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                    {user?.fullName || 'Nhà tuyển dụng'}
                  </p>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 group-hover:underline">
                    Hồ sơ cá nhân
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
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
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mr-2"
                title="Mở menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="md:hidden">
                <Link to="/recruiter/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold">
                    CM
                  </div>
                </Link>
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <NotificationBell />
            </div>
          </header>

          <main className={`flex-1 overflow-y-auto custom-scrollbar scroll-smooth ${location.pathname.includes('/recruiter/messages') ? '' : 'p-6 md:p-8'}`}>
            <div className={`max-w-7xl mx-auto animate-fade-in ${location.pathname.includes('/recruiter/messages') ? 'h-full' : ''}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
      <ChatWidget role="RECRUITER" />
    </div>
  );
}

