import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function RecruiterCompany() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    address: '',
    city: '',
    country: 'Việt Nam',
    description: '',
    companySize: '',
    industry: '',
    foundedYear: '',
  });

  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      const company = await api.getMyCompany();
      if (company) {
        // Parse headquarters
        const headquarters = company.headquarters || '';
        let address = headquarters;
        let city = '';
        let country = 'Việt Nam';

        if (headquarters.includes(',')) {
          const parts = headquarters.split(',').map(s => s.trim());
          address = parts[0] || '';
          city = parts[1] || '';
          country = parts[2] || 'Việt Nam';
        }

        setFormData({
          name: company.name || '',
          websiteUrl: company.websiteUrl || '',
          address,
          city,
          country,
          description: company.description || '',
          companySize: company.companySize || '',
          industry: company.industry || '',
          foundedYear: company.foundedYear || '',
        });

        // Load ratings
        if (company.id) {
          try {
            const [avgData, ratingsData] = await Promise.all([
              api.getCompanyAverageRating(company.id),
              api.getCompanyRatings(company.id)
            ]);

            const count = Array.isArray(ratingsData) ? ratingsData.length : (ratingsData.content?.length || 0);
            setRatingStats({
              average: avgData.averageRating || 0,
              count: count
            });
          } catch (err) {
            console.error('Error loading ratings:', err);
          }
        }
      }
      // 404 is expected when recruiter doesn't have a company yet - no need to log
    } catch (error) {
      // Only log non-404 errors
      if (error.response?.status !== 404) {
        console.error('Error loading company info:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const headquarters = [formData.address, formData.city, formData.country]
        .filter(Boolean)
        .join(', ');

      const companyData = {
        name: formData.name,
        websiteUrl: formData.websiteUrl,
        headquarters: headquarters || formData.address,
        description: formData.description,
        companySize: formData.companySize,
        industry: formData.industry,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        logoUrl: null, // TODO: Handle logo upload
      };

      await api.createOrUpdateCompany(companyData);
      alert('Đã lưu thông tin công ty thành công!');
      setTimeout(() => {
        navigate('/recruiter/post-job');
      }, 1000);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu thông tin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          Thông tin công ty
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cập nhật thông tin để thu hút ứng viên tiềm năng
        </p>
      </div>

      {/* Rating Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-inner min-w-[100px]">
              <span className="text-4xl font-bold">
                {ratingStats.average.toFixed(1)}
              </span>
              <div className="flex text-yellow-400 text-xs mt-1 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < Math.round(ratingStats.average) ? '' : 'text-white/30'}`}></i>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">
                Company Reputation
              </h3>
              <p className="text-indigo-100">
                Công ty của bạn hiện có <strong className="text-white text-lg mx-1">{ratingStats.count}</strong> lượt đánh giá.
              </p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/10">
              <i className="fas fa-info-circle"></i>
              <span>Điểm đánh giá giúp tăng độ tin cậy</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-white/5 p-8 space-y-8">

        {/* Basic Info Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <i className="fas fa-info"></i>
            </span>
            Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên công ty <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="Nhập tên công ty"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
              <input
                type="url"
                name="websiteUrl"
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                value={formData.websiteUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <i className="fas fa-map-marker-alt"></i>
            </span>
            Địa điểm
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                placeholder="Số nhà, đường, phường/xã..."
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thành phố</label>
                <input
                  type="text"
                  name="city"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  placeholder="TP. Hồ Chí Minh"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quốc gia</label>
                <input
                  type="text"
                  name="country"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <i className="fas fa-building"></i>
            </span>
            Chi tiết công ty
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả công ty <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                rows="6"
                required
                placeholder="Giới thiệu về công ty, lĩnh vực hoạt động, văn hóa công ty..."
                className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quy mô nhân sự</label>
                <select
                  name="companySize"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                  value={formData.companySize}
                  onChange={handleChange}
                >
                  <option value="">Chọn quy mô</option>
                  <option value="1-10">1-10 nhân viên</option>
                  <option value="11-50">11-50 nhân viên</option>
                  <option value="51-200">51-200 nhân viên</option>
                  <option value="201-500">201-500 nhân viên</option>
                  <option value="501-1000">501-1000 nhân viên</option>
                  <option value="1000+">Trên 1000 nhân viên</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lĩnh vực</label>
                <input
                  type="text"
                  name="industry"
                  placeholder="VD: IT, Marketing..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Năm thành lập</label>
                <input
                  type="number"
                  name="foundedYear"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={formData.foundedYear}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transform transition hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i> Đang lưu...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-save"></i> Lưu thông tin
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-8 py-3.5 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
