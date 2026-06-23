import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [filterRole, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers(filterRole || null, page, 10);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!confirm(`Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?`)) return;

    try {
      await api.updateUserStatus(userId, newStatus);
      alert('Cập nhật trạng thái thành công!');
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể cập nhật trạng thái'));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN người dùng này và toàn bộ thông tin liên quan? Hành động này không thể hoàn tác!')) return;

    try {
      await api.deleteUser(userId);
      alert('Đã xóa người dùng thành công!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa người dùng'));
    }
  };

  const statusConfigs = {
    ACTIVE: {
      label: 'Hoạt động',
      class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      dot: 'bg-emerald-500'
    },
    INACTIVE: {
      label: 'Ngoại tuyến',
      class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      dot: 'bg-slate-400'
    },
    SUSPENDED: {
      label: 'Tạm khóa',
      class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      dot: 'bg-amber-500'
    },
    DELETED: {
      label: 'Đã xóa',
      class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      dot: 'bg-red-500'
    }
  };

  const roleConfigs = {
    STUDENT: { label: 'Sinh viên', color: 'indigo' },
    RECRUITER: { label: 'Nhà tuyển dụng', color: 'blue' },
    ADMIN: { label: 'Quản trị viên', color: 'purple' },
    MENTOR: { label: 'Cố vấn', color: 'emerald' }
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

  if (loading && page === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold tracking-wider animate-pulse uppercase">Đang đồng bộ người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Quản lý người dùng</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Theo dõi và quản lý toàn bộ thành viên trên hệ thống</p>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tổng quy mô:</span>
          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{totalElements.toLocaleString()}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-800/50 p-6 shadow-xl flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-4">
          <i className="fas fa-filter text-indigo-500"></i>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Lọc nhanh:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['', 'STUDENT', 'RECRUITER', 'ADMIN', 'MENTOR'].map((role) => (
            <button
              key={role}
              onClick={() => { setFilterRole(role); setPage(0); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all border ${filterRole === role
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600'
                }`}
            >
              {role === '' ? 'TẤT CẢ' : roleConfigs[role]?.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="ml-auto hidden md:block">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="Tìm kiếm Email/Họ tên..."
              className="pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 rounded-xl outline-none transition-all text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/50 dark:border-slate-800/50">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thành viên</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ngày gia nhập</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
              {users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative group/avatar cursor-pointer">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-0 group-hover/avatar:opacity-30 transition-opacity"></div>
                        {user.avatarUrl ? (
                          <img
                            src={getFullUrl(user.avatarUrl)}
                            alt={user.fullName}
                            className="w-12 h-12 rounded-2xl object-cover relative z-10 border-2 border-white dark:border-slate-800 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative z-10 border-2 border-white dark:border-slate-800 shadow-sm">
                            <i className="fas fa-user-circle text-slate-400 text-xl"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.fullName}</span>
                        <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-${roleConfigs[user.role]?.color}-100/50 dark:bg-${roleConfigs[user.role]?.color}-900/20 text-${roleConfigs[user.role]?.color}-700 dark:text-${roleConfigs[user.role]?.color}-400 border border-${roleConfigs[user.role]?.color}-200/30`}>
                      {roleConfigs[user.role]?.label || user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfigs[user.status]?.class} border border-transparent`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusConfigs[user.status]?.dot} shadow-[0_0_6px_currentColor]`}></div>
                      <span className="text-[10px] font-black uppercase tracking-wider">{statusConfigs[user.status]?.label}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="text-[10px] font-bold uppercase tracking-widest bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-600 dark:text-slate-300"
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Khóa</option>
                        <option value="SUSPENDED">Tạm khóa</option>
                        <option value="DELETED">Xóa</option>
                      </select>
                      <button
                        onClick={() => handleDelete(user.id)}
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
        {users.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users-slash text-slate-400 text-3xl"></i>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Không tìm thấy người dùng nào</p>
          </div>
        )}

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trang {page + 1} / {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
              >
                <i className="fas fa-chevron-left text-xs"></i>
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
              >
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

