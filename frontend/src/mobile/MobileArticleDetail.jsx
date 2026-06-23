import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileArticleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        loadArticle();
        loadComments();
    }, [id]);

    const loadArticle = async () => {
        try {
            setLoading(true);
            const data = await api.getArticle(id);
            setArticle(data);
        } catch (error) {
            console.error('Error loading article:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            const data = await api.getArticleComments(id);
            setComments(data || []);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        try {
            await api.createArticleComment(id, newComment);
            setNewComment('');
            loadComments();
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };



    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải bài viết...</p>
        </div>
    );

    if (!article) return <div className="p-10 text-center">Không tìm thấy bài viết.</div>;

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in relative z-10">
            {/* Immersive Header */}
            <div className="relative h-72">
                <img
                    src={api.getFileUrl(article.thumbnailUrl)}
                    className="w-full h-full object-cover"
                    alt="Header"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white dark:to-slate-950"></div>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
            </div>

            {/* Title Section */}
            <div className="px-6 -mt-10 relative z-20">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-4 inline-block">
                        {article.category || 'THÔNG TIN'}
                    </span>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-6">{article.title}</h1>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
                            <img
                                src={api.getFileUrl(article.author?.avatarUrl) || `https://ui-avatars.com/api/?name=${article.author?.fullName || 'A'}&background=random`}
                                className="w-full h-full object-cover"
                                alt="Author"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{article.author?.fullName || 'CareerMate Team'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Năm kinh nghiệm • 12/03/2024</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-8 mt-10">
                <div
                    className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </div>

            {/* Share & Like Stats */}
            <div className="px-8 mt-10 flex gap-6 border-y border-slate-50 dark:border-slate-900/50 py-6">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                    <i className="far fa-heart text-lg text-rose-500"></i> {article.likesCount || 0} Lượt thích
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                    <i className="far fa-eye text-lg text-blue-500"></i> {article.viewsCount || 0} Lượt xem
                </div>
            </div>

            {/* Comments Section */}
            <div className="px-8 mt-10">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-8">Bình luận ({comments.length})</h3>

                <div className="flex gap-4 mb-10">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0"></div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Chia sẻ suy nghĩ..."
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-600 transition-all min-h-[100px]"
                        ></textarea>
                        <button
                            onClick={handlePostComment}
                            className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30"
                        >
                            ĐĂNG BÌNH LUẬN
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-200">
                                <img
                                    src={api.getFileUrl(comment.user?.avatarUrl) || `https://ui-avatars.com/api/?name=${comment.user?.fullName || 'U'}&background=random`}
                                    className="w-full h-full object-cover"
                                    alt="User"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">{comment.user?.fullName || 'Người dùng'}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{comment.content}</p>
                                </div>
                                <button className="mt-2 ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Trả lời</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sticky Interaction Bar (Optional, for now just bottom padding) */}
        </div>
    );
}
