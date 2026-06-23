import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadApplications();
  }, [page]);

  useEffect(() => {
    filterApplications();
  }, [applications, activeTab, searchTerm]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      // Fetching with larger size to improve client-side filtering experience roughly
      // In a real app, filtering should be server-side
      const data = await api.getApplications(page, 20);
      const content = data.content || data || [];

      setApplications(content);
      setTotalPages(data.totalPages || 0);

      // Update stats based on current page (Limitation of current API)
      // Ideally these stats should come from a separate API endpoint
      setStats({
        total: data.totalElements || content.length,
        pending: content.filter(a => a.status === 'PENDING').length,
        accepted: content.filter(a => a.status === 'ACCEPTED').length,
        rejected: content.filter(a => a.status === 'REJECTED').length,
      });
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let result = [...applications];

    // Filter by Tab
    if (activeTab !== 'ALL') {
      result = result.filter(app => app.status === activeTab);
    }

    // Filter by Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(app =>
        app.job?.title?.toLowerCase().includes(lowerTerm) ||
        app.job?.company?.name?.toLowerCase().includes(lowerTerm)
      );
    }

    setFilteredApplications(result);
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: {
        label: 'Đang chờ',
        icon: 'fa-clock',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700'
      },
      ACCEPTED: {
        label: 'Được nhận',
        icon: 'fa-check-circle',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700'
      },
      REJECTED: {
        label: 'Từ chối',
        icon: 'fa-times-circle',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700'
      },
      WITHDRAWN: {
        label: 'Đã hủy',
        icon: 'fa-ban',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
      }
    };

    const config = configs[status] || {
      label: status,
      icon: 'fa-info-circle',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        <i className={`fas ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCompanyLogo = (logoUrl) => {
    return getFullUrl(logoUrl);
  };

  const tabs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Đang chờ' },
    { id: 'ACCEPTED', label: 'Được nhận' },
    { id: 'REJECTED', label: 'Từ chối' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-10">
      {/* 1. Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 pb-8 pt-6 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lịch sử ứng tuyển</h1>
          <p className="text-gray-600 dark:text-gray-400">Theo dõi trạng thái các công việc bạn đã ứng tuyển</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Tổng đơn</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-1">Đang chờ</p>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{stats.pending}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Được nhận</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">{stats.accepted}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">Từ chối</p>
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 2. Controls & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          {/* Tabs */}
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-700 shadow-sm overflow-x-auto w-full md:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Tìm theo công ty, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <i className="fas fa-search absolute left-3.5 top-3 text-gray-400"></i>
          </div>
        </div>

        {/* 3. List of Applications */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border dark:border-gray-800 shadow-sm animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredApplications.length > 0 ? (
          <div className="space-y-4">
            {filteredApplications.map((app, index) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Logo & Basic Info */}
                  <div className="flex gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2 flex-shrink-0 border dark:border-gray-700 overflow-hidden">
                      {app.job?.company?.logoUrl ? (
                        <img src={getCompanyLogo(app.job.company.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <i className="fas fa-building text-2xl text-gray-400"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link to={`/student/jobs/${app.job?.id}`} className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {app.job?.title || 'Unknown Job'}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">
                        {app.job?.company?.name || 'Công ty ẩn danh'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="far fa-clock"></i>
                          {formatDate(app.appliedAt)}
                        </span>
                        {app.job?.location && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-map-marker-alt"></i>
                            {app.job.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Action */}
                  <div className="flex flex-col items-end justify-between gap-4">
                    {getStatusBadge(app.status)}

                    <div className="flex items-center gap-2">
                      {/* Contact/Message Button */}
                      {app.job?.recruiterUserId && (
                        <Link
                          to="/student/messages"
                          state={{ recipientId: app.job.recruiterUserId }}
                          className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <i className="fas fa-comment-alt"></i>
                          Nhắn tin
                        </Link>
                      )}

                      <Link
                        to={`/student/jobs/${app.job?.id}`}
                        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Xem công việc
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Optional: Notes/Cover Letter Preview */}
                {(app.note || (app.coverLetter && app.status === 'PENDING')) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {app.note && (
                      <div className={`p-3 rounded-lg text-sm mb-2 ${app.status === 'ACCEPTED' ? 'bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300' :
                        app.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300' :
                          'bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300'
                        }`}>
                        <span className="font-bold mr-2"><i className="fas fa-comment-dots"></i> Phản hồi:</span>
                        {app.note}
                      </div>
                    )}
                    {app.coverLetter && !app.note && (
                      <p className="text-sm text-gray-500 italic truncate">
                        <i className="fas fa-quote-left mr-2 text-gray-300"></i>
                        {app.coverLetter}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-file-signature text-4xl text-gray-300"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Không tìm thấy đơn ứng tuyển nào</h3>
            <p className="text-gray-500 text-sm mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm công việc mới</p>
            <Link to="/student/jobs" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30">
              Tìm việc ngay
            </Link>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="px-4 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 border dark:border-gray-700 font-medium text-sm">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
