import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function JobRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // Get all jobs and sort by relevance (for now, just get recent jobs)
      // In real implementation, this would use AI matching
      const data = await api.searchJobs('', '', 0, 20);
      setRecommendations(data.content || data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const getMatchScore = (job) => {
    // Mock match score - in real implementation, this would come from AI
    return Math.floor(Math.random() * 30) + 70; // 70-100%
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải gợi ý việc làm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-briefcase text-6xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 mb-4">Chưa có gợi ý việc làm nào</p>
          <Link
            to="/student/cv"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Tải CV để nhận gợi ý tốt hơn
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((job) => {
            const matchScore = getMatchScore(job);
            return (
              <Link
                key={job.id}
                to={`/student/jobs/${job.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          {matchScore}% phù hợp
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{job.company?.name || 'Công ty'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location}</span>
                      <span><i className="fas fa-dollar-sign mr-1"></i>
                        {formatCurrency(job.minSalary, job.currency)} - {formatCurrency(job.maxSalary, job.currency)}
                      </span>
                      <span><i className="fas fa-briefcase mr-1"></i>{job.jobType}</span>
                    </div>
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/student/jobs"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium inline-block"
        >
          Xem tất cả việc làm
        </Link>
      </div>
    </div>
  );
}

