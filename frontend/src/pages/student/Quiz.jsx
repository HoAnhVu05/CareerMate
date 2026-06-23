import { useState } from 'react';

export default function Quiz() {
  const [quizType, setQuizType] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const careerOrientationQuestions = [
    {
      question: 'Bạn thích làm việc như thế nào?',
      options: [
        'Làm việc độc lập, tự chủ',
        'Làm việc nhóm, hợp tác',
        'Lãnh đạo và quản lý',
        'Sáng tạo và đổi mới',
      ],
    },
    {
      question: 'Môi trường làm việc bạn mong muốn?',
      options: [
        'Văn phòng truyền thống',
        'Làm việc từ xa',
        'Môi trường năng động, startup',
        'Công ty lớn, ổn định',
      ],
    },
    {
      question: 'Bạn quan tâm đến điều gì nhất trong công việc?',
      options: [
        'Mức lương và phúc lợi',
        'Cơ hội phát triển',
        'Cân bằng cuộc sống',
        'Ý nghĩa và tác động',
      ],
    },
  ];

  const skillsQuestions = [
    {
      question: 'Bạn tự đánh giá kỹ năng lập trình của mình?',
      options: [
        'Mới bắt đầu',
        'Cơ bản',
        'Trung bình',
        'Nâng cao',
      ],
    },
    {
      question: 'Bạn có kinh nghiệm làm việc nhóm?',
      options: [
        'Chưa có',
        'Ít (1-2 dự án)',
        'Trung bình (3-5 dự án)',
        'Nhiều (5+ dự án)',
      ],
    },
    {
      question: 'Bạn tự tin với kỹ năng giao tiếp?',
      options: [
        'Rất tự tin',
        'Khá tự tin',
        'Trung bình',
        'Cần cải thiện',
      ],
    },
  ];

  const questions = quizType === 'career' ? careerOrientationQuestions : skillsQuestions;

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers) => {
    // Simple scoring logic
    const score = Object.values(finalAnswers).reduce((sum, ans) => sum + (ans + 1), 0);
    const maxScore = questions.length * 4;
    const percentage = (score / maxScore) * 100;

    let recommendation = '';
    if (quizType === 'career') {
      if (percentage >= 75) {
        recommendation = 'Bạn có định hướng nghề nghiệp rõ ràng. Hãy tập trung phát triển kỹ năng chuyên môn và tìm kiếm cơ hội phù hợp.';
      } else if (percentage >= 50) {
        recommendation = 'Bạn đang trong quá trình tìm hiểu. Hãy thử nghiệm nhiều lĩnh vực khác nhau để tìm ra đam mê của mình.';
      } else {
        recommendation = 'Hãy dành thời gian để khám phá bản thân và các lĩnh vực nghề nghiệp khác nhau.';
      }
    } else {
      if (percentage >= 75) {
        recommendation = 'Kỹ năng của bạn đang ở mức tốt. Hãy tiếp tục phát triển và tìm kiếm cơ hội thử thách hơn.';
      } else if (percentage >= 50) {
        recommendation = 'Bạn có nền tảng cơ bản. Hãy tập trung cải thiện các kỹ năng còn yếu và thực hành nhiều hơn.';
      } else {
        recommendation = 'Hãy bắt đầu với các khóa học cơ bản và thực hành thường xuyên để cải thiện kỹ năng.';
      }
    }

    setResult({
      score: Math.round(percentage),
      recommendation,
    });
  };

  const handleRestart = () => {
    setQuizType(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  if (!quizType) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Bài kiểm tra</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => setQuizType('career')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer hover:shadow-md transition"
          >
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <i className="fas fa-compass text-blue-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Định hướng nghề nghiệp</h2>
            <p className="text-gray-600">
              Tìm hiểu sở thích, tính cách và định hướng nghề nghiệp phù hợp với bạn
            </p>
          </div>
          <div
            onClick={() => setQuizType('skills')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 cursor-pointer hover:shadow-md transition"
          >
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <i className="fas fa-chart-line text-green-600 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Đánh giá kỹ năng</h2>
            <p className="text-gray-600">
              Đánh giá mức độ kỹ năng hiện tại và nhận gợi ý cải thiện
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-200 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-600 text-white text-4xl font-bold mb-4">
              {result.score}%
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kết quả bài kiểm tra</h2>
            <p className="text-lg text-gray-700">{result.recommendation}</p>
          </div>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <i className="fas fa-redo mr-2"></i>Làm lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleRestart}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <i className="fas fa-arrow-left mr-2"></i>Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          {quizType === 'career' ? 'Định hướng nghề nghiệp' : 'Đánh giá kỹ năng'}
        </h1>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Câu {currentQuestion + 1} / {questions.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {questions[currentQuestion].question}
        </h2>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-700 font-medium"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

