import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CourseRow = ({ title, courses, icon, color, navigate }) => {
    if (!courses || courses.length === 0) return null;

    return (
        <div className="mb-10 animate-fade-in pl-4">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center text-white text-xs shadow-lg`}>
                    <i className={icon}></i>
                </div>
                <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pr-4">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        onClick={() => navigate(`/mobile/courses/${course.id}`)}
                        className="w-56 flex-shrink-0 bg-white dark:bg-slate-900 rounded-[2rem] p-4 border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
                    >
                        <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-2xl relative overflow-hidden mb-4 flex items-center justify-center">
                            <img
                                src={getCourseIcon(course)}
                                alt={course.title}
                                className="w-16 h-16 object-contain drop-shadow-xl"
                            />
                            {course.isPremium && (
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-white text-[8px] font-black rounded-lg">PREMIUM</div>
                            )}
                        </div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-white leading-tight line-clamp-2 h-8">{course.title}</h3>
                        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            <span><i className="far fa-clock mr-1"></i> {course.durationHours || 4}h</span>
                            <span className="text-indigo-600 dark:text-indigo-400">Xem ngay</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const getCourseIcon = (course) => {
    const title = course.title?.toLowerCase() || '';
    const icons = {
        java: "https://img.icons8.com/3d-fluency/94/java-coffee-cup-logo.png",
        python: "https://img.icons8.com/3d-fluency/94/python.png",
        js: "https://img.icons8.com/3d-fluency/94/javascript.png",
        react: "https://img.icons8.com/3d-fluency/94/react.png",
        default: "https://img.icons8.com/3d-fluency/94/graduation-cap.png"
    };
    if (title.includes('java')) return icons.java;
    if (title.includes('python')) return icons.python;
    if (title.includes('javascript') || title.includes('js')) return icons.js;
    if (title.includes('react')) return icons.react;
    return icons.default;
};

export default function MobileCourses() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ tech: [], soft: [], free: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getCourses('');
            const courses = Array.isArray(data) ? data : [];
            setStats({
                tech: courses.filter(c => c.category === 'TECHNICAL' || c.title.toLowerCase().includes('lập trình')),
                soft: courses.filter(c => c.category === 'SOFT_SKILLS' || c.category === 'CAREER'),
                free: courses.filter(c => !c.isPremium || c.price === 0)
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in">
            {/* Exploration Hero */}
            <div className="bg-slate-900 px-6 pt-12 pb-10 rounded-b-[3.5rem] relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">CareerMate Learning</span>
                    <h1 className="text-2xl font-black text-white leading-tight mb-6">Trang bị kỹ năng<br />Bứt phá tương lai</h1>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Khám phá khóa học..."
                            className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md rounded-2xl text-sm font-bold text-white border-none placeholder-white/40 focus:bg-white focus:text-slate-900 transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50">
                            <i className="fas fa-search"></i>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20 animate-pulse"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i></div>
            ) : (
                <>
                    <CourseRow
                        title="Dành cho Developer"
                        courses={stats.tech}
                        icon="fas fa-code"
                        color="bg-indigo-600"
                        navigate={navigate}
                    />
                    <CourseRow
                        title="Kỹ năng mềm"
                        courses={stats.soft}
                        icon="fas fa-magic"
                        color="bg-purple-600"
                        navigate={navigate}
                    />
                    <CourseRow
                        title="Học miễn phí"
                        courses={stats.free}
                        icon="fas fa-gift"
                        color="bg-emerald-500"
                        navigate={navigate}
                    />
                </>
            )}
        </div>
    );
}
