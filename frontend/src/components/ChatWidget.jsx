import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

export default function ChatWidget({ role = 'STUDENT' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Draggable state
  const isMobileLayout = window.location.pathname.includes('/mobile');
  const [position, setPosition] = useState({
    bottom: isMobileLayout ? 100 : 24,
    right: 24
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessages = {
      STUDENT: 'Xin chào! Tôi là Career AI Coach. Tôi có thể giúp bạn:\n\n• Phân tích CV (upload file PDF)\n• Tư vấn nghề nghiệp\n• Đề xuất kỹ năng cần phát triển\n• Luyện tập phỏng vấn',
      RECRUITER: 'Xin chào! Tôi là AI Assistant cho Nhà tuyển dụng. Tôi có thể giúp bạn:\n\n• Tìm ứng viên phù hợp\n• Phân tích CV ứng viên\n• Đề xuất câu hỏi phỏng vấn',
      ADMIN: 'Xin chào! Tôi là AI Assistant cho Admin. Tôi có thể giúp bạn:\n\n• Phân tích dữ liệu hệ thống\n• Đề xuất cải thiện\n• Báo cáo và thống kê',
    };

    setMessages([
      {
        role: 'assistant',
        content: welcomeMessages[role] || welcomeMessages.STUDENT,
      },
    ]);
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle global drag events
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = dragStart.x - clientX;
      const deltaY = dragStart.y - clientY;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        setHasMoved(true);
      }

      setPosition(prev => ({
        bottom: prev.bottom + deltaY,
        right: prev.right + deltaX
      }));

      setDragStart({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e) => {
    if (e.type === 'mousedown' && e.button !== 0) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setHasMoved(false);
  };

  const handleButtonClick = () => {
    if (!hasMoved) setIsOpen(!isOpen);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('Chỉ chấp nhận file PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadCV = async () => {
    if (!selectedFile) return;
    try {
      setUploadingCV(true);
      const userMessage = {
        role: 'user',
        content: `Đã upload CV: ${selectedFile.name}`,
        file: selectedFile.name,
      };
      setMessages((prev) => [...prev, userMessage]);

      const cv = await api.uploadCV(selectedFile);
      const analysis = await api.analyzeCV(cv.id);

      if (analysis.error) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: `❌ Lỗi phân tích: ${analysis.error}`,
        }]);
      } else {
        const score = analysis.score || analysis.overallScore;
        const summary = analysis.summary || 'CV của bạn có tiềm năng nhưng cần cải thiện một số điểm.';
        const suggestions = analysis.suggestions || [];

        let content = `✅ Đã phân tích CV!\n\n`;
        content += score !== undefined ? `📊 Điểm số: ${score}/100\n\n` : '';
        content += `${summary}\n\n`;
        if (suggestions.length > 0) {
          content += `💡 Gợi ý:\n${suggestions.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        }
        content += `Xem chi tiết tại trang CV của bạn.`;
        setMessages((prev) => [...prev, { role: 'assistant', content }]);
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '❌ Lỗi: ' + (error.response?.data?.message || 'Không thể phân tích CV.'),
      }]);
    } finally {
      setUploadingCV(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Chưa đăng nhập.');

      const response = await api.client.post('/ai/chat', {
        message: userMessage.content,
        context: role.toLowerCase(),
        role: role,
      });

      const data = response.data;
      const aiResponse = data.response || data.message || 'Xin lỗi, tôi không thể trả lời ngay bây giờ.';
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error calling AI chat:', error);
      const fallbackMessages = {
        STUDENT: 'Dịch vụ AI đang bận. Bạn có thể thử upload CV để được phân tích nhé.',
        RECRUITER: 'Dịch vụ AI đang bận. Tôi có thể giúp bạn tìm kiếm ứng viên sau.',
        ADMIN: 'Dịch vụ AI đang bận. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: fallbackMessages[role] || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = {
    STUDENT: ['Cách cải thiện CV?', 'Kỹ năng IT cần thiết?', 'Lộ trình phát triển?'],
    RECRUITER: ['Cách tìm ứng viên?', 'Câu hỏi phỏng vấn?', 'Đánh giá CV?'],
    ADMIN: ['Thống kê người dùng?', 'Báo cáo hệ thống?', 'Tối ưu nội dung?'],
  };

  return (
    <>
      {/* Draggable Chat Button */}
      <div
        style={{
          position: 'fixed',
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          touchAction: 'none',
          zIndex: 50
        }}
        className={`transition-transform duration-200 ${isDragging ? 'scale-95 cursor-grabbing' : 'hover:scale-105 cursor-pointer'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="relative group h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-100 via-yellow-300 to-yellow-500 p-[2px] shadow-2xl shadow-yellow-500/40 border border-white animate-pulse"
        >
          <div className="h-full w-full rounded-full bg-gradient-to-br from-white via-yellow-50 to-yellow-100 flex items-center justify-center overflow-hidden relative">
            {/* Shimmer effect - Hiệu ứng lấp lánh */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_1.5s_infinite]"></div>

            {isOpen ? (
              <i className="fas fa-times text-2xl text-yellow-600 relative z-10"></i>
            ) : (
              // Miss Universe 4-pointed Star SVG - Sao 4 cánh xoay
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-yellow-600 animate-[spin_10s_linear_infinite] relative z-10" fill="currentColor">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
              </svg>
            )}
          </div>
          {/* Status Dot */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
          </span>
        </button>
      </div>

      {/* Glassmorphic Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: `${position.bottom + 80}px`,
            right: `${position.right}px`,
            zIndex: 50
          }}
          className="w-[380px] max-w-[95vw] h-[600px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/80 backdrop-blur-xl animate-scale-in origin-bottom-right"
        >
          {/* Header */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none z-0"></div>

          <div className="relative z-10 p-5 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-md text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <i className="fas fa-robot text-lg text-indigo-100"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-wide">AI Assistant</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                    <span className="text-xs font-medium">Always Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <i className="fas fa-minus text-xs"></i>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-slate-50/50 relative">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-md mt-1 flex-shrink-0">
                    <i className="fas fa-robot"></i>
                  </div>
                )}

                <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                  <div
                    className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                  >
                    {msg.file && (
                      <div className="mb-2 pb-2 border-b border-white/20 flex items-center gap-2">
                        <i className="fas fa-file-pdf text-red-200"></i>
                        <span className="font-medium truncate">{msg.file}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 px-1 opacity-70">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs mt-1 flex-shrink-0">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-md mt-1 flex-shrink-0">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Actions */}
          <div className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-white/20 p-4">
            {/* Quick Chips */}
            {messages.length === 1 && (
              <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar hide-scrollbar">
                {(quickQuestions[role] || []).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium border border-indigo-100 hover:bg-indigo-100 transition active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* File & Input */}
            <div className="space-y-3">
              {role === 'STUDENT' && !selectedFile && !uploadingCV && (
                <div onClick={() => fileInputRef.current?.click()} className="group cursor-pointer flex items-center justify-between p-2.5 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                      <i className="fas fa-file-pdf"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Phân tích CV</p>
                      <p className="text-[10px] text-gray-400">Tải lên PDF để chấm điểm</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-1 transition-transform"></i>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <i className="fas fa-file-pdf text-red-500"></i>
                    <span className="text-xs font-semibold text-indigo-900 truncate max-w-[180px]">{selectedFile.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={handleUploadCV} disabled={uploadingCV} className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs shadow-sm">
                      {uploadingCV ? <i className="fas fa-spinner fa-spin"></i> : 'Gửi'}
                    </button>
                    <button onClick={() => setSelectedFile(null)} className="p-1.5 text-gray-400 hover:text-red-500">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi tôi bất cứ điều gì..."
                  className="w-full bg-gray-100 hover:bg-white focus:bg-white text-gray-800 text-sm rounded-xl py-3 pl-4 pr-12 border border-transparent focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="absolute right-2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none disabled:scale-100"
                >
                  {loading ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-paper-plane text-xs"></i>}
                </button>
              </form>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-20 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      )}
    </>
  );
}
