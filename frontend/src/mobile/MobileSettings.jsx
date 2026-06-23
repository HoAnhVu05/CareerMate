import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import api from '../services/api';

export default function MobileProfile() {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) return null;

    const menuItems = [
        {
            title: 'Tài khoản',
            items: [
                { id: 'view', label: 'Xem trang cá nhân', icon: 'fa-id-card', color: 'text-indigo-500', path: user.role === 'RECRUITER' ? '/mobile/profile' : '/mobile/profile' },
                { id: 'edit', label: 'Chỉnh sửa thông tin', icon: 'fa-user-edit', color: 'text-blue-500', path: user.role === 'RECRUITER' ? '/mobile/profile/recruiter' : '/mobile/profile/edit' },
                { id: 'security', label: 'Bảo mật', icon: 'fa-shield-alt', color: 'text-emerald-500', path: '#' },
            ]
        },
        {
            title: 'Hoạt động',
            items: user.role === 'STUDENT' ? [
                { id: 'apps', label: 'Việc làm đã nộp', icon: 'fa-file-alt', color: 'text-indigo-500', path: '/mobile/applications' },
                { id: 'saved', label: 'Việc làm đã lưu', icon: 'fa-heart', color: 'text-rose-500', path: '#' },
            ] : user.role === 'RECRUITER' ? [
                { id: 'my-jobs', label: 'Tin tuyển dụng của tôi', icon: 'fa-briefcase', color: 'text-indigo-500', path: '/mobile/dashboard' },
                { id: 'applicants', label: 'Quản lý ứng viên', icon: 'fa-users', color: 'text-emerald-500', path: '/mobile/applicants' },
            ] : [
                { id: 'users', label: 'Quản lý người dùng', icon: 'fa-users-cog', color: 'text-indigo-500', path: '/mobile/users' },
            ]
        },
        {
            title: 'Cài đặt',
            items: [
                {
                    id: 'darkmode',
                    label: 'Chế độ tối',
                    icon: darkMode ? 'fa-moon' : 'fa-sun',
                    color: 'text-amber-500',
                    action: toggleDarkMode,
                    toggle: true,
                    value: darkMode
                },
                { id: 'help', label: 'Trung tâm trợ giúp', icon: 'fa-question-circle', color: 'text-slate-500', path: '#' },
            ]
        }
    ];

    return (
        <div className="pb-24 animate-fade-in">
            {/* Profile Header */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 mb-4 shadow-lg">
                        <img
                            src={api.getFileUrl(user.avatarUrl) || `https://ui-avatars.com/api/?name=${user.fullName || user.username}&background=random`}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900"
                        />
                    </div>
                    <button className="absolute bottom-4 right-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform">
                        <i className="fas fa-camera text-xs"></i>
                    </button>
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{user.fullName || user.username}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                        {user.role}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="p-4 space-y-8 mt-2">
                {menuItems.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 px-2">{section.title}</h3>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                            {section.items.map((item, itemIdx) => (
                                <button
                                    key={itemIdx}
                                    onClick={() => item.action ? item.action() : navigate(item.path)}
                                    className={`w-full flex items-center justify-between p-4 active:bg-slate-50 dark:active:bg-slate-700/50 transition-colors ${itemIdx !== section.items.length - 1 ? 'border-b border-slate-50 dark:border-slate-700/30' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center ${item.color}`}>
                                            <i className={`fas ${item.icon}`}></i>
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                                    </div>

                                    {item.toggle ? (
                                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${item.value ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${item.value ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                        </div>
                                    ) : (
                                        <i className="fas fa-chevron-right text-[10px] text-slate-300"></i>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-3xl text-rose-600 font-black text-sm active:scale-95 transition-all justify-center border border-rose-100 dark:border-rose-900/30"
                >
                    <i className="fas fa-sign-out-alt"></i> ĐĂNG XUẤT
                </button>
            </div>
        </div>
    );
}
