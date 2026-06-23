import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CVTemplateEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cvData, setCvData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: []
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await api.getCVTemplate(id);
      setTemplate(data);
      // Load current profile data if available
      try {
        const profile = await api.getStudentProfile();
        if (profile) {
          setCvData(prev => ({
            ...prev,
            personalInfo: {
              fullName: profile.user?.fullName || '',
              email: profile.user?.email || '',
              phone: profile.user?.phone || '',
              address: profile.address || '',
              linkedin: profile.linkedinUrl || '',
              github: profile.githubUrl || ''
            },
            summary: profile.bio || ''
          }));
        }
      } catch (e) {
        console.log('Could not load profile data');
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'personalInfo') {
      setCvData(prev => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value }
      }));
    } else {
      setCvData(prev => ({
        ...prev,
        [section]: value
      }));
    }
  };

  const addItem = (section) => {
    setCvData(prev => ({
      ...prev,
      [section]: [...prev[section], {}]
    }));
  };

  const removeItem = (section, index) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Chỉ chấp nhận file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File ảnh không được vượt quá 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!cvData.personalInfo.fullName) {
      alert('Vui lòng nhập họ và tên');
      return;
    }
    
    try {
      setSaving(true);
      const savedCV = await api.createCVFromTemplate(id, cvData, photoFile);
      alert('✅ Lưu CV thành công!');
      navigate('/student/cv');
    } catch (error) {
      console.error('Error saving CV:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'Không thể lưu CV. Vui lòng thử lại.';
      alert('❌ Lỗi: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải mẫu CV...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy mẫu CV</h2>
          <button onClick={() => navigate('/student/cv-templates')} className="btn-primary mt-4">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/student/cv-templates')}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Quay lại</span>
          </button>
        </div>
        <button 
          onClick={handleSave} 
          className="btn-primary"
          disabled={saving}
        >
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Đang lưu...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Lưu CV
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cá nhân</h2>
            <div className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <i className="fas fa-user text-gray-400 text-2xl"></i>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photoInput"
                    />
                    <label
                      htmlFor="photoInput"
                      className="btn-secondary cursor-pointer inline-block"
                    >
                      <i className="fas fa-upload mr-2"></i>
                      {photoFile ? 'Đổi ảnh' : 'Chọn ảnh'}
                    </label>
                    {photoFile && (
                      <button
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview(null);
                          document.getElementById('photoInput').value = '';
                        }}
                        className="ml-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        <i className="fas fa-times mr-1"></i>Xóa
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tối đa 5MB, định dạng JPG/PNG</p>
              </div>
              
              <input
                type="text"
                placeholder="Họ và tên"
                value={cvData.personalInfo.fullName}
                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                className="input-field"
              />
              <input
                type="email"
                placeholder="Email"
                value={cvData.personalInfo.email}
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                className="input-field"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={cvData.personalInfo.phone}
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={cvData.personalInfo.address}
                onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                className="input-field"
              />
              <input
                type="url"
                placeholder="LinkedIn URL"
                value={cvData.personalInfo.linkedin}
                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                className="input-field"
              />
              <input
                type="url"
                placeholder="GitHub URL"
                value={cvData.personalInfo.github}
                onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt</h2>
            <textarea
              value={cvData.summary}
              onChange={(e) => handleInputChange('summary', '', e.target.value)}
              className="input-field"
              rows="5"
              placeholder="Viết một đoạn tóm tắt ngắn gọn về bản thân..."
            />
          </div>

          {/* Experience */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Kinh nghiệm</h2>
              <button
                onClick={() => addItem('experience')}
                className="btn-secondary text-sm"
              >
                <i className="fas fa-plus mr-1"></i>
                Thêm
              </button>
            </div>
            <div className="space-y-4">
              {cvData.experience.map((exp, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => removeItem('experience', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Vị trí công việc"
                    value={exp.position || ''}
                    onChange={(e) => {
                      const newExp = [...cvData.experience];
                      newExp[index] = { ...newExp[index], position: e.target.value };
                      setCvData(prev => ({ ...prev, experience: newExp }));
                    }}
                    className="input-field mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Công ty"
                    value={exp.company || ''}
                    onChange={(e) => {
                      const newExp = [...cvData.experience];
                      newExp[index] = { ...newExp[index], company: e.target.value };
                      setCvData(prev => ({ ...prev, experience: newExp }));
                    }}
                    className="input-field mb-2"
                  />
                  <textarea
                    placeholder="Mô tả công việc"
                    value={exp.description || ''}
                    onChange={(e) => {
                      const newExp = [...cvData.experience];
                      newExp[index] = { ...newExp[index], description: e.target.value };
                      setCvData(prev => ({ ...prev, experience: newExp }));
                    }}
                    className="input-field"
                    rows="3"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Học vấn</h2>
              <button
                onClick={() => addItem('education')}
                className="btn-secondary text-sm"
              >
                <i className="fas fa-plus mr-1"></i>
                Thêm
              </button>
            </div>
            <div className="space-y-4">
              {cvData.education.map((edu, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => removeItem('education', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Trường học"
                    value={edu.school || ''}
                    onChange={(e) => {
                      const newEdu = [...cvData.education];
                      newEdu[index] = { ...newEdu[index], school: e.target.value };
                      setCvData(prev => ({ ...prev, education: newEdu }));
                    }}
                    className="input-field mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Chuyên ngành"
                    value={edu.major || ''}
                    onChange={(e) => {
                      const newEdu = [...cvData.education];
                      newEdu[index] = { ...newEdu[index], major: e.target.value };
                      setCvData(prev => ({ ...prev, education: newEdu }));
                    }}
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="card p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xem trước</h3>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">{cvData.personalInfo.fullName || 'Họ và tên'}</h2>
                <p className="text-sm text-gray-600">
                  {cvData.personalInfo.email || 'email@example.com'} | 
                  {cvData.personalInfo.phone || ' 0123456789'}
                </p>
              </div>
              {cvData.summary && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Tóm tắt</h3>
                  <p className="text-sm">{cvData.summary}</p>
                </div>
              )}
              {cvData.experience.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Kinh nghiệm</h3>
                  {cvData.experience.map((exp, i) => (
                    <div key={i} className="mb-2">
                      <p className="font-semibold text-sm">{exp.position || 'Vị trí'}</p>
                      <p className="text-xs text-gray-600">{exp.company || 'Công ty'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
