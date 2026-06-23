import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCoursePlayer() {
    const { enrollmentId, lessonId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [enrollment, setEnrollment] = useState(null);
    const [modules, setModules] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [allProgress, setAllProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCurriculum, setShowCurriculum] = useState(false);

    useEffect(() => {
        loadData();
    }, [enrollmentId, lessonId]);

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
                // Load lessons
                await Promise.all(modulesData.map(async (m) => {
                    const lessons = await api.getModuleLessons(m.id);
                    m.lessons = lessons || [];
                }));
                setModules(modulesData);

                let targetId = lessonId;
                if (!targetId && modulesData.length > 0 && modulesData[0].lessons.length > 0) {
                    targetId = modulesData[0].lessons[0].id;
                }

                if (targetId) {
                    const lesson = await api.getLesson(targetId);
                    setCurrentLesson(lesson);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonComplete = async () => {
        if (!currentLesson) return;
        try {
            await api.completeLesson(currentLesson.id);
            // Auto navigate to next if possible
            const next = getNextLesson();
            if (next) {
                navigate(`/mobile/courses/learn/${enrollmentId}/${next.id}`);
            } else {
                alert("Chúc mừng! Bạn đã hoàn thành bài học này.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getNextLesson = () => {
        if (!modules.length || !currentLesson) return null;
        for (let mIdx = 0; mIdx < modules.length; mIdx++) {
            const mod = modules[mIdx];
            const lIdx = mod.lessons.findIndex(l => l.id === currentLesson.id);
            if (lIdx !== -1) {
                if (lIdx < mod.lessons.length - 1) return mod.lessons[lIdx + 1];
                if (mIdx < modules.length - 1 && modules[mIdx + 1].lessons.length > 0) {
                    return modules[mIdx + 1].lessons[0];
                }
            }
        }
        return null;
    };

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white font-black uppercase text-xs tracking-widest animate-pulse">Đang tải học liệu...</div>;
    if (!currentLesson) return <div className="p-20 text-center">Không thấy bài học.</div>;

    const isCompleted = allProgress.find(p => p.lesson?.id === currentLesson.id)?.isCompleted;

    return (
        <div className="h-screen bg-black flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="h-14 bg-black/50 backdrop-blur-md flex items-center px-4 justify-between z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                    <i className="fas fa-times"></i>
                </button>
                <h1 className="text-white text-[10px] font-black uppercase tracking-tighter truncate max-w-[200px]">{currentLesson.title}</h1>
                <button
                    onClick={() => setShowCurriculum(!showCurriculum)}
                    className="text-white text-xs font-black uppercase tracking-widest"
                >
                    Mục lục
                </button>
            </div>

            {/* Player Area */}
            <div className="flex-1 relative flex items-center justify-center">
                {currentLesson.type === 'VIDEO' && currentLesson.videoUrl ? (
                    <video
                        ref={videoRef}
                        src={currentLesson.videoUrl}
                        className="w-full h-auto max-h-full"
                        controls
                        autoPlay
                    />
                ) : (
                    <div className="text-white text-center p-10">
                        <i className="fas fa-file-alt text-5xl mb-4 text-indigo-500"></i>
                        <p className="font-bold text-sm">Nội dung văn bản/quiz đang được cập nhật cho Mobile.</p>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="p-6 bg-slate-900 border-t border-white/5 safe-bottom">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isCompleted ? 'Trạng thái: ĐÃ HOÀN THÀNH' : 'Trạng thái: CHƯA HOÀN THÀNH'}</p>
                    <button className="text-xs text-white opacity-50"><i className="fas fa-cog"></i></button>
                </div>
                <button
                    onClick={handleLessonComplete}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${isCompleted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-white text-slate-900 shadow-white/10'}`}
                >
                    {isCompleted ? 'HOÀN THÀNH LẠI' : 'TÔI ĐÃ HỌC XONG'}
                </button>
            </div>

            {/* Curriculum Drawer */}
            {showCurriculum && (
                <div className="fixed inset-0 z-50 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80" onClick={() => setShowCurriculum(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 shadow-2xl animate-slide-left p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-black uppercase text-sm tracking-tight">Nội dung khóa học</h3>
                            <button onClick={() => setShowCurriculum(false)} className="text-white opacity-50 text-xl"><i className="fas fa-times"></i></button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                            {modules.map((mod, idx) => (
                                <div key={mod.id}>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Chương {idx + 1}</p>
                                    <div className="space-y-1">
                                        {mod.lessons.map(lesson => (
                                            <button
                                                key={lesson.id}
                                                onClick={() => {
                                                    navigate(`/mobile/courses/learn/${enrollmentId}/${lesson.id}`);
                                                    setShowCurriculum(false);
                                                }}
                                                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${currentLesson.id === lesson.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                                            >
                                                <i className={`fas ${lesson.type === 'VIDEO' ? 'fa-play-circle' : 'fa-check-circle'} text-xs`}></i>
                                                <span className="text-[10px] font-bold tracking-tight truncate flex-1">{lesson.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
