import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function CVTemplatesManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateHtml: '',
    templateCss: '',
    category: '',
    isPremium: false,
    previewImageUrl: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminCVTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.updateCVTemplate(editingTemplate.id, formData);
        alert('Cập nhật template thành công!');
      } else {
        await api.createCVTemplate(formData);
        alert('Tạo template thành công!');
      }
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể lưu template'));
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || '',
      description: template.description || '',
      templateHtml: template.templateHtml || '',
      templateCss: template.templateCss || '',
      category: template.category || '',
      isPremium: template.isPremium || false,
      previewImageUrl: template.previewImageUrl || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (templateId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa template này?')) return;

    try {
      await api.deleteCVTemplate(templateId);
      alert('Xóa template thành công!');
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa template'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      templateHtml: '',
      templateCss: '',
      category: '',
      isPremium: false,
      previewImageUrl: ''
    });
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold tracking-wider animate-pulse uppercase">Đang xây dựng thư viện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Quản lý CV Templates</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Cung cấp các giải pháp trình bày hồ sơ chuyên nghiệp</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingTemplate(null); resetForm(); }}
          className={`flex items-center gap-3 px-8 py-4 ${showForm ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20'} rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-lg transition-all hover:-translate-y-1`}
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus-circle'} text-lg`}></i>
          <span>{showForm ? 'Đóng trình soạn' : 'Thiết kế mẫu mới'}</span>
        </button>
      </div>

      {/* Editor Form Modal-like */}
      {showForm && (
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl animate-slide-up">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
              <i className="fas fa-magic"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {editingTemplate ? 'Tinh chỉnh Template' : 'Thiết kế mới'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Tên định danh</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl outline-none transition-all font-bold dark:text-white"
                  placeholder="Ví dụ: Modern Tech Resume v1"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Ngành nghề phù hợp</label>
                <input
                  type="text" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl outline-none transition-all font-bold dark:text-white"
                  placeholder="IT, Design, Marketing..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Mô tả đặc tính</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl outline-none transition-all font-medium dark:text-white min-h-[80px] resize-none"
                placeholder="Mẫu CV tối giản, tập trung vào kỹ năng chuyên môn..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Cấu trúc HTML (Body)</label>
                <textarea
                  required value={formData.templateHtml}
                  onChange={(e) => setFormData({ ...formData, templateHtml: e.target.value })}
                  className="w-full px-6 py-6 bg-slate-900 text-emerald-400 font-mono text-sm leading-relaxed rounded-2xl outline-none border-2 border-transparent focus:border-emerald-500/30 min-h-[300px] custom-scrollbar"
                  placeholder="<div class='resume-container'>...</div>"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">Định dạng CSS</label>
                <textarea
                  value={formData.templateCss}
                  onChange={(e) => setFormData({ ...formData, templateCss: e.target.value })}
                  className="w-full px-6 py-6 bg-slate-900 text-blue-400 font-mono text-sm leading-relaxed rounded-2xl outline-none border-2 border-transparent focus:border-blue-500/30 min-h-[300px] custom-scrollbar"
                  placeholder=".resume-container { ... }"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-2">URL Hình ảnh xem trước</label>
                <input
                  type="url" value={formData.previewImageUrl}
                  onChange={(e) => setFormData({ ...formData, previewImageUrl: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl outline-none transition-all font-medium text-xs dark:text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox" checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
                <div>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300 block uppercase tracking-widest">Premium Template</span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter">Yêu cầu tài khoản cao cấp</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" className="flex-1 px-10 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all">
                {editingTemplate ? 'Cập nhật thay đổi' : 'Tạo mới nội dung'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingTemplate(null); resetForm(); }}
                className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div key={template.id} className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
              {template.previewImageUrl ? (
                <img
                  src={template.previewImageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <i className="fas fa-file-invoice text-slate-300 text-5xl opacity-50"></i>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 gap-4">
                <button
                  onClick={() => handleEdit(template)}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                >
                  <i className="fas fa-pencil-alt mr-2"></i>Chỉnh sửa thiết kế
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="w-full py-4 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
                  style={{ transitionDelay: '50ms' }}
                >
                  <i className="fas fa-trash-alt mr-2"></i>Gỡ bỏ template
                </button>
              </div>

              {template.isPremium && (
                <div className="absolute top-6 right-6 px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                  <i className="fas fa-crown mr-2"></i>Premium
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors uppercase leading-tight line-clamp-1">{template.name}</h3>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-wider">{template.category || 'N/A'}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                {template.description || 'Không có mô tả chi tiết cho mẫu thiết kế này.'}
              </p>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-file-invoice text-slate-400 text-3xl"></i>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Thư viện đang trống</p>
            <button onClick={() => setShowForm(true)} className="mt-8 text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline">Hãy tạo mẫu đầu tiên ngay!</button>
          </div>
        )}
      </div>
    </div>
  );
}

