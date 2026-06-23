import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    newApplications: 0,
    upcomingInterviews: 0,
    successfulHires: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load statistics (may fail if no company, but usually robust)
      let statsData = {
        activeJobs: 0,
        newApplications: 0,
        upcomingInterviews: 0,
        successfulHires: 0
      };

      try {
        statsData = await api.getRecruiterStatistics();
        // Backend returns: activeJobs, newApplications, upcomingInterviews, successfulHires
      } catch (err) {
        console.warn('Dashboard stats failed:', err);
      }
      setStats(statsData);

      // Load recent jobs
      try {
        // Get more jobs to show in a grid
        const jobsData = await api.getMyJobs(0, 6);
        setRecentJobs(jobsData.content || jobsData || []);
      } catch (err) {
        console.error('Error loading jobs:', err);
        setRecentJobs([]);
      }

      // Load recent applications
      try {
        const appsData = await api.getRecentApplications();
        setRecentApplications(appsData || []);
      } catch (err) {
        console.error('Error loading recent applications:', err);
        setRecentApplications([]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ label, count, icon, color, bg, text, delay }) => (
    <div className={`bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group animate-slide-up`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300`}>
          <i className={`${icon} text-2xl ${text}`}></i>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${bg} ${text} opacity-0 group-hover:opacity-100 transition-opacity`}>
          Chi tiết <i className="fas fa-arrow-right ml-1"></i>
        </span>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">{label}</h3>
      <p className={`text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {count}
      </p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
            Chào mừng trở lại!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Cập nhật tình hình tuyển dụng mới nhất của bạn hôm nay.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/recruiter/company/edit" className="px-5 py-3 rounded-xl font-bold transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md flex items-center gap-2">
            <i className="fas fa-building text-blue-500"></i>
            Hồ sơ Công ty
          </Link>
          <Link to="/recruiter/post-job" className="px-5 py-3 rounded-xl font-bold transition-all duration-200 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center gap-2">
            <i className="fas fa-plus"></i>
            Đăng tin mới
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          label="Tin đang tuyển"
          count={stats.activeJobs}
          icon="fas fa-briefcase"
          color="from-blue-500 to-indigo-600"
          bg="bg-blue-50 dark:bg-blue-900/10"
          text="text-blue-600 dark:text-blue-400"
          delay={0}
        />
        <StatCard
          label="Ứng viên mới"
          count={stats.newApplications}
          icon="fas fa-user-plus"
          color="from-emerald-500 to-teal-500"
          bg="bg-emerald-50 dark:bg-emerald-900/10"
          text="text-emerald-600 dark:text-emerald-400"
          delay={100}
        />
        <StatCard
          label="Phỏng vấn sắp tới"
          count={stats.upcomingInterviews}
          icon="fas fa-calendar-check"
          color="from-purple-500 to-pink-500"
          bg="bg-purple-50 dark:bg-purple-900/10"
          text="text-purple-600 dark:text-purple-400"
          delay={200}
        />
        <StatCard
          label="Tuyển thành công"
          count={stats.successfulHires}
          icon="fas fa-trophy"
          color="from-amber-400 to-orange-500"
          bg="bg-orange-50 dark:bg-orange-900/10"
          text="text-orange-600 dark:text-orange-400"
          delay={300}
        />
      </div>

      {/* Recent Jobs Section */}
      <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <i className="fas fa-history"></i>
            </span>
            Tin tuyển dụng gần đây
          </h2>
          <Link to="/recruiter/applicants" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm">
            Xem tất cả <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <div className="text-center py-16 bg-white/40 dark:bg-gray-900/40 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400 dark:text-gray-500 animate-bounce-slow">
              <i className="fas fa-briefcase text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có tin tuyển dụng nào</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Bắt đầu tìm kiếm nhân tài bằng cách đăng tin tuyển dụng đầu tiên của bạn.
            </p>
            <Link to="/recruiter/post-job" className="px-6 py-3 rounded-xl font-bold transition-all duration-200 bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 hover:scale-105 inline-flex items-center gap-2">
              <i className="fas fa-plus"></i> Đăng tin ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <div key={job.id} className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${job.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : job.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                    {job.status === 'ACTIVE' ? 'Đang tuyển' :
                      job.status === 'PENDING' ? 'Chờ duyệt' :
                        job.status}
                  </span>
                </div>

                <div className="mb-4 pr-16">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1" title={job.title}>
                    {job.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <i className="far fa-clock"></i> {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                      <i className="fas fa-map-marker-alt text-xs"></i>
                    </div>
                    <span className="truncate">{job.location || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                      <i className="fas fa-dollar-sign text-xs"></i>
                    </div>
                    <span className="truncate font-medium text-emerald-600 dark:text-emerald-400">
                      {job.minSalary && job.maxSalary
                        ? `${(job.minSalary / 1000000).toLocaleString()} - ${(job.maxSalary / 1000000).toLocaleString()} triệu`
                        : 'Thỏa thuận'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto flex items-center gap-3">
                  <Link
                    to={`/recruiter/applicants?jobId=${job.id}`}
                    className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors text-center border border-emerald-100"
                  >
                    Hồ sơ ({job.applicationsCount || 0})
                  </Link>
                </div>
              </div>
            ))}

            {/* Add New Card (always visible if < 6 jobs) */}
            <Link to="/recruiter/post-job" className="group bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-plus text-2xl text-emerald-500"></i>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">Đăng tin mới</h3>
              <p className="text-xs text-gray-500 text-center mt-1">Tìm kiếm thêm ứng viên tiềm năng</p>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Applications Section */}
      <div className="mt-10 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <i className="fas fa-users"></i>
            </span>
            Ứng cử viên mới nhất
          </h2>
          <Link to="/recruiter/applicants" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm">
            Xem tất cả hồ sơ <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Chưa có ứng tuyển mới nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-4 font-bold text-gray-500 text-sm">Ứng viên</th>
                  <th className="pb-4 font-bold text-gray-500 text-sm">Vị trí</th>
                  <th className="pb-4 font-bold text-gray-500 text-sm">Ngày ứng tuyển</th>
                  <th className="pb-4 font-bold text-gray-500 text-sm">Trạng thái</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-100 dark:border-blue-800">
                          {app.student?.avatarUrl ? (
                            <img src={api.getFileUrl(app.student.avatarUrl)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            app.student?.fullName?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{app.student?.fullName || 'Ứng viên ẩn danh'}</p>
                          <p className="text-xs text-gray-500">{app.student?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{app.job?.title || 'N/A'}</p>
                    </td>
                    <td className="py-4 text-sm text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'VIEWED' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link to={`/recruiter/applicants?jobId=${app.job?.id}`} className="text-blue-500 hover:text-blue-600 font-bold text-sm">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

