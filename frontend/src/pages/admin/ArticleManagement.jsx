import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';
import ArticleDetail from '../student/ArticleDetail';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-500">
          <h3 className="font-bold text-lg mb-2">Đã xảy ra lỗi khi tải bài viết</h3>
          <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-4 rounded text-left overflow-auto max-h-40 text-slate-700 dark:text-slate-300">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ArticleManagement() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonAction, setReasonAction] = useState(null); // 'hide', 'delete'
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadArticles();
  }, [filterStatus, page]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = filterStatus === 'PENDING'
        ? await api.getPendingArticles(page)
        : await api.getAllArticles(filterStatus, page);
      setArticles(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) return;

    try {
      await api.approveArticle(articleId);
      alert('Bài viết đã được duyệt thành công!');
      loadArticles();
    } catch (error) {
      console.error('Error approving article:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể duyệt bài viết'));
    }
  };

  const handleReject = async (articleId) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối bài viết này?')) return;

    try {
      await api.rejectArticle(articleId);
      alert('Bài viết đã bị từ chối!');
      loadArticles();
    } catch (error) {
      console.error('Error rejecting article:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể từ chối bài viết'));
    }
  };

  const handleHide = (articleId) => {
    setSelectedArticleId(articleId);
    setReasonAction('hide');
    setReason('');
    setShowReasonModal(true);
  };

  const handleUnhide = async (articleId) => {
    if (!confirm('Bạn có chắc chắn muốn hiện lại bài viết này?')) return;

    try {
      await api.unhideArticle(articleId);
      alert('Đã hiện lại bài viết thành công!');
      loadArticles();
    } catch (error) {
      console.error('Error unhiding article:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể hiện lại bài viết'));
    }
  };

  const handleDelete = (articleId) => {
    setSelectedArticleId(articleId);
    setReasonAction('delete');
    setReason('');
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do!');
      return;
    }

    try {
      if (reasonAction === 'hide') {
        await api.hideArticle(selectedArticleId, reason);
        alert('Đã ẩn bài viết thành công!');
      } else if (reasonAction === 'delete') {
        if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết này? Hành động này không thể hoàn tác!')) {
          setShowReasonModal(false);
          return;
        }
        await api.deleteArticle(selectedArticleId, reason);
        alert('Đã xóa bài viết thành công!');
      }
      setShowReasonModal(false);
      setReason('');
      setSelectedArticleId(null);
      setReasonAction(null);
      loadArticles();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể thực hiện thao tác'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusConfigs = {
    PENDING: { label: 'Chờ duyệt', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    PUBLISHED: { label: 'Đã đăng', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    REJECTED: { label: 'Từ chối', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    HIDDEN: { label: 'Đã ẩn', class: 'bg-slate-900 text-white dark:bg-black dark:text-slate-400' },
    DRAFT: { label: 'Nháp', class: 'bg-slate-100 text-slate-600 dark:bg-slate-800' }
  };

  if (loading && page === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold tracking-wider animate-pulse uppercase">Đang tải tài liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Quản lý bài viết</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Biên tập và kiểm soát nội dung cộng động</p>
        </div>
        <button
          onClick={() => navigate('/admin/articles/create')}
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95"
        >
          <i className="fas fa-plus-circle text-lg group-hover:rotate-90 transition-transform duration-500"></i>
          <span>Đăng bài mới</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-800/50 p-6 shadow-xl flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <i className="fas fa-newspaper text-indigo-500"></i>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Trình trạng:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN', 'DRAFT', ''].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(0); }}
              className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all border ${filterStatus === status
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl'
                : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600'
                }`}
            >
              {status === '' ? 'TẤT CẢ' : statusConfigs[status]?.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/50 dark:border-slate-800/50">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nội dung bài viết</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tác giả</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thời gian</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {articles.map((article, idx) => (
                <tr key={article.id} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-500">
                        {article.thumbnailUrl ? (
                          <img
                            src={getFullUrl(article.thumbnailUrl)}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="fas fa-image text-slate-300 text-2xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">{article.title}</span>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{article.excerpt || 'Không có mô tả ngắn cho bài viết này.'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{article.author?.fullName || 'Hệ thống'}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{article.author?.role || 'ADMIN'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${statusConfigs[article.status]?.class} border border-transparent`}>
                      {statusConfigs[article.status]?.label}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {formatDate(article.createdAt)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedArticleId(article.id); setReasonAction(null); }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="Xem nội dung chi tiết"
                      >
                        <i className="fas fa-eye text-sm"></i>
                      </button>

                      {article.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(article.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Duyệt đăng"
                          >
                            <i className="fas fa-check text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleReject(article.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            title="Từ chối"
                          >
                            <i className="fas fa-times text-sm"></i>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => article.hidden ? handleUnhide(article.id) : handleHide(article.id)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl ${article.hidden ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'} hover:bg-slate-600 hover:text-white transition-all shadow-sm`}
                        title={article.hidden ? "Hiện lại" : "Ẩn bài"}
                      >
                        <i className={`fas ${article.hidden ? 'fa-eye' : 'fa-eye-slash'} text-sm`}></i>
                      </button>

                      <button
                        onClick={() => handleDelete(article.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Xóa bài viết"
                      >
                        <i className="fas fa-trash-alt text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-newspaper text-slate-300 text-3xl"></i>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Không tìm thấy bài viết nào</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trang {page + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm">
                <i className="fas fa-chevron-left text-xs"></i>
              </button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm">
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fade-in">
          <div className="bg-white/90 dark:bg-slate-900 border border-white/50 dark:border-slate-800 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl mb-6 mx-auto">
              <i className={`fas ${reasonAction === 'hide' ? 'fa-eye-slash' : 'fa-trash-alt'}`}></i>
            </div>
            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2 leading-tight">
              {reasonAction === 'hide' ? 'Ẩn nội dung bài viết' : 'Gỡ bỏ bài viết hệ thống'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center font-medium mb-8">
              {reasonAction === 'hide'
                ? 'Nội dung sẽ không còn xuất hiện trên bảng tin. Vui lòng cho biết lý do để thông báo tới tác giả.'
                : 'Cảnh báo: Hành động này sẽ gỡ bài viết vĩnh viễn khỏi hệ thống dư liệu cộng đồng.'}
            </p>
            <textarea
              value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500/30 rounded-3xl outline-none transition-all dark:text-white font-medium mb-8 min-h-[140px] resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setShowReasonModal(false); setReason(''); setSelectedArticleId(null); setReasonAction(null); }}
                className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                Hủy lệnh
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-6 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Xác nhận {reasonAction === 'hide' ? 'Ẩn' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedArticleId && !reasonAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fade-in" onClick={() => setSelectedArticleId(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/20 flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur z-10 shrink-0">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <i className="fas fa-newspaper text-indigo-600"></i>
                Chi tiết bài viết
              </h3>
              <button
                onClick={() => setSelectedArticleId(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
              <ArticleDetail articleId={selectedArticleId} isModal={true} onClose={() => setSelectedArticleId(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

