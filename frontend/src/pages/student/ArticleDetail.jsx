import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';


const CommentItem = ({ comment, onReply, currentUserId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Helper to get initials for avatar fallback
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    await onReply(comment.id, replyContent);
    setSubmitting(false);
    setReplyContent('');
    setShowReplyForm(false);
  };

  return (
    <div className="flex gap-4 mb-6 animate-fade-in">
      <div className="flex-shrink-0">
        {comment.user?.avatarUrl ? (
          <img
            src={getFullUrl(comment.user.avatarUrl)}
            alt={comment.user.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {getInitials(comment.user?.fullName)}
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{comment.user?.fullName || 'Người dùng ẩn danh'}</h4>
            <span className="text-xs text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-3 px-2">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="hover:text-indigo-600 transition-colors"
          >
            Trả lời
          </button>
        </div>

        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="mb-4 flex gap-3 animate-fade-in-down">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Trả lời ${comment.user?.fullName}...`}
              className="flex-grow px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-indigo-500 outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              Gửi
            </button>
          </form>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 mt-2">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ArticleDetail({ articleId: propId, isModal, onClose }) {
  const params = useParams();
  const id = propId || params.id;
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [authorCompany, setAuthorCompany] = useState(null); // Full company object
  const [authorProfile, setAuthorProfile] = useState(null); // Full user/recruiter profile
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const reactionCloseTimeoutRef = useRef(null);

  const getReactionEmojiUrl = (type) => {
    const urls = {
      LIKE: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg/1f44d.svg',
      LOVE: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg/2764.svg',
      HAHA: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg/1f602.svg',
      WOW: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg/1f62e.svg',
      SAD: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg/1f622.svg',
      ANGRY: 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@14.1.2/assets/svg/1f621.svg'
    };
    return urls[type] || urls.LIKE;
  };

  const handleMouseEnter = () => {
    if (reactionCloseTimeoutRef.current) {
      clearTimeout(reactionCloseTimeoutRef.current);
      reactionCloseTimeoutRef.current = null;
    }
    setShowReactionPicker(true);
  };

  const handleMouseLeave = () => {
    reactionCloseTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (reactionCloseTimeoutRef.current) {
        clearTimeout(reactionCloseTimeoutRef.current);
      }
    };
  }, []);

  const [reactionCounts, setReactionCounts] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const handleTouchStart = (e) => {
    isLongPressRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setShowReactionPicker(true);
      if (navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (err) {
          // ignore
        }
      }
    }, 500);
  };

  const handleTouchEnd = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Helper to get initials
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  useEffect(() => {
    // If no ID is available (e.g. modal closed/empty), don't fetch
    if (!id) return;

    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadArticle();
    loadComments();
    loadReactions();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await api.getArticle(id);
      console.log('API Response Article:', data);
      setArticle(data);

      // Get author display name & company info
      try {
        const authorDisplayName = await api.getAuthorDisplayName(id);
        setAuthorName(authorDisplayName);

        console.log('Article Author Data:', data.author);

        // FAILSAFE LOGIC: Use local variable to handle missing author
        let effectiveAuthor = data.author;

        if (!effectiveAuthor && data.authorId) {
          console.log('Author data missing from Article, attempting manual fetch for:', data.authorId);
          try {
            // Try fetching as recruiter first since we need company
            console.log('Failsafe: Fetching recruiter profile...');
            const recruiterProfile = await api.getRecruiterByUserId(data.authorId);
            if (recruiterProfile) {
              effectiveAuthor = {
                ...recruiterProfile,
                role: 'RECRUITER',
                id: data.authorId,
                fullName: recruiterProfile.fullName || authorDisplayName,
              };
            }
          } catch (e) {
            try {
              const studentProfile = await api.getStudentProfileByUserId(data.authorId);
              if (studentProfile) {
                effectiveAuthor = { ...studentProfile, role: 'STUDENT', id: data.authorId };
              }
            } catch (e2) {
              console.error('Failsafe: All fetches failed', e2);
            }
          }
        }

        // Set profile for modal usage
        if (effectiveAuthor) {
          setAuthorProfile(effectiveAuthor);
          setArticle(prev => ({ ...prev, author: effectiveAuthor }));
        }

        // Fetch detailed company info if recruiter
        if (data.authorId && effectiveAuthor) {
          // Check if author role is RECRUITER
          const isRecruiter = effectiveAuthor.role === 'RECRUITER' || effectiveAuthor.role === 'recruiter';

          if (isRecruiter) {
            try {
              let rProfile = effectiveAuthor;
              if (!rProfile.companyId) {
                try {
                  rProfile = await api.getRecruiterByUserId(data.authorId);
                  setAuthorProfile(rProfile);
                } catch (e) { }
              }

              if (rProfile?.companyId) {
                const company = await api.getCompany(rProfile.companyId);
                setAuthorCompany(company);
              }
            } catch (err) {
              console.error('Error fetching recruiter/company info:', err);
            }
          }
        }

      } catch (error) {
        console.error('Error loading author details:', error);
        if (data.author) {
          setAuthorName(data.author.fullName);
        }
      }

    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getArticleComments(id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.createArticleComment(id, newComment);
      setNewComment('');
      loadComments(); // Reload to see new comment
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Không thể đăng bình luận. Vui lòng thử lại.');
    }
  };

  const handleReply = async (commentId, content) => {
    try {
      await api.createArticleComment(id, content, commentId);
      loadComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Không thể trả lời. Vui lòng thử lại.');
    }
  };

  const loadReactions = async () => {
    try {
      const counts = await api.getArticleReactionCounts(id);
      setReactionCounts(counts || {});
      
      const myReact = await api.getMyArticleReaction(id);
      setMyReaction(myReact);
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      await api.toggleArticleReaction(id, reactionType);
      await loadReactions();
    } catch (error) {
      console.error('Error reacting to article:', error);
    }
  };

  const getTotalReactions = () => {
    return Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  };

  const getReactionEmoji = (type) => {
    const emojis = {
      LIKE: '👍',
      LOVE: '❤️',
      HAHA: '😂',
      WOW: '😮',
      SAD: '😢',
      ANGRY: '😡'
    };
    return emojis[type] || '👍';
  };

  const getReactionLabel = (type) => {
    const labels = {
      LIKE: 'Thích',
      LOVE: 'Yêu thích',
      HAHA: 'Haha',
      WOW: 'Wow',
      SAD: 'Buồn',
      ANGRY: 'Phẫn nộ'
    };
    return labels[type] || 'Thích';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorInitials = () => {
    return authorName ? authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';
  };

  // Helper handling safe URL generation to prevent crashes
  const getSafeAvatarUrl = () => {
    if (!article) return null;
    const url = authorProfile?.avatarUrl || article.author?.avatarUrl;
    return getFullUrl(url);
  };

  const getSafeLogoUrl = () => {
    const url = authorCompany?.logoUrl;
    return getFullUrl(url);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-slate-500 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    if (isModal) {
      return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
          <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-slate-600 mb-6">Bài viết này không tồn tại hoặc đã bị xóa.</p>
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 shadow-xl">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-slate-600 mb-6">Bài viết này không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate(currentUser?.role === 'RECRUITER' ? '/recruiter/articles' : currentUser?.role === 'ADMIN' ? '/admin/articles' : '/student/articles')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-600 transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto px-4 py-4 animate-fade-in ${isModal ? '' : 'max-w-4xl'}`}>
      {/* Back Button - Hide if Modal */}
      {!isModal && (
        <button
          onClick={() => navigate(currentUser?.role === 'RECRUITER' ? '/recruiter/articles' : currentUser?.role === 'ADMIN' ? '/admin/articles' : '/student/articles')}
          className="mb-8 text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-2 transition-colors uppercase tracking-widest text-xs"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại danh sách</span>
        </button>
      )}

      {/* Article Header */}
      <div className="mb-10">
        <div className="mb-6 flex gap-3">
          <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
            {article.category || 'GENERAL'}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">{article.title}</h1>

        {/* Author Info Bar */}
        <div className="flex items-center gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
          <div
            onClick={() => setShowAuthorModal(true)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Author Avatar - Fallback or Actual */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              {getSafeLogoUrl() ? (
                <img src={getSafeLogoUrl()} alt={authorCompany?.name || 'Company'} className="w-full h-full rounded-full object-cover border-2 border-white bg-white" />
              ) : getSafeAvatarUrl() ? (
                <img src={getSafeAvatarUrl()} alt={authorName} className="w-full h-full rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-600 font-black text-sm">
                  {getAuthorInitials()}
                </div>
              )}
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{authorName}</p>
              <p className="text-xs text-slate-500 font-medium">{authorCompany?.name || 'Tác giả'}</p>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:border-slate-700 mx-2"></div>

          <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <i className="far fa-calendar-alt"></i>
            {formatDate(article.publishedAt || article.createdAt)}
          </div>

          <div className="ml-auto text-sm font-medium text-slate-500 flex items-center gap-2">
            <i className="far fa-eye"></i> {article.viewsCount} lượt xem
          </div>
        </div>
      </div>

      {/* Article Image */}
      {article.thumbnailUrl && (
        <div className="mb-10 rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-slate-900/5">
          <img
            src={getFullUrl(article.thumbnailUrl)}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Article Excerpt/Summary */}
      {article.excerpt && article.content && (
        <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-slate-800/40 dark:to-slate-800/20 rounded-[2rem] p-8 border border-indigo-100/50 dark:border-slate-800 mb-8 shadow-sm">
          <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fas fa-quote-left text-xs"></i>
            Tóm tắt bài viết
          </h3>
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
            {article.excerpt}
          </p>
        </div>
      )}

      {/* Article Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl ring-1 ring-slate-900/5 mb-12">
        {article.content ? (
          <div
            className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-a:text-indigo-600"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-slate-600 italic text-lg leading-relaxed whitespace-pre-line text-center py-10">
            {article.excerpt || 'Nội dung bài viết đang được cập nhật...'}
          </p>
        )}
      </div>

      {/* Reactions Bar & Actions */}
      <div className="max-w-3xl mx-auto mb-12 border-y border-slate-100 dark:border-slate-800 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getTotalReactions() > 0 ? (
            <>
              <div className="flex -space-x-1">
                {Object.entries(reactionCounts)
                  .filter(([_, count]) => count > 0)
                  .slice(0, 3)
                  .map(([type, _]) => (
                    <img 
                      key={type} 
                      src={getReactionEmojiUrl(type)} 
                      className="w-5 h-5 object-contain border border-white dark:border-slate-900 rounded-full bg-white dark:bg-slate-900 p-0.5 transform hover:scale-125 transition-transform" 
                      alt={type} 
                    />
                  ))}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{getTotalReactions()} lượt thích</span>
            </>
          ) : (
            <span className="text-sm font-medium text-slate-400">Chưa có tương tác nào</span>
          )}
        </div>

        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => handleReaction(myReaction ? null : 'LIKE')}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onContextMenu={(e) => e.preventDefault()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 select-none ${
              myReaction
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-800 text-blue-700 dark:text-blue-300 font-bold shadow-sm scale-105'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold'
            }`}
          >
            {myReaction ? (
              <img 
                src={getReactionEmojiUrl(myReaction.reactionType)} 
                onContextMenu={(e) => e.preventDefault()}
                className="w-5 h-5 object-contain select-none" 
                alt={myReaction.reactionType} 
              />
            ) : (
              <span className="text-lg select-none">👍</span>
            )}
            <span className="select-none">{myReaction ? getReactionLabel(myReaction.reactionType) : 'Thích'}</span>
          </button>

          {/* Facebook-style Reaction Picker */}
          {showReactionPicker && (
            <div 
              onContextMenu={(e) => e.preventDefault()}
              className="absolute right-0 bottom-full mb-2 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl px-3 py-2 border border-slate-100 dark:border-slate-800 z-30 animate-reaction-pop origin-bottom select-none"
            >
              {[
                { type: 'LIKE', label: 'Thích' },
                { type: 'LOVE', label: 'Yêu thích' },
                { type: 'HAHA', label: 'Haha' },
                { type: 'WOW', label: 'Wow' },
                { type: 'SAD', label: 'Buồn' },
                { type: 'ANGRY', label: 'Phẫn nộ' }
              ].map((item, idx) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    handleReaction(item.type);
                    setShowReactionPicker(false);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  className="relative group/emoji hover:scale-150 hover:-translate-y-2.5 transition-all duration-300 p-1.5 flex items-center justify-center rounded-full active:scale-95 animate-reaction-item select-none"
                  title={item.label}
                  style={{
                    animationDelay: `${idx * 40}ms`
                  }}
                >
                  <img 
                    src={getReactionEmojiUrl(item.type)} 
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-9 h-9 object-contain filter drop-shadow-sm select-none" 
                    alt={item.label} 
                  />
                  <span className="emoji-tooltip select-none">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <i className="far fa-comments text-indigo-500"></i>
          Bình luận <span className="text-slate-400 text-lg font-medium">({comments.length})</span>
        </h3>

        {/* Comment Form */}
        <div className="flex gap-4 mb-10">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-200 overflow-hidden">
            {/* Current User Avatar */}
            {currentUser?.avatarUrl ? (
              <img src={getFullUrl(currentUser.avatarUrl)} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">{getInitials(currentUser?.fullName || 'Me')}</div>
            )}
          </div>
          <form onSubmit={handlePostComment} className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ suy nghĩ của bạn..."
              className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-indigo-500 outline-none transition-all resize-none min-h-[100px] text-sm font-medium"
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đăng bình luận
              </button>
            </div>
          </form>
        </div>

        {/* Check if no comments */}
        {comments.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] mb-10 border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                currentUserId={currentUser?.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Author Profile Modal */}
      {showAuthorModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAuthorModal(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 transform transition-all scale-100 animate-scale-in relative border border-white/20" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowAuthorModal(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full p-1 mb-4 shadow-xl flex items-center justify-center overflow-hidden">
                {getSafeLogoUrl() ? (
                  <img src={getSafeLogoUrl()} alt={authorCompany?.name || 'Company'} className="w-full h-full rounded-full object-cover border-4 border-white bg-white" />
                ) : getSafeAvatarUrl() ? (
                  <img src={getSafeAvatarUrl()} alt={authorName} className="w-full h-full rounded-full object-cover border-4 border-white" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-600 font-black text-2xl">
                    {getAuthorInitials()}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{authorName}</h2>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-6">
                {(authorProfile?.role === 'RECRUITER' || article.author?.role === 'RECRUITER') ? 'Nhà tuyển dụng' : (authorProfile?.role || article.author?.role || 'Thành viên')}
              </p>

              {authorCompany ? (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 mb-6 text-left border border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Công ty đại diện</h4>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                      {getSafeLogoUrl() ? (
                        <img src={getSafeLogoUrl()} className="w-full h-full object-contain" />
                      ) : (
                        <i className="fas fa-building text-slate-300"></i>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{authorCompany?.name}</p>
                      <p className="text-xs text-slate-500">{authorCompany?.industry || 'Đa ngành'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm mb-8 px-8">Thành viên tích cực của cộng đồng CareerMate, chia sẻ kiến thức và kinh nghiệm phát triển nghề nghiệp.</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {authorCompany && (
                  <button
                    onClick={() => navigate(currentUser?.role === 'RECRUITER' ? `/recruiter/companies/${authorCompany.id}` : currentUser?.role === 'ADMIN' ? `/admin/companies/${authorCompany.id}` : `/student/companies/${authorCompany.id}`)}
                    className="col-span-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                  >
                    Xem hồ sơ công ty
                  </button>
                )}
                <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  <i className="fas fa-envelope mr-2"></i> Liên hệ
                </button>
                {/* TODO: Add logic specifically for rating if needed, currently linking to company profile has rating */}
                <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  <i className="fas fa-star mr-2"></i> Đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
