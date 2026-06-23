import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ChatWidget from '../components/ChatWidget';

export default function MobileLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/mobile/dashboard') || path.includes('/mobile/home')) setActiveTab('home');
        else if (path.includes('/mobile/jobs')) setActiveTab('jobs');
        else if (path.includes('/mobile/messages')) setActiveTab('messages');
        else if (path.includes('/mobile/profile')) setActiveTab('profile');
        else if (path.includes('/mobile/applicants')) setActiveTab('applicants');
        else if (path.includes('/mobile/articles')) setActiveTab('home'); // Articles is discovery
        else if (path.includes('/mobile/courses')) setActiveTab('home'); // Courses is discovery
    }, [location]);

    const handleNavigation = (tab, path) => {
        setActiveTab(tab);
        navigate(path);
    };

    const getNavItems = () => {
        if (!user) return [];

        const commonItems = [
            { id: 'messages', icon: 'fa-comment-dots', label: 'Chat', path: '/mobile/messages' },
            { id: 'profile', icon: 'fa-user-circle', label: 'Cá nhân', path: '/mobile/profile' }
        ];

        if (user.role === 'STUDENT') {
            return [
                { id: 'home', icon: 'fa-compass', label: 'Khám phá', path: '/mobile/dashboard' },
                { id: 'jobs', icon: 'fa-briefcase', label: 'Việc làm', path: '/mobile/jobs' },
                ...commonItems
            ];
        } else if (user.role === 'RECRUITER') {
            return [
                { id: 'home', icon: 'fa-home', label: 'Chính', path: '/mobile/dashboard' },
                { id: 'applicants', icon: 'fa-users', label: 'Ứng viên', path: '/mobile/applicants' },
                ...commonItems
            ];
        } else {
            return [
                { id: 'home', icon: 'fa-shield-alt', label: 'Admin', path: '/mobile/dashboard' },
                ...commonItems
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Dynamic Status Bar / Header */}
            <div className="sticky top-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/30">C</div>
                    <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">CareerMate</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/mobile/notifications" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 active:scale-90 transition-transform">
                        <i className="fas fa-bell text-xs"></i>
                    </Link>
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-slate-800">
                        <img src={api.getFileUrl(user?.avatarUrl) || `https://ui-avatars.com/api/?name=${user?.fullName}&background=6366f1&color=fff`} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="animate-fade-in relative z-10">
                <Outlet />
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pt-3 pb-8 px-6 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.id, item.path)}
                                className={`flex flex-col items-center gap-1.5 transition-all duration-500 relative ${isActive
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'
                                    }`}
                            >
                                <div className={`text-xl ${isActive ? 'scale-110 -translate-y-0.5' : ''} transition-all duration-300`}>
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                                {isActive && (
                                    <div className="absolute -bottom-2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <ChatWidget role={user?.role} />
        </div>
    );
}
