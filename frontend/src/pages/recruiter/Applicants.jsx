import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { getFullUrl } from '../../utils/apiUtils';

export default function Applicants() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      setSelectedJobId(jobIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedJobId) {
      loadApplicants(selectedJobId);
    } else if (jobs.length > 0) {
      // Clear applicants if no job selected (though we auto-select usually)
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getMyJobs(0, 100);
      const jobsList = data.content || data || [];
      setJobs(jobsList);

      // Auto toggle to first job if not selected
      if (jobsList.length > 0 && !selectedJobId) {
        // Only set if we don't have one from URL
        if (!searchParams.get('jobId')) {
          setSelectedJobId(jobsList[0].id);
        }
      }
    } catch (error) {
      if (error.response?.status === 410) {
        console.warn('No company found (410). Empty jobs list.');
        setJobs([]);
      } else {
        console.error('Error loading jobs:', error);
      }
    } finally {
      if (!selectedJobId) setLoading(false);
      // If we selected a job, the other effect will trigger and handle loading state
    }
  };

  const loadApplicants = async (jobId) => {
    try {
      setLoading(true);
      const data = await api.getJobApplicants(jobId, 0, 100);
      setApplicants(data.content || data || []);
    } catch (error) {
      console.error('Error loading applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.updateApplicationStatus(applicationId, status, '');
      loadApplicants(selectedJobId);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật'));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const columns = {
    new: applicants.filter(a => a.status === 'PENDING'),
    viewed: applicants.filter(a => a.status === 'VIEWED'),
    interview: applicants.filter(a => a.status === 'INTERVIEW'),
    offered: applicants.filter(a => ['OFFERED', 'ACCEPTED', 'REJECTED'].includes(a.status)),
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-6 animate-fade-in max-w-[1920px] mx-auto overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Quản lý ứng viên
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi và quản lý quy trình tuyển dụng theo thời gian thực</p>
        </div>

        <div className="relative min-w-[320px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="fas fa-briefcase text-blue-500"></i>
          </div>
          <select
            className="w-full pl-11 pr-10 py-3.5 bg-white dark:bg-gray-800 border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl shadow-lg shadow-blue-500/5 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700 dark:text-gray-200 appearance-none cursor-pointer"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">-- Chọn tin tuyển dụng --</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
            <i className="fas fa-chevron-down text-sm"></i>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/40 dark:bg-gray-800/40 backdrop-blur-md rounded-3xl border border-white/20">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 font-bold text-lg">Đang tải dữ liệu hồ sơ...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="h-full flex gap-8 min-w-max px-2">

            {/* Column: New */}
            <KanbanColumn
              title="Mới ứng tuyển"
              count={columns.new.length}
              icon="fa-bell"
              color="blue"
              applicants={columns.new}
              onStatusChange={updateStatus}
              formatDate={formatDate}
            />

            {/* Column: Viewed */}
            <KanbanColumn
              title="Đã xem hồ sơ"
              count={columns.viewed.length}
              icon="fa-eye"
              color="indigo"
              applicants={columns.viewed}
              onStatusChange={updateStatus}
              formatDate={formatDate}
            />

            {/* Column: Interview */}
            <KanbanColumn
              title="Phỏng vấn"
              count={columns.interview.length}
              icon="fa-comments"
              color="amber"
              applicants={columns.interview}
              onStatusChange={updateStatus}
              formatDate={formatDate}
            />

            {/* Column: Done (Offered/Rejected) */}
            <KanbanColumn
              title="Đã xử lý"
              count={columns.offered.length}
              icon="fa-check-circle"
              color="emerald"
              applicants={columns.offered}
              onStatusChange={updateStatus}
              formatDate={formatDate}
            />

          </div>
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ title, count, icon, color, applicants, onStatusChange, formatDate }) {
  const colorStyles = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 shadow-blue-500/10',
    indigo: 'from-indigo-500 to-purple-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-indigo-500/10',
    amber: 'from-amber-400 to-orange-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 shadow-amber-500/10',
    emerald: 'from-emerald-400 to-teal-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 shadow-emerald-500/10',
  };

  const headerGradient = colorStyles[color].split(' ')[0] + ' ' + colorStyles[color].split(' ')[1];
  const bgBadge = colorStyles[color].split(' ').slice(2, 5).join(' '); // Extract bg and text color parts roughly

  return (
    <div className="w-[380px] flex flex-col h-full bg-gray-50/60 dark:bg-gray-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/50 dark:border-white/5 shadow-2xl flex-shrink-0">
      {/* Column Header */}
      <div className={`p-6 rounded-t-[2rem] border-b border-gray-100 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${headerGradient} flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-110`}>
            <i className={`fas ${icon} text-lg`}></i>
          </div>
          <h3 className="font-extrabold text-gray-800 dark:text-white text-xl tracking-tight">{title}</h3>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-sm font-bold bg-white dark:bg-gray-800/50 shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300`}>
          {count}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {applicants.length === 0 ? (
          <div className="h-48 border-2 border-dashed border-gray-200 dark:border-gray-700/50 rounded-3xl flex flex-col items-center justify-center text-gray-400 opacity-60 m-2">
            <i className="fas fa-inbox text-4xl mb-3"></i>
            <span className="font-semibold">Chưa có ứng viên</span>
          </div>
        ) : (
          applicants.map(app => (
            <ApplicantCard
              key={app.id}
              applicant={app}
              onStatusChange={onStatusChange}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}


function ApplicantCard({ applicant, onStatusChange, formatDate }) {
  const [showDetails, setShowDetails] = useState(false);
  const studentName = applicant.student?.user?.fullName || applicant.student?.fullName || applicant.studentName || 'Ứng viên ẩn danh';
  const studentUserId = applicant.student?.user?.id || applicant.student?.userId;
  // Helper for avatar URL
  const getAvatar = (url) => {
    return getFullUrl(url);
  };
  const matchScore = applicant.matchScore ? parseFloat(applicant.matchScore) : 0;

  const getScoreColor = () => {
    if (matchScore >= 80) return 'text-emerald-500';
    if (matchScore >= 60) return 'text-amber-500';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 group hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-600">
            {applicant.student?.avatarUrl ? (
              <img src={getAvatar(applicant.student.avatarUrl)} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-white dark:bg-gray-800">
                {studentName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
              {studentName}
            </h4>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <i className="far fa-clock"></i> {formatDate(applicant.appliedAt)}
            </p>
          </div>
        </div>
        {matchScore > 0 && (
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-gray-700" />
              <circle cx="22" cy="22" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={113} strokeDashoffset={113 - (matchScore / 100 * 113)} className={getScoreColor()} />
            </svg>
            <span className={`absolute text-[11px] font-bold ${getScoreColor()}`}>{matchScore.toFixed(0)}</span>
          </div>
        )}
      </div>

      {/* Status Badge (if finished) */}
      {['ACCEPTED', 'REJECTED', 'OFFERED'].includes(applicant.status) && (
        <div className={`text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-3 ${applicant.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' :
          applicant.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
          <i className={`fas ${applicant.status === 'ACCEPTED' ? 'fa-check' : applicant.status === 'REJECTED' ? 'fa-times' : 'fa-info-circle'}`}></i>
          {applicant.status}
        </div>
      )}

      {/* AI Notes */}
      {applicant.aiNotes && (
        <div className="text-sm bg-blue-50/60 dark:bg-blue-900/20 p-3 rounded-xl mb-4 text-gray-700 dark:text-gray-300 border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-2 mb-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <i className="fas fa-magic"></i> Insight AI
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed opacity-90">{applicant.aiNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {applicant.cvId && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const blob = await api.downloadCV(applicant.cvId);
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
              } catch (error) {
                console.error('Error viewing CV:', error);
                alert('Không thể mở CV');
              }
            }}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-bold flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 group/btn"
          >
            <i className="far fa-file-pdf text-red-500 group-hover/btn:scale-110 transition-transform"></i> Xem CV
          </button>
        )}

        {/* Message Button */}
        {studentUserId && (
          <Link
            to="/recruiter/messages"
            state={{ recipientId: studentUserId }}
            onClick={(e) => e.stopPropagation()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 hover:scale-105"
            title="Nhắn tin"
          >
            <i className="fas fa-comment-alt"></i>
          </Link>
        )}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${showDetails ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500'}`}
        >
          <i className={`fas fa-${showDetails ? 'chevron-up' : 'chevron-down'}`}></i>
        </button>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-slide-down">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button onClick={() => onStatusChange(applicant.id, 'VIEWED')} className="p-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">Đã xem</button>
            <button onClick={() => onStatusChange(applicant.id, 'INTERVIEW')} className="p-2.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">Phỏng vấn</button>
            <button onClick={() => onStatusChange(applicant.id, 'OFFERED')} className="p-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">Offer</button>
            <button onClick={() => onStatusChange(applicant.id, 'REJECTED')} className="p-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Từ chối</button>
          </div>

          {applicant.coverLetter && (
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="font-bold block mb-1 text-gray-800 dark:text-gray-200">Cover Letter:</span>
              {applicant.coverLetter}
            </div>
          )}

          <div className="text-[10px] text-gray-400 mt-3 text-center font-mono">
            ID: {applicant.id.split('-')[0]}...
          </div>
        </div>
      )}
    </div>
  );
}
