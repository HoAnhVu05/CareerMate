import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function CompanyEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [logoPreview, setLogoPreview] = useState(null);
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
    logoUrl: '',
  });

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      setMessage('');
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
          foundedYear: company.foundedYear ? String(company.foundedYear) : '',
          logoUrl: company.logoUrl || '',
        });

        if (company.logoUrl) {
          setLogoPreview(getLogoUrl(company.logoUrl));
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading company info:', error);
        setMessage('Lỗi: ' + (error.response?.data?.message || 'Không thể tải thông tin'));
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (logoUrl) => {
    return getFullUrl(logoUrl);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Lỗi: Chỉ chấp nhận file ảnh');
      setMessageType('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Lỗi: Kích thước file không được vượt quá 5MB');
      setMessageType('error');
      return;
    }

    try {
      setUploadingLogo(true);
      setMessage('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload logo
      const response = await api.uploadCompanyLogo(file);
      if (response && response.logoUrl) {
        setFormData(prev => ({ ...prev, logoUrl: response.logoUrl }));
        setLogoPreview(getLogoUrl(response.logoUrl));
        setMessage('Cập nhật logo thành công!');
        setMessageType('success');

        // Trigger company reload
        window.dispatchEvent(new CustomEvent('companyUpdated'));

        setTimeout(() => {
          loadCompanyInfo();
        }, 500);
      } else {
        setMessage('Cập nhật logo thành công!');
        setMessageType('success');
        window.dispatchEvent(new CustomEvent('companyUpdated'));
        setTimeout(() => {
          loadCompanyInfo();
        }, 500);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể tải logo lên'));
      setMessageType('error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');

      const headquarters = [formData.address, formData.city, formData.country]
        .filter(Boolean)
        .join(', ');

      const companyData = {
        name: formData.name,
        websiteUrl: formData.websiteUrl || null,
        headquarters: headquarters || formData.address || null,
        description: formData.description || null,
        companySize: formData.companySize || null,
        industry: formData.industry || null,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        logoUrl: formData.logoUrl || null,
      };

      await api.createOrUpdateCompany(companyData);
      setMessage('Cập nhật thông tin công ty thành công!');
      setMessageType('success');

      // Trigger company reload
      window.dispatchEvent(new CustomEvent('companyUpdated'));

      setTimeout(() => {
        setMessage('');
        // Navigate to view page
        navigate('/recruiter/company/view', {
          replace: true,
          state: { refresh: Date.now() }
        });
      }, 1500);
    } catch (error) {
      console.error('Error updating company:', error);
      setMessage('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu thông tin'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/recruiter/company/view')}
          className="mb-6 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 transition-colors font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg w-fit"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Hồ sơ công ty
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Cập nhật thông tin chi tiết để thu hút ứng viên</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm animation-slide-down ${messageType === 'success' || (message && !message.includes('Lỗi'))
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
          <i className={`fas ${messageType === 'success' || !message.includes('Lỗi') ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
          <span className="font-medium">{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Upload */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <i className="fas fa-image"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Logo thương hiệu</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>

              <div className="relative w-40 h-40 rounded-full border-4 border-white dark:border-gray-700 shadow-2xl overflow-hidden bg-white flex items-center justify-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <i className="fas fa-building text-gray-300 text-5xl"></i>
                )}

                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 border-2 border-white dark:border-gray-800"
                title="Tải ảnh lên"
              >
                <i className="fas fa-camera text-sm"></i>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Hình ảnh đại diện</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed max-w-md">
                Tải lên logo chính thức của công ty. Hình ảnh nên có tỉ lệ vuông, nền trong suốt hoặc trắng để hiển thị tốt nhất.
                <br />Định dạng: JPG, PNG. Tối đa 5MB.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="px-5 py-2.5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium shadow-sm"
              >
                <i className="fas fa-upload mr-2"></i>
                {uploadingLogo ? 'Đang tải...' : 'Chọn từ máy tính'}
              </button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <i className="fas fa-building"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tên đầy đủ của công ty"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                name="websiteUrl"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Quốc gia
              </label>
              <input
                type="text"
                name="country"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Địa chỉ trụ sở chính <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                required
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Thành phố
              </label>
              <input
                type="text"
                name="city"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                value={formData.city}
                onChange={handleChange}
                placeholder="VD: Hà Nội"
              />
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <i className="fas fa-info-circle"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chi tiết hoạt động</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Quy mô nhân sự
              </label>
              <div className="relative">
                <select
                  name="companySize"
                  className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer font-medium"
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
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Lĩnh vực hoạt động
              </label>
              <input
                type="text"
                name="industry"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                value={formData.industry}
                onChange={handleChange}
                placeholder="VD: IT - Phần mềm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Năm thành lập
              </label>
              <input
                type="number"
                name="foundedYear"
                min="1900"
                max="2024"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                value={formData.foundedYear}
                onChange={handleChange}
                placeholder="2020"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Giới thiệu về công ty <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows="8"
              required
              className="w-full px-5 py-4 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none font-medium leading-relaxed"
              value={formData.description}
              onChange={handleChange}
              placeholder="Giới thiệu về công ty, lịch sử phát triển, văn hóa công ty..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transform transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Lưu thay đổi
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/company/view')}
            className="px-10 py-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
