import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function JobDetail({ jobId: propJobId, isModal = false, onClose }) {
  const { id: paramId } = useParams();
  const id = propJobId || paramId;
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [cvs, setCvs] = useState([]);
  const [selectedCV, setSelectedCV] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    if (id) {
      loadJob();
      loadCVs();
      checkApplication();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await api.getJobById(id);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCVs = async () => {
    try {
      const data = await api.getCVs();
      setCvs(data || []);
      if (data && data.length > 0) {
        setSelectedCV(data[0].id);
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
    }
  };

  const checkApplication = async () => {
    try {
      const data = await api.checkApplication(id);
      if (data.applied) {
        setHasApplied(true);
        setApplicationStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleApply = async () => {
    if (!selectedCV && cvs.length > 0) {
      alert('Vui lòng chọn CV');
      return;
    }

    try {
      setApplying(true);
      await api.applyForJob(id, selectedCV || null, coverLetter);
      alert('Ứng tuyển thành công!');
      navigate('/student/applications');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể ứng tuyển';
      alert('Lỗi: ' + errorMessage);
      if (errorMessage.includes('Already applied') || errorMessage.includes('đã ứng tuyển')) {
        setTimeout(() => navigate('/student/applications'), 1500);
      }
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const getCompanyLogo = (logoUrl) => {
    return getFullUrl(logoUrl);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-wider animate-pulse uppercase">Đang tải thông tin việc làm...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-briefcase text-slate-300 text-3xl"></i>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Không tìm thấy việc làm</h3>
        <p className="text-slate-500 font-medium mb-8">Việc làm này có thể đã bị xóa hoặc không tồn tại.</p>
        <button
          onClick={() => navigate('/student/jobs')}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className={`${isModal ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'} animate-fade-in`}>
      {/* Back Button */}
      {!isModal && (
        <button
          onClick={() => navigate('/student/jobs')}
          className="group mb-8 flex items-center gap-2 px-5 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/50 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 font-bold hover:bg-white hover:text-indigo-600 hover:shadow-lg transition-all"
        >
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          Quay lại danh sách
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Header Card */}
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 dark:border-slate-800/50 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-1000"></div>

            <div className="relative flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white dark:bg-slate-800 shadow-lg p-2 flex-shrink-0 border border-slate-100 dark:border-slate-700">
                {job.company?.logoUrl ? (
                  <img src={getCompanyLogo(job.company.logoUrl)} alt={job.company?.name} className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl">
                    <i className="fas fa-building text-slate-300 text-4xl"></i>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${job.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                    {job.status === 'ACTIVE' ? 'Đang tuyển dụng' : 'Đã đóng'}
                  </span>
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {job.jobType || 'Full-time'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                  {job.title}
                </h1>

                <div className="flex items-center gap-2 text-lg font-bold text-slate-600 dark:text-slate-300 mb-6">
                  <i className="fas fa-building text-indigo-500"></i>
                  {job.company?.name || 'Công ty ẩn danh'}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-white/50 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <i className="fas fa-map-marker-alt text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Địa điểm</p>
                      <p className="font-bold text-sm">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-white/50 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <i className="fas fa-dollar-sign text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mức lương</p>
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(job.minSalary)} - {formatCurrency(job.maxSalary)}
                      </p>
                    </div>
                  </div>

                  {job.experienceLevel && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-white/50 dark:border-slate-700">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <i className="fas fa-user-graduate text-xs"></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kinh nghiệm</p>
                        <p className="font-bold text-sm">{job.experienceLevel}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-white/50 dark:border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <i className="fas fa-clock text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hạn nộp</p>
                      <p className="font-bold text-sm">{job.expiresAt ? new Date(job.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {job.skills && job.skills.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Kỹ năng yêu cầu</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {skill.skillName || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 dark:border-slate-800/50 shadow-xl">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <i className="fas fa-align-left"></i>
              </span>
              Mô tả công việc
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300 font-medium">{job.description}</p>
            </div>
          </div>

          {/* Job Requirements */}
          {job.requirements && (
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 dark:border-slate-800/50 shadow-xl">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                  <i className="fas fa-list-check"></i>
                </span>
                Yêu cầu ứng viên
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="whitespace-pre-line leading-relaxed text-slate-600 dark:text-slate-300 font-medium">{job.requirements}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Application Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-6">
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/50 dark:border-slate-800/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <i className="fas fa-paper-plane"></i>
                  </span>
                  Ứng tuyển ngay
                </h2>

                {hasApplied ? (
                  <div className="text-center py-8 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400 text-2xl animate-bounce">
                      <i className="fas fa-check"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Đã ứng tuyển</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Hồ sơ đã được gửi đi</p>

                    <div className="inline-block px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 mb-6">
                      Trạng thái: <span className="text-indigo-600">{applicationStatus || 'Đang xử lý'}</span>
                    </div>

                    <button
                      onClick={() => navigate('/student/applications')}
                      className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      Xem lịch sử ứng tuyển
                    </button>
                  </div>
                ) : cvs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400 text-3xl">
                      <i className="fas fa-file-upload"></i>
                    </div>
                    <p className="text-slate-500 font-medium mb-6 px-4">Bạn chưa có CV nào trên hệ thống. Hãy tải CV lên để bắt đầu ứng tuyển.</p>
                    <button
                      onClick={() => navigate('/student/cv')}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-plus-circle"></i>
                      Tạo & Tải CV mới
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                        Chọn CV của bạn <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {cvs.map((cv) => (
                          <label key={cv.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedCV === cv.id
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                              : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                            }`}>
                            <input
                              type="radio"
                              name="cv"
                              value={cv.id}
                              checked={selectedCV === cv.id}
                              onChange={(e) => setSelectedCV(e.target.value)}
                              className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{cv.fileName}</p>
                              <p className="text-xs text-slate-500 font-medium">Cập nhật: {new Date(cv.updatedAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                              <i className="far fa-file-pdf"></i>
                            </div>
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={() => navigate('/student/cv')}
                        className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-1"
                      >
                        <i className="fas fa-plus"></i> Thêm CV mới
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                        Thư giới thiệu (Cover Letter)
                      </label>
                      <textarea
                        rows="4"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 transition-colors font-medium text-sm text-slate-700 dark:text-slate-200 resize-none"
                        placeholder="Viết đôi lời giới thiệu về bản thân và lý do bạn phù hợp với công việc này..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={handleApply}
                      disabled={applying || !selectedCV}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                    >
                      {applying ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Đang gửi hồ sơ...</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi hồ sơ ứng tuyển</span>
                          <i className="fas fa-arrow-right"></i>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-center text-slate-400 font-medium">
                      Bằng việc ấn nộp hồ sơ, bạn đồng ý với các điều khoản của CareerMate.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info / Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <i className="fas fa-shield-alt"></i>
              Bảo mật & An toàn
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
