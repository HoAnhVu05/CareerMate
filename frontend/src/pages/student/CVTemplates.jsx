import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function CVTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, showFreeOnly]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      let data;
      if (showFreeOnly) {
        data = await api.getFreeCVTemplates();
      } else {
        data = await api.getCVTemplates(selectedCategory);
      }
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const categories = [
    { value: '', label: 'Tất cả', icon: 'fas fa-border-all' },
    { value: 'MODERN', label: 'Hiện đại', icon: 'fas fa-bolt' },
    { value: 'CLASSIC', label: 'Chuyên nghiệp', icon: 'fas fa-briefcase' },
    { value: 'CREATIVE', label: 'Sáng tạo', icon: 'fas fa-paint-brush' },
    { value: 'MINIMALIST', label: 'Tối giản', icon: 'fas fa-stream' },
  ];

  const getGradient = (type) => {
    switch (type) {
      case 'MODERN': return 'from-blue-600 to-indigo-700';
      case 'CREATIVE': return 'from-fuchsia-600 to-purple-700';
      case 'MINIMALIST': return 'from-slate-700 to-slate-900';
      case 'CLASSIC': return 'from-emerald-600 to-teal-700';
      default: return 'from-blue-600 to-cyan-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transform -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transform translate-y-1/2"></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-16 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-4 animate-fade-in-up">
            <i className="fas fa-sparkles mr-2"></i>
            Thiết kế bởi chuyên gia HR
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight animate-fade-in-up animation-delay-100">
            Tạo CV Ấn Tượng <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Chinh Phục Nhà Tuyển Dụng
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            Chọn một mẫu CV chuyên nghiệp, nhập thông tin của bạn và tải xuống chỉ trong vài phút.
            Tối ưu hóa cho hệ thống ATS và gây ấn tượng mạnh mẽ.
          </p>

          {/* Filter Bar */}
          <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl shadow-blue-500/10 rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-4 border border-white/20 dark:border-white/5 animate-fade-in-up animation-delay-300">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide px-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat.value
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  <i className={cat.icon}></i>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Free Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Chỉ hiện miễn phí</span>
              <button
                onClick={() => setShowFreeOnly(!showFreeOnly)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${showFreeOnly ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${showFreeOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[1/1.414] bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse overflow-hidden relative">
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gray-100 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              😕
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy mẫu nào</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc xem sao nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative perspective-1000"
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 group-hover:-translate-y-2 border border-slate-200 dark:border-slate-700">

                  {/* Preview Image Container */}
                  <div className="relative aspect-[1/1.0] overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      {template.isPremium && (
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/20 flex items-center gap-1">
                          <i className="fas fa-crown"></i> PRO
                        </span>
                      )}
                      <span className="bg-white/90 dark:bg-black/70 backdrop-blur text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                        {categories.find(c => c.value === template.category)?.label || template.category}
                      </span>
                    </div>

                    {/* Image */}
                    {template.previewImageUrl ? (
                      <img
                        src={getFullUrl('/users/' + template.previewImageUrl)}
                        alt={template.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    {/* Fallback & Overlay */}
                    <div className={`absolute inset-0 flex-col items-center justify-center bg-gradient-to-br ${getGradient(template.category)} ${template.previewImageUrl ? 'hidden' : 'flex'}`}>
                      <i className="fas fa-file-invoice text-7xl text-white/80 mb-4 drop-shadow-md"></i>
                      <span className="text-white font-bold tracking-widest uppercase text-sm border-b-2 border-white/30 pb-1">Review</span>
                    </div>

                    {/* Hover Overlay Action */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
                      <Link to={`/student/cv-templates/${template.id}`}>
                        <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:scale-105 flex items-center gap-2">
                          <i className="fas fa-magic text-indigo-600"></i>
                          Sử dụng mẫu này
                        </button>
                      </Link>
                      <button className="text-white font-medium hover:underline text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <i className="fas fa-eye mr-2"></i> Xem chi tiết
                      </button>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 bg-white dark:bg-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                      {template.description || 'Thiết kế chuyên nghiệp, tối ưu logic, giúp bạn nổi bật trước nhà tuyển dụng.'}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-users text-slate-400"></i>
                        1.2k lượt dùng
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <i className="fas fa-star"></i>
                        4.9
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
        }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}
