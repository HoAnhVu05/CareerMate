import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CreateArticle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    thumbnailUrl: ''
  });
  const [tagInput, setTagInput] = useState('');

  const categories = [
    { value: 'CAREER', label: 'Nghề nghiệp' },
    { value: 'SKILLS', label: 'Kỹ năng' },
    { value: 'INTERVIEW', label: 'Phỏng vấn' },
    { value: 'CV', label: 'CV & Resume' },
    { value: 'JOB_SEARCH', label: 'Tìm việc' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createArticle(formData);
      alert('Bài viết đã được đăng thành công!');
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể tạo bài viết'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/admin/articles')}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500 transition-all shadow-sm"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Soạn thảo bài viết</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Chia sẻ kiến thức và định hướng nghề nghiệp cho cộng đồng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Editor Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl space-y-8 animate-slide-up">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Tiêu đề nội dung</label>
              <input
                type="text" required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-8 py-5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-950 rounded-3xl outline-none transition-all text-xl font-bold dark:text-white placeholder:text-slate-400"
                placeholder="Ví dụ: 10 bước chuẩn bị phỏng vấn hiệu quả..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Mô tả tóm tắt (Excerpt)</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-8 py-5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-950 rounded-3xl outline-none transition-all text-sm font-medium dark:text-white placeholder:text-slate-400 min-h-[100px] resize-none"
                placeholder="Một đoạn mô tả ngắn để lôi cuốn người đọc..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Nội dung chi tiết</label>
              <div className="relative">
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-8 py-8 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-950 rounded-[2rem] outline-none transition-all text-base font-medium dark:text-white placeholder:text-slate-400 min-h-[500px]"
                  placeholder="Hãy bắt đầu câu chuyện của bạn tại đây..."
                />
                <div className="absolute bottom-6 right-8 flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
                  <span>HTML Support</span>
                  <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                  <span>Draft Saved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit" disabled={loading}
              className="flex-1 px-10 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1 hover:brightness-110 disabled:opacity-50"
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-3`}></i>
              {loading ? 'Đang xuất bản...' : 'Xuất bản bài viết'}
            </button>
            <button
              type="button" onClick={() => navigate('/admin/articles')}
              className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
            >
              Hủy bỏ
            </button>
          </div>
        </form>

        {/* Sidebar Settings */}
        <div className="lg:col-span-4 space-y-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-8 shadow-xl space-y-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Thiết lập chung</h3>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Phân loại danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all text-sm font-bold dark:text-white appearance-none"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Hình ảnh đại diện (URL)</label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all text-xs font-medium dark:text-white"
                placeholder="https://..."
              />
              {formData.thumbnailUrl && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-2 overflow-hidden bg-slate-50 dark:bg-slate-900/50 group">
                  <img src={formData.thumbnailUrl} alt="Preview" className="w-full aspect-video object-cover rounded-xl transition-transform group-hover:scale-105 duration-700" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Từ khóa gán thẻ (Tags)</label>
              <div className="relative">
                <input
                  type="text" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl outline-none transition-all text-xs font-medium dark:text-white pr-16"
                  placeholder="Gõ tag và Enter..."
                />
                <button
                  type="button" onClick={handleAddTag}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black shadow-sm"
                >
                  GỬI
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30 group/tag"
                  >
                    {tag}
                    <button
                      type="button" onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <i className="fas fa-lightbulb text-2xl opacity-50 mb-4 block"></i>
            <h4 className="font-black text-lg tracking-tight">Tip biên tập:</h4>
            <p className="text-sm font-medium opacity-80 leading-relaxed">Sử dụng các thẻ HTML đơn giản như &lt;b&gt;, &lt;h2&gt; để làm nổi bật các ý chính trong bài viết của bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

