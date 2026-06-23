import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatWidget from '../components/ChatWidget';
import NotificationBell from '../components/NotificationBell';
import DarkModeToggle from '../components/DarkModeToggle';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/admin/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { path: '/admin/users', icon: 'fa-users-cog', label: 'Quản lý người dùng' },
    { path: '/admin/companies', icon: 'fa-building', label: 'Quản lý doanh nghiệp' },
    { path: '/admin/jobs', icon: 'fa-briefcase', label: 'Quản lý tin tuyển dụng' },
    { path: '/admin/articles', icon: 'fa-newspaper', label: 'Quản lý bài viết' },
    { path: '/admin/articles/create', icon: 'fa-plus-circle', label: 'Đăng bài viết' },
    { path: '/admin/cv-templates', icon: 'fa-file-code', label: 'Quản lý CV Templates' },
    { path: '/admin/packages', icon: 'fa-gem', label: 'Quản lý Gói Dịch Vụ' },
    { path: '/admin/mock-interviews', icon: 'fa-robot', label: 'Quản lý Phỏng vấn AI' },
    { path: '/admin/analytics', icon: 'fa-chart-line', label: 'Phân Tích & Báo Cáo' },
    { path: '/admin/messages', icon: 'fa-comments', label: 'Tin nhắn' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-['Inter']">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 shadow-2xl transition-all duration-300">
          <div className="h-20 flex items-center px-8 mb-4">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold text-lg shadow-xl transform group-hover:rotate-6 transition-transform">
                  CM
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                  CareerMate
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="px-4 mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 py-2">
                Menu chính
              </h3>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${isActive(item.path)
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:translate-x-1'
                  }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive(item.path)
                  ? 'bg-white/20'
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30'
                  }`}>
                  <i className={`fas ${item.icon} text-sm ${isActive(item.path)
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`} />
                </div>
                <span className="font-semibold">{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 mt-auto">
            <div className="relative p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>

              <div className="flex items-center gap-3 relative z-10 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                    {user?.fullName || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ADMIN ROLE</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800/50 transition-all duration-300 font-bold text-xs"
              >
                <i className="fas fa-sign-out-alt text-sm" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content area */}
        <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-20 px-8 flex items-center justify-between bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 relative z-20">
            <div className="flex items-center gap-4 lg:hidden">
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <i className="fas fa-bars text-lg"></i>
              </button>
              <Link to="/admin/dashboard" className="text-xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                CM Admin
              </Link>
            </div>

            {/* Search Bar - Aesthetic addition */}
            <div className="hidden md:flex items-center relative w-96 group">
              <i className="fas fa-search absolute left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
              <input
                type="text"
                placeholder="Tìm kiếm hệ thống..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl outline-none transition-all dark:text-slate-200 font-medium text-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <DarkModeToggle />
                <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700"></div>
                <NotificationBell />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-transparent">
            <div className="p-8 lg:p-10 max-w-7xl mx-auto animate-fade-in relative">
              {children}
            </div>
          </main>
        </div>
      </div>
      <ChatWidget role="ADMIN" />
    </div>
  );
}


