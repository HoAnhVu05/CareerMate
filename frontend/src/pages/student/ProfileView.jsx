import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    const handleAvatarUpdate = () => loadProfile();
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    return () => window.removeEventListener('avatarUpdated', handleAvatarUpdate);
  }, [location.pathname, location.state?.refresh]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile(true);
      if (data && !data.error) setProfile(data);
      else setProfile(null);
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 401) setTimeout(() => window.location.href = '/login', 2000);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatarUrl) {
      let url = api.getFileUrl(profile.avatarUrl);
      return url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8 font-sans animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Header with Background */}
        <div className="relative mb-6">
          <div className="h-48 md:h-64 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden shadow-lg relative group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-20"></div>

            <div className="absolute top-6 left-6 flex gap-3">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 transition flex items-center gap-2 text-sm font-medium"
              >
                <i className="fas fa-arrow-left"></i> Dashboard
              </button>
            </div>

            <button
              onClick={() => navigate('/student/profile/edit')}
              className="absolute top-6 right-6 px-4 py-2 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-gray-100 transition flex items-center gap-2 text-sm font-bold"
            >
              <i className="fas fa-pen"></i> Chỉnh sửa
            </button>
          </div>

          {/* Avatar - Absolute Positioned */}
          <div className="absolute -bottom-12 left-8 md:left-12">
            <div className="relative">
              {getAvatarUrl() ? (
                <img src={getAvatarUrl()} alt="Avatar" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-black shadow-2xl object-cover bg-white" />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-black shadow-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <i className="fas fa-user text-4xl text-gray-400"></i>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name & Info - Flow Content (Below Header) */}
        <div className="mb-8 pl-[160px] md:pl-[190px] min-h-[60px] flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">{user?.fullName || 'Sinh viên'}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/30 dark:text-blue-300 uppercase">
              {profile.currentStatus === 'STUDENT' ? 'Sinh viên' : profile.currentStatus}
            </span>
            • {profile.major || 'Chưa cập nhật chuyên ngành'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Quick Info */}
          <div className="space-y-6">
            {/* Bio Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Giới thiệu</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {profile.bio || 'Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ để nhà tuyển dụng hiểu rõ hơn về bạn.'}
              </p>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Liên kết</h3>
              <div className="space-y-3">
                {profile.linkedinUrl ? (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <i className="fab fa-linkedin text-xl"></i> <span className="text-sm truncate">LinkedIn Profile</span>
                  </a>
                ) : <p className="text-sm text-gray-400">Chưa cập nhật LinkedIn</p>}

                {profile.githubUrl ? (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <i className="fab fa-github text-xl"></i> <span className="text-sm truncate">GitHub Profiler</span>
                  </a>
                ) : <p className="text-sm text-gray-400">Chưa cập nhật GitHub</p>}

                {profile.portfolioUrl ? (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <i className="fas fa-globe text-xl"></i> <span className="text-sm truncate">Portfolio Website</span>
                  </a>
                ) : <p className="text-sm text-gray-400">Chưa cập nhật Portfolio</p>}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="md:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                  <i className="fas fa-user"></i>
                </div>
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ngày sinh</p>
                  <p className="text-gray-900 dark:text-white font-medium">{formatDate(profile.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Giới tính</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Địa chỉ</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.address ? `${profile.address}, ${profile.city}, ${profile.country}` : 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                Học vấn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Trường</p>
                  <p className="text-gray-900 dark:text-white font-medium text-lg">{profile.university || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chuyên ngành</p>
                  <p className="text-gray-900 dark:text-white font-medium text-lg">{profile.major || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Năm tốt nghiệp</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.graduationYear || '--'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">GPA</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.gpa || '--'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
