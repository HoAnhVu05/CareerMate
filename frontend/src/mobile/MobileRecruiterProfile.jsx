import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function MobileRecruiterProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '', position: '', department: '', phone: '', bio: '', avatarUrl: user?.avatarUrl || ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getRecruiterProfile();
            if (data) {
                setFormData({
                    fullName: data.user?.fullName || user?.fullName || '',
                    position: data.position || '',
                    department: data.department || '',
                    phone: data.phone || '',
                    bio: data.bio || '',
                    avatarUrl: data.user?.avatarUrl || user?.avatarUrl || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await api.uploadRecruiterAvatar(file);
            setFormData(prev => ({ ...prev, avatarUrl: result.avatarUrl || result }));
            alert('Cập nhật ảnh đại diện thành công!');
        } catch (error) {
            alert('Lỗi tải ảnh.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.updateRecruiterProfile({
                position: formData.position,
                department: formData.department,
                phone: formData.phone,
                bio: formData.bio
            });
            if (formData.fullName !== user?.fullName) {
                await api.updateUserFullName(formData.fullName);
            }
            alert('Cập nhật thành công!');
            navigate(-1);
        } catch (e) {
            alert('Lỗi cập nhật.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center"><i className="fas fa-spinner fa-spin text-4xl text-indigo-600"></i></div>;

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in relative z-10 text-slate-800 dark:text-white">
            <div className="p-6 pt-12 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                    <h1 className="text-xl font-black uppercase tracking-tight">Hồ sơ chuyên gia</h1>
                </div>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-10">
                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 dark:bg-slate-800 p-1 mb-4 shadow-xl border-2 border-indigo-600 overflow-hidden">
                            <img
                                src={api.getFileUrl(formData.avatarUrl) || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`}
                                className="w-full h-full rounded-[1.8rem] object-cover"
                            />
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-active:opacity-100 transition-opacity rounded-[2rem] cursor-pointer">
                            <i className="fas fa-camera text-white"></i>
                            <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                        </label>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chạm ảnh để thay đổi</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Họ và tên</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chức vụ</label>
                            <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="VD: HR Manager" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Phòng ban</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="VD: Nhân sự" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Số điện thoại liên hệ</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Giới thiệu kinh nghiệm</label>
                        <textarea name="bio" rows="5" value={formData.bio} onChange={handleChange} className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[2.5rem] text-[11px] font-bold dark:text-white leading-relaxed resize-none shadow-sm" placeholder="Chia sẻ kinh nghiệm làm việc của bạn..." />
                    </div>
                </div>

                <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        {saving ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-check"></i> XÁC NHẬN CẬP NHẬT</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
