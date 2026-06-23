import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CompanyManagement() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');

    useEffect(() => {
        loadCompanies();
    }, [page, keyword]);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminCompanies(page, 10, keyword);
            setCompanies(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error('Error loading companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleVerify = async (companyId, currentStatus) => {
        const newStatus = !currentStatus;
        const actionText = newStatus ? 'xác thực' : 'hủy xác thực';
        if (!confirm(`Bạn có chắc chắn muốn ${actionText} công ty này?`)) return;

        try {
            await api.verifyCompany(companyId, newStatus);
            alert(`${newStatus ? 'Xác thực' : 'Hủy xác thực'} công ty thành công!`);
            loadCompanies();
        } catch (error) {
            console.error('Error verifying company:', error);
            alert('Lỗi: ' + (error.response?.data?.error || 'Không thể thay đổi trạng thái xác thực'));
        }
    };

    const handleDeleteClick = (company) => {
        setSelectedCompany(company);
        setDeleteReason('');
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteReason.trim()) {
            alert('Vui lòng nhập lý do xóa!');
            return;
        }

        if (!confirm(`Cảnh báo: Bạn có chắc chắn muốn XÓA VĨNH VIỄN công ty "${selectedCompany.name}"? Hành động này không thể hoàn tác!`)) {
            return;
        }

        try {
            await api.deleteAdminCompany(selectedCompany.id, deleteReason);
            alert('Đã xóa công ty thành công!');
            setShowDeleteModal(false);
            loadCompanies();
        } catch (error) {
            console.error('Error deleting company:', error);
            alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa công ty'));
        }
    };

    const getLogoUrl = (logoUrl) => {
        if (!logoUrl) return null;
        if (logoUrl.startsWith('http')) return logoUrl;
        return api.getFileUrl(logoUrl);
    };

    if (loading && page === 0) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-bold tracking-wider animate-pulse uppercase">Đang tải danh sách công ty...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in text-slate-900 dark:text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Quản lý doanh nghiệp</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Giám sát và quản lý các đối tác doanh nghiệp trên nền tảng</p>
                </div>
                <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tổng cộng:</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{totalElements.toLocaleString()}</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-800/50 p-6 shadow-xl flex items-center gap-4">
                <i className="fas fa-search text-slate-400 ml-2"></i>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
                    placeholder="Tìm kiếm công ty theo tên, ngành nghề..."
                    className="flex-1 bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
                />
            </div>

            {/* Companies Table */}
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-200/50 dark:border-slate-800/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Doanh nghiệp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ngành nghề</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quy mô</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                            {companies.map((company, idx) => (
                                <tr key={company.id} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-colors group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-1 shadow-sm overflow-hidden">
                                                {company.logoUrl ? (
                                                    <img src={getLogoUrl(company.logoUrl)} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <i className="fas fa-building text-slate-300 text-xl"></i>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{company.name}</span>
                                                {company.websiteUrl && (
                                                    <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors truncate max-w-[150px]">
                                                        {company.websiteUrl.replace(/^https?:\/\//, '')}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                            {company.industry || '---'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                            {company.companySize || '---'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        {company.verified ? (
                                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50 w-fit">
                                                <i className="fas fa-check-circle"></i> Đã xác thực
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800/50 w-fit">
                                                <i className="fas fa-clock"></i> Chưa xác thực
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/student/companies/${company.id}`)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                title="Xem trang công ty"
                                            >
                                                <i className="fas fa-external-link-alt text-sm"></i>
                                            </button>

                                            <button
                                                onClick={() => handleToggleVerify(company.id, company.verified)}
                                                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all shadow-sm ${company.verified
                                                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                    }`}
                                                title={company.verified ? "Hủy xác thực" : "Xác thực doanh nghiệp"}
                                            >
                                                <i className={`fas ${company.verified ? 'fa-times-circle' : 'fa-check-circle'} text-sm`}></i>
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(company)}
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
                {companies.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fas fa-building text-slate-300 text-3xl"></i>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Không tìm thấy doanh nghiệp nào</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trang {page + 1} / {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm"
                            >
                                <i className="fas fa-chevron-left text-xs"></i>
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:border-indigo-500 transition-all shadow-sm"
                            >
                                <i className="fas fa-chevron-right text-xs"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-fade-in">
                    <div className="bg-white/95 dark:bg-slate-900 border border-white/50 dark:border-slate-800 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center text-red-600 dark:text-red-400 text-3xl mb-6 mx-auto">
                            <i className="fas fa-trash-alt"></i>
                        </div>
                        <h3 className="text-2xl font-black text-center mb-2 leading-tight">Xóa doanh nghiệp</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center font-medium mb-8 uppercase tracking-widest text-[10px]">
                            Bạn đang thực hiện xóa vĩnh viễn công ty <span className="text-red-600 font-black">{selectedCompany?.name}</span>
                        </p>

                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">Lý do xóa vĩnh viễn</label>
                        <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Nhập lý do chi tiết..."
                            className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-red-500/30 rounded-3xl outline-none transition-all font-medium mb-8 min-h-[120px] resize-none"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-6 py-4 bg-red-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-red-500/30 hover:bg-red-700"
                            >
                                Xác nhận xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
