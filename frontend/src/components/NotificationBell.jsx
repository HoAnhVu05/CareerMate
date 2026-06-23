import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await api.getUnreadNotificationCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 group"
      title="Thông báo"
    >
      <i className="fas fa-bell text-xl transform group-hover:rotate-12 transition-transform duration-300"></i>
      {!loading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-[10px] font-black text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-900 shadow-md animate-bounce-short">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
