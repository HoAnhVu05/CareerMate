import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function CVAnalysis() {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (cvId) {
      loadAnalysis();
    }
  }, [cvId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);

      // 1. Fetch CV details first
      const cv = await api.getCV(cvId);
      console.log('Fetched CV:', cv);

      // 2. Check if analysis already exists in CV object
      if (cv.aiAnalysis && Object.keys(cv.aiAnalysis).length > 0) {
        console.log('Using existing analysis from CV');
        setAnalysis(cv.aiAnalysis);
        setLoading(false);
        return;
      }

      // 3. Prepare content for analysis
      let content = "";

      // Use extractedContent if available (from PDF/DOCX extraction)
      if (cv.extractedContent && cv.extractedContent.trim()) {
        content = cv.extractedContent;
        console.log('Using extracted content:', content.substring(0, 100) + '...');
      } else {
        // Fallback: Try to build content from metadata if available
        if (cv.fileName) content += `File: ${cv.fileName}\n`;

        // If still empty, show error
        if (!content.trim()) {
          console.warn('No content available for analysis');
          alert('⚠️ CV này chưa có nội dung để phân tích. Vui lòng upload lại CV hoặc sử dụng CV có định dạng PDF/DOCX.');
          setLoading(false);
          return;
        }
      }

      const requestBody = {
        content: content,
        fileName: cv.fileName,
        fileUrl: cv.fileUrl
      };

      // 4. Call Analyze API
      const data = await api.analyzeCV(cvId, requestBody);
      console.log('CV Analysis response:', data);

      if (data && data.error) {
        console.error('CV Analysis error:', data.error);
        alert('❌ Lỗi phân tích: ' + data.error);
        return;
      }

      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
      const errorMsg = error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Không thể phân tích CV';
      alert('❌ Lỗi: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setAnalyzing(true);
      const data = await api.analyzeCV(cvId);
      setAnalysis(data);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể phân tích CV'));
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Xuất sắc';
    if (score >= 60) return 'Khá tốt';
    if (score >= 40) return 'Cần cải thiện';
    return 'Yếu';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang phân tích CV...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-file-alt text-6xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 mb-4">Chưa có kết quả phân tích</p>
          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {analyzing ? 'Đang phân tích...' : 'Phân tích CV ngay'}
          </button>
        </div>
      </div>
    );
  }

  const score = analysis.score || analysis.overallScore || 0;
  const strengths = analysis.strengths || analysis.positivePoints || [];
  const weaknesses = analysis.weaknesses || analysis.negativePoints || [];
  const suggestions = analysis.suggestions || analysis.recommendations || [];
  const skills = analysis.skills || [];
  const missingSkills = analysis.missingSkills || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to="/student/cv"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
          >
            <i className="fas fa-arrow-left mr-2"></i>Quay lại danh sách CV
          </Link>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={analyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          {analyzing ? 'Đang phân tích...' : 'Phân tích lại'}
        </button>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mb-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Điểm tổng thể</p>
            <div className="flex items-baseline gap-3">
              <span className={`text-6xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                {score}
              </span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <p className={`mt-2 text-lg font-semibold ${getScoreColor(score).split(' ')[0]}`}>
              {getScoreLabel(score)}
            </p>
          </div>
          <div className="text-right">
            <div className="w-32 h-32 relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(score / 100) * 352} 352`}
                  className={getScoreColor(score).split(' ')[0]}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                  {score}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Điểm mạnh</h2>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-3">
              {strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <i className="fas fa-star text-yellow-500 mt-1"></i>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Chưa có thông tin</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <i className="fas fa-exclamation-circle text-red-600 text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Điểm cần cải thiện</h2>
          </div>
          {weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <i className="fas fa-arrow-up text-red-500 mt-1"></i>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Chưa có thông tin</p>
          )}
        </div>
      </div>

      {/* Skills Analysis */}
      {(skills.length > 0 || missingSkills.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Phân tích kỹ năng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Kỹ năng có trong CV</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                    >
                      <i className="fas fa-check mr-1"></i>{skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Kỹ năng cần bổ sung</h3>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                    >
                      <i className="fas fa-plus mr-1"></i>{skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-lightbulb text-blue-600 text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Gợi ý cải thiện</h2>
          </div>
          <ul className="space-y-4">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <i className="fas fa-arrow-right text-blue-600 mt-1"></i>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <Link
          to="/student/cv"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          Quay lại
        </Link>
        <button
          onClick={() => navigate('/student/cv/edit')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <i className="fas fa-edit mr-2"></i>Chỉnh sửa CV
        </button>
      </div>
    </div>
  );
}

