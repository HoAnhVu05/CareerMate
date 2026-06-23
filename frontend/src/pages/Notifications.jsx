import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications(page, 20);
      if (page === 0) {
        setNotifications(data.content || []);
      } else {
        setNotifications(prev => [...prev, ...(data.content || [])]);
      }
      setHasMore(!data.last);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'READ' } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'READ' }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status === 'UNREAD') {
      await handleMarkAsRead(notification.id);
    }

    if (notification.linkUrl) {
      const url = notification.linkUrl;
      if (url.includes('?')) {
        const [path, search] = url.split('?');
        navigate({ pathname: path, search: `?${search}` });
      } else {
        navigate(url);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ARTICLE_APPROVED': return { icon: 'fas fa-check-circle', color: 'text-green-500 bg-green-500/10' };
      case 'ARTICLE_REJECTED': return { icon: 'fas fa-times-circle', color: 'text-red-500 bg-red-500/10' };
      case 'ARTICLE_PENDING': return { icon: 'fas fa-clock', color: 'text-yellow-500 bg-yellow-500/10' };
      case 'JOB_APPROVED': return { icon: 'fas fa-briefcase', color: 'text-green-500 bg-green-500/10' };
      case 'JOB_REJECTED': return { icon: 'fas fa-ban', color: 'text-red-500 bg-red-500/10' };
      case 'NEW_APPLICATION': return { icon: 'fas fa-user-plus', color: 'text-blue-500 bg-blue-500/10' };
      case 'APPLICATION_STATUS_CHANGED': return { icon: 'fas fa-sync-alt', color: 'text-orange-500 bg-orange-500/10' };
      case 'INTERVIEW_SCHEDULED': return { icon: 'fas fa-calendar-check', color: 'text-purple-500 bg-purple-500/10' };
      case 'NEW_COMMENT': return { icon: 'fas fa-comment-alt', color: 'text-indigo-500 bg-indigo-500/10' };
      case 'NEW_REACTION': return { icon: 'fas fa-heart', color: 'text-pink-500 bg-pink-500/10' };
      case 'JOB_RECOMMENDATION': return { icon: 'fas fa-magic', color: 'text-indigo-600 bg-indigo-600/10' };
      case 'SUBSCRIPTION_APPROVED': return { icon: 'fas fa-crown', color: 'text-yellow-500 bg-yellow-500/10' };
      case 'SUBSCRIPTION_REJECTED': return { icon: 'fas fa-file-invoice-dollar', color: 'text-red-500 bg-red-500/10' };
      case 'SUBSCRIPTION_REQUEST': return { icon: 'fas fa-shopping-cart', color: 'text-blue-500 bg-blue-500/10' };
      default: return { icon: 'fas fa-bell', color: 'text-slate-500 bg-slate-500/10' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredNotifications = filter === 'ALL'
    ? notifications
    : notifications.filter(n => n.status === 'UNREAD');

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Thông báo</h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">
              Bạn có <span className="font-bold text-blue-600 dark:text-blue-400">{unreadCount}</span> thông báo chưa đọc
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${unreadCount > 0
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                }`}
            >
              <i className="fas fa-check-double"></i> Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-white dark:bg-gray-900 p-1 rounded-xl w-fit shadow-sm border border-slate-200 dark:border-gray-800">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'ALL'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'UNREAD'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
          >
            Chưa đọc
          </button>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {loading && notifications.length === 0 ? (
            // Loading Skeletons
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 animate-pulse flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-gray-800"></div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : filteredNotifications.length === 0 ? (
            // Empty State
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-gray-800">
              <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-bell-slash text-4xl text-slate-300 dark:text-gray-600"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không có thông báo nào</h3>
              <p className="text-slate-500 dark:text-gray-400">
                {filter === 'UNREAD' ? 'Bạn đã đọc hết tất cả thông báo!' : 'Bạn chưa nhận được thông báo nào.'}
              </p>
            </div>
          ) : (
            // Notification Items
            filteredNotifications.map((notification) => {
              const { icon, color } = getNotificationIcon(notification.type);
              const isUnread = notification.status === 'UNREAD';

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative overflow-hidden bg-white dark:bg-gray-900 p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:shadow-lg ${isUnread
                      ? 'border-blue-200 dark:border-blue-900/50 shadow-md shadow-blue-500/5'
                      : 'border-slate-100 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700'
                    }`}
                >
                  {/* Unread Indicator Dot */}
                  {isUnread && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></div>
                  )}

                  <div className="flex gap-5">
                    {/* Icon Box */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${color}`}>
                      <i className={icon}></i>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-col h-full justify-between gap-2">
                        <div>
                          <h4 className={`text-base font-bold mb-1 line-clamp-2 ${isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-300'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <i className="fas fa-clock text-[10px] text-slate-400"></i>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="text-center pt-8 pb-12">
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="group px-8 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Tải thêm thông báo cũ
              <i className="fas fa-arrow-down ml-2 group-hover:translate-y-1 transition-transform"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
