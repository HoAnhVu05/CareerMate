import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCreateArticle() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', content: '', category: 'TECHNOLOGY', thumbnail: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.createArticle(formData);
            alert('Đăng bài viết thành công!');
            navigate(-1);
        } catch (e) {
            alert('Lỗi đăng bài viết.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in relative z-10">
            <div className="p-6 pt-12 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Viết bài mới</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
                <section>
                    <div className="w-full aspect-video bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 mb-8 active:scale-95 transition-all">
                        <i className="fas fa-image text-3xl mb-2"></i>
                        <p className="text-[10px] font-black uppercase tracking-widest">Tải ảnh bìa</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tiêu đề bài viết *</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="VD: 5 lời khuyên cho Developer mới" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chủ đề</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white">
                                <option value="TECHNOLOGY">Công nghệ</option>
                                <option value="CAREER">Sự nghiệp</option>
                                <option value="SKILLS">Kỹ năng mềm</option>
                                <option value="INTERVIEW">Phỏng vấn</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Nội dung bài viết</h3>
                    <textarea name="content" required rows="10" value={formData.content} onChange={handleChange} className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[2.5rem] text-[11px] font-bold dark:text-white leading-relaxed resize-none" placeholder="Chia sẻ kiến thức của bạn tại đây..." />
                </section>

                <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-paper-plane"></i> XÁC NHẬN ĐĂNG BÀI</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
