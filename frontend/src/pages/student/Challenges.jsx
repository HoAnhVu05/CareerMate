import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function Challenges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');

  // Stats
  const [stats, setStats] = useState({
    points: 0,
    completed: 0,
    badges: 0
  });

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  useEffect(() => {
    // Update active tab from URL if changed externally
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [allChallenges, myParticipations, badges] = await Promise.all([
        api.getChallenges(selectedCategory),
        api.getMyChallenges().catch(() => []),
        api.getMyBadges().catch(() => [])
      ]);

      setMyChallenges(Array.isArray(myParticipations) ? myParticipations : []);
      setMyBadges(Array.isArray(badges) ? badges : []);

      // Filter logic: In "All Challenges", show only those NOT completed or NOT participated?
      // For now, retaining existing logic: "All" shows everything available (maybe excluding completed?)
      // The original code filtered out completed ones. Let's keep that to avoid clutter.
      const completedIds = new Set(
        (Array.isArray(myParticipations) ? myParticipations : [])
          .filter(p => p.status === 'COMPLETED')
          .map(p => p.challenge?.id)
          .filter(Boolean)
      );

      const available = (Array.isArray(allChallenges) ? allChallenges : [])
        .filter(c => !completedIds.has(c.id));

      setChallenges(available);

      // Calculate stats
      const points = (Array.isArray(myParticipations) ? myParticipations : [])
        .reduce((sum, p) => sum + (p.score || 0), 0);

      setStats({
        points,
        completed: completedIds.size,
        badges: Array.isArray(badges) ? badges.length : 0
      });

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleRetryChallenge = async (challengeId) => {
    if (!window.confirm('Bạn có chắc muốn làm lại thử thách này? Kết quả cũ sẽ bị xóa.')) return;
    try {
      await api.deleteChallengeParticipation(challengeId);
      loadData();
      window.location.href = `/student/challenges/${challengeId}`;
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể làm lại thử thách'));
    }
  };

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'SKILL', label: 'Kỹ năng' },
    { value: 'CAREER', label: 'Nghề nghiệp' },
    { value: 'CV', label: 'CV Check' },
    { value: 'INTERVIEW', label: 'Phỏng vấn' },
  ];

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'EASY': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'HARD': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black font-sans pb-12">
      {/* 1. Hero / Stats Section */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 pt-8 pb-12 px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Thử thách & Huy hiệu</h1>
              <p className="text-gray-600 dark:text-gray-400">Hoàn thành thử thách để nâng cao kỹ năng và nhận huy hiệu danh giá</p>
            </div>

            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/30 w-32 text-center">
                <div className="text-3xl font-bold mb-1">{stats.points}</div>
                <div className="text-xs font-medium opacity-90 uppercase tracking-wide">Điểm XP</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-4 text-white shadow-lg shadow-blue-500/30 w-32 text-center">
                <div className="text-3xl font-bold mb-1">{stats.completed}</div>
                <div className="text-xs font-medium opacity-90 uppercase tracking-wide">Hoàn thành</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg shadow-purple-500/30 w-32 text-center">
                <div className="text-3xl font-bold mb-1">{stats.badges}</div>
                <div className="text-xs font-medium opacity-90 uppercase tracking-wide">Huy hiệu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 2. Controls & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Custom Tab Switcher */}
          <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 flex shadow-sm">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Khám phá
            </button>
            <button
              onClick={() => handleTabChange('my')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Của tôi
            </button>
            <button
              onClick={() => handleTabChange('badges')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'badges' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Bộ sưu tập
            </button>
          </div>

          {/* Filters (Only for Discover tab) */}
          {activeTab === 'all' && (
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium cursor-pointer"
              >
                {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-3.5 text-gray-400 pointer-events-none"></i>
            </div>
          )}
        </div>

        {/* 3. Content Area */}
        {loading && challenges.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* BADGES GALLERY */}
            {activeTab === 'badges' && (
              <div className="animate-fade-in">
                {myBadges.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fas fa-medal text-4xl text-gray-300"></i>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có huy hiệu nào</h3>
                    <p className="text-gray-500">Hoàn thành các thử thách để mở khóa bộ sưu tập của bạn!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {myBadges.map((badge, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 group">
                        <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                          {/* Emoji Mapping based on name/category if visual assets missing */}
                          {badge.category === 'CV' ? '📄' :
                            badge.category === 'INTERVIEW' ? '🎤' :
                              badge.category === 'CAREER' ? '🎯' : '🏆'}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{badge.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.rarity === 'LEGENDARY' ? 'bg-yellow-100 text-yellow-700' :
                            badge.rarity === 'EPIC' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {badge.rarity || 'Common'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CHALLENGES GRID (ALL & MY) */}
            {activeTab !== 'badges' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {(activeTab === 'all' ? challenges : myChallenges.map(c => c.challenge).filter(Boolean)).length === 0 ? (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-gray-500 text-lg">Không tìm thấy thử thách nào phù hợp.</p>
                  </div>
                ) : (
                  (activeTab === 'all' ? challenges : myChallenges.map(c => c.challenge).filter(Boolean)).map((challenge) => {
                    const participation = activeTab === 'my' ? myChallenges.find(c => c.challenge?.id === challenge.id) : null;
                    const isCompleted = participation?.status === 'COMPLETED';

                    return (
                      <div key={challenge.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(challenge.difficulty || 'MEDIUM')}`}>
                              {challenge.difficulty || 'MEDIUM'}
                            </span>
                            {isCompleted && (
                              <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                <i className="fas fa-check"></i>
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {challenge.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                            {challenge.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <i className="fas fa-star text-yellow-400"></i>
                              {challenge.points || 0} XP
                            </span>
                            {challenge.badge && (
                              <span className="flex items-center gap-1.5" title="Phần thưởng huy hiệu">
                                <i className="fas fa-medal text-purple-400"></i>
                                Huy hiệu
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                          {isCompleted ? (
                            <div className="flex gap-2">
                              <div className="flex-1 py-1.5 text-center font-bold text-green-600">
                                <div className="text-xs text-gray-400 font-normal uppercase">Điểm đạt được</div>
                                {participation.score}/100
                              </div>
                              <button
                                onClick={() => handleRetryChallenge(challenge.id)}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition shadow-sm"
                              >
                                Làm lại
                              </button>
                            </div>
                          ) : (
                            <Link
                              to={`/student/challenges/${challenge.id}`}
                              className="flex items-center justify-center w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                            >
                              {participation ? 'Tiếp tục' : 'Tham gia ngay'}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
