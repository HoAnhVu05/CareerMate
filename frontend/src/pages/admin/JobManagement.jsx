import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';
import JobDetail from '../student/JobDetail';

export default function JobManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonAction, setReasonAction] = useState(null); // 'hide', 'delete'
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadJobs();
  }, [filterStatus, page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminJobs(filterStatus || null, page, 10);
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt tin tuyển dụng này?')) return;

    try {
      await api.approveJob(jobId);
      alert('Duyệt tin tuyển dụng thành công!');
      loadJobs();
    } catch (error) {
      console.error('Error approving job:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể duyệt tin tuyển dụng'));
    }
  };

  const handleReject = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối tin tuyển dụng này?')) return;

    try {
      await api.rejectJob(jobId);
      alert('Từ chối tin tuyển dụng thành công!');
      loadJobs();
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể từ chối tin tuyển dụng'));
    }
  };

  const handleHide = (jobId) => {
    setSelectedJobId(jobId);
    setReasonAction('hide');
    setReason('');
    setShowReasonModal(true);
  };

  const handleUnhide = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn hiện lại tin tuyển dụng này?')) return;

    try {
      await api.unhideJob(jobId);
      alert('Đã hiện lại tin tuyển dụng thành công!');
      loadJobs();
    } catch (error) {
      console.error('Error unhiding job:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể hiện lại tin tuyển dụng'));
    }
  };

  const handleDelete = (jobId) => {
    setSelectedJobId(jobId);
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
        await api.hideJob(selectedJobId, reason);
        alert('Đã ẩn tin tuyển dụng thành công!');
      } else if (reasonAction === 'delete') {
        if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN tin tuyển dụng này? Hành động này không thể hoàn tác!')) {
          setShowReasonModal(false);
          return;
        }
        await api.deleteJob(selectedJobId, reason);
        alert('Đã xóa tin tuyển dụng thành công!');
      }
      setShowReasonModal(false);
      setReason('');
      setSelectedJobId(null);
      setReasonAction(null);
      loadJobs();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể thực hiện thao tác'));
    }
  };

  const statusConfigs = {
    DRAFT: { label: 'Bản nháp', class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    PENDING: { label: 'Chờ duyệt', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    ACTIVE: { label: 'Hoạt động', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    CLOSED: { label: 'Đã đóng', class: 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300' },
    REJECTED: { label: 'Từ chối', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    HIDDEN: { label: 'Đã ẩn', class: 'bg-slate-900 text-white dark:bg-black dark:text-slate-400' }
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

  const getAvatarUrl = (avatarUrl) => {
    return getFullUrl(avatarUrl);
  };

  if (loading && page === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold tracking-wider animate-pulse uppercase">Đang quét tin tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Quản lý tin tuyển dụng</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Kiểm duyệt và điều phối các cơ hội nghề nghiệp</p>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Thị trường:</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{totalElements.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-800/50 p-6 shadow-xl flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <i className="fas fa-layer-group text-indigo-500"></i>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Trạng thái:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['', 'PENDING', 'ACTIVE', 'CLOSED', 'REJECTED', 'HIDDEN', 'DRAFT'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setPage(0); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all border ${filterStatus === status
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600'
                }`}
            >
              {status === '' ? 'TẤT CẢ' : statusConfigs[status]?.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/50 dark:border-slate-800/50">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tin tuyển dụng</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Doanh nghiệp</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Địa điểm</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {jobs.map((job, idx) => (
                <tr key={job.id} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <td className="px-8 py-5">
                    <div className="flex flex-col max-w-md">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</span>
                      <span className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">Ngày đăng: {formatDate(job.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-1 shadow-sm overflow-hidden">
                        {job.company?.logoUrl ? (
                          <img src={getAvatarUrl(job.company.logoUrl)} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <i className="fas fa-building text-slate-300 text-sm"></i>
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{job.company?.name || '---'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500">
                      <i className="fas fa-map-marker-alt text-[10px]"></i>
                      <span className="text-xs font-semibold">{job.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${statusConfigs[job.status]?.class} border border-transparent`}>
                      {statusConfigs[job.status]?.label}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setSelectedJobId(job.id); setReasonAction(null); }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye text-sm"></i>
                      </button>

                      {job.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(job.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Duyệt"
                          >
                            <i className="fas fa-check text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleReject(job.id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                            title="Từ chối"
                          >
                            <i className="fas fa-times text-sm"></i>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => job.hidden ? handleUnhide(job.id) : handleHide(job.id)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl ${job.hidden ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'} hover:bg-slate-600 hover:text-white transition-all shadow-sm`}
                        title={job.hidden ? "Hiện lại" : "Ẩn bài"}
                      >
                        <i className={`fas ${job.hidden ? 'fa-eye' : 'fa-eye-slash'} text-sm`}></i>
                      </button>

                      <button
                        onClick={() => handleDelete(job.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Xóa vĩnh viễn"
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
        {jobs.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-briefcase text-slate-300 text-3xl"></i>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Không có dữ liệu tin đăng</p>
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
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center text-orange-600 dark:text-orange-400 text-3xl mb-6 mx-auto">
              <i className={`fas ${reasonAction === 'hide' ? 'fa-eye-slash' : 'fa-trash-alt'}`}></i>
            </div>
            <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2 leading-tight">
              {reasonAction === 'hide' ? 'Ẩn tin tuyển dụng' : 'Xóa tin tuyển dụng'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center font-medium mb-8">
              {reasonAction === 'hide'
                ? 'Lưu ý: Tin tuyển dụng sẽ không còn hiển thị với ứng viên. Vui lòng cho biết lý do để gửi về nhà tuyển dụng.'
                : 'Cảnh báo: Hành động này sẽ xóa vĩnh viễn tin đăng. Vui lòng nhập lý do xóa để gửi về nhà tuyển dụng.'}
            </p>
            <textarea
              value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do cụ thể tại đây..."
              className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-orange-500/30 rounded-3xl outline-none transition-all dark:text-white font-medium mb-8 min-h-[140px] resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setShowReasonModal(false); setReason(''); setSelectedJobId(null); setReasonAction(null); }}
                className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-6 py-4 rounded-[1.5rem] text-white font-black uppercase tracking-widest text-xs transition-all shadow-lg ${reasonAction === 'delete'
                  ? 'bg-red-600 shadow-red-500/30 hover:bg-red-700'
                  : 'bg-orange-600 shadow-orange-500/30 hover:bg-orange-700'
                  }`}
              >
                Xác nhận {reasonAction === 'hide' ? 'Ẩn' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedJobId && !reasonAction && !showReasonModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fade-in" onClick={() => setSelectedJobId(null)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/20 flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur z-10 shrink-0">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <i className="fas fa-briefcase text-indigo-600"></i>
                Chi tiết tuyển dụng
              </h3>
              <button
                onClick={() => setSelectedJobId(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
              <JobDetail jobId={selectedJobId} isModal={true} onClose={() => setSelectedJobId(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

