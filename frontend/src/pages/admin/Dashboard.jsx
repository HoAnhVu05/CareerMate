import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!stats) return;

    const doc = new jsPDF();
    const today = new Date();
    const dateStr = today.toLocaleDateString('vi-VN');
    const timeStr = today.toLocaleTimeString('vi-VN');

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('CareerMate - Bao Cao He Thong', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Ngay xuat: ${dateStr} ${timeStr}`, 105, 30, { align: 'center' });
    doc.text('Nguoi xuat: Administrator', 105, 36, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);

    // Summary Stats
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Tong Quan He Thong', 20, 55);

    const summaryData = [
      ['Chi so', 'Gia tri', 'Tang truong'],
      ['Tong nguoi dung', stats.totalUsers.toLocaleString(), `${(stats.userGrowthPercentage || 0).toFixed(1)}%`],
      ['Tong viec lam', stats.totalJobs.toLocaleString(), `${(stats.jobGrowthPercentage || 0).toFixed(1)}%`],
      ['Tong bai viet', stats.totalArticles.toLocaleString(), `${(stats.articleGrowthPercentage || 0).toFixed(1)}%`],
      ['Tong don ung tuyen', stats.totalApplications.toLocaleString(), `${(stats.applicationGrowthPercentage || 0).toFixed(1)}%`],
      ['Tong doanh nghiep', stats.totalCompanies.toLocaleString(), `${(stats.companyGrowthPercentage || 0).toFixed(1)}%`],
    ];

    autoTable(doc, {
      startY: 60,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 12, cellPadding: 3 },
    });

    // Details - Jobs
    let finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Chi Tiet Viec Lam', 20, finalY);

    const jobData = [
      ['Trang thai', 'So luong'],
      ['Dang hoat dong', stats.activeJobs.toLocaleString()],
      ['Cho duyet', stats.pendingJobs.toLocaleString()],
    ];

    autoTable(doc, {
      startY: finalY + 5,
      head: [jobData[0]],
      body: jobData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] }, // Amber
    });

    // Details - Articles
    finalY = doc.lastAutoTable.finalY + 15;
    doc.text('Chi Tiet Bai Viet', 20, finalY);

    const articleData = [
      ['Trang thai', 'So luong'],
      ['Da xuat ban', stats.publishedArticles.toLocaleString()],
      ['Ban nhap / Cho duyet', stats.pendingArticles.toLocaleString()],
    ];

    autoTable(doc, {
      startY: finalY + 5,
      head: [articleData[0]],
      body: articleData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }, // Emerald
    });

    // Details - Users (Breakdown)
    finalY = doc.lastAutoTable.finalY + 15;
    doc.text('Phan Bo Nguoi Dung', 20, finalY);

    const userData = [
      ['Vai tro', 'So luong'],
      ['Sinh vien', stats.totalStudents.toLocaleString()],
      ['Nha tuyen dung', stats.totalRecruiters.toLocaleString()],
      ['Quan tri vien', stats.totalAdmins.toLocaleString()],
    ];

    autoTable(doc, {
      startY: finalY + 5,
      head: [userData[0]],
      body: userData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blue
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Trang ${i} / ${pageCount}`, 195, 290, { align: 'right' });
      doc.text('CareerMate System Report - Generated Automatically', 10, 290, { align: 'left' });
    }

    doc.save(`CareerMate_Report_${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}.pdf`);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold tracking-wider animate-pulse">ĐANG TẢI DỮ LIỆU HỆ THỐNG...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-10 text-center bg-red-50/50 dark:bg-red-900/10 backdrop-blur-xl rounded-3xl border border-red-100 dark:border-red-900/30">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
        </div>
        <h3 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">Không thể tải dữ liệu</h3>
        <p className="text-red-700 dark:text-red-300/70 mb-6">Đã có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại sau.</p>
        <button onClick={loadStats} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all"> Thử lại ngay </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Người dùng',
      value: stats.totalUsers,
      growth: stats.userGrowthPercentage || 0,
      icon: 'fa-users',
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20',
      link: '/admin/users',
      detail: `${stats.totalStudents} sinh viên • ${stats.totalRecruiters} nhà tuyển dụng`
    },
    {
      title: 'Việc làm',
      value: stats.totalJobs,
      growth: stats.jobGrowthPercentage || 0,
      icon: 'fa-briefcase',
      gradient: 'from-indigo-600 to-blue-600',
      shadow: 'shadow-indigo-500/20',
      link: '/admin/jobs',
      detail: `${stats.activeJobs} đang đăng • ${stats.pendingJobs} chờ duyệt`
    },
    {
      title: 'Bài viết',
      value: stats.totalArticles,
      growth: stats.articleGrowthPercentage || 0,
      icon: 'fa-newspaper',
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      link: '/admin/articles',
      detail: `${stats.publishedArticles} công khai • ${stats.pendingArticles} bản nháp`
    },
    {
      title: 'Đơn ứng tuyển',
      value: stats.totalApplications,
      growth: stats.applicationGrowthPercentage || 0,
      icon: 'fa-file-signature',
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/20',
      link: null,
      detail: 'Tổng số hồ sơ đã nộp trên hệ thống'
    },
    {
      title: 'Công ty',
      value: stats.totalCompanies,
      growth: stats.companyGrowthPercentage || 0,
      icon: 'fa-building',
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/20',
      link: null,
      detail: 'Các doanh nghiệp đã đăng ký thông tin'
    },
    {
      title: 'Tin nhắn',
      value: '24', // Placeholder for now
      growth: 0,
      icon: 'fa-comments',
      gradient: 'from-violet-500 to-indigo-500',
      shadow: 'shadow-violet-500/20',
      link: '/admin/messages',
      detail: 'Số cuộc hội thoại đang diễn ra'
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Chào buổi chiều, <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Administrator!</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStats}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            title="Làm mới dữ liệu"
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          </button>
          <button
            onClick={handleExportReport}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <i className="fas fa-file-export mr-2"></i> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map((card, index) => {
          const isPositive = card.growth >= 0;
          const growthColorClass = isPositive
            ? 'text-emerald-500 bg-emerald-500/10'
            : 'text-rose-500 bg-rose-500/10';
          const growthIcon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';

          return (
            <div
              key={index}
              className={`group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-800/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => card.link && navigate(card.link)}
            >
              {/* Hover Background Blob */}
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-[0.03] group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`}></div>

              <div className="flex items-start justify-between relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} ${card.shadow} flex items-center justify-center text-white text-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <i className={`fas ${card.icon}`}></i>
                </div>
                {card.link && (
                  <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                    <i className="fas fa-chevron-right text-xs"></i>
                  </div>
                )}
              </div>

              <div className="mt-6 relative z-10">
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{card.title}</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900 dark:text-white">
                    {loading ? '---' : card.value.toLocaleString()}
                  </p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${growthColorClass}`}>
                    <i className={`fas ${growthIcon}`}></i> {Math.abs(card.growth).toFixed(1)}%
                  </span>
                </div>
                <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-1 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200/20 dark:border-slate-700/20 inline-block">
                  {card.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Quick Actions - Left Side */}
        <div className="lg:col-span-3 space-y-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Thao tác nhanh</h2>
                <p className="text-slate-500 font-medium text-sm">Quản lý các đề mục quan trọng cần xử lý ngay</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <i className="fas fa-bolt text-lg"></i>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <button
                onClick={() => navigate('/admin/jobs?status=PENDING')}
                className="group/btn flex items-center gap-4 p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-3xl hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all hover:scale-[1.02]"
              >
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 text-xl group-hover/btn:scale-110 transition-transform">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="text-left">
                  <div className="font-black text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-widest mb-1">Tin tuyển dụng</div>
                  <div className="text-lg font-bold text-amber-900 dark:text-amber-400">{stats.pendingJobs} tin chờ duyệt</div>
                </div>
                <i className="fas fa-chevron-right ml-auto text-amber-300 group-hover/btn:translate-x-1 transition-transform"></i>
              </button>

              <button
                onClick={() => navigate('/admin/articles?status=PENDING')}
                className="group/btn flex items-center gap-4 p-6 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-900/30 rounded-3xl hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all hover:scale-[1.02]"
              >
                <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl group-hover/btn:scale-110 transition-transform">
                  <i className="fas fa-newspaper"></i>
                </div>
                <div className="text-left">
                  <div className="font-black text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-widest mb-1">Nội dung bài viết</div>
                  <div className="text-lg font-bold text-indigo-900 dark:text-indigo-400">{stats.pendingArticles} bài chờ duyệt</div>
                </div>
                <i className="fas fa-chevron-right ml-auto text-indigo-300 group-hover/btn:translate-x-1 transition-transform"></i>
              </button>

              <button
                onClick={() => navigate('/admin/users')}
                className="group/btn flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all hover:scale-[1.02]"
              >
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-400 text-xl group-hover/btn:scale-110 transition-transform">
                  <i className="fas fa-users-cog"></i>
                </div>
                <div className="text-left">
                  <div className="font-black text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-widest mb-1">Người dùng</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Quản lý thành viên</div>
                </div>
                <i className="fas fa-chevron-right ml-auto text-slate-300 group-hover/btn:translate-x-1 transition-transform"></i>
              </button>

              <button
                onClick={() => navigate('/admin/analytics')}
                className="group/btn flex items-center gap-4 p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-3xl hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all hover:scale-[1.02]"
              >
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl group-hover/btn:scale-110 transition-transform">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="text-left">
                  <div className="font-black text-slate-800 dark:text-slate-100 uppercase text-[10px] tracking-widest mb-1">Thống kê chi tiết</div>
                  <div className="text-lg font-bold text-emerald-900 dark:text-emerald-400">Xem phân tích & báo cáo</div>
                </div>
                <i className="fas fa-chevron-right ml-auto text-emerald-300 group-hover/btn:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
        </div>

        {/* System Health / Logs Mini - Right Side */}
        <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '800ms' }}>
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 p-10 shadow-2xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Trạng thái hệ thống</h3>
              <div className="space-y-6">
                {[
                  { name: 'API Gateway', status: 'Healthy', color: 'emerald' },
                  { name: 'Microservices', status: 'Running (8/8)', color: 'blue' },
                  { name: 'Database', status: 'Connected', color: 'emerald' },
                  { name: 'Security layer', status: 'Active', color: 'indigo' },
                ].map((item, id) => (
                  <div key={id} className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 dark:text-slate-400 text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest text-${item.color}-600 dark:text-${item.color}-400`}>{item.status}</span>
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-500 shadow-[0_0_8px_${item.color}-500] animate-pulse`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 p-5 bg-indigo-600 rounded-3xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Bảo mật hệ thống</p>
              <h4 className="text-lg font-bold mb-4">Chứng chỉ SSL hợp lệ</h4>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold text-xs transition-all tracking-wider">XEM CHI TIẾT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

