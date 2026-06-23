import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobilePostJob() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', requirements: '', location: '',
        jobType: 'FULL_TIME', experienceLevel: '', minSalary: '', maxSalary: '',
        expiresAt: '', requiredSkills: '', optionalSkills: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const reqSkills = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
            const optSkills = formData.optionalSkills.split(',').map(s => s.trim()).filter(Boolean);

            const jobData = {
                ...formData,
                minSalary: formData.minSalary ? parseFloat(formData.minSalary) * 1000000 : null,
                maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) * 1000000 : null,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
            };

            await api.createJob(jobData, reqSkills, optSkills);
            alert('Đăng tin thành công!');
            navigate('/mobile/home');
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || 'Không thể đăng tin'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in relative z-10">
            <div className="p-6 pt-12 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Đăng tin tuyển dụng</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-8 space-y-10">
                <section>
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1 h-3 bg-indigo-600 rounded-full"></div> Thông tin cơ bản
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tiêu đề công việc *</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="VD: Senior Java Developer" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Địa điểm *</label>
                                <select name="location" required value={formData.location} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white">
                                    <option value="">Chọn...</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="TP. Hồ Chí Minh">TP. HCM</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Loại hình</label>
                                <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white">
                                    <option value="FULL_TIME">Full-time</option>
                                    <option value="PART_TIME">Part-time</option>
                                    <option value="INTERNSHIP">Thực tập</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1 h-3 bg-emerald-500 rounded-full"></div> Kỹ năng & Lương
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Kỹ năng bắt buộc (Phẩy) *</label>
                            <input type="text" name="requiredSkills" required value={formData.requiredSkills} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="Java, Spring, MySQL" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lương tối thiểu (tr)</label>
                                <input type="number" name="minSalary" value={formData.minSalary} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="VD: 10" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lương tối đa (tr)</label>
                                <input type="number" name="maxSalary" value={formData.maxSalary} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" placeholder="VD: 25" />
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1 h-3 bg-amber-500 rounded-full"></div> Nội dung chi tiết
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mô tả công việc *</label>
                            <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white resize-none" placeholder="Viết mô tả..." />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Ngày hết hạn</label>
                            <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleChange} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                        </div>
                    </div>
                </section>

                {/* Submit Sticky Overlay */}
                <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border border-white/10"
                    >
                        {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-plus-circle"></i> XÁC NHẬN ĐĂNG TIN</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
