import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CourseCard = ({ course, isHovered, onHover, onLeave, className }) => {
  // Default to fixed width for scroll rows if no class provided, but allow override
  const baseClass = className || "w-72 md:w-80 flex-shrink-0";

  return (
    <div
      className={`relative h-[320px] rounded-xl transition-all duration-300 transform hover:scale-105 hover:z-20 cursor-pointer group ${baseClass}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md dark:shadow-gray-900/50 group-hover:shadow-xl dark:border-gray-800 border border-transparent dark:border">
        {/* Thumbnail Area - STICKER MODE ONLY */}
        <div className="relative h-44 bg-gray-50 dark:bg-gray-800 overflow-hidden group-hover:bg-blue-50/50 dark:group-hover:bg-gray-800 transition-colors">
          {/* Background Pattern */}
          <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${getGradient(course.category)}`}></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={getCourseIcon(course)}
              alt={course.title}
              className="w-24 h-24 object-contain drop-shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://img.icons8.com/3d-fluency/94/graduation-cap.png";
              }}
            />
          </div>

          <div className="absolute top-2 right-2">
            {!course.isPremium || course.price === 0 ? (
              <span className="bg-green-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">MIỄN PHÍ</span>
            ) : (
              <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">PREMIUM</span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col h-[calc(100%-11rem)] justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {course.category || 'General'}
              </span>
              <span className="text-[10px] font-medium text-gray-400">
                {course.level || 'All Levels'}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-gray-100 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
              <span className="flex items-center gap-1">
                <i className="far fa-clock"></i> {course.durationHours || 4}h
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-star text-yellow-400"></i> 4.8
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-user-graduate"></i> 1.2k
              </span>
            </div>

            <Link
              to={`/student/courses/${course.id}`}
              className="block w-full py-2.5 text-center bg-gray-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseRow = ({ title, courses, icon, color }) => {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { current } = rowRef;
      const scrollAmount = direction === 'left' ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!courses || courses.length === 0) return null;

  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white text-md shadow-lg shadow-blue-500/20`}>
            <i className={icon}></i>
          </div>
          {title}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors">
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors">
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-6 overflow-x-auto pb-10 pt-4 px-2 snap-x scroll-smooth custom-scrollbar hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {courses.map((course, idx) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

// ... Helper Functions ...
const getGradient = (category) => {
  switch (category) {
    case 'TECHNICAL': return 'from-blue-400 to-cyan-300';
    case 'SOFT_SKILLS': return 'from-purple-400 to-pink-300';
    case 'CAREER': return 'from-amber-300 to-orange-400';
    default: return 'from-emerald-400 to-teal-300';
  }
};

const getCourseIcon = (course) => {
  const title = course.title?.toLowerCase() || '';
  const cat = course.category;

  // 3D Fluency Icons (Icons8)
  const icons = {
    java: "https://img.icons8.com/3d-fluency/94/java-coffee-cup-logo.png",
    python: "https://img.icons8.com/3d-fluency/94/python.png",
    js: "https://img.icons8.com/3d-fluency/94/javascript.png",
    react: "https://img.icons8.com/3d-fluency/94/react.png",
    spring: "https://img.icons8.com/3d-fluency/94/spring-logo.png",
    db: "https://img.icons8.com/3d-fluency/94/database.png",
    cloud: "https://img.icons8.com/3d-fluency/94/cloud-storage.png",
    code: "https://img.icons8.com/3d-fluency/94/source-code.png",
    soft: "https://img.icons8.com/3d-fluency/94/handshake.png",
    career: "https://img.icons8.com/3d-fluency/94/rocket.png",
    interview: "https://img.icons8.com/3d-fluency/94/microphone.png",
    default: "https://img.icons8.com/3d-fluency/94/graduation-cap.png"
  };

  if (title.includes('java')) return icons.java;
  if (title.includes('python')) return icons.python;
  if (title.includes('javascript') || title.includes('js')) return icons.js;
  if (title.includes('react')) return icons.react;
  if (title.includes('spring')) return icons.spring;
  if (title.includes('sql') || title.includes('data')) return icons.db;
  if (title.includes('cloud') || title.includes('aws')) return icons.cloud;

  if (cat === 'TECHNICAL') return icons.code;
  if (cat === 'SOFT_SKILLS') return icons.soft;
  if (cat === 'CAREER') return icons.career;
  if (cat === 'INTERVIEW') return icons.interview;

  return icons.default;
};

export default function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Categorized State
  const [techCourses, setTechCourses] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses('');
      const courses = Array.isArray(data) ? data : [];
      setAllCourses(courses);

      // Categorize
      setTechCourses(courses.filter(c => c.category === 'TECHNICAL' || c.title.toLowerCase().includes('java') || c.title.toLowerCase().includes('react') || c.title.toLowerCase().includes('lập trình')));
      setSoftSkills(courses.filter(c => c.category === 'SOFT_SKILLS' || c.category === 'CAREER' || c.category === 'INTERVIEW'));
      setFreeCourses(courses.filter(c => !c.isPremium || c.price === 0));

    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = allCourses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 pb-20">

      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white mb-12 shadow-2xl animate-fade-in h-[380px] border border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-[0.2em] mb-6 text-blue-200 shadow-lg">
            CareerMate Learning
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold mb-6 leading-tight tracking-tight drop-shadow-lg">
            Nâng tầm sự nghiệp với<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-300 animate-gradient-x">Kỹ năng thực tế</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed font-light">
            Hơn 100+ khóa học chất lượng cao từ lập trình, thiết kế đến kỹ năng mềm.
            Học trực tuyến mọi lúc, mọi nơi.
          </p>

          <div className="relative w-full max-w-lg group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:bg-blue-500/30 transition-all opacity-0 group-hover:opacity-100"></div>
            <input
              type="text"
              placeholder="Tìm khóa học bạn quan tâm..."
              className="relative w-full pl-14 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 focus:bg-white/90 focus:text-slate-900 outline-none transition-all placeholder-white/50 focus:placeholder-slate-500 shadow-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className={`fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-xl transition-colors ${searchTerm ? 'text-slate-500 z-10' : 'text-white/60'}`}></i>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-lg text-blue-500"></div>
        </div>
      ) : searchTerm ? (
        // Search Results Grid
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pl-2 border-l-4 border-blue-500">
            Kết quả tìm kiếm ({filteredCourses.length})
          </h2>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, idx) => (
                <CourseCard key={course.id} course={course} className="w-full" />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <img src="https://img.icons8.com/3d-fluency/94/search.png" alt="No results" className="mx-auto mb-4 w-24 h-24 opacity-50" />
              <p className="text-slate-500 dark:text-slate-400">Không tìm thấy khóa học nào phù hợp.</p>
            </div>
          )}
        </div>
      ) : (
        // Dashboard Rows
        <div className="space-y-4">
          <CourseRow
            title="Khóa học Công nghệ"
            courses={techCourses}
            icon="fas fa-code"
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
          />

          <CourseRow
            title="Phát triển kỹ năng"
            courses={softSkills}
            icon="fas fa-magic"
            color="bg-gradient-to-br from-purple-500 to-fuchsia-600"
          />

          <CourseRow
            title="Khóa học Miễn phí"
            courses={freeCourses}
            icon="fas fa-gift"
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        </div>
      )}
    </div>
  );
}
