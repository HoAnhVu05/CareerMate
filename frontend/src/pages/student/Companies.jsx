import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  useEffect(() => {
    loadCompanies();
  }, [page, searchKeyword, selectedIndustry]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies(page, 12, searchKeyword);
      // Filter by industry on client side if API doesn't support it yet
      // Ideally API should support it, but for now we filter what's returned if keyword searches name
      // If we had a dedicated API endpoint for filtering, we'd use that. 
      // Assuming getCompanies uses the keyword to search.

      let results = data.content || [];
      if (selectedIndustry) {
        results = results.filter(c => c.industry === selectedIndustry);
      }

      setCompanies(results);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    { value: '', label: 'Tất cả ngành nghề' },
    { value: 'Information Technology', label: 'Công nghệ thông tin' },
    { value: 'Fintech', label: 'Tài chính / Fintech' },
    { value: 'E-commerce', label: 'Thương mại điện tử' },
    { value: 'Education', label: 'Giáo dục' },
    { value: 'Marketing', label: 'Marketing & Media' },
  ];

  const getCompanySizeLabel = (size) => {
    switch (size) {
      case 'STARTUP': return 'Startup (< 50)';
      case 'SMALL': return 'Nhỏ (50 - 100)';
      case 'MEDIUM': return 'Vừa (100 - 500)';
      case 'LARGE': return 'Lớn (500 - 1000)';
      case 'ENTERPRISE': return 'Tập đoàn (> 1000)';
      default: return size;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 pt-8 pb-12 px-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Khám phá Công ty hàng đầu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
            Tìm hiểu văn hóa, môi trường làm việc và cơ hội nghề nghiệp tại các doanh nghiệp công nghệ uy tín.
          </p>

          {/* Search & Filter Bar */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 border border-blue-100 dark:border-gray-700">
            <div className="flex-1 relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Tìm kiếm công ty..."
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="h-px md:h-12 w-full md:w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1 relative">
              <i className="fas fa-briefcase absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <select
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-300 cursor-pointer appearance-none"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                {industries.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
            </div>
            <button
              onClick={() => setPage(0)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-2xl animate-pulse shadow-sm border border-gray-100 dark:border-gray-800"></div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
              <i className="fas fa-building text-3xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Không tìm thấy công ty nào</h2>
            <p className="text-gray-500 mt-2">Hãy thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {companies.map((company, idx) => (
              <div
                key={company.id}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fas fa-arrow-right text-gray-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
                </div>

                {/* Header: Logo & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 flex items-center justify-center shadow-sm">
                    {company.logoUrl ? (
                      <img
                        src={getFullUrl(company.logoUrl)}
                        alt={company.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <i className="fas fa-building text-2xl text-gray-300"></i>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                      <i className="fas fa-map-marker-alt text-xs"></i>
                      {company.headquarters || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                {/* Size & Industry Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {company.industry && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-800">
                      {company.industry}
                    </span>
                  )}
                  {company.companySize && (
                    <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-100 dark:border-purple-800">
                      {getCompanySizeLabel(company.companySize)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                  {company.description || 'Chưa có mô tả về công ty này.'}
                </p>

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{company.averageRating ? company.averageRating.toFixed(1) : '0.0'}</span>
                    <span className="text-xs text-gray-400">({company.ratingsCount || 0})</span>
                  </div>
                  <Link
                    to={`/student/companies/${company.id}`}
                    className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
