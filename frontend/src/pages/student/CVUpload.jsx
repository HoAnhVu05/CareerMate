import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CVUpload() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Ref for file input
  const inputRef = useRef(null);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      setLoading(true);
      const data = await api.getCVs();
      setCvs(data || []);
    } catch (error) {
      console.error('Error loading CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validation
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf') &&
      !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      alert('Chỉ chấp nhận file PDF, DOCX hoặc DOC');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File không được vượt quá 10MB');
      return;
    }

    // Upload Process
    try {
      setUploading(true);
      setUploadProgress(10);

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      console.log('Uploading CV file:', file.name);
      const response = await api.uploadCV(file);

      clearInterval(interval);
      setUploadProgress(100);

      if (response && response.id) {
        setTimeout(async () => {
          await loadCVs();
          setUploading(false);
          setUploadProgress(0);
        }, 500); // Wait for 100% animation
      } else {
        throw new Error('Không nhận được phản hồi từ server');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      const errorMsg = error.response?.data?.error || 'Không thể tải CV. Vui lòng thử lại.';
      alert('❌ Lỗi: ' + errorMsg);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const handleDeleteCV = async (cvId, fileName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa CV "${fileName || 'này'}"?`)) {
      return;
    }
    try {
      await api.deleteCV(cvId);
      await loadCVs();
    } catch (error) {
      console.error('Error deleting CV:', error);
      alert('❌ Không thể xóa CV.');
    }
  };

  const handleViewCV = async (cv) => {
    try {
      // Use the dedicated download endpoint which handles auth and paths correctly
      const blob = await api.downloadCV(cv.id);

      // Create object URL from blob
      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, '_blank');

      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Error viewing CV:', error);
      alert('❌ Không thể mở file CV. Vui lòng thử lại.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Quản lý hồ sơ CV</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Tải lên CV của bạn để hệ thống AI phân tích và gợi ý việc làm phù hợp nhất.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
              : uploading
                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />

            {uploading ? (
              <div className="py-8">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-blue-600 text-sm">{uploadProgress}%</div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Đang xử lý CV...</h3>
                <p className="text-slate-500 text-sm">Hệ thống đang tải lên và phân tích dữ liệu</p>
              </div>
            ) : (
              <div className="py-4">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg transform transition-transform duration-300 ${dragActive ? 'scale-110 rotate-12' : ''}`}>
                  <i className="fas fa-cloud-upload-alt text-3xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  Kéo & thả CV của bạn vào đây
                </h3>
                <p className="text-slate-500 mb-6 text-sm">hoặc click để chọn file từ máy tính</p>
                <button
                  onClick={onButtonClick}
                  className="px-8 py-3 bg-white border border-gray-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95"
                >
                  Chọn File
                </button>
                <p className="mt-6 text-xs text-slate-400 uppercase tracking-wide">
                  Hỗ trợ PDF, DOCX (Max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* CV List */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-history text-blue-500"></i>
              CV đã tải lên
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : cvs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-slate-500">Chưa có CV nào được tải lên.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cvs.map((cv, index) => (
                  <div
                    key={cv.id}
                    className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-file-pdf text-xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-slate-800 dark:text-white truncate pr-4">
                            {cv.fileName || `CV #${index + 1}`}
                          </h3>
                          <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {formatDate(cv.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>
                            <i className="fas fa-hdd w-4"></i>
                            {formatFileSize(cv.fileSize)}
                          </span>
                          {cv.aiScore > 0 && (
                            <span className={`flex items-center gap-1 font-bold ${cv.aiScore >= 80 ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                              <i className="fas fa-magic"></i>
                              AI Score: {cv.aiScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewCV(cv)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem CV"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <Link
                          to={`/student/cv/${cv.id}/analysis`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Phân tích AI"
                        >
                          <i className="fas fa-chart-pie"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteCV(cv.id, cv.fileName)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tips & Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <i className="fas fa-magic text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Phân tích</h3>
                <p className="text-blue-100 text-sm">Powered by Gemini</p>
              </div>
            </div>
            <p className="text-blue-50 text-sm mb-4 leading-relaxed">
              Hệ thống sẽ tự động quét CV của bạn để đánh giá kỹ năng, kinh nghiệm và đề xuất các vị trí phù hợp nhất.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <i className="fas fa-check-circle text-green-300"></i>
                <span>Chấm điểm CV theo chuẩn ATS</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <i className="fas fa-check-circle text-green-300"></i>
                <span>Gợi ý từ khóa quan trọng</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <i className="fas fa-check-circle text-green-300"></i>
                <span>So khớp với mô tả công việc</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Mẹo CV ấn tượng</h3>
            <ul className="space-y-4">
              {[
                { icon: 'fas fa-palette', text: 'Sử dụng template hiện đại, tối giản', color: 'text-purple-500' },
                { icon: 'fas fa-image', text: 'Ảnh đại diện chuyên nghiệp, rõ nét', color: 'text-blue-500' },
                { icon: 'fas fa-bolt', text: 'Tập trung vào thành tích định lượng', color: 'text-yellow-500' },
                { icon: 'fas fa-check-double', text: 'Kiểm tra lỗi chính tả kỹ lưỡng', color: 'text-green-500' },
              ].map((tip, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <i className={`${tip.icon} ${tip.color} mt-0.5`}></i>
                  <span>{tip.text}</span>
                </li>
              ))}
            </ul>
            <Link to="/student/cv-templates" className="block w-full text-center mt-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Xem thư viện mẫu CV
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
