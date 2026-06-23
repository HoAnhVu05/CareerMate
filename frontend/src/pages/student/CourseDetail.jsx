import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, curriculum, reviews
  const [expandedModule, setExpandedModule] = useState(0); // Index of expanded module
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);

  useEffect(() => {
    loadCourse();
    checkEnrollment();
  }, [id]);

  useEffect(() => {
    if (course) {
      loadModules();
      checkEnrollment();
    }
  }, [course]);

  // Re-check enrollment when enrollment state might have changed
  useEffect(() => {
    if (course && !enrollment) {
      // Periodically check enrollment if not found (in case of async processing)
      const interval = setInterval(() => {
        checkEnrollment();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [course, enrollment]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await api.getCourse(id);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const enrollments = await api.getMyEnrollments();
      const myEnrollment = enrollments.find(e => e.course?.id === id);
      setEnrollment(myEnrollment);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const loadModules = async () => {
    try {
      const modulesData = await api.getCourseModules(id);

      // Load lessons for modules if needed
      for (const module of modulesData) {
        if (module.id && (!module.lessons || module.lessons.length === 0)) {
          try {
            const lessons = await api.getModuleLessons(module.id);
            module.lessons = lessons;
          } catch (error) {
            console.error(`Error loading lessons for module ${module.id}:`, error);
            module.lessons = [];
          }
        }
      }
      setModules(modulesData);
    } catch (error) {
      console.error('Error loading modules:', error);
      setModules([]);
    }
  };

  const handleEnroll = async () => {
    setIsEnrollLoading(true);
    try {
      if (course.isPremium) {
        // Premium handling (simplified for now)
        try {
          const subscription = await api.getMySubscription();
          if (!subscription || !subscription.isActive) {
            if (confirm('Khóa học này yêu cầu gói Premium. Bạn có muốn mua gói Premium không?')) {
              navigate('/student/packages');
            }
            return;
          }
        } catch (subError) {
          if (confirm('Khóa học này yêu cầu gói Premium. Bạn có muốn mua gói Premium không?')) {
            navigate('/student/packages');
          }
          return;
        }
      }

      const enrollmentData = await api.enrollCourse(id);
      const updatedEnrollment = await checkEnrollment();
      const finalEnrollment = updatedEnrollment || enrollmentData;

      if (!course.isPremium) {
        // Auto navigate for free courses
        setTimeout(() => {
          // Logic to find first lesson
          if (modules.length > 0 && modules[0].lessons?.length > 0) {
            const firstLessonId = modules[0].lessons[0].id;
            const enrollId = finalEnrollment?.id || enrollmentData?.id;
            if (enrollId) {
              navigate(`/student/courses/${id}/learn/${enrollId}/${firstLessonId}`);
            } else {
              window.location.reload();
            }
          } else {
            window.location.reload();
          }
        }, 500);
      } else {
        alert('Đã đăng ký khóa học thành công!');
      }

    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể đăng ký'));
    } finally {
      setIsEnrollLoading(false);
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

  // Calculate total lessons
  const totalLessons = modules.reduce((acc, curr) => acc + (curr.lessons?.length || 0), 0);


  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) return <div className="text-center py-20">Không tìm thấy khóa học</div>;

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen pb-20">

      {/* 1. Hero Section (Full Width) */}
      <div className="bg-[#1a1f3c] text-white pt-10 pb-20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Hero Content (Left, 70%) */}
            <div className="md:w-2/3">
              <div className="flex items-center gap-2 mb-4">
                <Link to="/student/courses" className="text-blue-300 hover:text-white transition-colors text-sm font-semibold">
                  <i className="fas fa-arrow-left mr-1"></i> Khóa học
                </Link>
                <span className="text-gray-500">/</span>
                <span className="text-blue-200 text-sm font-bold uppercase tracking-wider">{course.category}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6 max-w-2xl leading-relaxed">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-300">
                <span className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-400"></i> 4.8 (120 đánh giá)
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-user-friends text-blue-400"></i> 1,543 học viên
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-globe text-green-400"></i> Tiếng Việt
                </span>
                <span className="flex items-center gap-2">
                  <i className="fas fa-clock text-pink-400"></i> {course.durationHours || 4} giờ học
                </span>
              </div>
            </div>

            {/* The sticky card will be in the content area, but we put a placeholder here/or hidden on mobile if needed */}
          </div>
        </div>
      </div>

      {/* 2. Main Content Area (2 Columns) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left Column: Details (65-70%) */}
          <div className="md:w-2/3">

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm px-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'curriculum' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Nội dung khóa học
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Đánh giá
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 md:p-8 min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-bold mb-4 dark:text-white">Bạn sẽ học được gì?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-3">
                        <i className="fas fa-check text-green-500 mt-1"></i>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">Hiểu rõ nền tảng và tư duy cốt lõi.</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mb-4 dark:text-white">Mô tả chi tiết</h3>
                  <div
                    className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: course.content || '<p>Đang cập nhật nội dung chi tiết...</p>' }}
                  />
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Nội dung khóa học</h3>
                    <span className="text-sm text-gray-500">{modules.length} phần • {totalLessons} bài học</span>
                  </div>

                  <div className="space-y-4">
                    {modules.map((module, idx) => (
                      <div key={module.id} className="border dark:border-gray-700 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedModule(expandedModule === idx ? -1 : idx)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                        >
                          <div className="flex items-center gap-3 font-bold text-gray-800 dark:text-white">
                            <i className={`fas fa-chevron-${expandedModule === idx ? 'up' : 'down'} text-xs text-gray-400`}></i>
                            {module.title}
                          </div>
                          <span className="text-xs text-gray-500">{module.lessons?.length || 0} bài</span>
                        </button>

                        {expandedModule === idx && (
                          <div className="bg-white dark:bg-gray-900 divide-y dark:divide-gray-800">
                            {module.lessons?.map((lesson, lIdx) => (
                              <div key={lesson.id} className="p-3 pl-10 flex items-start justify-between hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer gap-4">
                                <div className="flex gap-3 flex-1">
                                  <div className="mt-1">
                                    <i className={`fas ${lesson.type === 'VIDEO' ? 'fa-play-circle' : lesson.type === 'QUIZ' ? 'fa-question-circle' : 'fa-file-alt'} text-gray-400 group-hover:text-blue-500 text-sm`}></i>
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-0.5">
                                      {lesson.title}
                                    </div>
                                    {lesson.description && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{lesson.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1">
                                      {lesson.durationMinutes > 0 && (
                                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          <i className="far fa-clock text-[9px]"></i> {lesson.durationMinutes} phút
                                        </span>
                                      )}
                                      <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                        {lesson.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {lesson.isPreview && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded whitespace-nowrap h-fit">Học thử</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="text-center py-12">
                  <img src="https://img.icons8.com/3d-fluency/94/comments.png" alt="Reviews" className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Enrollment Card (30-35%) */}
          <div className="md:w-1/3 relative">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Preview Image/Sticker Area */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative p-6">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 to-indigo-400"></div>
                  <img
                    src={getCourseIcon(course)}
                    alt={course.title}
                    className="w-32 h-32 object-contain drop-shadow-2xl filter brightness-110"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://img.icons8.com/3d-fluency/94/graduation-cap.png"; }}
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 hover:scale-100 transition-transform">
                      <i className="fas fa-play text-blue-600 text-xl ml-1"></i>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-end gap-2 mb-6">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {course.price === 0 || !course.isPremium ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(course.price)}đ`}
                    </span>
                    {course.price > 0 && <span className="text-gray-400 line-through text-sm mb-1">{new Intl.NumberFormat('vi-VN').format(course.price * 1.5)}đ</span>}
                  </div>

                  {enrollment ? (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 border border-green-100 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-400 font-bold mb-2 flex items-center gap-2">
                        <i className="fas fa-check-circle"></i> Đã đăng ký
                      </p>
                      <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mb-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${enrollment.progressPercentage || 0}%` }}></div>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 text-right">{enrollment.progressPercentage}% hoàn thành</p>

                      <button
                        onClick={() => {
                          // Logic to continue learning
                          if (modules.length > 0 && modules[0].lessons?.length > 0) {
                            const firstLessonId = modules[0].lessons[0].id; // Simplified, should find last accessed
                            navigate(`/student/courses/${id}/learn/${enrollment.id}/${firstLessonId}`);
                          }
                        }}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-500/30"
                      >
                        Tiếp tục học
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={isEnrollLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-blue-500/30 mb-4 transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isEnrollLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          {course.price === 0 || !course.isPremium ? 'Đăng ký ngay' : 'Mua khóa học'}
                          <i className="fas fa-arrow-right"></i>
                        </>
                      )}
                    </button>
                  )}

                  <p className="text-xs text-center text-gray-500 mb-6">Đảm bảo hoàn tiền trong 30 ngày. Hủy bất cứ lúc nào.</p>

                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Khóa học bao gồm:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                      <li className="flex items-center gap-3">
                        <i className="fas fa-video text-blue-500 w-4"></i> {course.durationHours || 4} giờ video
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="fas fa-file-alt text-blue-500 w-4"></i> {totalLessons} bài học
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="fas fa-mobile-alt text-blue-500 w-4"></i> Truy cập trên mọi thiết bị
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="fas fa-infinity text-blue-500 w-4"></i> Truy cập trọn đời
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="fas fa-certificate text-blue-500 w-4"></i> Cấp chứng chỉ hoàn thành
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div >
    </div >
  );
}
