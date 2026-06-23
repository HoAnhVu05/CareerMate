import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getFullUrl } from '../utils/apiUtils';

export default function CompanyDetailModal({ isOpen, onClose, company, recruiter, recruiterUser }) {
  const navigate = useNavigate();
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [myRating, setMyRating] = useState(null);

  useEffect(() => {
    if (isOpen && company) {
      loadAverageRating();
      loadMyRating();
    }
  }, [isOpen, company]);

  const loadAverageRating = async () => {
    if (!company?.id) return;
    try {
      const data = await api.getCompanyAverageRating(company.id);
      setAverageRating(data.averageRating || 0);
      // Get rating count from ratings list if needed
    } catch (error) {
      console.error('Error loading average rating:', error);
    }
  };

  const loadMyRating = async () => {
    if (!company?.id) return;
    try {
      const data = await api.getMyCompanyRating(company.id);
      setMyRating(data);
      // Pre-fill form if rating exists
      if (data) {
        setRating(data.rating || 5);
        setReviewText(data.reviewText || '');
      } else {
        setRating(5);
        setReviewText('');
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading my rating:', error);
      }
      setMyRating(null);
      setRating(5);
      setReviewText('');
    }
  };

  const handleDeleteRating = async () => {
    if (!company?.id || !myRating) return;
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      setLoading(true);
      await api.deleteCompanyRating(company.id);
      setMyRating(null);
      setRating(5);
      setReviewText('');
      setShowRatingForm(false);
      await loadAverageRating();
      alert('Đã xóa đánh giá!');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa đánh giá'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!company?.id) return;

    try {
      setLoading(true);
      await api.submitCompanyRating(company.id, { rating, comment: reviewText });
      alert(myRating ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã đánh giá!');
      setShowRatingForm(false);
      await loadMyRating(); // Reload my rating
      await loadAverageRating(); // Reload average rating
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi đánh giá'));
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!recruiterUser?.id) {
      alert('Không tìm thấy thông tin nhà tuyển dụng');
      return;
    }
    
    try {
      // Get or create conversation with recruiter
      const conversation = await api.getOrCreateConversation(recruiterUser.id);
      // Close modal and navigate to messages page with conversationId
      onClose();
      if (conversation?.id) {
        navigate(`/student/messages?conversationId=${conversation.id}`);
      } else {
        navigate('/student/messages');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể tạo cuộc trò chuyện'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Thông tin công ty</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Company Header */}
          <div className="flex items-start gap-6 mb-6">
            {company?.logoUrl && (
              <img
                src={getFullUrl(company.logoUrl)}
                alt={company.name}
                className="w-24 h-24 object-contain rounded-lg border border-gray-200"
              />
            )}
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{company?.name || 'N/A'}</h3>
              
              {/* Average Rating */}
              {averageRating > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star text-lg ${
                          i < Math.floor(averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}

              {company?.industry && (
                <p className="text-gray-600 mb-1">
                  <i className="fas fa-industry mr-2"></i>
                  {company.industry}
                </p>
              )}
              {company?.headquarters && (
                <p className="text-gray-600 mb-1">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {company.headquarters}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {company?.description && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Giới thiệu</h4>
              <p className="text-gray-700 leading-relaxed">{company.description}</p>
            </div>
          )}

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {company?.companySize && (
              <div>
                <p className="text-sm text-gray-500">Quy mô</p>
                <p className="font-semibold text-gray-900">{company.companySize}</p>
              </div>
            )}
            {company?.foundedYear && (
              <div>
                <p className="text-sm text-gray-500">Năm thành lập</p>
                <p className="font-semibold text-gray-900">{company.foundedYear}</p>
              </div>
            )}
            {company?.websiteUrl && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Website</p>
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {company.websiteUrl}
                </a>
              </div>
            )}
          </div>

          {/* Rating Form */}
          <div className="mb-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Đánh giá công ty</h4>
              <div className="flex gap-2">
                {myRating && (
                  <button
                    onClick={handleDeleteRating}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Xóa đánh giá
                  </button>
                )}
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showRatingForm ? 'Hủy' : (myRating ? 'Thay đổi đánh giá' : 'Viết đánh giá')}
                </button>
              </div>
            </div>
            {showRatingForm && (
              <form onSubmit={handleSubmitRating} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Điểm đánh giá
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nhận xét
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Button */}
          <div className="border-t pt-6">
            <button
              onClick={handleContact}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <i className="fas fa-comments"></i>
              Liên hệ với nhà tuyển dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
