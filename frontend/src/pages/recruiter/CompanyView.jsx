import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getFullUrl } from '../../utils/apiUtils';

export default function CompanyView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });

  useEffect(() => {
    loadCompany();

    // Listen for company updates
    const handleCompanyUpdate = () => {
      loadCompany();
    };
    window.addEventListener('companyUpdated', handleCompanyUpdate);

    return () => {
      window.removeEventListener('companyUpdated', handleCompanyUpdate);
    };
  }, [location.pathname, location.state?.refresh]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await api.getMyCompany();
      if (data) {
        setCompany(data);

        // Load ratings
        try {
          const [avgData, ratingsData] = await Promise.all([
            api.getCompanyAverageRating(data.id),
            api.getCompanyRatings(data.id)
          ]);

          const count = Array.isArray(ratingsData) ? ratingsData.length : (ratingsData.content?.length || 0);
          setRatingStats({
            average: avgData.averageRating || 0,
            count: count
          });
        } catch (err) {
          console.error('Error loading ratings:', err);
        }

      } else {
        // No company yet, redirect to edit to create one
        navigate('/recruiter/company/edit', { replace: true });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No company yet, redirect to edit to create one
        navigate('/recruiter/company/edit', { replace: true });
      } else {
        console.error('Error loading company:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = () => {
    return getFullUrl(company?.logoUrl);
  };

  const parseHeadquarters = () => {
    if (!company?.headquarters) return { address: '', city: '', country: '' };
    const parts = company.headquarters.split(',').map(s => s.trim());
    return {
      address: parts[0] || '',
      city: parts[1] || '',
      country: parts[2] || 'Việt Nam'
    };
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <i className="fas fa-building text-yellow-600 dark:text-yellow-400 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">Chưa có thông tin công ty</h2>
          <p className="text-yellow-700 dark:text-yellow-200 mb-4">Vui lòng tạo thông tin công ty để bắt đầu đăng tin tuyển dụng.</p>
          <button
            onClick={() => navigate('/recruiter/company/edit')}
            className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            <i className="fas fa-plus mr-2"></i>
            Tạo thông tin công ty
          </button>
        </div>
      </div>
    );
  }

  const headquarters = parseHeadquarters();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate('/recruiter/dashboard')}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 transition-colors font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/recruiter/company/edit')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <i className="fas fa-edit"></i>
          Chỉnh sửa thông tin
        </button>
      </div>

      {/* Company Card */}
      <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-white/5">
        {/* Banner/Header Section */}
        <div className="relative h-48 bg-gradient-to-r from-emerald-600 to-teal-600 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="px-8 pb-8 relative">
          {/* Logo & Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 -mt-16 items-start">
            <div className="relative">
              {getLogoUrl() ? (
                <img
                  src={getLogoUrl()}
                  alt="Company Logo"
                  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl object-contain bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                  <i className="fas fa-building text-emerald-600 dark:text-emerald-400 text-5xl"></i>
                </div>
              )}
              {/* Rating Badge Overlay */}
              <div className="absolute -bottom-3 -right-3 bg-white dark:bg-gray-800 text-yellow-500 px-3 py-1 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-1">
                <span className="font-bold text-gray-900 dark:text-white">{ratingStats.average > 0 ? ratingStats.average.toFixed(1) : 'N/A'}</span>
                <i className="fas fa-star text-sm"></i>
              </div>
            </div>

            <div className="flex-1 pt-4 md:pt-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {company.name}
                  </h1>
                  <div className="flex flex-wrap gap-3">
                    {company.industry && (
                      <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-100 dark:border-blue-800">
                        <i className="fas fa-industry mr-1.5 opacity-70"></i>
                        {company.industry}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium border border-purple-100 dark:border-purple-800">
                      <i className="fas fa-star mr-1.5 opacity-70"></i>
                      {ratingStats.count} đánh giá
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white/50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <i className="fas fa-file-alt"></i>
                  </span>
                  Giới thiệu chung
                </h3>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-justify">
                  {company.description || 'Chưa có mô tả.'}
                </div>
              </div>
            </div>

            {/* Right Column: Key Info */}
            <div className="space-y-6">
              <div className="bg-white/50 dark:bg-gray-900/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <i className="fas fa-info-circle"></i>
                  </span>
                  Thông tin liên hệ
                </h3>

                <ul className="space-y-5">
                  {company.websiteUrl && (
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                        <i className="fas fa-globe text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Website</p>
                        <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium break-all">
                          {company.websiteUrl.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </li>
                  )}

                  {headquarters.address && (
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                        <i className="fas fa-map-marker-alt text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Trụ sở chính</p>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                          {headquarters.address}
                          {headquarters.city && `, ${headquarters.city}`}
                          {headquarters.country && `, ${headquarters.country}`}
                        </p>
                      </div>
                    </li>
                  )}

                  {company.companySize && (
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                        <i className="fas fa-users text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Quy mô</p>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{company.companySize}</p>
                      </div>
                    </li>
                  )}

                  {company.foundedYear && (
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                        <i className="fas fa-history text-sm"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Thành lập</p>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{company.foundedYear}</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
