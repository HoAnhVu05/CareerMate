import { useState, useEffect } from 'react';
import api from '../services/api';
import { getFullUrl } from '../utils/apiUtils';

export default function UserInfoModal({ isOpen, onClose, user, userRole }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadProfile();
    }
  }, [isOpen, user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      if (userRole === 'RECRUITER') {
        const data = await api.getRecruiterByUserId(user.id);
        setProfile(data);
      } else if (userRole === 'STUDENT') {
        // For students, we might need a different API
        // For now, just use the user data
        setProfile({ user });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getAvatarUrl = (avatarUrl) => {
    return getFullUrl(avatarUrl);
  };

  const avatarUrl = getAvatarUrl(user?.avatarUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600 text-sm">Đang tải...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Avatar and Name */}
              <div className="text-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.fullName}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold mx-auto mb-3">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900">{user?.fullName || 'Người dùng'}</h3>
                <p className="text-sm text-gray-500">
                  {userRole === 'RECRUITER' ? 'Nhà tuyển dụng' : 'Sinh viên'}
                </p>
              </div>

              {/* User Info */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                  <p className="text-sm text-gray-900 mt-1">{user?.email || 'N/A'}</p>
                </div>

                {userRole === 'RECRUITER' && profile?.company && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Công ty</label>
                      <p className="text-sm text-gray-900 mt-1">{profile.company.name || 'N/A'}</p>
                    </div>
                    {profile.company.description && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Mô tả công ty</label>
                        <p className="text-sm text-gray-900 mt-1">{profile.company.description}</p>
                      </div>
                    )}
                    {profile.company.website && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Website</label>
                        <a
                          href={profile.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-1 block"
                        >
                          {profile.company.website}
                        </a>
                      </div>
                    )}
                  </>
                )}

                {userRole === 'STUDENT' && profile?.user && (
                  <>
                    {profile.user.phone && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Số điện thoại</label>
                        <p className="text-sm text-gray-900 mt-1">{profile.user.phone}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
