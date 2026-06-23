import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    loadCompany();
    loadRatings();
    loadMyRating();
  }, [id]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await api.getCompany(id);
      setCompany(data);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const data = await api.getCompanyRatings(id);
      // Handle both array and object with content property
      if (Array.isArray(data)) {
        setRatings(data);
      } else if (data && data.content) {
        setRatings(data.content);
      } else {
        setRatings([]);
      }
      console.log('Loaded ratings:', data);
    } catch (error) {
      console.error('Error loading ratings:', error);
      setRatings([]);
    }
  };



  const loadMyRating = async () => {
    try {
      const data = await api.getMyCompanyRating(id);
      if (data) {
        setMyRating(data);
        setRatingForm({
          rating: data.rating || 5,
          comment: data.reviewText || ''
        });
      } else {
        setMyRating(null);
        setRatingForm({ rating: 5, comment: '' });
      }
    } catch (error) {
      console.error('Error loading my rating:', error);
      setMyRating(null);
    }
  };

  const handleContact = async () => {
    console.log('=== Company Contact Debug ===');
    console.log('Company data:', company);
    console.log('Company recruiter ID:', company?.recruiterId);

    // Get recruiter ID directly from company
    const recruiterId = company?.recruiterId;

    if (!recruiterId) {
      console.error('No recruiter ID found for company');
      alert('Không tìm thấy thông tin nhà tuyển dụng. Vui lòng thử lại sau.');
      return;
    }

    console.log('Using recruiter ID:', recruiterId);

    // Navigate to messages with recipientId in state for auto-selection
    navigate('/student/messages', { state: { recipientId: recruiterId } });
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await api.submitCompanyRating(id, ratingForm);
      alert(myRating ? 'Đánh giá đã được cập nhật!' : 'Cảm ơn bạn đã đánh giá!');
      setShowRatingForm(false);
      loadRatings();
      loadCompany();
      loadMyRating();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi đánh giá'));
    }
  };

  const handleDeleteRating = async () => {
    if (!myRating) return;

    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      return;
    }

    try {
      await api.deleteCompanyRating(id);
      alert('Đánh giá đã được xóa!');
      setMyRating(null);
      setRatingForm({ rating: 5, comment: '' });
      setShowRatingForm(false);
      loadRatings();
      loadCompany();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa đánh giá'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
          <i className="fas fa-exclamation-circle text-red-500 dark:text-red-400 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy công ty</h2>
          <Link to="/student/companies" className="btn-primary mt-4">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/companies')}
        className="mb-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors group"
      >
        <i className="fas fa-arrow-left transform group-hover:-translate-x-1 transition-transform"></i>
        <span className="font-medium">Quay lại danh sách công ty</span>
      </button>

      {/* Enhanced Company Header */}
      <div className="card p-8 mb-6 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 border-2 border-blue-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Company Logo */}
          {company.logoUrl ? (
            <div className="flex-shrink-0">
              <img
                src={getFullUrl(company.logoUrl)}
                alt={company.name}
                className="w-40 h-40 object-contain rounded-xl border-4 border-white dark:border-gray-800 shadow-lg bg-white dark:bg-gray-900 p-4"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-40 h-40 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              <i className="fas fa-building text-blue-500 dark:text-blue-400 text-5xl"></i>
            </div>
          )}

          {/* Company Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{company.name}</h1>

            {/* Info Icons */}
            <div className="flex flex-wrap gap-4 mb-4">
              {company.industry && (
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <i className="fas fa-industry text-blue-600 dark:text-blue-400"></i>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">{company.industry}</span>
                </div>
              )}
              {company.headquarters && (
                <div className="flex items-center gap-2 bg-green-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <i className="fas fa-map-marker-alt text-green-600 dark:text-green-400"></i>
                  <span className="text-sm font-medium text-green-900 dark:text-green-300">{company.headquarters}</span>
                </div>
              )}
              {company.companySize && (
                <div className="flex items-center gap-2 bg-purple-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <i className="fas fa-users text-purple-600 dark:text-purple-400"></i>
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-300">{company.companySize}</span>
                </div>
              )}
              {company.foundedYear && (
                <div className="flex items-center gap-2 bg-orange-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                  <i className="fas fa-calendar text-orange-600 dark:text-orange-400"></i>
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Thành lập {company.foundedYear}</span>
                </div>
              )}
            </div>

            {/* Rating Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-yellow-100 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-3xl ${i < Math.floor(company.averageRating || 0)
                        ? 'text-yellow-400 drop-shadow-sm'
                        : 'text-gray-300 dark:text-gray-600'
                        } transition-all`}
                    ></i>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {company.averageRating ? company.averageRating.toFixed(1) : '0.0'}
                  </span>
                  {company.ratingsCount > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Dựa trên {company.ratingsCount} đánh giá
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Giới thiệu</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{company.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4">
          {company.websiteUrl && (
            <a
              href={company.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 dark:text-white border-2 border-blue-200 dark:border-gray-700 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 font-medium transition-all duration-200"
            >
              <i className="fas fa-external-link-alt"></i>
              <span>Trang web chính thức</span>
            </a>
          )}
          <button
            onClick={handleContact}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 font-medium transition-all duration-200"
          >
            <i className="fas fa-comments"></i>
            <span>Liên hệ với nhà tuyển dụng</span>
          </button>
        </div>
      </div>

      {/* Enhanced Rating Form */}
      <div className="card p-6 mb-6 shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {myRating ? 'Đánh giá của bạn' : 'Đánh giá công ty'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {myRating
                ? 'Bạn đã đánh giá công ty này. Bạn có thể thay đổi hoặc xóa đánh giá.'
                : 'Chia sẻ trải nghiệm của bạn về công ty này'}
            </p>
          </div>
          <div className="flex gap-3">
            {myRating && (
              <button
                onClick={handleDeleteRating}
                className="px-6 py-2 rounded-lg font-medium transition-all duration-200 bg-red-600 text-white shadow-md hover:shadow-lg hover:bg-red-700 transform hover:scale-105"
              >
                <i className="fas fa-trash mr-2"></i>
                Xóa đánh giá
              </button>
            )}
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${showRatingForm
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }`}
            >
              {showRatingForm ? (
                <>
                  <i className="fas fa-times mr-2"></i>
                  Hủy
                </>
              ) : (
                <>
                  <i className="fas fa-star mr-2"></i>
                  {myRating ? 'Thay đổi đánh giá' : 'Viết đánh giá'}
                </>
              )}
            </button>
          </div>
        </div>
        {showRatingForm && (
          <form onSubmit={handleSubmitRating} className="space-y-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border-2 border-blue-100 dark:border-gray-700 animate-fade-in">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                Điểm đánh giá *
              </label>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                    className={`text-5xl transform transition-all duration-200 hover:scale-110 ${star <= ratingForm.rating
                      ? 'text-yellow-400 drop-shadow-lg'
                      : 'text-gray-300 hover:text-yellow-200'
                      }`}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                {ratingForm.rating === 5 && 'Tuyệt vời!'}
                {ratingForm.rating === 4 && 'Rất tốt!'}
                {ratingForm.rating === 3 && 'Tốt'}
                {ratingForm.rating === 2 && 'Bình thường'}
                {ratingForm.rating === 1 && 'Cần cải thiện'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                Nhận xét của bạn *
              </label>
              <textarea
                value={ratingForm.comment}
                onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                className="input-field w-full min-h-[120px] bg-white dark:bg-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                placeholder="Chia sẻ trải nghiệm, cảm nhận của bạn về công ty này..."
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nhận xét sẽ giúp người khác hiểu rõ hơn về công ty</p>
            </div>
            <button type="submit" className="btn-primary w-full">
              <i className="fas fa-paper-plane mr-2"></i>
              {myRating ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </button>
          </form>
        )}
      </div>

      {/* Enhanced Ratings List */}
      <div className="card p-6 shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Đánh giá từ cộng đồng
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {ratings.length} đánh giá từ các thành viên
            </p>
          </div>
          <div className="px-4 py-2 bg-blue-100 dark:bg-gray-800 rounded-full">
            <span className="text-sm font-bold text-blue-900 dark:text-blue-300">{ratings.length}</span>
          </div>
        </div>
        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <i className="fas fa-star text-gray-400 dark:text-gray-600 text-3xl"></i>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Chưa có đánh giá nào</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Hãy là người đầu tiên đánh giá công ty này!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {ratings.map((rating) => {
              const userName = rating.student?.user?.fullName || 'Người dùng ẩn danh';
              const avatarUrl = rating.student?.user?.avatarUrl;
              const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

              // Construct full avatar URL
              let fullAvatarUrl = getFullUrl(avatarUrl);

              return (
                <div key={rating.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900 rounded-xl p-6 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300 animate-fade-in">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {fullAvatarUrl ? (
                        <img
                          src={fullAvatarUrl}
                          alt={userName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ${fullAvatarUrl ? 'hidden' : ''}`}
                      >
                        {initials}
                      </div>
                    </div>

                    {/* User Info & Rating */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white mb-1">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(rating.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-sm ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                }`}
                            ></i>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      {rating.reviewText && (
                        <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{rating.reviewText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
