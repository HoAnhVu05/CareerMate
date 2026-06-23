import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function MobileProfileView() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getStudentProfile(true);
            setProfile(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };



    if (loading) return <div className="h-screen flex items-center justify-center animate-pulse"><i className="fas fa-user-astronaut text-4xl text-indigo-400"></i></div>;

    return (
        <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen animate-fade-in relative z-10 text-slate-800 dark:text-white">
            {/* Header Banner */}
            <div className="h-48 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 relative">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <button onClick={() => navigate('/mobile/profile/settings')} className="absolute top-12 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform">
                    <i className="fas fa-cog"></i>
                </button>
            </div>

            {/* Profile Info Overlay */}
            <div className="px-6 -mt-16 relative z-20">
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-50 dark:bg-slate-900 p-1 shadow-2xl relative">
                        <img
                            src={api.getFileUrl(profile?.avatarUrl) || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`}
                            className="w-full h-full rounded-[2.3rem] object-cover border-4 border-white dark:border-slate-800"
                        />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
                    </div>
                    <h2 className="mt-6 text-2xl font-black uppercase tracking-tight text-center">{user?.fullName}</h2>
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mt-1">{profile?.major || 'Chưa cập nhật chuyên ngành'}</p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">GPA</p>
                        <p className="text-xl font-black text-emerald-500">{profile?.gpa || '--'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tốt nghiệp</p>
                        <p className="text-xl font-black text-indigo-600">{profile?.graduationYear || '--'}</p>
                    </div>
                </div>

                {/* Bio */}
                <section className="mt-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Giới thiệu</h3>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-xs font-medium leading-relaxed shadow-sm">
                        {profile?.bio || "Chưa có giới thiệu. Hãy cập nhật hồ sơ để mọi người hiểu rõ hơn về bạn!"}
                    </div>
                </section>

                {/* Social Links */}
                <section className="mt-10">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Liên kết chuyên môn</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {profile?.linkedinUrl && (
                            <a href={profile.linkedinUrl} target="_blank" className="flex items-center justify-between p-5 bg-[#0077B5] rounded-3xl text-white">
                                <div className="flex items-center gap-4">
                                    <i className="fab fa-linkedin text-xl"></i>
                                    <span className="font-black text-[10px] uppercase tracking-widest">LinkedIn Profile</span>
                                </div>
                                <i className="fas fa-external-link-alt text-[10px]"></i>
                            </a>
                        )}
                        {profile?.githubUrl && (
                            <a href={profile.githubUrl} target="_blank" className="flex items-center justify-between p-5 bg-[#24292e] rounded-3xl text-white">
                                <div className="flex items-center gap-4">
                                    <i className="fab fa-github text-xl"></i>
                                    <span className="font-black text-[10px] uppercase tracking-widest">GitHub Repository</span>
                                </div>
                                <i className="fas fa-external-link-alt text-[10px]"></i>
                            </a>
                        )}
                        {!profile?.linkedinUrl && !profile?.githubUrl && (
                            <div className="text-center py-6 opacity-30 text-[10px] font-black uppercase">Chưa có liên kết</div>
                        )}
                    </div>
                </section>

                <button onClick={() => navigate('/mobile/profile/edit')} className="w-full mt-10 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em]">
                    CHỈNH SỬA HỒ SƠ
                </button>
            </div>
        </div>
    );
}
