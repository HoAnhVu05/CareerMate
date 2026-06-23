import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';

export default function Articles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 500);
    return () => clearTimeout(debounceTimerRef.current);
  }, [searchKeyword]);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, debouncedKeyword]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getArticles(debouncedKeyword, selectedCategory);
      setArticles(data.content || data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'CAREER', label: 'Sự nghiệp' },
    { value: 'SKILLS', label: 'Kỹ năng' },
    { value: 'TECHNOLOGY', label: 'Công nghệ' },
    { value: 'INTERVIEW', label: 'Phỏng vấn' },
    { value: 'CV', label: 'Hồ sơ CV' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black font-sans pb-12">
      {/* Feed Header / Filter Bar - Transparent & Floating */}
      <div className="sticky top-0 z-30 px-6 md:px-8 py-4 pointer-events-none">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {/* Search Bar - Glass Effect */}
          <div className="flex-1 bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-full px-5 py-2.5 flex items-center gap-3 border border-white/40 dark:border-white/10 shadow-lg pointer-events-auto transition-all focus-within:bg-white/80 dark:focus-within:bg-black/80 focus-within:shadow-xl focus-within:scale-[1.02]">
            <i className="fas fa-search text-gray-500 dark:text-gray-400"></i>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full text-gray-900 dark:text-white placeholder-gray-500 font-medium"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Filter - Glass Effect */}
          <div className="relative pointer-events-auto group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white/60 dark:bg-black/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full pl-5 pr-10 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer shadow-lg hover:bg-white/80 dark:hover:bg-black/80 transition-all"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors"></i>
          </div>
        </div>
        {/* Optional Gradient Fade at top to ensure text doesn't clash too harshly if it scrolls under immediately? 
             Actually user asked for transparent, so leaving it clean. 
         */}
      </div>

      {/* Main Feed Content */}
      <div className="max-w-2xl mx-auto px-4 mt-2">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 dark:border-gray-800">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-newspaper text-3xl text-gray-400"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Không có bài viết nào</h2>
            <p className="text-gray-500 text-sm">Hãy thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.</p>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {articles.map((article, index) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ArticleCard
                  article={article}
                  onUpdate={loadArticles}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
