import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');
  const [profile, setProfile] = useState({
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    country: 'Việt Nam',
    university: '',
    major: '',
    graduationYear: '',
    gpa: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    avatarUrl: '',
    currentStatus: 'STUDENT',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage('');
      const data = await api.getStudentProfile(true);
      if (data && !data.error) {
        setProfile({
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || 'Việt Nam',
          university: data.university || '',
          major: data.major || '',
          graduationYear: data.graduationYear ? String(data.graduationYear) : '',
          gpa: data.gpa ? String(data.gpa) : '',
          bio: data.bio || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          avatarUrl: data.avatarUrl || '',
          currentStatus: data.currentStatus || 'STUDENT',
        });
        if (data.avatarUrl) {
          let url = api.getFileUrl(data.avatarUrl);
          // Add cache busting for display
          url = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
          setAvatarPreview(url);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể tải thông tin hồ sơ'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Lỗi: Chỉ chấp nhận file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Lỗi: Kích thước file quá 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);

      const response = await api.uploadAvatar(file);
      if (response?.avatarUrl) {
        setProfile(prev => ({ ...prev, avatarUrl: response.avatarUrl }));

        let fullUrl = api.getFileUrl(response.avatarUrl);
        fullUrl = fullUrl + (fullUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
        setAvatarPreview(fullUrl);

        setMessage('Cập nhật ảnh đại diện thành công!');
        window.dispatchEvent(new CustomEvent('avatarUpdated', {
          detail: { avatarUrl: response.avatarUrl }
        }));
      }
    } catch (error) {
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể tải ảnh lên'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');

      const profileData = { ...profile };
      // Convert numeric fields
      if (profileData.graduationYear) profileData.graduationYear = parseInt(profileData.graduationYear);
      if (profileData.gpa) profileData.gpa = parseFloat(profileData.gpa);

      // Clean empty strings to null
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === '') profileData[key] = null;
      });

      const response = await api.updateStudentProfile(profileData);

      if (response && !response.error) {
        setMessage('Đã lưu thay đổi thành công!');
        // Optimistically update
        setProfile(prev => ({ ...prev, ...profileData }));
      } else {
        throw new Error(response?.error || 'Lỗi không xác định');
      }
    } catch (error) {
      setMessage('Lỗi: ' + (error.message || 'Không thể cập nhật hồ sơ'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const TabButton = ({ id, icon, label }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left mb-2 ${activeTab === id
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
      <i className={`fas ${icon} w-6 text-center`}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header with Background */}
        <div className="relative mb-6">
          <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden shadow-lg relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20"></div>

            <button
              onClick={() => navigate('/student/profile/view')}
              className="absolute top-6 left-6 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm font-medium"
            >
              <i className="fas fa-eye"></i> Xem trang cá nhân
            </button>
          </div>

          {/* Avatar - Absolute Positioned */}
          <div className="absolute -bottom-12 left-8 md:left-12">
            <div className="relative group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-black shadow-2xl object-cover bg-white" />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-black shadow-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <i className="fas fa-user text-4xl text-gray-400"></i>
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
                title="Đổi ảnh đại diện"
              >
                <i className={`fas ${uploadingAvatar ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
              </button>
              <input type="file" ref={fileInputRef} hidden onChange={handleAvatarChange} accept="image/*" />
            </div>
          </div>
        </div>

        {/* Name & Info - Flow Content */}
        <div className="mb-10 pl-[160px] md:pl-[190px] min-h-[60px] flex flex-col justify-center hidden md:flex">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt hồ sơ</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Quản lý thông tin cá nhân và tài khoản</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 animate-slide-up ${message.includes('Lỗi')
            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
            : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
            }`}>
            <i className={`fas ${message.includes('Lỗi') ? 'fa-exclamation-triangle' : 'fa-check-circle'} text-xl`}></i>
            <span className="font-medium">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">Tài khoản</p>
              <TabButton id="general" icon="fa-user-circle" label="Thông tin chung" />
              <TabButton id="education" icon="fa-graduation-cap" label="Học vấn" />
              <TabButton id="bio" icon="fa-file-alt" label="Giới thiệu" />
              <TabButton id="social" icon="fa-share-alt" label="Mạng xã hội" />

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>

              <button
                type="submit"
                disabled={saving}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-[500px]">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4">Thông tin cơ bản</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Ngày sinh</label>
                      <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="label">Giới tính</label>
                      <select name="gender" value={profile.gender} onChange={handleChange} className="input-field">
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Trạng thái hiện tại</label>
                      <select name="currentStatus" value={profile.currentStatus} onChange={handleChange} className="input-field">
                        <option value="STUDENT">Đang đi học</option>
                        <option value="GRADUATED">Đã tốt nghiệp</option>
                        <option value="JOB_SEEKING">Đang tìm việc</option>
                        <option value="EMPLOYED">Đang đi làm</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Quốc gia</label>
                      <input type="text" name="country" value={profile.country} onChange={handleChange} className="input-field" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b dark:border-gray-800 pb-4">Địa chỉ liên hệ</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="label">Địa chỉ nhà</label>
                      <input type="text" name="address" value={profile.address} onChange={handleChange} className="input-field" placeholder="Số nhà, tên đường..." />
                    </div>
                    <div>
                      <label className="label">Thành phố / Tỉnh</label>
                      <input type="text" name="city" value={profile.city} onChange={handleChange} className="input-field" placeholder="Hà Nội, TP.HCM..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-6 border-b dark:border-gray-800 pb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lịch sử học tập</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Trường đại học</label>
                      <input type="text" name="university" value={profile.university} onChange={handleChange} className="input-field" placeholder="Đại học Bách Khoa..." />
                    </div>
                    <div>
                      <label className="label">Chuyên ngành</label>
                      <input type="text" name="major" value={profile.major} onChange={handleChange} className="input-field" placeholder="Kỹ thuật phần mềm..." />
                    </div>
                    <div>
                      <label className="label">Năm tốt nghiệp (Dự kiến)</label>
                      <input type="number" name="graduationYear" value={profile.graduationYear} onChange={handleChange} className="input-field" placeholder="2025" />
                    </div>
                    <div>
                      <label className="label">Điểm GPA</label>
                      <input type="number" step="0.01" name="gpa" value={profile.gpa} onChange={handleChange} className="input-field" placeholder="3.6" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bio Tab */}
            {activeTab === 'bio' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-6 border-b dark:border-gray-800 pb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                      <i className="fas fa-feather-alt"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Giới thiệu bản thân</h2>
                  </div>

                  <div>
                    <label className="label">Tiểu sử ngắn</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      rows="8"
                      className="input-field resize-none leading-relaxed"
                      placeholder="Hãy viết gì đó ấn tượng về bạn (Kinh nghiệm, sở thích, mục tiêu nghề nghiệp...)"
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-2 text-right">Mẹo: Sử dụng markdown để định dạng văn bản tốt hơn</p>
                  </div>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4 mb-6 border-b dark:border-gray-800 pb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                      <i className="fas fa-link"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Liên kết ngoại vi</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label flex items-center gap-2">
                        <i className="fab fa-linkedin text-blue-700"></i> LinkedIn
                      </label>
                      <div className="relative">
                        <input type="url" name="linkedinUrl" value={profile.linkedinUrl} onChange={handleChange} className="input-field pl-10" placeholder="https://linkedin.com/in/..." />
                        <i className="fas fa-link absolute left-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="label flex items-center gap-2">
                        <i className="fab fa-github text-gray-800 dark:text-white"></i> GitHub
                      </label>
                      <div className="relative">
                        <input type="url" name="githubUrl" value={profile.githubUrl} onChange={handleChange} className="input-field pl-10" placeholder="https://github.com/..." />
                        <i className="fas fa-code absolute left-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>
                    <div>
                      <label className="label flex items-center gap-2">
                        <i className="fas fa-globe text-blue-500"></i> Portfolio / Website
                      </label>
                      <div className="relative">
                        <input type="url" name="portfolioUrl" value={profile.portfolioUrl} onChange={handleChange} className="input-field pl-10" placeholder="https://your-website.com" />
                        <i className="fas fa-globe absolute left-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* CSS for custom classes to avoid repetition */}
        <style>{`
           .label {
               @apply block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2;
           }
           .input-field {
               @apply w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all;
           }
        `}</style>
      </div>
    </div>
  );
}
