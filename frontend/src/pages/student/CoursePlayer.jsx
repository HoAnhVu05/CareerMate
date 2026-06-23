import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CoursePlayer() {
  const { enrollmentId, lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const progressIntervalRef = useRef(null);

  // UI States
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, notes, qna

  // Quiz States
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    loadData();
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [enrollmentId, lessonId]);

  useEffect(() => {
    if (currentLesson && enrollment) {
      startProgressTracking();
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentLesson, enrollment]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentData, progressData] = await Promise.all([
        api.getEnrollment(enrollmentId),
        api.getEnrollmentProgress(enrollmentId)
      ]);

      setEnrollment(enrollmentData);
      setAllProgress(progressData);

      if (enrollmentData.course) {
        const modulesData = await api.getCourseModules(enrollmentData.course.id);

        // Parallel load lessons
        await Promise.all(modulesData.map(async (module) => {
          if (module.id) {
            try {
              const lessons = await api.getModuleLessons(module.id);
              module.lessons = lessons || [];
            } catch (e) {
              module.lessons = [];
            }
          }
        }));
        setModules(modulesData);

        // Determine target lesson
        let targetLessonId = lessonId;
        if (!targetLessonId && modulesData.length > 0) {
          // Find first incomplete or just first lesson
          // For now just first lesson
          if (modulesData[0]?.lessons?.length > 0) {
            targetLessonId = modulesData[0].lessons[0].id;
          }
        }

        if (targetLessonId) {
          await loadLesson(targetLessonId, enrollmentData.course.id);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading course data:', error);
      setLoading(false);
      // Handle error gracefully
    }
  };

  const loadLesson = async (id, courseId) => {
    try {
      const lesson = await api.getLesson(id);
      setCurrentLesson(lesson);

      // Load progress
      try {
        const progress = await api.getLessonProgress(enrollmentId, id);
        setLessonProgress(progress);
        if (progress?.lastPositionSeconds) {
          setCurrentPosition(progress.lastPositionSeconds);
        }
      } catch (e) {
        console.warn('Reviewing lesson (no progress record found)');
      }

      // Load Quiz Integration
      if (lesson.type === 'QUIZ') {
        try {
          const quiz = await api.getCourseQuiz(courseId);
          if (quiz && quiz.questions) {
            setQuizData({
              ...quiz,
              questions: quiz.questions.map(q => ({
                ...q,
                options: q.options || [],
                // Adding explanation helpers if needed
              }))
            });

            // Check completion
            const progress = await api.getLessonProgress(enrollmentId, id).catch(() => null);
            setQuizPassed(progress?.isCompleted || false);
          }
        } catch (e) {
          console.error('Error loading quiz:', e);
        }
      }

    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        setWatchTime(currentTime);
        try {
          await api.updateLessonProgress(enrollmentId, currentLesson.id, currentTime, false);
        } catch (e) { }
      }
    }, 5000);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentPosition(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || !enrollment?.course?.id) return;

    try {
      const answersForAPI = {};
      Object.keys(quizAnswers).forEach(qId => {
        answersForAPI[qId] = String(quizAnswers[qId]);
      });

      const result = await api.submitCourseQuiz(enrollment.course.id, answersForAPI);

      // Calculate score locally if needed or use result
      const score = result.correctAnswers !== undefined ? result.correctAnswers : (result.score || 0);
      const total = result.totalQuestions || quizData.questions.length;
      const percent = (score / total) * 100;
      const passed = percent >= 50;

      setQuizScore(score);
      setQuizSubmitted(true);
      setQuizPassed(passed);

      if (passed) {
        await api.completeLesson(currentLesson.id);
        loadData(); // Refresh progress
        alert(`Chúc mừng! Bạn đạt ${percent}%. Bài học đã hoàn thành.`);
      } else {
        alert(`Bạn chỉ đạt ${percent}%. Cần 50% để qua bài. Hãy thử lại!`);
      }

    } catch (error) {
      alert('Lỗi nộp bài: ' + error.message);
    }
  };

  const getNextLesson = () => {
    if (!modules.length || !currentLesson) return null;
    if (currentLesson.type === 'QUIZ' && !quizPassed) return null;

    for (let mIdx = 0; mIdx < modules.length; mIdx++) {
      const module = modules[mIdx];
      if (!module.lessons) continue;

      const lIdx = module.lessons.findIndex(l => l.id === currentLesson.id);
      if (lIdx !== -1) {
        // Next in module
        if (lIdx < module.lessons.length - 1) return module.lessons[lIdx + 1];
        // Next module's first lesson
        if (mIdx < modules.length - 1 && modules[mIdx + 1].lessons?.length > 0) {
          return modules[mIdx + 1].lessons[0];
        }
      }
    }
    return null;
  };

  const handleNext = () => {
    const next = getNextLesson();
    if (next) {
      navigate(`/student/courses/${enrollment.course.id}/learn/${enrollmentId}/${next.id}`);
    }
  };

  const getLessonProgressStatus = (lesson) => {
    return allProgress.find(p => p.lesson?.id === lesson.id)?.isCompleted || false;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-black text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      <span className="ml-4 font-bold">Đang tải học liệu...</span>
    </div>
  );

  if (!enrollment || !currentLesson) return <div className="text-white bg-black h-screen p-10">Không tìm thấy nội dung khóa học.</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0F0F0F] text-gray-300 overflow-hidden font-sans">

      {/* 1. Header (Minimalist) */}
      <header className="h-16 bg-[#1A1A1A] border-b border-[#333] flex items-center justify-between px-4 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/student/courses/${enrollment.course.id}`)}
            className="w-10 h-10 rounded-full bg-[#333] hover:bg-[#444] flex items-center justify-center transition-colors"
            title="Quay lại chi tiết"
          >
            <i className="fas fa-chevron-left text-white"></i>
          </button>
          <h1 className="text-white font-bold text-lg line-clamp-1">{enrollment.course.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs text-gray-400">Tiến độ khóa học</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-[#333] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${(allProgress.filter(p => p.isCompleted).length / (modules.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-white">
                {Math.round((allProgress.filter(p => p.isCompleted).length / (modules.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 1)) * 100)}%
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSidebarOpen ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-[#333] hover:bg-[#444] text-gray-300'}`}
          >
            <i className={`fas fa-columns`}></i>
            {isSidebarOpen ? 'Đóng mục lục' : 'Mở mục lục'}
          </button>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Main Content (Video/Quiz/Text) */}
        <div className="flex-1 flex flex-col relative bg-black">
          {/* Player Area */}
          <div className="flex-1 relative group overflow-hidden bg-[#121212]">
            {currentLesson.type === 'VIDEO' && currentLesson.videoUrl ? (
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                controls
                className="w-full h-full object-contain focus:outline-none"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={(e) => {
                  if (currentPosition > 0) e.target.currentTime = currentPosition;
                }}
                autoPlay
              />
            ) : currentLesson.type === 'QUIZ' ? (
              <div className="absolute inset-0 w-full h-full bg-[#121212] overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto bg-[#1E1E1E] rounded-2xl p-6 md:p-10 shadow-2xl border border-[#333] mb-10">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center mx-auto mb-4 text-2xl border border-blue-500/20">
                      <i className="fas fa-brain"></i>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentLesson.title}</h2>
                    <p className="text-gray-400">Bài kiểm tra kiến thức module</p>
                  </div>

                  {!quizData ? (
                    <div className="text-center py-10">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                      <p>Đang tải câu hỏi...</p>
                    </div>
                  ) : !quizSubmitted ? (
                    <div className="space-y-6">
                      {quizData.questions.map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-xl bg-[#252525] border border-[#333] hover:border-[#444] transition-colors">
                          <p className="font-semibold text-white mb-4 text-lg">
                            <span className="text-blue-500 mr-2">Câu {idx + 1}:</span>
                            {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <label
                                key={oIdx}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${quizAnswers[q.id] === oIdx ? 'bg-blue-600/20 border-blue-500' : 'bg-[#333] hover:bg-[#444] border-transparent'} border`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  className="hidden"
                                  onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                                  checked={quizAnswers[q.id] === oIdx}
                                />
                                <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center flex-shrink-0 ${quizAnswers[q.id] === oIdx ? 'border-blue-500' : 'border-gray-500'}`}>
                                  {quizAnswers[q.id] === oIdx && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                                </div>
                                <span className={quizAnswers[q.id] === oIdx ? 'text-white' : 'text-gray-400'}>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < quizData.questions.length}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Nộp bài
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl ${quizPassed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        <i className={`fas ${quizPassed ? 'fa-check' : 'fa-times'}`}></i>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">{quizScore}/{quizData.questions.length} Câu đúng</h3>
                      <p className="text-gray-400 mb-8">{quizPassed ? 'Tuyệt vời! Bạn đã vượt qua bài kiểm tra.' : 'Rất tiếc, bạn chưa đạt yêu cầu. Hãy thử lại.'}</p>

                      {quizPassed && (
                        <button onClick={() => setQuizSubmitted(false)} className="px-6 py-2 rounded-lg bg-[#333] text-white hover:bg-[#444] font-medium transition-colors">
                          Xem lại bài làm
                        </button>
                      )}
                      {!quizPassed && (
                        <button onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                          setQuizScore(null);
                        }} className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg">
                          Làm lại bài kiểm tra
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : currentLesson.type === 'TEXT' || (!currentLesson.videoUrl && currentLesson.content) ? (
              <div className="absolute inset-0 w-full h-full bg-[#121212] overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-6 md:p-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 border-b border-gray-800 pb-4">
                    {currentLesson.title}
                  </h1>

                  <div
                    className="prose prose-invert prose-lg max-w-none 
                      text-gray-300
                      prose-headings:text-white prose-headings:font-bold 
                      prose-p:text-gray-300 prose-li:text-gray-300
                      prose-strong:text-blue-400 prose-strong:font-bold
                      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                      prose-code:text-pink-400 prose-code:bg-[#1E1E1E] prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-[#1E1E1E] prose-pre:border prose-pre:border-[#333]
                      prose-img:rounded-xl prose-img:shadow-lg
                      [&_*]:text-gray-300 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />

                  {/* Text Lesson Completion Button - Explicit action */}
                  <div className="mt-12 pt-8 border-t border-gray-800 flex justify-center">
                    {!getLessonProgressStatus(currentLesson) ? (
                      <button
                        onClick={async () => {
                          try {
                            await api.updateLessonProgress(enrollmentId, currentLesson.id, 1, true); // 1 second, completed
                            await api.completeLesson(currentLesson.id);
                            loadData(); // Refresh sidebar status
                            handleNext();
                          } catch (e) {
                            console.error("Lỗi hoàn thành bài học:", e);
                          }
                        }}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                      >
                        <span>Đánh dấu đã hoàn thành</span>
                        <i className="fas fa-check"></i>
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-[#333] hover:bg-[#444] text-white font-bold rounded-xl transition-all border border-gray-600 flex items-center gap-2"
                      >
                        <span>Đã hoàn thành. Bài tiếp theo</span>
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Định dạng bài học không hỗ trợ</p>
              </div>
            )}
          </div>

          {/* Footer/Navigation Controls */}
          <div className="bg-[#1A1A1A] border-t border-[#333] p-4 flex items-center justify-between z-20">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Ghi chú
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors" title="Bài trước">
                <i className="fas fa-step-backward"></i>
              </button>

              {/* Next Button */}
              {(() => {
                const next = getNextLesson();
                return next ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                  >
                    <span>Bài tiếp theo</span>
                    <i className="fas fa-step-forward"></i>
                  </button>
                ) : (
                  <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors opacity-50 cursor-not-allowed">
                    <span>Đã hoàn thành</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Sidebar - Curriculum (Right Side) */}
        <div
          className={`bg-[#1A1A1A] border-l border-[#333] flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80 md:w-96' : 'w-0 opacity-0 overflow-hidden'}`}
        >
          <div className="p-4 border-b border-[#333]">
            <h3 className="text-white font-bold">Nội dung khóa học</h3>
            <p className="text-xs text-gray-500 mt-1">{modules.length} chương • {modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)} bài học</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {modules.map((module, idx) => (
              <div key={module.id} className="mb-4">
                <div className="px-3 py-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 flex justify-between">
                  <span>Chương {idx + 1}</span>
                  <span className="text-[10px] bg-[#333] px-1.5 py-0.5 rounded">{module.lessons?.length} bài</span>
                </div>
                <div className="space-y-0.5">
                  {module.lessons?.map((lesson, lIdx) => {
                    const isActive = currentLesson?.id === lesson.id;
                    const isCompleted = getLessonProgressStatus(lesson);

                    let iconClass = 'fa-play-circle';
                    if (lesson.type === 'QUIZ') iconClass = 'fa-question-circle';
                    else if (lesson.type === 'TEXT') iconClass = 'fa-file-alt';

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigate(`/student/courses/${enrollment.course.id}/learn/${enrollmentId}/${lesson.id}`)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${isActive
                          ? 'bg-[#333] text-white border-l-4 border-blue-500'
                          : 'text-gray-400 hover:bg-[#252525] hover:text-gray-300'}`}
                      >
                        <div className={`mt-0.5 ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-600'}`}>
                          <i className={`fas ${iconClass}`}></i>
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-snug ${isCompleted && !isActive ? 'line-through opacity-70' : ''}`}>{lesson.title}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {lesson.durationMinutes ? `${lesson.durationMinutes} phút` : (lesson.type === 'QUIZ' ? 'Bài tập' : 'Bài đọc')}
                          </p>
                        </div>
                        {isCompleted && (
                          <i className="fas fa-check text-green-500 text-xs mt-1"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
