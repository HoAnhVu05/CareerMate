import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function CareerRoadmap() {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [step, setStep] = useState(1); // 1: Target Role, 2: Skills, 3: Generating/Result
  const [formData, setFormData] = useState({
    currentSkills: '',
    targetRole: '',
  });

  const popularRoles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
    'Product Manager', 'UI/UX Designer', 'Mobile Developer', 'AI Engineer'
  ];

  const popularSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'SQL', 'Docker', 'AWS', 'Git', 'Figma'
  ];

  const handleGenerate = async () => {
    if (!formData.currentSkills || !formData.targetRole) return;

    try {
      setLoading(true);
      setStep(3);
      // Simulate "AI Thinking" time for better UX if API is too fast
      const startTime = Date.now();
      const data = await api.getCareerRoadmap(formData.currentSkills, formData.targetRole);
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - elapsedTime));
      }

      setRoadmap(data);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Lỗi: ' + (error.response?.data?.error || error.message || 'Không thể tạo lộ trình'));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && formData.targetRole) setStep(2);
    else if (step === 2 && formData.currentSkills) handleGenerate();
  };

  const addSkill = (skill) => {
    const skills = formData.currentSkills.split(',').map(s => s.trim()).filter(Boolean);
    if (!skills.includes(skill)) {
      const newSkills = [...skills, skill].join(', ');
      setFormData({ ...formData, currentSkills: newSkills });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 pt-8 pb-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <i className="fas fa-map-marked-alt text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lộ trình sự nghiệp AI</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Xây dựng lộ trình học tập cá nhân hóa dựa trên kỹ năng hiện tại và mục tiêu nghề nghiệp của bạn.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {!roadmap ? (
          /* Wizard Mode */
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>1</div>
              <div className={`w-20 h-1 bg-gray-200 dark:bg-gray-800 ${step >= 2 ? 'bg-blue-600' : ''}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>2</div>
              <div className={`w-20 h-1 bg-gray-200 dark:bg-gray-800 ${step >= 3 ? 'bg-blue-600' : ''}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>3</div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden transition-all duration-500">
              {/* Step 1: Target Role */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Bạn muốn trở thành ai?</h2>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vị trí mục tiêu</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ví dụ: Senior Full Stack Developer"
                        value={formData.targetRole}
                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                        autoFocus
                      />
                      <i className="fas fa-search absolute left-3.5 top-3.5 text-gray-400"></i>
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Gợi ý phổ biến</p>
                    <div className="flex flex-wrap gap-2">
                      {popularRoles.map(role => (
                        <button
                          key={role}
                          onClick={() => setFormData({ ...formData, targetRole: role })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.targetRole === role
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={!formData.targetRole}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Tiếp tục <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              )}

              {/* Step 2: Skills */}
              {step === 2 && (
                <div className="animate-fade-in">
                  <button onClick={() => setStep(1)} className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <i className="fas fa-arrow-left text-xl"></i>
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Kỹ năng hiện tại của bạn?</h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Danh sách kỹ năng (cách nhau bởi dấu phẩy)</label>
                    <textarea
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="Ví dụ: Java, Spring Boot, ReactJS..."
                      value={formData.currentSkills}
                      onChange={(e) => setFormData({ ...formData, currentSkills: e.target.value })}
                      autoFocus
                    />
                  </div>

                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thêm nhanh</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map(skill => (
                        <button
                          key={skill}
                          onClick={() => addSkill(skill)}
                          className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                        >
                          <i className="fas fa-plus text-xs mr-1 opacity-50"></i> {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={!formData.currentSkills}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-magic"></i> Tạo lộ trình AI
                  </button>
                </div>
              )}

              {/* Step 3: Loading */}
              {step === 3 && loading && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fas fa-brain text-4xl text-blue-600 animate-pulse"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đang phân tích hồ sơ...</h3>
                  <p className="text-gray-500 dark:text-gray-400">AI đang xây dựng lộ trình tối ưu cho bạn</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Result: Roadmap View */
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Sidebar: Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{formData.targetRole}</h2>
                    <p className="text-sm text-gray-500">Mục tiêu nghề nghiệp</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Thời gian dự kiến</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{roadmap.timeline || '3 - 6 tháng'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Kỹ năng cần bổ sung</p>
                      <div className="flex flex-wrap gap-2">
                        {roadmap.skillsGap && roadmap.skillsGap.map((skill, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            {skill}
                          </span>
                        ))}
                        {(!roadmap.skillsGap || roadmap.skillsGap.length === 0) && (
                          <span className="text-sm text-gray-500">Bạn đã có đủ kỹ năng cơ bản!</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t dark:border-gray-800">
                      <button
                        onClick={() => { setRoadmap(null); setStep(1); }}
                        className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      >
                        <i className="fas fa-redo mr-2"></i> Tạo lại
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content: Roadmap Timeline */}
              <div className="lg:col-span-2">
                <div className="relative space-y-8 pl-8 md:pl-0">
                  {/* Timeline Line */}
                  <div className="absolute left-0 md:left-[27px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                  {roadmap.steps && roadmap.steps.map((step, idx) => (
                    <div key={idx} className="relative animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                      {/* Connector Node */}
                      <div className="absolute -left-[39px] md:left-0 top-0 w-14 h-14 rounded-full bg-white dark:bg-gray-900 border-4 border-white dark:border-black flex items-center justify-center z-10 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                          {idx + 1}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="ml-0 md:ml-12 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {step.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                              <i className="far fa-clock"></i> {step.duration || '2 tuần'}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold whitespace-nowrap self-start">
                            {step.milestones?.[0] || 'Hoàn thành module'}
                          </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          {step.description}
                        </p>

                        {/* Resources & Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Learn */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <i className="fas fa-book-open text-blue-500"></i> Học gì?
                            </p>
                            <ul className="space-y-1">
                              {step.skills?.map((skill, i) => (
                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <i className="fas fa-check text-green-500 text-xs"></i> {skill}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Resources */}
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <i className="fas fa-link text-indigo-500"></i> Tài liệu
                            </p>
                            <ul className="space-y-1">
                              {step.resources?.map((res, i) => (
                                <li key={i} className="text-sm truncate">
                                  <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                                    {res}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
