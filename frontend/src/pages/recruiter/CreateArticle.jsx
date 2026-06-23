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
      alert('Bài viết đã được gửi thành công! Đang chờ phê duyệt từ admin.');
      navigate('/recruiter/articles');
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
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          Viết bài chia sẻ
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Chia sẻ kiến thức và kinh nghiệm tuyển dụng để thu hút ứng viên tiềm năng.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => navigate('/recruiter/articles')}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 transition-colors font-medium px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg w-fit"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại danh sách</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-white/5 p-8 md:p-10 space-y-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Tiêu đề bài viết <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-lg placeholder-gray-400"
            placeholder="Nhập tiêu đề bài viết hấp dẫn..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Mô tả ngắn
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium resize-none"
            rows="3"
            placeholder="Tóm tắt nội dung bài viết (sẽ hiển thị ở danh sách bài viết)..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              URL hình ảnh đại diện
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <i className="fas fa-image"></i>
              </span>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Nội dung bài viết <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-5 py-4 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm leading-relaxed min-h-[400px]"
              placeholder="Nhập nội dung bài viết (hỗ trợ HTML cơ bản)..."
            />
            <div className="absolute top-2 right-2">
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">HTML Supported</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Tags (Thẻ từ khóa)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-5 py-3 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
              placeholder="Nhập tag và nhấn Enter để thêm..."
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <i className="fas fa-plus mr-2"></i> Thêm
            </button>
          </div>
          {formData.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800/50 min-h-[60px]">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800/30"
                >
                  <i className="fas fa-tag text-xs opacity-70"></i>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="w-5 h-5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 flex items-center justify-center transition-colors ml-1"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic pl-1">Chưa có thẻ nào được thêm.</p>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transform transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Đang gửi...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Gửi bài viết
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/articles')}
            className="px-10 py-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
