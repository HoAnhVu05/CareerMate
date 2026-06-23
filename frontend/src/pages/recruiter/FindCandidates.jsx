import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function FindCandidates() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getMyJobs(0, 100);
      const jobsList = data.content || data || [];
      setJobs(jobsList.filter(job => job.status === 'ACTIVE'));
      if (jobsList.length > 0) {
        setSelectedJobId(jobsList[0].id);
      }
    } catch (error) {
      if (error.response?.status === 410) {
        setJobs([]);
      } else {
        console.error('Error loading jobs:', error);
      }
    }
  };

  const handleFindCandidates = async () => {
    if (!selectedJobId) {
      alert('Vui lòng chọn tin tuyển dụng');
      return;
    }

    try {
      setSearching(true);
      const result = await api.findMatchingCandidates(selectedJobId);

      if (result.matchingCVs && result.matchingCVs.length > 0) {
        // Load candidate details from CV IDs
        // Note: This would need additional API endpoints to get student profiles from CV IDs
        setMatchingCandidates(result.matchingCVs);
      } else {
        setMatchingCandidates([]);
        alert('Không tìm thấy ứng viên phù hợp. Hệ thống sẽ sử dụng AI để tìm kiếm ứng viên dựa trên mô tả công việc.');
      }
    } catch (error) {
      console.error('Error finding candidates:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể tìm ứng viên'));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
            Tìm kiếm ứng viên (AI)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Sử dụng công nghệ AI để tìm kiếm nhân tài phù hợp nhất
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Search & Job Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-white/5 p-8">
            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <i className="fas fa-briefcase text-emerald-500"></i>
                Chọn tin tuyển dụng
              </label>
              <div className="relative">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full pl-5 pr-10 py-3.5 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="">-- Chọn tin tuyển dụng --</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <i className="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            {selectedJobId && (
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 mb-8 animation-fade-in">
                {(() => {
                  const job = jobs.find(j => j.id === selectedJobId);
                  return job ? (
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base">{job.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <i className="fas fa-map-marker-alt text-emerald-500"></i> {job.location || 'N/A'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-4">
                        {job.description}
                      </p>
                      {job.requirements && (
                        <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">Yêu cầu:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{job.requirements}</p>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <button
              onClick={handleFindCandidates}
              disabled={!selectedJobId || searching}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 text-lg"
            >
              {searching ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang quét AI...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  Tìm ứng viên ngay
                </>
              )}
            </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
                <i className="fas fa-lightbulb"></i>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-base">Cơ chế AI Matching</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                  <li className="flex gap-3">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                    <span>Phân tích ngữ nghĩa (Semantic Analysis) yêu cầu công việc</span>
                  </li>
                  <li className="flex gap-3">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                    <span>Tìm kiếm Vector (Vector Search) trên hàng nghìn CV</span>
                  </li>
                  <li className="flex gap-3">
                    <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                    <span>Xếp hạng ứng viên theo độ phù hợp (Matching Score)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8">
          {matchingCandidates.length > 0 ? (
            <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-white/5 p-8 min-h-[600px]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <i className="fas fa-users"></i>
                  </span>
                  Kết quả tìm kiếm ({matchingCandidates.length})
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700">
                  <i className="fas fa-sort-amount-down mr-2"></i>
                  Độ phù hợp giảm dần
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {matchingCandidates.map((candidate, index) => (
                  <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                    {/* Match Score Indicator */}
                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold rounded-bl-2xl border-b border-l border-emerald-100 dark:border-emerald-800">
                      {candidate.score}% Match
                    </div>

                    <div className="flex items-start gap-5 mb-5">
                      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-2xl border-4 border-white dark:border-gray-700 shadow-md">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="pt-1">
                        <p className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 transition-colors line-clamp-1 mb-1" title={candidate.name}>
                          {candidate.name || 'Ứng viên tiềm năng'}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">CV ID: {candidate.cvId}</p>
                        <p className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md w-fit flex items-center gap-1 border border-amber-100 dark:border-amber-900/30">
                          <i className="fas fa-star"></i> Potential Candidate
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button className="flex-1 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl text-sm font-bold transition-colors">
                        Xem hồ sơ
                      </button>
                      <button className="w-12 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors border border-gray-100 dark:border-gray-700">
                        <i className="far fa-bookmark"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full bg-white/40 dark:bg-gray-800/20 backdrop-blur-md rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <div className="w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <i className="fas fa-search text-4xl text-gray-300 dark:text-gray-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Chưa có kết quả tìm kiếm</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed text-lg">
                Vui lòng chọn tin tuyển dụng ở cột bên trái và nhấn nút "Tìm ứng viên ngay" để hệ thống AI bắt đầu quét và phân tích hồ sơ.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
