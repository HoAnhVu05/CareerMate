import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getCourseById(id);
            setCourse(data);

            const mods = await api.getCourseModules(id);
            // Load lessons for modules
            await Promise.all(mods.map(async (m) => {
                const lessons = await api.getModuleLessons(m.id);
                m.lessons = lessons || [];
            }));
            setModules(mods);

            // Check enrollment
            const enrollments = await api.getStudentEnrollments();
            const exists = enrollments.find(e => e.course?.id === parseInt(id));
            setEnrolled(exists);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            const response = await api.enrollCourse(id);
            alert("Chúc mừng! Bạn đã đăng ký khóa học thành công.");
            navigate(`/mobile/courses/learn/${response.id}`);
        } catch (error) {
            console.error(error);
            alert("Đã có lỗi xảy ra khi đăng ký.");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600"><i className="fas fa-circle-notch fa-spin text-3xl"></i></div>;
    if (!course) return <div className="p-10 text-center">Không tìm thấy khóa học.</div>;

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in">
            {/* Header / Intro */}
            <div className="h-56 bg-gradient-to-br from-slate-900 to-indigo-900 relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <i className="fas fa-arrow-left"></i>
                </button>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <i className="fas fa-play-circle text-8xl text-white"></i>
                </div>
            </div>

            {/* Info Overlay */}
            <div className="px-6 -mt-12 relative z-10">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                    <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-3 inline-block">
                        {course.level || 'Cơ bản'}
                    </span>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-4">{course.title}</h1>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <i className="far fa-clock text-indigo-500"></i>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{course.durationHours || 4} Giờ học</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="far fa-file-video text-emerald-500"></i>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{modules.reduce((s, m) => s + m.lessons.length, 0)} Bài học</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="far fa-user text-blue-500"></i>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">1.2k Học viên</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs / Description */}
            <div className="px-8 mt-10 space-y-8">
                <section>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">Mô tả khóa học</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {course.description}
                    </p>
                </section>

                <section>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4">Lộ trình học tập</h3>
                    <div className="space-y-4">
                        {modules.map((mod, idx) => (
                            <div key={mod.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">Chương {idx + 1}</p>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-3">{mod.title}</h4>
                                <div className="space-y-2">
                                    {mod.lessons.map(lesson => (
                                        <div key={lesson.id} className="flex items-center gap-3 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                            <i className="far fa-play-circle text-slate-300"></i>
                                            <span className="flex-1">{lesson.title}</span>
                                            <span>{lesson.durationMinutes || 0}m</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Bottom Sticky Action */}
            <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] p-3 shadow-2xl border border-white/20 dark:border-slate-800/50 flex items-center justify-between gap-4">
                    <div className="pl-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá khóa học</p>
                        <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{course.price === 0 ? 'MIỄN PHÍ' : course.price.toLocaleString() + 'đ'}</p>
                    </div>
                    {enrolled ? (
                        <button
                            onClick={() => navigate(`/mobile/courses/learn/${enrolled.id}`)}
                            className="bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-indigo-500/30 active:scale-95 transition-all text-xs"
                        >
                            TIẾP TỤC HỌC
                        </button>
                    ) : (
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-4 px-8 rounded-2xl shadow-lg active:scale-95 transition-all text-xs"
                        >
                            {enrolling ? <i className="fas fa-circle-notch fa-spin"></i> : 'BẮT ĐẦU NGAY'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
