import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState({
    answer: '',
    attachmentUrl: ''
  });
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenge();
    loadParticipation();
  }, [id]);

  useEffect(() => {
    console.log('showBadgeModal changed:', showBadgeModal);
    console.log('earnedBadge changed:', earnedBadge);
  }, [showBadgeModal, earnedBadge]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const data = await api.getChallenge(id);
      setChallenge(data);
    } catch (error) {
      console.error('Error loading challenge:', error);
      if (error.response?.status === 404) {
        alert('Thử thách không tồn tại hoặc đã bị xóa. Bạn sẽ được chuyển về trang danh sách thử thách.');
        navigate('/student/challenges');
      } else {
        alert('Lỗi khi tải thử thách: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadParticipation = async () => {
    try {
      const data = await api.getMyChallenges();
      const myPart = data.find(p => p.challenge?.id === id);
      setParticipation(myPart);
    } catch (error) {
      console.error('Error loading participation:', error);
      // Don't show alert for participation errors, just log it
      // Participation might not exist yet or challenge might have been deleted
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    console.log('=== HANDLE SUBMIT STARTED ===');
    console.log('Challenge ID:', id);
    console.log('Submission:', submission);
    console.log('Current challenge:', challenge);
    
    try {
      setSubmitting(true);
      console.log('Calling API participateChallenge...');
      const result = await api.participateChallenge(id, submission);
      setLatestResult(result);
      console.log('=== API RESPONSE ===');
      console.log('Full result:', JSON.stringify(result, null, 2));
      console.log('Result status:', result.status);
      console.log('Result score:', result.score);
      console.log('Result challenge:', result.challenge);
      console.log('Result challenge badge:', result.challenge?.badge);
      
      if (result.status === 'COMPLETED') {
        console.log('Status is COMPLETED, checking for badge...');
        // Get badge info from result.challenge.badge or challenge state
        const badge = result.challenge?.badge || challenge?.badge;
        console.log('Badge found:', badge);
        console.log('Badge name:', badge?.name);
        
        if (badge) {
          console.log('Setting badge and showing modal...');
          setEarnedBadge(badge);
          setShowBadgeModal(true);
          console.log('Modal should be visible now');
          // User will manually click button to navigate to badges
        } else {
          console.log('No badge found, showing alert instead');
          alert(`Chúc mừng! Bạn đã hoàn thành thử thách với điểm số ${result.score}/100!`);
        }
      } else if (result.status === 'FAILED') {
        console.log('Status is FAILED');
        const passingScore = result.challenge?.passingScore || 70;
        alert(`Bài làm của bạn đã được chấm điểm: ${result.score}/100.\n\nĐiểm số chưa đạt yêu cầu (cần ${passingScore}/100) để hoàn thành thử thách.\n\nVui lòng nộp lại với bài làm đầy đủ hơn để đạt điểm cao hơn!`);
      } else {
        console.log('Status is:', result.status);
        alert('Đã gửi bài làm thành công!');
      }
      // Reload to update UI with new status and score
      loadParticipation();
      loadChallenge();
    } catch (error) {
      console.error('=== SUBMIT ERROR ===');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi bài làm'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewBadges = () => {
    setShowBadgeModal(false);
    // Navigate immediately to badges tab
    navigate('/student/challenges?tab=badges');
  };
  
  const handleCloseBadgeModal = () => {
    setShowBadgeModal(false);
    // Keep user on challenge page, don't navigate away
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thử thách...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thử thách</h2>
          <button onClick={() => navigate('/student/challenges')} className="btn-primary mt-4">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/challenges')}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Quay lại</span>
      </button>

      {/* Challenge Header */}
      <div className="card p-8 mb-6">
        <div className="mb-4">
          <span className="badge badge-info">{challenge.category}</span>
          {participation?.status === 'COMPLETED' && (
            <span className="badge badge-success ml-2">
              <i className="fas fa-check mr-1"></i>
              Đã hoàn thành
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-gray-700 leading-relaxed mb-4">{challenge.description}</p>
        )}
        <div className="flex items-center gap-6 text-sm text-gray-600">
        {challenge.difficulty && (
          <span>
            <i className="fas fa-signal mr-1"></i>
            Độ khó: {challenge.difficulty}
          </span>
        )}
          {challenge.badge && (
            <span>
              <i className="fas fa-medal text-blue-500 mr-1"></i>
              Huy hiệu: {challenge.badge.name}
            </span>
          )}
        </div>
      </div>

      {/* Challenge Instructions */}
      {challenge.instructions && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hướng dẫn</h2>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: challenge.instructions }}
          />
        </div>
      )}

      {/* Submission Form */}
      {participation?.status !== 'COMPLETED' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nộp bài</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Câu trả lời / Bài làm
              </label>
              <textarea
                value={submission.answer}
                onChange={(e) => setSubmission({ ...submission, answer: e.target.value })}
                className="input-field"
                rows="10"
                placeholder="Nhập câu trả lời hoặc mô tả bài làm của bạn..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link đính kèm (tùy chọn)
              </label>
              <input
                type="url"
                value={submission.attachmentUrl}
                onChange={(e) => setSubmission({ ...submission, attachmentUrl: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>
             <button type="submit" disabled={submitting} className="btn-primary flex items-center justify-center gap-2 min-w-[120px]">
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang chấm bài...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  <span>Gửi bài làm</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Participation Status */}
      {participation && (
        <div className="card p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Trạng thái</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Trạng thái: </span>
              {participation.status === 'COMPLETED' && (
                <span className="badge badge-success">Đã hoàn thành</span>
              )}
              {participation.status === 'FAILED' && (
                <span className="badge badge-danger">Chưa đạt</span>
              )}
              {participation.status === 'IN_PROGRESS' && (
                <span className="badge badge-info">Đang làm</span>
              )}
            </p>
            {participation.score !== null && participation.score !== undefined && (
              <p>
                <span className="font-semibold">Điểm số: </span>
                <span className={`font-bold text-lg ${participation.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                  {participation.score}/100
                </span>
              </p>
            )}
            {participation.submittedAt && (
              <p className="text-sm text-gray-600">
                Nộp lúc: {new Date(participation.submittedAt + '+07:00').toLocaleString('vi-VN')}
              </p>
            )}

            {/* AI Feedback */}
            {participation.feedback && (
              <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                participation.score >= 70
                  ? 'bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500'
                  : 'bg-orange-50 border-orange-400 dark:bg-orange-900/20 dark:border-orange-500'
              }`}>
                <p className={`font-semibold mb-2 flex items-center gap-2 ${
                  participation.score >= 70 ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'
                }`}>
                  <i className="fas fa-robot"></i>
                  Nhận xét của AI:
                </p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {participation.feedback}
                </p>
              </div>
            )}

            {participation.answer && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Bài làm của bạn:</p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
                  <p className="whitespace-pre-wrap">{participation.answer}</p>
                </div>
              </div>
            )}
            {participation.attachmentUrl && (
              <p className="text-sm">
                <span className="font-semibold">Link đính kèm: </span>
                <a href={participation.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {participation.attachmentUrl}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Badge Earned Modal */}
      {showBadgeModal && earnedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Chúc mừng!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Bạn đã hoàn thành thử thách và nhận được huy hiệu!
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 mb-6">
              {(() => {
                // Get badge emoji/sticker based on category or rarity
                const getBadgeEmoji = (badge) => {
                  if (badge.category === 'CV') return '📄';
                  if (badge.category === 'INTERVIEW') return '🎤';
                  if (badge.category === 'CAREER') return '🎯';
                  if (badge.category === 'SKILL') return '💻';
                  if (badge.rarity === 'LEGENDARY') return '🏆';
                  if (badge.rarity === 'EPIC') return '⭐';
                  if (badge.rarity === 'RARE') return '✨';
                  return '🏅';
                };
                return (
                  <div className="text-9xl mb-4 animate-bounce">
                    {getBadgeEmoji(earnedBadge)}
                  </div>
                );
              })()}
              <h3 className="text-2xl font-bold text-white mb-2">{earnedBadge.name}</h3>
              {earnedBadge.description && (
                <p className="text-white text-sm opacity-90">{earnedBadge.description}</p>
              )}
            </div>

            {/* Score & AI Feedback inside Badge Modal */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl mb-6 border border-green-100 dark:border-green-800 text-left">
              <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1.5">
                <i className="fas fa-check-circle"></i>
                Điểm đạt được: {latestResult?.score}/100
              </p>
              {latestResult?.feedback && (
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-2 whitespace-pre-wrap">
                  <strong>Nhận xét từ AI:</strong> {latestResult.feedback}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCloseBadgeModal}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Ở lại trang này
              </button>
              <button
                onClick={handleViewBadges}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Xem huy hiệu của tôi
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Submitting Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center border border-gray-100 dark:border-gray-700 shadow-2xl flex flex-col items-center">
            <div className="relative w-20 h-20 mb-6">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 animate-pulse"></div>
              {/* Inner spinning loader */}
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              {/* Central robot icon */}
              <div className="absolute inset-0 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl animate-pulse">
                <i className="fas fa-robot"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đang chấm điểm...</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Hệ thống trí tuệ nhân tạo (AI) đang phân tích ngữ nghĩa và đánh giá bài làm của bạn. Quá trình này có thể mất vài giây.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
