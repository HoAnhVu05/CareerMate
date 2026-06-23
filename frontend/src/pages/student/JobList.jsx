import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function JobList() {
  /* State Variables */
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState({
    type: [],
    level: [],
    salaryRange: [0, 50000000]
  });

  useEffect(() => {
    loadJobs();
  }, [page, searchTerm, location]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // Simulate slight delay for smooth transition if needed or call API directly
      const data = await api.searchJobs(searchTerm, location, page, 10);
      setJobs(data.content || data || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getCompanyLogo = (logoUrl) => {
    return getFullUrl(logoUrl);
  };

  const JobCard = ({ job, index }) => (
    <Link
      to={`/student/jobs/${job.id}`}
      className="group relative block bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-800 rounded-full shadow-sm">
          <i className="far fa-heart"></i>
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-white p-2 shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          {job.company?.logoUrl ? (
            <img src={getCompanyLogo(job.company.logoUrl)} alt="" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {job.company?.name?.charAt(0) || 'C'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            {job.status === 'ACTIVE' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                New
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">{job.company?.name || 'Công ty ẩn danh'}</p>

          <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
              <i className="fas fa-map-marker-alt text-blue-500"></i>
              {job.location}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-medium">
              <i className="fas fa-dollar-sign text-green-500"></i>
              {formatCurrency(job.minSalary)}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
              <i className="far fa-clock text-orange-500"></i>
              3 ngày trước
            </span>
          </div>

          <div className="flex gap-2">
            {job.requiredSkills?.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                {skill}
              </span>
            ))}
            {job.requiredSkills?.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-400">+{job.requiredSkills.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Sidebar - Filters */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="glass-card p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Bộ lọc</h3>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLocation('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="space-y-6">
                {/* Search Keyword */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Từ khóa</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Java, Design, ..."
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-sm transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Địa điểm</label>
                  <div className="relative">
                    <select
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-sm transition-all appearance-none cursor-pointer"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <option value="">Toàn quốc</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Remote">Remote</option>
                    </select>
                    <i className="fas fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                  </div>
                </div>

                {/* Categories (Mock) */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Ngành nghề</label>
                  <div className="space-y-2">
                    {['IT - Phần mềm', 'Marketing', 'Thiết kế', 'Kinh doanh'].map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Promo Card */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-fullblur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Bạn cần CV đẹp?</h3>
              <p className="text-purple-100 text-sm mb-4 relative z-10">Tạo CV chuyên nghiệp chỉ trong 3 phút với CareerMate.</p>
              <Link to="/student/cv-templates" className="inline-block px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-bold shadow-md hover:bg-gray-50 transition-colors relative z-10">
                Tạo CV ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content - Job List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Việc làm phù hợp</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Tìm thấy <span className="font-bold text-slate-800 dark:text-white">{jobs.length}</span> cơ hội việc làm</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sắp xếp:</span>
              <select className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 border-none focus:ring-0 cursor-pointer">
                <option>Mới nhất</option>
                <option>Lương cao nhất</option>
                <option>Phù hợp nhất</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                      <div className="flex gap-2 pt-2">
                        <div className="h-6 w-20 bg-gray-100 dark:bg-gray-800 rounded"></div>
                        <div className="h-6 w-24 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-search text-4xl text-blue-500"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy kết quả</h3>
              <p className="text-slate-500 mb-6">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLocation('');
                }}
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          )}

          {/* Pagination (Simplified for UI) */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${page === i
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
