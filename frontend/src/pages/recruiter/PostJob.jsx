import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: '',
    minSalary: '',
    maxSalary: '',
    expiresAt: '',
    requiredSkills: '',
    optionalSkills: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const requiredSkills = formData.requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      const optionalSkills = formData.optionalSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel || null,
        minSalary: formData.minSalary ? parseFloat(formData.minSalary) * 1000000 : null,
        maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) * 1000000 : null,
        currency: 'VND',
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      await api.createJob(jobData, requiredSkills, optionalSkills);
      alert('Đăng tin thành công! Tin đăng đang chờ duyệt từ admin.');
      navigate('/recruiter/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể đăng tin';

      if (errorMessage.includes('company')) {
        const shouldCreate = confirm(
          'Bạn chưa có thông tin công ty.\n\n' +
          'Bạn cần tạo thông tin công ty trước khi đăng tin tuyển dụng.\n\n' +
          'Bấm OK để chuyển đến trang tạo thông tin công ty.'
        );
        if (shouldCreate) {
          navigate('/recruiter/company');
        }
      } else {
        alert('Lỗi: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">

      <form onSubmit={handleSubmit} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-white/5 p-8 md:p-10 space-y-10">

        {/* Job Basics */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <i className="fas fa-briefcase"></i>
            </span>
            Thông tin cơ bản
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Tiêu đề công việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="VD: Backend Developer (Java/Spring Boot)"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Địa điểm làm việc <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="location"
                  required
                  className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer font-medium"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="">Chọn địa điểm</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Khác">Khác</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Loại hình công việc</label>
              <div className="relative">
                <select
                  name="jobType"
                  className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer font-medium"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Hợp đồng</option>
                  <option value="INTERNSHIP">Thực tập</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Kinh nghiệm yêu cầu</label>
              <div className="relative">
                <select
                  name="experienceLevel"
                  className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer font-medium"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option value="">Không yêu cầu</option>
                  <option value="ENTRY">Fresher / Entry Level</option>
                  <option value="JUNIOR">Junior (1-2 năm)</option>
                  <option value="MID">Mid Level (2-5 năm)</option>
                  <option value="SENIOR">Senior (Trên 5 năm)</option>
                  <option value="LEAD">Lead</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mức lương (triệu VND)</label>
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fas fa-dollar-sign text-sm"></i>
                  </span>
                  <input
                    type="number"
                    name="minSalary"
                    placeholder="Min"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                    value={formData.minSalary}
                    onChange={handleChange}
                  />
                </div>
                <span className="text-gray-400 font-bold">-</span>
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                    <i className="fas fa-dollar-sign text-sm"></i>
                  </span>
                  <input
                    type="number"
                    name="maxSalary"
                    placeholder="Max"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                    value={formData.maxSalary}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <i className="fas fa-list-ul"></i>
            </span>
            Chi tiết công việc
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mô tả công việc <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                rows="6"
                required
                placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
                className="w-full px-5 py-4 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none font-medium leading-relaxed"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Yêu cầu ứng viên</label>
              <textarea
                name="requirements"
                rows="5"
                placeholder="Các yêu cầu cụ thể về trình độ, kỹ năng..."
                className="w-full px-5 py-4 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none font-medium leading-relaxed"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Skills & Deadline */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-3">
            <span className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <i className="fas fa-star"></i>
            </span>
            Kỹ năng & Hạn nộp
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Kỹ năng chuyên môn (bắt buộc) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="requiredSkills"
                required
                placeholder="VD: Java, Spring Boot, MySQL"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                value={formData.requiredSkills}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                <i className="fas fa-info-circle text-blue-500"></i>
                Nhập các kỹ năng cách nhau bởi dấu phẩy. Hệ thống sẽ dùng để tính Match Score.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Kỹ năng bổ trợ (tùy chọn)</label>
              <input
                type="text"
                name="optionalSkills"
                placeholder="VD: Docker, Kubernetes, AWS"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                value={formData.optionalSkills}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ngày hết hạn nộp hồ sơ</label>
              <input
                type="date"
                name="expiresAt"
                className="w-full px-5 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                value={formData.expiresAt}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-8 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transform transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Đăng tin tuyển dụng
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-10 py-4 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-gray-300"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
