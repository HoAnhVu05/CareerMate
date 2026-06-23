import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';

export default function MyArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'admin'

  useEffect(() => {
    const scrollPosition = window.scrollY;
    loadArticles().then(() => {
      // Restore scroll position after loading
      window.scrollTo(0, scrollPosition);
    });
  }, [page, filter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      let data;

      if (filter === 'my') {
        // Lấy bài viết của tôi
        data = await api.getMyArticles(page, 10);
        setArticles(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        // Lấy tất cả bài viết (cho filter 'all' và 'admin')
        data = await api.getArticles('', '', page, 20); // Lấy nhiều hơn để có đủ dữ liệu filter

        if (filter === 'admin') {
          // Filter chỉ bài viết của admin
          const adminArticles = (data.content || []).filter(
            article => article.author && article.author.role === 'ADMIN'
          );
          setArticles(adminArticles);

          // Để tính pagination chính xác, cần lấy tổng số admin articles
          // Tạm thời dùng ước lượng dựa trên số lượng hiện tại
          setTotalElements(adminArticles.length * data.totalPages); // Ước lượng
          setTotalPages(Math.ceil((adminArticles.length * data.totalPages) / 10));
        } else {
          // Filter 'all' - hiển thị tất cả
          setArticles(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        }
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0); // Reset về trang đầu khi đổi filter
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { label: 'Bản nháp', class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300' },
      PENDING: { label: 'Chờ duyệt', class: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-300' },
      PUBLISHED: { label: 'Đã xuất bản', class: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' },
      REJECTED: { label: 'Đã từ chối', class: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-300' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300' };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-slate-600 dark:text-gray-300 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Quản lý bài viết
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chia sẻ kiến thức, kinh nghiệm và kết nối với cộng đồng
          </p>
        </div>
        <button
          onClick={() => navigate('/recruiter/articles/create')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          <span>Viết bài mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Card */}
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/5 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                <i className="fas fa-newspaper"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng bài viết</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalElements}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-2/3 rounded-full"></div>
            </div>
          </div>

          {/* Filter Menu */}
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/5 p-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Bộ lọc</h3>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'Tất cả bài viết', icon: 'fa-globe' },
                { id: 'my', label: 'Bài viết của tôi', icon: 'fa-user-edit' },
                { id: 'admin', label: 'Bài viết từ Admin', icon: 'fa-shield-alt' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleFilterChange(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-3 ${filter === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center`}></i>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Articles Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse h-64"></div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white/40 dark:bg-gray-800/20 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <i className="fas fa-pencil-alt text-3xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                {filter === 'my'
                  ? 'Bạn chưa đăng bài viết nào. Hãy chia sẻ kiến thức ngay!'
                  : 'Không tìm thấy bài viết nào phù hợp với bộ lọc.'}
              </p>
              {filter === 'my' && (
                <button
                  onClick={() => navigate('/recruiter/articles/create')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Tạo bài viết đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {articles.map((article, index) => (
                <div
                  key={article.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 relative overflow-hidden element-hover-scale"
                >
                  {/* Hover Gradient Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-2xl transition-all pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {getStatusBadge(article.status)}
                        {article.category && (
                          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {article.category.replace('_', ' ')}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <i className="far fa-clock"></i>
                          {formatDate(article.createdAt)}
                        </span>
                      </div>

                      <h2
                        onClick={() => navigate(`/recruiter/articles/${article.id}`)}
                        className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer"
                      >
                        {article.title}
                      </h2>

                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {article.excerpt || 'Không có mô tả ngắn...'}
                      </p>

                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1.5" title="Lượt xem">
                            <i className="far fa-eye"></i>
                            {article.viewsCount || 0}
                          </span>
                          <span className="flex items-center gap-1.5" title="Bình luận">
                            <i className="far fa-comment"></i>
                            {article.commentsCount || 0}
                          </span>
                          {article.author && (
                            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-700">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                {article.author.role === 'ADMIN' ? 'A' : 'R'}
                              </div>
                              <span className="text-xs truncate max-w-[100px]">{article.author.fullName || 'Người dùng'}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {article.status === 'PUBLISHED' && (
                            <button
                              onClick={() => {
                                const element = document.getElementById(`article-${article.id}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition"
                              title="Xem bình luận nhanh"
                            >
                              <i className="far fa-comments"></i>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline Comments */}
                      {article.status === 'PUBLISHED' && (
                        <div id={`article-${article.id}`} className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 transition-all">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Bình luận mới nhất</p>
                          <ArticleCard
                            article={article}
                            onUpdate={async () => {
                              // Keep update logic light
                            }}
                            showFullComments={false}
                            compact={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="px-4 font-medium text-gray-700 dark:text-gray-300">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
