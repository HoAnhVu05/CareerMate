import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function MobileProfileEdit() {
    const { user, login } = useAuth(); // login to refresh stored user
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        bio: user?.bio || '',
        address: user?.address || '',
        university: '',
        major: '',
        graduationYear: '',
        gpa: ''
    });

    useEffect(() => {
        loadStudentProfile();
    }, []);

    const loadStudentProfile = async () => {
        if (user?.role !== 'STUDENT') return;
        try {
            const data = await api.getStudentProfile(true);
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    university: data.university || '',
                    major: data.major || '',
                    graduationYear: data.graduationYear || '',
                    gpa: data.gpa || ''
                }));
            }
        } catch (e) { }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (user?.role === 'STUDENT') {
                const studentData = {
                    ...formData,
                    graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
                    gpa: formData.gpa ? parseFloat(formData.gpa) : null
                };
                await api.updateStudentProfile(studentData);
            } else {
                await api.updateProfile(formData);
            }
            alert('Cập nhật hồ sơ thành công!');
            navigate('/mobile/profile');
        } catch (e) {
            alert('Lỗi cập nhật hồ sơ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in relative z-10">
            <div className="p-6 pt-12 flex items-center gap-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Chỉnh sửa hồ sơ</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-10">
                {/* Avatar section */}
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-indigo-600 p-1">
                            <img src={api.getFileUrl(user?.avatarUrl) || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random`} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950 overflow-hidden">
                            <i className="fas fa-camera text-[10px]"></i>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Chạm để thay đổi ảnh</p>
                </div>

                <div className="space-y-6">
                    <section>
                        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <div className="w-1 h-3 bg-indigo-600 rounded-full"></div> Thông tin tài khoản
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Họ và tên</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="VD: Nguyễn Văn A" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Số điện thoại</label>
                                <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="0912..." />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Vùng / Địa chỉ</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="Hà Nội, Việt Nam" />
                            </div>
                        </div>
                    </section>

                    {user?.role === 'STUDENT' && (
                        <section>
                            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <div className="w-1 h-3 bg-blue-500 rounded-full"></div> Học vấn & Chuyên môn
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Trường đại học</label>
                                    <input type="text" name="university" value={formData.university} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chuyên ngành</label>
                                    <input type="text" name="major" value={formData.major} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Năm tốt nghiệp</label>
                                        <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">GPA</label>
                                        <input type="number" step="0.1" name="gpa" value={formData.gpa} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <div className="w-1 h-3 bg-emerald-500 rounded-full"></div> Giới thiệu bản thân
                        </h3>
                        <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[2rem] text-xs font-bold dark:text-white resize-none" placeholder="Viết một chút về bạn..." />
                    </section>
                </div>

                <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-save"></i> LƯU THAY ĐỔI</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
