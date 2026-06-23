import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function MobileCompanyEdit() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '', industry: '', websiteUrl: '', headquarters: '', companySize: '', foundedYear: '', description: '', logoUrl: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getMyCompany();
            if (data) {
                setFormData({
                    name: data.name || '',
                    industry: data.industry || '',
                    websiteUrl: data.websiteUrl || '',
                    headquarters: data.headquarters || '',
                    companySize: data.companySize || '',
                    foundedYear: data.foundedYear || '',
                    description: data.description || '',
                    logoUrl: data.logoUrl || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await api.uploadCompanyLogo(file);
            setFormData(prev => ({ ...prev, logoUrl: result.logoUrl || result }));
            alert('Tải logo lên thành công!');
        } catch (error) {
            alert('Lỗi tải logo.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.updateCompany(formData);
            alert('Cập nhật thông tin công ty thành công!');
            navigate(-1);
        } catch (e) {
            alert('Lỗi cập nhật. Hãy đảm bảo bạn đã điền đầy đủ thông tin bắt buộc.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center"><i className="fas fa-spinner fa-spin text-4xl text-emerald-500"></i></div>;

    return (
        <div className="pb-32 bg-white dark:bg-slate-950 min-h-screen animate-fade-in relative z-10 text-slate-800 dark:text-white">
            <div className="p-6 pt-12 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-slate-400"><i className="fas fa-arrow-left"></i></button>
                    <h1 className="text-xl font-black uppercase tracking-tight text-emerald-600">Hồ sơ Doanh nghiệp</h1>
                </div>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-10">
                <div className="space-y-6">
                    <section>
                        {/* Branding Block */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl mb-10">
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-20 h-20 bg-white rounded-3xl p-3 flex items-center justify-center shadow-lg relative group">
                                    <img src={api.getFileUrl(formData.logoUrl) || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} className="w-full h-full object-contain" />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-active:opacity-100 transition-opacity rounded-3xl cursor-pointer">
                                        <i className="fas fa-camera text-white"></i>
                                        <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                    </label>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-black uppercase tracking-tight leading-tight">{formData.name || 'Tên doanh nghiệp'}</h2>
                                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-2 px-2 py-1 bg-emerald-500/10 rounded-lg inline-block border border-emerald-500/20">Chạm vào Logo để thay đổi</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        </div>

                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">Thông tin nhận diện</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2 text-indigo-500">Tên công ty *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white shadow-inner" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Lĩnh vực hoạt động</label>
                                <input type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="VD: Công nghệ phần mềm" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">Vận hành & Kết nối</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Quy mô nhân sự</label>
                                <input type="text" name="companySize" value={formData.companySize} onChange={handleChange} placeholder="VD: 50-100" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Năm thành lập</label>
                                <input type="text" name="foundedYear" value={formData.foundedYear} onChange={handleChange} placeholder="VD: 2015" className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Website chính thức</label>
                            <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                        </div>
                        <div className="mt-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-2">Trụ sở chính</label>
                            <input type="text" name="headquarters" value={formData.headquarters} onChange={handleChange} placeholder="Địa chỉ đầy đủ..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-[10px] font-bold dark:text-white" />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">Văn hóa & Tầm nhìn</h3>
                        <textarea name="description" rows="6" value={formData.description} onChange={handleChange} className="w-full p-6 bg-slate-50 dark:bg-slate-900 border-none rounded-[2.5rem] text-[11px] font-bold dark:text-white leading-relaxed resize-none shadow-sm shadow-inner" placeholder="Mô tả về môi trường làm việc, văn hóa doanh nghiệp và cơ hội phát triển..." />
                    </section>
                </div>

                <div className="fixed bottom-20 left-0 right-0 p-4 z-50">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                    >
                        {saving ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-save"></i> CẬP NHẬT HỆ THỐNG</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
