import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    position: '',
    department: '',
    phone: '',
    bio: '',
    fullName: '',
  });
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await api.getRecruiterProfile();
      if (profileData) {
        setProfile({
          position: profileData.position || '',
          department: profileData.department || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          fullName: profileData.user?.fullName || user?.fullName || '',
        });

        // Set avatar from user info in response
        if (profileData.user?.avatarUrl) {
          setAvatarPreview(getAvatarUrl(profileData.user.avatarUrl));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't show error message, silently fail
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage('');

      // Load profile
      await loadProfile();

      // Load company
      try {
        const companyData = await api.getMyCompany();
        setCompany(companyData);
      } catch (error) {
        // Company might not exist yet
        setCompany(null);
      }

      // Load stats
      try {
        const statsData = await api.getRecruiterDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      }

      // Set avatar preview from user
      if (user?.avatarUrl) {
        setAvatarPreview(getAvatarUrl(user.avatarUrl));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Lỗi: ' + (error.response?.data?.error || error.message || 'Không thể tải thông tin hồ sơ'));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (avatarUrl) => {
    return getFullUrl(avatarUrl);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Chỉ chấp nhận file ảnh');
      setMessageType('error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Kích thước file không được vượt quá 5MB');
      setMessageType('error');
      return;
    }

    setUploadingAvatar(true);
    setMessage('');

    try {
      const result = await api.uploadRecruiterAvatar(file);
      if (result.avatarUrl) {
        setAvatarPreview(getAvatarUrl(result.avatarUrl));
        setMessage('Cập nhật ảnh đại diện thành công!');
        setMessageType('success');

        // Update AuthContext to reflect new avatar across all components
        updateUser({ avatarUrl: result.avatarUrl });

        // Reload profile to get updated avatar from database
        await loadProfile();
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể tải ảnh lên'));
      setMessageType('error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      await api.updateRecruiterProfile({
        position: profile.position,
        department: profile.department,
        phone: profile.phone,
        bio: profile.bio
      });

      if (profile.fullName && profile.fullName !== user?.fullName) {
        await api.updateUserFullName(profile.fullName);
        if (user) {
          const updatedUser = { ...user, fullName: profile.fullName };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        }
      }

      setMessage('Cập nhật hồ sơ thành công!');
      setMessageType('success');
      setIsEditing(false);
      await loadData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể cập nhật hồ sơ'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-fade-in">
      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm animation-slide-down ${messageType === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
          <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
          <span className="font-medium">{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Card */}
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-white/5">
            {/* Cover Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              {/* Decorative Shapes */}
              <div className="absolute -bottom-24 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-8 relative -mt-20">
                {/* Avatar Section */}
                <div className="flex flex-col items-center md:items-start">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-white dark:bg-gray-800 relative z-10">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full ${avatarPreview ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-5xl font-bold`}
                      >
                        {user?.fullName?.charAt(0)?.toUpperCase() || 'R'}
                      </div>
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center border border-gray-100 dark:border-gray-600 z-20 group/btn"
                      title="Thay đổi ảnh đại diện"
                    >
                      {uploadingAvatar ? (
                        <i className="fas fa-spinner fa-spin text-sm"></i>
                      ) : (
                        <i className="fas fa-camera text-sm group-hover/btn:scale-110 transition-transform"></i>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Header Info */}
                <div className="flex-1 pt-2 md:pt-24 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {user?.fullName || 'Nhà tuyển dụng'}
                      </h2>
                      <a href={`mailto:${user?.email}`} className="text-gray-500 dark:text-gray-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2 mt-1">
                        <i className="far fa-envelope"></i> {user?.email}
                      </a>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm font-medium flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-edit"></i>
                        <span>Chỉnh sửa hồ sơ</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 group-hover:text-blue-500 transition-colors">Họ và tên</label>
                        <p className="text-gray-900 dark:text-white font-medium text-lg border-b border-gray-100 dark:border-gray-800 pb-2">
                          {profile.fullName || user?.fullName || 'Chưa cập nhật'}
                        </p>
                      </div>
                      <div className="group">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 group-hover:text-blue-500 transition-colors">Số điện thoại</label>
                        <p className="text-gray-900 dark:text-white font-medium text-lg border-b border-gray-100 dark:border-gray-800 pb-2">
                          {profile.phone ? (
                            <span className="flex items-center gap-2">
                              <i className="fas fa-phone-alt text-gray-400 text-sm"></i>
                              {profile.phone}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Chưa cập nhật</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 group-hover:text-blue-500 transition-colors">Chức vụ</label>
                        <p className="text-gray-900 dark:text-white font-medium text-lg border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                          <i className="fas fa-id-badge text-gray-400 text-sm"></i>
                          {profile.position || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                        </p>
                      </div>
                      <div className="group">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 group-hover:text-blue-500 transition-colors">Phòng ban</label>
                        <p className="text-gray-900 dark:text-white font-medium text-lg border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center gap-2">
                          <i className="fas fa-building text-gray-400 text-sm"></i>
                          {profile.department || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                        </p>
                      </div>
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3 group-hover:text-blue-500 transition-colors">Giới thiệu</label>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line border border-gray-100 dark:border-gray-800 min-h-[100px]">
                        {profile.bio || <span className="text-gray-400 italic">Chưa có thông tin giới thiệu.</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <i className="far fa-user"></i>
                          </span>
                          <input
                            type="text"
                            name="fullName"
                            value={profile.fullName}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white"
                            placeholder="Nhập họ và tên của bạn"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Chức vụ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <i className="fas fa-id-badge"></i>
                          </span>
                          <input
                            type="text"
                            name="position"
                            value={profile.position}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white"
                            placeholder="VD: HR Manager"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Phòng ban
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <i className="far fa-building"></i>
                          </span>
                          <input
                            type="text"
                            name="department"
                            value={profile.department}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white"
                            placeholder="VD: Phòng Hành chính Nhân sự"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <i className="fas fa-phone"></i>
                          </span>
                          <input
                            type="tel"
                            name="phone"
                            value={profile.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white"
                            placeholder="Nhập số điện thoại liên hệ"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Giới thiệu
                        </label>
                        <textarea
                          name="bio"
                          value={profile.bio}
                          onChange={handleInputChange}
                          rows={6}
                          className="w-full px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white resize-none"
                          placeholder="Giới thiệu ngắn gọn về bản thân và kinh nghiệm..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition font-medium"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
                      >
                        {saving ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check"></i>
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Company & Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Company Card */}
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-white/5 flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900/50">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <i className="fas fa-building"></i>
                </span>
                Thông tin công ty
              </h3>
            </div>
            <div className="p-6">
              {company ? (
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>

                    {company.logoUrl ? (
                      <img
                        src={getAvatarUrl(company.logoUrl)}
                        alt={company.name}
                        className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-700 shadow-xl object-contain bg-white relative z-10"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-700 shadow-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-4xl relative z-10">
                        <i className="fas fa-building"></i>
                      </div>
                    )}
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{company.name}</h4>
                  {company.industry && (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                      {company.industry}
                    </span>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-bold">Quy mô</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{company.employeeCount || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-bold">Thành lập</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{company.foundedYear || 'N/A'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/recruiter/company/view')}
                    className="w-full py-3 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-bold shadow-sm flex items-center justify-center gap-2 group"
                  >
                    <span>Xem chi tiết</span>
                    <i className="fas fa-arrow-right text-indigo-500 group-hover:translate-x-1 transition-transform"></i>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <i className="fas fa-city text-3xl"></i>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Chưa có công ty</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                    Bạn chưa liên kết hoặc tạo hồ sơ công ty. Hãy cập nhật để bắt đầu đăng tin.
                  </p>
                  <button
                    onClick={() => navigate('/recruiter/company/edit')}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition font-bold flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-plus-circle"></i>
                    Tạo hồ sơ công ty
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20 dark:border-white/5">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900/50">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <i className="fas fa-chart-pie"></i>
                  </span>
                  Thống kê nhanh
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <i className="fas fa-briefcase text-lg"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Việc làm active</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeJobs || 0}</p>
                    </div>
                  </div>
                  <div className="h-8 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-600 rounded">Active</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                      <i className="fas fa-user-clock text-lg"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ứng viên chờ</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.newApplications || 0}</p>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <i className="fas fa-calendar-alt text-lg"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phỏng vấn</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.upcomingInterviews || 0}</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
