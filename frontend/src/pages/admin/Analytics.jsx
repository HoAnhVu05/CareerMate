import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Đang tổng hợp dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-red-50/50 dark:bg-red-900/10 backdrop-blur-md rounded-[2.5rem] border border-red-100 dark:border-red-900/30 p-20 text-center animate-fade-in text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs">
        <i className="fas fa-exclamation-triangle text-3xl mb-4 block"></i>
        Không thể truy xuất dữ liệu phân tích
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Trung Tâm Báo Cáo</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Thống kê thông tin toàn diện về hoạt động hệ thống</p>
        </div>
        <button onClick={loadAnalytics} className="w-12 h-12 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metric Cards - Column 1: Users */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <i className="fas fa-users text-9xl"></i>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4 uppercase tracking-widest">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm">
                <i className="fas fa-user-astronaut"></i>
              </div>
              Tăng trưởng người dùng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between group/card overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover/card:scale-150 transition-transform duration-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2 block">30 ngày qua</span>
                <p className="text-5xl font-black tracking-tighter mb-4">+{analytics.newUsersLast30Days}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-white/20 w-fit px-3 py-1.5 rounded-lg border border-white/20">
                  <i className="fas fa-arrow-up"></i> Tăng trưởng thực
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-xl flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">7 ngày gần nhất</span>
                <p className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">+{analytics.newUsersLast7Days}</p>
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Hoạt động tích cực
                </div>
              </div>
            </div>

            {analytics.usersByRole && (
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Phân bố vai trò hệ thống</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.usersByRole).map(([role, count]) => (
                    <div key={role} className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">{role}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white uppercase">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Job Section */}
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl overflow-hidden relative group">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-4 uppercase tracking-widest">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-sm">
                <i className="fas fa-briefcase"></i>
              </div>
              Thị trường tuyển dụng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 block">Mới (30d)</span>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{analytics.newJobsLast30Days}</p>
              </div>
              <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 block">Mới (7d)</span>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{analytics.newJobsLast7Days}</p>
              </div>
              <div className="p-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] shadow-xl">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Tổng quan</span>
                <p className="text-4xl font-black tracking-tighter">
                  {Object.values(analytics.jobsByStatus || {}).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>

            {analytics.jobsByStatus && (
              <div className="flex flex-wrap gap-4">
                {Object.entries(analytics.jobsByStatus).map(([status, count]) => (
                  <div key={status} className="px-6 py-3 bg-white/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          {/* Applications Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <h2 className="text-xl font-black mb-10 flex items-center gap-4 uppercase tracking-widest">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white text-sm backdrop-blur-md">
                <i className="fas fa-paper-plane"></i>
              </div>
              Đơn Ứng Tuyển
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Tháng này</span>
                  <p className="text-4xl font-black tracking-tighter">{analytics.newApplicationsLast30Days}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Tuần này</span>
                  <p className="text-2xl font-black tracking-tighter">+{analytics.newApplicationsLast7Days}</p>
                </div>
              </div>
              <div className="pt-2">
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[65%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50">Tỷ lệ tương tác cao</p>
              </div>
            </div>
          </div>

          {/* Top Skills Card */}
          {analytics.topSkillsInDemand && (
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4 uppercase tracking-widest">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm">
                  <i className="fas fa-fire"></i>
                </div>
                Xu hướng Kỹ năng
              </h2>
              <div className="space-y-4">
                {analytics.topSkillsInDemand.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${index < 3 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{index + 1}</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{skill.skillName}</span>
                    </div>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">{skill.jobCount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

