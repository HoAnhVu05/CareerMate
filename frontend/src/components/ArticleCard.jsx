import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CompanyDetailModal from './CompanyDetailModal';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

  // If the path already includes /api at start, use origin only
  if (url.startsWith('/api')) {
    const origin = apiBase.replace(/\/api$/, '');
    return `${origin}${url}`;
  }

  const path = url.startsWith('/') ? url : `/${url}`;
  return `${apiBase}${path}`;
};

// Component for rendering nested replies recursively
function ReplyComment({ reply, onReply, replyingTo, setReplyingTo, replyContent, setReplyContent, formatDate, depth = 0 }) {
  const maxDepth = 10; // Prevent infinite nesting in UI (safety limit)
  const hasNestedReplies = reply.replies && reply.replies.length > 0;

  const replyUserName = reply.user?.fullName || 'Người dùng';
  const replyAvatarUrl = reply.user?.avatarUrl;
  const replyInitials = replyUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  // Construct full avatar URL
  const fullReplyAvatarUrl = getFullUrl(replyAvatarUrl);

  return (
    <div className="flex gap-2">
      <div className="flex-shrink-0">
        {fullReplyAvatarUrl ? (
          <img
            src={fullReplyAvatarUrl}
            alt={replyUserName}
            className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md ring-1 ring-gray-200 dark:ring-gray-800"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-gray-200 dark:ring-gray-800 ${fullReplyAvatarUrl ? 'hidden' : ''}`}>
          {replyInitials}
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-3 border border-green-200 dark:border-gray-700">
          <p className="font-bold text-xs text-gray-900 dark:text-white mb-1">
            {replyUserName}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{reply.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <i className="fas fa-clock"></i>
          <span>{formatDate(reply.createdAt)}</span>
          {depth < maxDepth && (
            <button
              onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-all flex items-center gap-1"
            >
              <i className="fas fa-reply text-xs"></i>
              Trả lời
            </button>
          )}
        </div>

        {/* Reply Input */}
        {replyingTo === reply.id && depth < maxDepth && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onReply(reply.id)}
              placeholder="Viết phản hồi..."
              className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 dark:text-white"
            />
            <button
              onClick={() => onReply(reply.id)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-semibold"
            >
              Gửi
            </button>
          </div>
        )}

        {/* Nested Replies - Recursive rendering */}
        {hasNestedReplies && depth < maxDepth && (
          <div className="mt-3 ml-4 space-y-3 border-l-4 border-teal-300 pl-4">
            {reply.replies.map((nestedReply) => (
              <ReplyComment
                key={nestedReply.id}
                reply={nestedReply}
                onReply={onReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                formatDate={formatDate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleCard({ article, onUpdate, showFullComments = false }) {
  const navigate = useNavigate();
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
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadReactions();
    loadAuthorInfo();
    if (showFullComments) {
      loadComments();
      setShowComments(true);
    }

    // Also try to load company logo if author is RECRUITER (priority over user avatar)
    if (article.author && article.author.role === 'RECRUITER') {
      api.getRecruiterByUserId(article.author.id).then(profile => {
        if (profile?.company?.logoUrl) {
          setAuthorAvatar(getFullUrl(profile.company.logoUrl));
          if (profile.company.name) {
            setAuthorName(profile.company.name);
          }
        } else if (article.author.avatarUrl) {
          setAuthorAvatar(getFullUrl(article.author.avatarUrl));
        }
      }).catch(() => {
        if (article.author.avatarUrl) {
          setAuthorAvatar(getFullUrl(article.author.avatarUrl));
        }
      });
    } else if (article.author && article.author.avatarUrl) {
      setAuthorAvatar(getFullUrl(article.author.avatarUrl));
    }
  }, [article.id, showFullComments, article.author]);

  const loadReactions = async () => {
    try {
      const counts = await api.getArticleReactionCounts(article.id);
      setReactionCounts(counts);

      try {
        const myReactionData = await api.getMyArticleReaction(article.id);
        setMyReaction(myReactionData);
      } catch (error) {
        setMyReaction(null);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const loadAuthorInfo = async () => {
    try {
      const authorDisplayName = await api.getAuthorDisplayName(article.id);
      setAuthorName(authorDisplayName);

      // Get author avatar - for RECRUITER, prioritize company logo over user avatar
      if (article.author) {
        // If author is RECRUITER, try to get company logo first
        if (article.author.role === 'RECRUITER') {
          try {
            const profile = await api.getRecruiterByUserId(article.author.id);

            let companyInfo = profile?.company;
            if (!companyInfo && profile?.companyId) {
              try {
                companyInfo = await api.getCompany(profile.companyId);
              } catch (e) { }
            }

            if (companyInfo?.logoUrl) {
              setAuthorAvatar(getFullUrl(companyInfo.logoUrl));
              if (companyInfo.name) {
                setAuthorName(companyInfo.name);
              }
              return; // Exit early if we have company logo
            }
          } catch (err) {
            console.error('Error loading recruiter/company info:', err);
          }
        }

        // Fallback: use author avatar (for STUDENT or if company logo not available)
        if (article.author.avatarUrl) {
          setAuthorAvatar(getFullUrl(article.author.avatarUrl));
          return; // Exit early if we have avatar
        }

        // If no avatarUrl in article.author, try to get from user profile (for non-recruiter)
        try {
          if (article.author.role === 'STUDENT') {
            const profile = await api.getStudentProfile?.();
            if (profile?.user?.avatarUrl) {
              setAuthorAvatar(getFullUrl(profile.user.avatarUrl));
            }
          }
        } catch (err) {
          console.error('Error loading user avatar:', err);
        }
      }
    } catch (error) {
      console.error('Error loading author info:', error);
      if (article.author) {
        setAuthorName(article.author.fullName || 'Người dùng');
        // Try to get avatar from article.author directly
        if (article.author.avatarUrl) {
          setAuthorAvatar(getFullUrl(article.author.avatarUrl));
        }
      }
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getArticleComments(article.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      await api.toggleArticleReaction(article.id, reactionType);
      await loadReactions();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.createArticleComment(article.id, newComment, replyingTo);
      setNewComment('');
      setReplyingTo(null);
      await loadComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể bình luận'));
    }
  };

  const handleReply = async (parentCommentId) => {
    if (!replyContent.trim()) return;
    try {
      await api.createArticleComment(article.id, replyContent, parentCommentId);
      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error replying:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể trả lời'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = (typeof dateString === 'string' && !dateString.includes('Z') && !dateString.includes('+') && !/-\d{2}:\d{2}$/.test(dateString))
      ? new Date(dateString + 'Z')
      : new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
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

  const handleAuthorClick = async () => {
    if (article.author?.role === 'RECRUITER') {
      try {
        const profile = await api.getRecruiterByUserId(article.author.id);

        let companyData = profile?.company;
        if (!companyData && profile?.companyId) {
          try {
            companyData = await api.getCompany(profile.companyId);
          } catch (e) { }
        }

        if (companyData) {
          setRecruiterProfile(profile);
          setCompany(companyData);
          setShowCompanyModal(true);
        } else {
          // Fallback to User Modal if no company info found
          setUserProfile({ ...profile, role: 'RECRUITER', user: article.author, fullName: authorName });
          setShowUserModal(true);
        }
      } catch (error) {
        // Fallback to User Modal on error
        setUserProfile({ user: article.author, role: 'RECRUITER', fullName: authorName });
        setShowUserModal(true);
      }
    } else if (article.author?.role === 'STUDENT') {
      try {
        const profile = await api.getStudentProfileByUserId(article.author.id);
        setUserProfile({ ...profile, role: 'STUDENT' });
        setShowUserModal(true);
      } catch (e) {
        setUserProfile({ user: article.author, role: 'STUDENT', fullName: authorName });
        setShowUserModal(true);
      }
    } else if (article.author?.role === 'ADMIN') {
      setUserProfile({ user: article.author, role: 'ADMIN', fullName: authorName });
      setShowUserModal(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900 rounded-xl shadow-lg mb-6 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      {/* Header with Avatar and Author Info */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAuthorClick}
            className="flex-shrink-0 hover:opacity-80 transition-opacity transform hover:scale-110"
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md ring-2 ring-gray-100 dark:ring-gray-800"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-gray-100 dark:ring-gray-800 ${authorAvatar ? 'hidden' : ''}`}>
              {authorName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
          <div className="flex-1">
            <button
              onClick={handleAuthorClick}
              className="text-left hover:underline group"
            >
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{authorName}</h3>
            </button>
            <div className="flex items-center gap-2 mt-1">
              <i className="fas fa-clock text-xs text-gray-400 dark:text-gray-500"></i>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(article.publishedAt || article.createdAt)}</p>
              {article.category && (
                <>
                  <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                    {article.category.replace('_', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900">
        <h2
          className="text-xl font-bold text-gray-900 dark:text-white mb-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 group"
          onClick={() => navigate(`/student/articles/${article.id}`)}
        >
          {article.title}
          <i className="fas fa-external-link-alt ml-2 text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </h2>
        {article.excerpt && (
          <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{article.excerpt}</p>
        )}

        {/* Read More Button */}
        {!isExpanded && article.content && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold mb-4 flex items-center gap-1 group"
          >
            <span>Xem thêm</span>
            <i className="fas fa-chevron-down text-xs group-hover:translate-y-0.5 transition-transform"></i>
          </button>
        )}

        {/* Full Content - Expanded */}
        {isExpanded && article.content && (
          <div className="mb-4">
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            <button
              onClick={() => setIsExpanded(false)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-3 flex items-center gap-1 group"
            >
              <span>Thu gọn</span>
              <i className="fas fa-chevron-up text-xs group-hover:-translate-y-0.5 transition-transform"></i>
            </button>
          </div>
        )}

        {article.thumbnailUrl && (
          <div className="relative overflow-hidden rounded-xl mb-4 border-2 border-gray-100 dark:border-gray-800 group cursor-pointer" onClick={() => navigate(`/student/articles/${article.id}`)}>
            <img
              src={getFullUrl(article.thumbnailUrl)}
              alt={article.title}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        )}
      </div>

      {/* Reactions Count */}
      {getTotalReactions() > 0 && (
        <div className="px-5 pb-3 flex items-center gap-2 text-sm">
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
          <span className="font-semibold text-gray-700 dark:text-gray-300">{getTotalReactions()}</span>
          {comments.length > 0 && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-600 dark:text-gray-300">
                <i className="fas fa-comment mr-1"></i>
                {comments.length}
              </span>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-around gap-2">
          <div 
            className="relative flex-1"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => handleReaction(myReaction ? null : 'LIKE')}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onContextMenu={(e) => e.preventDefault()}
              className={`w-full flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 justify-center select-none ${myReaction
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-800 text-blue-700 dark:text-blue-300 shadow-md transform scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-800 hover:shadow-sm'
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
                <span className="text-xl select-none">👍</span>
              )}
              <span className="font-semibold select-none">{myReaction ? getReactionLabel(myReaction.reactionType) : 'Thích'}</span>
            </button>

            {/* Facebook-style Reaction Picker */}
            {showReactionPicker && (
              <div 
                onContextMenu={(e) => e.preventDefault()}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-2xl px-3 py-2 border border-slate-100 dark:border-slate-800 z-30 animate-reaction-pop origin-bottom select-none"
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
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 flex-1 justify-center text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-800 hover:shadow-sm ${showComments ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-800' : ''
              }`}
            onMouseEnter={showComments ? null : loadComments}
          >
            <i className="fas fa-comment text-lg"></i>
            <span className="font-semibold">Bình luận</span>
            {article.commentsCount > 0 && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                {article.commentsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
          {/* Comment Input */}
          <div className="mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Viết bình luận..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 dark:text-white transition-all"
              />
              <button
                onClick={handleComment}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Gửi
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {comments.map((comment) => {
              const commentUserName = comment.user?.fullName || 'Người dùng';
              const commentAvatarUrl = comment.user?.avatarUrl;
              const commentInitials = commentUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

              // Construct full avatar URL
              const fullCommentAvatarUrl = getFullUrl(commentAvatarUrl);

              return (
                <div key={comment.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-600 transition-all shadow-sm">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {fullCommentAvatarUrl ? (
                        <img
                          src={fullCommentAvatarUrl}
                          alt={commentUserName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md ring-2 ring-gray-100 dark:ring-gray-800"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-gray-100 dark:ring-gray-800 ${fullCommentAvatarUrl ? 'hidden' : ''}`}>
                        {commentInitials}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                        <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                          {commentUserName}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <i className="fas fa-clock"></i>
                        <span>{formatDate(comment.createdAt)}</span>
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 hover:font-semibold transition-all flex items-center gap-1"
                        >
                          <i className="fas fa-reply text-xs"></i>
                          Trả lời
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                            placeholder="Viết phản hồi..."
                            className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleReply(comment.id)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-semibold"
                          >
                            Gửi
                          </button>
                        </div>
                      )}

                      {/* Replies - Support unlimited nested levels */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3 border-l-4 border-blue-300 dark:border-blue-600 pl-4">
                          {comment.replies.map((reply) => (
                            <ReplyComment
                              key={reply.id}
                              reply={reply}
                              onReply={handleReply}
                              replyingTo={replyingTo}
                              setReplyingTo={setReplyingTo}
                              replyContent={replyContent}
                              setReplyContent={setReplyContent}
                              formatDate={formatDate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && userProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowUserModal(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 transform transition-all scale-100 animate-scale-in relative border border-white/20" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full p-1 mb-4 shadow-xl flex items-center justify-center overflow-hidden">
                {userProfile.user?.avatarUrl || userProfile.avatarUrl ? (
                  <img src={getFullUrl(userProfile.user?.avatarUrl || userProfile.avatarUrl)} className="w-full h-full rounded-full object-cover border-4 border-white bg-white" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-600 font-black text-2xl">
                    {(userProfile.fullName || userProfile.user?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{userProfile.fullName || userProfile.user?.fullName}</h2>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-6">
                {userProfile.role === 'STUDENT' ? 'Sinh viên' : userProfile.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
              </p>

              {userProfile.role === 'STUDENT' && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 mb-6 text-left border border-slate-100 dark:border-slate-700">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-graduation-cap text-slate-400 w-6 text-center"></i>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Trường</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{userProfile.university || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <i className="fas fa-book text-slate-400 w-6 text-center"></i>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Chuyên ngành</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{userProfile.major || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {userProfile.role === 'ADMIN' && (
                <p className="text-slate-500 text-sm mb-8 px-8">Quản trị viên hệ thống CareerMate.</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                  <i className="fas fa-user-circle mr-2"></i> Xem hồ sơ
                </button>
                <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  <i className="fas fa-envelope mr-2"></i> Nhắn tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Detail Modal */}
      <CompanyDetailModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false);
          setRecruiterProfile(null);
          setCompany(null);
        }}
        company={company}
        recruiter={recruiterProfile}
        recruiterUser={article.author}
      />
    </div>
  );
}
