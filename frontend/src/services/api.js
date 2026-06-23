/**
 * API Client for CareerMate Frontend
 * Tương thích với api-client.js hiện tại
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class CareerMateAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadTokens();

    // Setup axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Helper function to detect public auth endpoints that don't need tokens
    const isPublicAuthEndpoint = (url) => {
      if (!url) return false;
      const publicPatterns = [
        '/auth/login',
        '/auth/register',
        '/auth/oauth-login',
        '/auth/refresh',
        '/auth/forgot-password',
        '/auth/reset-password'
      ];
      return publicPatterns.some(pattern => url.includes(pattern));
    };

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Skip token injection for public auth endpoints
        if (isPublicAuthEndpoint(config.url)) {
          return config;
        }

        // Reload token from localStorage on each request
        this.loadTokens();
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          // Log for challenge endpoints
          if (config.url && (config.url.includes('/challenges') || config.url.includes('/students/profile') || config.url.includes('/quiz'))) {
            console.log('API Request - URL:', config.url);
            console.log('API Request - Method:', config.method);
            console.log('API Request - Token:', this.token ? this.token.substring(0, 20) + '...' : 'NO TOKEN');
            console.log('API Request - Has Authorization header:', !!config.headers.Authorization);
            console.log('API Request - Authorization header value:', config.headers.Authorization ? config.headers.Authorization.substring(0, 30) + '...' : 'NONE');
          }
        } else {
          console.warn('No token found in localStorage for URL:', config.url);
          if (config.url && (config.url.includes('/challenges') || config.url.includes('/students/profile'))) {
            console.error('API Request - Missing token! Please login again.');
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          // DO NOT retry for public auth endpoints
          if (isPublicAuthEndpoint(originalRequest.url)) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  getFileUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Format: http://localhost:8080/api/uploads/...
    // Ensure we don't double slash if baseURL ends with / and url starts with /
    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const cleanUrl = url.startsWith('/') ? url : '/' + url;

    return `${baseUrl}${cleanUrl}`;
  }

  loadTokens() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: this.refreshToken,
      });

      // Backend returns 'accessToken', not 'token'
      const token = response.data.accessToken || response.data.token;
      if (token) {
        this.token = token;
        localStorage.setItem('token', this.token);
        if (response.data.refreshToken) {
          this.refreshToken = response.data.refreshToken;
          localStorage.setItem('refreshToken', this.refreshToken);
        }
        return this.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.token = null;
    this.refreshToken = null;
    window.location.href = '/login';
  }

  // Auth APIs
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    // Backend returns 'accessToken', not 'token'
    const token = response.data.accessToken || response.data.token;
    if (token) {
      this.token = token;
      this.refreshToken = response.data.refreshToken;
      localStorage.setItem('token', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Login successful. Token saved:', this.token.substring(0, 20) + '...');
    } else {
      console.error('Login response missing accessToken:', response.data);
    }
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async verifyOtp(email, otp, type) {
    const response = await this.client.post(`/auth/verify-otp?email=${email}&otp=${otp}&type=${type}`);
    return response.data;
  }

  async forgotPassword(email) {
    const response = await this.client.post(`/auth/forgot-password?email=${email}`);
    return response.data;
  }

  async resetPassword(data) {
    const response = await this.client.post('/auth/reset-password', data);
    return response.data;
  }

  async oauthLogin(oauthData) {
    const response = await this.client.post('/auth/oauth-login', oauthData);
    // Backend returns 'accessToken', not 'token'
    const token = response.data.accessToken || response.data.token;
    if (token) {
      this.token = token;
      this.refreshToken = response.data.refreshToken;
      localStorage.setItem('token', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  // Student APIs
  async getJobs(page = 0, size = 10) {
    // Use searchJobs with empty filters to get all jobs
    return this.searchJobs('', '', page, size);
  }

  async searchJobs(keyword = '', location = '', page = 0, size = 10) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    params.append('page', page);
    params.append('size', size);

    // Updated: Use /api/jobs instead of /api/students/jobs (moved to job-service)
    const response = await this.client.get(`/jobs?${params}`);
    return response.data;
  }

  async getJobById(jobId) {
    // Updated: Use /api/jobs/{jobId} instead of /api/students/jobs/{jobId} (moved to job-service)
    const response = await this.client.get(`/jobs/${jobId}`);
    return response.data;
  }

  async checkApplication(jobId) {
    // Updated: Use /api/applications/check/{jobId} instead of /api/students/applications/check/{jobId} (moved to job-service)
    const response = await this.client.get(`/applications/check/${jobId}`);
    return response.data;
  }

  async applyForJob(jobId, cvId, coverLetter) {
    const params = new URLSearchParams();
    params.append('jobId', jobId);
    if (cvId) params.append('cvId', cvId);
    if (coverLetter) params.append('coverLetter', coverLetter);

    // Updated: Use /api/applications instead of /api/students/applications (moved to job-service)
    const response = await this.client.post(`/applications?${params}`);
    return response.data;
  }

  async getStudentApplications(page = 0, size = 10) {
    return this.getApplications(page, size);
  }

  async getApplications(page = 0, size = 10) {
    // Updated: Use /api/applications instead of /api/students/applications (moved to job-service)
    const response = await this.client.get(`/applications?page=${page}&size=${size}`);
    return response.data;
  }

  async getStudentProfile(forceRefresh = false) {
    try {
      if (!this.token) {
        throw new Error('No authentication token found. Please login first.');
      }
      // Only log in development mode to reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.log('Getting student profile with token:', this.token.substring(0, 20) + '...');
      }
      // Add cache busting parameter if force refresh
      const url = forceRefresh
        ? `/students/profile?t=${Date.now()}`
        : '/students/profile';
      const response = await this.client.get(url);
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('=== PROFILE API RESPONSE ===');
        console.log('Full response:', response.data);
        console.log('Profile details:', {
          gender: response.data?.gender,
          address: response.data?.address,
          city: response.data?.city,
          university: response.data?.university,
          major: response.data?.major
        });
      }

      // Check if response has error
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Error getting student profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response?.status === 401) {
        // Try to refresh token
        try {
          console.log('Attempting to refresh token...');
          await this.refreshAccessToken();
          const response = await this.client.get('/students/profile');
          return response.data;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      // Return error object with message
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async updateStudentProfile(profileData) {
    try {
      console.log('Updating profile with data:', profileData);
      const response = await this.client.put('/students/profile', profileData);
      console.log('Update response:', response.data);

      // Check if response has error
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/students/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Recruiter APIs
  async createJob(jobData, requiredSkills = [], optionalSkills = []) {
    const params = new URLSearchParams();
    requiredSkills.forEach(skill => params.append('requiredSkills', skill));
    optionalSkills.forEach(skill => params.append('optionalSkills', skill));

    const response = await this.client.post(`/jobs?${params}`, jobData);
    return response.data;
  }

  async getMyJobs(page = 0, size = 10) {
    const response = await this.client.get(`/jobs/my-jobs?page=${page}&size=${size}`);
    return response.data;
  }

  async getJobApplicants(jobId, page = 0, size = 10) {
    const response = await this.client.get(`/applications/job/${jobId}?page=${page}&size=${size}`);
    return response.data;
  }

  async getRecruiterJobStats(recruiterId) {
    const response = await this.client.get(`/jobs/recruiter/stats?recruiterId=${recruiterId}`);
    return response.data;
  }

  async getRecruiterDashboardStats() {
    const response = await this.client.get('/recruiters/dashboard/stats');
    return response.data;
  }

  async findMatchingCandidates(jobId) {
    return this.getJobMatching(jobId);
  }

  async updateApplicationStatus(applicationId, status, note = '') {
    const response = await this.client.put(`/applications/${applicationId}/status`, null, {
      params: {
        status,
        notes: note
      }
    });
    return response.data;
  }

  // Recruiter Profile APIs
  async getRecruiterProfile() {
    const response = await this.client.get('/recruiters/profile');
    return response.data;
  }

  async getRecruiterStatistics() {
    const response = await this.client.get('/recruiters/dashboard/stats');
    return response.data;
  }

  async getRecentApplications() {
    const response = await this.client.get('/applications/recent');
    return response.data;
  }

  async updateRecruiterProfile(profileData) {
    const response = await this.client.put('/recruiters/profile', profileData);
    return response.data;
  }

  async updateUserFullName(fullName) {
    const response = await this.client.put('/recruiters/profile/fullName', { fullName });
    return response.data;
  }

  async uploadRecruiterAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/recruiters/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Company APIs
  async getMyCompany() {
    try {
      const response = await this.client.get('/recruiters/company');
      return response.data;
    } catch (error) {
      // 404 is expected when recruiter doesn't have a company yet
      if (error.response?.status === 404) {
        return null;
      }
      // Only log non-404 errors
      if (error.response?.status !== 404) {
        console.error('Error loading company:', error);
      }
      throw error;
    }
  }

  async updateCompany(companyData) {
    return this.createOrUpdateCompany(companyData);
  }

  async createOrUpdateCompany(companyData) {
    const response = await this.client.post('/recruiters/company', companyData);
    return response.data;
  }

  async uploadCompanyLogo(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/recruiters/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getRecruiterByUserId(userId) {
    // UPDATED: Use DTO endpoint to avoid Entity serialization issues
    const response = await this.client.get(`/recruiters/profile/user/${userId}`);
    return response.data;
  }

  async getRecruiterByCompanyId(companyId) {
    const response = await this.client.get(`/recruiters/by-company/${companyId}`);
    return response.data;
  }

  async getExpertRecruiters() {
    const response = await this.client.get('/recruiters/experts');
    return response.data;
  }

  async getCompanyAverageRating(companyId) {
    const response = await this.client.get(`/companies/${companyId}/rating/average`);
    return response.data;
  }

  // Messaging APIs
  async getMyConversations() {
    const response = await this.client.get('/messaging/conversations');
    return response.data;
  }

  async getConversation(conversationId) {
    const response = await this.client.get(`/messaging/conversations/${conversationId}`);
    return response.data;
  }

  async getOrCreateConversation(otherUserId) {
    const response = await this.client.post(`/messaging/conversations?otherUserId=${otherUserId}`);
    return response.data;
  }

  async getMessages(conversationId, page = 0, size = 50) {
    const response = await this.client.get(`/messaging/conversations/${conversationId}/messages?page=${page}&size=${size}`);
    return response.data;
  }

  async sendMessage(conversationId, content) {
    const response = await this.client.post(`/messaging/conversations/${conversationId}/messages`, { content });
    return response.data;
  }

  async sendMessageToUser(recipientId, content) {
    const response = await this.client.post(`/messaging/messages?recipientId=${recipientId}`, { content });
    return response.data;
  }

  async markConversationAsRead(conversationId) {
    const response = await this.client.put(`/messaging/conversations/${conversationId}/read`);
    return response.data;
  }

  async getUnreadCount() {
    const response = await this.client.get('/messaging/unread-count');
    return response.data;
  }

  async deleteAllMessages(conversationId) {
    const response = await this.client.delete(`/messaging/conversations/${conversationId}/messages`);
    return response.data;
  }

  // Get available users to chat with
  async getAvailableRecruiters() {
    const response = await this.client.get('/messaging/available-recruiters');
    return response.data;
  }

  async getAvailableStudents() {
    const response = await this.client.get('/messaging/available-students');
    return response.data;
  }

  // Admin messaging APIs
  async getAllRecruiters() {
    const response = await this.client.get('/messaging/admin/recruiters');
    return response.data;
  }

  async getAdminConversations() {
    const response = await this.client.get('/messaging/admin/conversations');
    return response.data;
  }

  async getAdminMessages(conversationId, page = 0, size = 50) {
    const response = await this.client.get(`/messaging/admin/conversations/${conversationId}/messages?page=${page}&size=${size}`);
    return response.data;
  }

  async sendAdminMessage(conversationId, content) {
    const response = await this.client.post(`/messaging/admin/conversations/${conversationId}/messages`, { content });
    return response.data;
  }

  async getOrCreateAdminConversation(recruiterId) {
    const response = await this.client.post(`/messaging/admin/conversations?recruiterId=${recruiterId}`);
    return response.data;
  }

  async markAdminConversationAsRead(conversationId) {
    const response = await this.client.put(`/messaging/admin/conversations/${conversationId}/read`);
    return response.data;
  }

  // CV APIs
  async getCVs() {
    const response = await this.client.get('/students/cv');
    return response.data;
  }

  async getCV(cvId) {
    const response = await this.client.get(`/students/cv/${cvId}`);
    return response.data;
  }

  async deleteCV(cvId) {
    const response = await this.client.delete(`/students/cv/${cvId}`);
    return response.data;
  }

  async downloadCV(cvId) {
    const response = await this.client.get(`/students/cv/download/${cvId}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async uploadCV(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/students/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Articles APIs
  async getArticles(keyword = '', category = '', page = 0, size = 20) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    params.append('page', page);
    params.append('size', size);
    const response = await this.client.get(`/articles?${params.toString()}`);
    return response.data;
  }

  async getMyArticles(page = 0, size = 10) {
    const response = await this.client.get(`/articles/my?page=${page}&size=${size}`);
    return response.data;
  }

  async getArticle(articleId) {
    const response = await this.client.get(`/articles/${articleId}`);
    return response.data;
  }

  async createArticle(articleData) {
    const response = await this.client.post('/articles', articleData);
    return response.data;
  }

  async getAuthorDisplayName(articleId) {
    const response = await this.client.get(`/articles/${articleId}/author-name`);
    return response.data;
  }

  async getPendingArticles(page = 0, size = 10) {
    const response = await this.client.get(`/admin/articles/pending?page=${page}&size=${size}`);
    return response.data;
  }

  async getAllArticles(status = '', page = 0, size = 10) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('size', size);
    const response = await this.client.get(`/admin/articles?${params.toString()}`);
    return response.data;
  }

  async approveArticle(articleId) {
    const response = await this.client.post(`/admin/articles/${articleId}/approve`);
    return response.data;
  }

  async rejectArticle(articleId) {
    const response = await this.client.post(`/admin/articles/${articleId}/reject`);
    return response.data;
  }

  // Article Reactions
  async toggleArticleReaction(articleId, reactionType) {
    const response = await this.client.post(`/articles/${articleId}/reactions?reactionType=${reactionType}`);
    return response.data;
  }

  async getArticleReactionCounts(articleId) {
    const response = await this.client.get(`/articles/${articleId}/reactions`);
    return response.data;
  }

  async getMyArticleReaction(articleId) {
    const response = await this.client.get(`/articles/${articleId}/reactions/my`);
    return response.data;
  }

  // Article Comments
  async getArticleComments(articleId) {
    const response = await this.client.get(`/articles/${articleId}/comments`);
    return response.data;
  }

  async createArticleComment(articleId, content, parentCommentId = null) {
    const response = await this.client.post(`/articles/${articleId}/comments`, {
      content,
      parentCommentId
    });
    return response.data;
  }

  async updateArticleComment(commentId, content) {
    const response = await this.client.put(`/articles/comments/${commentId}`, { content });
    return response.data;
  }

  async deleteArticleComment(commentId) {
    await this.client.delete(`/articles/comments/${commentId}`);
  }

  // Company APIs
  async getCompanies(page = 0, size = 20, keyword = '') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (keyword) params.append('keyword', keyword);
    const response = await this.client.get(`/companies?${params.toString()}`);
    return response.data;
  }

  async getCompany(companyId) {
    const response = await this.client.get(`/companies/${companyId}`);
    return response.data;
  }

  async getCompanyRatings(companyId) {
    const response = await this.client.get(`/companies/${companyId}/ratings`);
    return response.data;
  }

  async getMyCompanyRating(companyId) {
    try {
      const response = await this.client.get(`/companies/${companyId}/ratings/my`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async submitCompanyRating(companyId, rating) {
    // Backend expects rating and reviewText as JSON body
    const payload = {
      rating: rating.rating,
      comment: rating.comment, // Controller maps 'comment' to 'reviewText'
      reviewText: rating.comment // Sending both just in case
    };
    const response = await this.client.post(`/companies/${companyId}/ratings`, payload);
    return response.data;
  }

  async deleteCompanyRating(companyId) {
    const response = await this.client.delete(`/companies/${companyId}/ratings`);
    return response.data;
  }

  async getCompanyRecruiter(companyId) {
    try {
      const response = await this.client.get(`/companies/${companyId}/recruiter`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // CV Template APIs
  async getCVTemplates(category = '') {
    const params = category ? `?category=${category}` : '';
    const response = await this.client.get(`/cv-templates${params}`);
    return response.data;
  }

  async getFreeCVTemplates() {
    const response = await this.client.get('/cv-templates/free');
    return response.data;
  }

  async getCVTemplate(templateId) {
    const response = await this.client.get(`/cv-templates/${templateId}`);
    return response.data;
  }

  async createCVFromTemplate(templateId, cvData, photoFile) {
    const formData = new FormData();
    formData.append('templateId', templateId);
    formData.append('cvDataJson', JSON.stringify(cvData));
    if (photoFile) {
      formData.append('photoFile', photoFile);
    }

    const response = await this.client.post('/students/cv/from-template', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Course APIs
  async getCourses(category = '') {
    try {
      const params = category ? `?category=${category}` : '';
      console.log('API: Getting courses from /courses' + params);
      const response = await this.client.get(`/courses${params}`);
      console.log('API: Courses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting courses:', error);
      throw error;
    }
  }

  async getFreeCourses() {
    try {
      console.log('API: Getting free courses from /courses/free');
      const response = await this.client.get('/courses/free');
      console.log('API: Free courses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting free courses:', error);
      throw error;
    }
  }

  async getCourse(courseId) {
    const response = await this.client.get(`/courses/${courseId}`);
    return response.data;
  }

  async enrollCourse(courseId) {
    const response = await this.client.post(`/courses/${courseId}/enroll`);
    return response.data;
  }

  async getMyEnrollments() {
    const response = await this.client.get('/courses/my-enrollments');
    return response.data;
  }

  async getEnrollment(enrollmentId) {
    const response = await this.client.get(`/courses/enrollments/${enrollmentId}`);
    return response.data;
  }

  // Course Content APIs
  async getCourseModules(courseId) {
    try {
      console.log('API: Getting course modules from /course-content/courses/' + courseId + '/modules');
      const response = await this.client.get(`/course-content/courses/${courseId}/modules`);
      console.log('API: Course modules response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting course modules:', error);
      throw error;
    }
  }

  async getModuleLessons(moduleId) {
    try {
      console.log('API: Getting module lessons from /course-content/modules/' + moduleId + '/lessons');
      const response = await this.client.get(`/course-content/modules/${moduleId}/lessons`);
      console.log('API: Module lessons response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting module lessons:', error);
      throw error;
    }
  }

  async getLesson(lessonId) {
    try {
      console.log('API: Getting lesson from /course-content/lessons/' + lessonId);
      const response = await this.client.get(`/course-content/lessons/${lessonId}`);
      console.log('API: Lesson response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting lesson:', error);
      throw error;
    }
  }

  async getEnrollmentProgress(enrollmentId) {
    try {
      console.log('API: Getting enrollment progress from /course-content/enrollments/' + enrollmentId + '/progress');
      const response = await this.client.get(`/course-content/enrollments/${enrollmentId}/progress`);
      console.log('API: Enrollment progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting enrollment progress:', error);
      throw error;
    }
  }

  async getLessonProgress(enrollmentId, lessonId) {
    try {
      console.log('API: Getting lesson progress from /course-content/enrollments/' + enrollmentId + '/lessons/' + lessonId + '/progress');
      const response = await this.client.get(`/course-content/enrollments/${enrollmentId}/lessons/${lessonId}/progress`);
      console.log('API: Lesson progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting lesson progress:', error);
      throw error;
    }
  }

  async updateLessonProgress(enrollmentId, lessonId, currentTimeSeconds, completed) {
    try {
      console.log('API: Updating lesson progress:', { enrollmentId, lessonId, currentTimeSeconds, completed });
      const body = {};
      if (currentTimeSeconds !== undefined) body.currentTimeSeconds = currentTimeSeconds;
      if (completed !== undefined) body.completed = completed;
      const response = await this.client.put(`/course-content/enrollments/${enrollmentId}/lessons/${lessonId}/progress`, body);
      console.log('API: Update lesson progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error updating lesson progress:', error);
      throw error;
    }
  }

  async markLessonComplete(enrollmentId, lessonId) {
    try {
      console.log('API: Marking lesson complete:', { enrollmentId, lessonId });
      const response = await this.client.post(`/course-content/enrollments/${enrollmentId}/lessons/${lessonId}/complete`);
      console.log('API: Mark lesson complete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error marking lesson complete:', error);
      throw error;
    }
  }

  // Challenge APIs
  async getChallenges(category = '') {
    const params = category ? `?category=${category}` : '';
    const response = await this.client.get(`/challenges${params}`);
    return response.data;
  }

  async getChallenge(challengeId) {
    const response = await this.client.get(`/challenges/${challengeId}`);
    return response.data;
  }

  async joinChallenge(challengeId) {
    const response = await this.client.post(`/challenges/${challengeId}/join`);
    return response.data;
  }

  async participateChallenge(challengeId, submission) {
    const response = await this.client.post(`/challenges/${challengeId}/submit`, submission);
    return response.data;
  }

  async completeChallenge(participationId) {
    const response = await this.client.post(`/challenges/participations/${participationId}/complete`);
    return response.data;
  }

  async getMyChallenges() {
    const response = await this.client.get('/challenges/my-participations');
    return response.data;
  }

  async getMyBadges() {
    const response = await this.client.get('/challenges/my-badges');
    return response.data;
  }

  async deleteChallengeParticipation(challengeId) {
    const response = await this.client.delete(`/challenges/${challengeId}/participation`);
    return response.data;
  }

  // Course Quiz APIs
  async getCourseQuizAttempts(courseId) {
    try {
      const response = await this.client.get(`/courses/${courseId}/quiz-attempts`);
      return response.data;
    } catch (error) {
      console.error('Error getting course quiz attempts:', error);
      return [];
    }
  }

  async getCourseQuiz(courseId) {
    try {
      console.log('=== GET COURSE QUIZ ===');
      console.log('Course ID:', courseId);
      console.log('Token:', this.token ? this.token.substring(0, 20) + '...' : 'NO TOKEN');
      console.log('URL:', `/courses/${courseId}/quiz`);
      const response = await this.client.get(`/courses/${courseId}/quiz`);
      console.log('Quiz response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting course quiz:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      return null;
    }
  }

  async submitCourseQuiz(courseId, answers) {
    const response = await this.client.post(`/courses/${courseId}/quiz/submit`, answers);
    return response.data;
  }

  // Lesson Progress APIs
  async completeLesson(lessonId) {
    const response = await this.client.post(`/course-content/lessons/${lessonId}/complete`);
    return response.data;
  }

  async getLessonProgress(lessonId) {
    const response = await this.client.get(`/course-content/lessons/${lessonId}/progress`);
    return response.data;
  }

  // Package APIs
  // Admin subscription management
  async getPendingSubscriptions(page = 0, size = 10) {
    const response = await this.client.get(`/packages/subscriptions/pending?page=${page}&size=${size}`);
    return response.data;
  }

  async approveSubscription(subscriptionId) {
    const response = await this.client.post(`/packages/subscriptions/${subscriptionId}/approve`);
    return response.data;
  }

  async rejectSubscription(subscriptionId) {
    const response = await this.client.post(`/packages/subscriptions/${subscriptionId}/reject`);
    return response.data;
  }

  async getApprovedSubscriptions(page = 0, size = 10) {
    const response = await this.client.get(`/packages/subscriptions/approved?page=${page}&size=${size}`);
    return response.data;
  }

  async getSubscriptionsHistory(page = 0, size = 10) {
    const response = await this.client.get(`/packages/subscriptions/history?page=${page}&size=${size}`);
    return response.data;
  }

  // AI Services
  async analyzeCV(cvId, requestBody = {}) {
    // If no request body provided, send empty object
    const response = await this.client.post(`/ai/cv/analyze/${cvId}`, requestBody);
    return response.data;
  }

  async getJobMatching(jobId) {
    const response = await this.client.get(`/ai/jobs/${jobId}/matching`);
    return response.data;
  }

  async startMockInterview(jobId, cvId) {
    // Redirect to the modern mock interview flow
    // In our new system, mocking interviews is job-specific
    return this.startAIMockInterview(jobId, { cvId });
  }

  async getCareerRoadmap(currentSkills, targetRole) {
    const response = await this.client.post('/ai/career/roadmap', {
      currentSkills,
      targetRole,
    });
    return response.data;
  }

  async chatAI(message, context, role) {
    const response = await this.client.post('/ai/chat', {
      message,
      context,
      role,
    });
    return response.data;
  }

  // Admin APIs
  async getAdminDashboardStats() {
    const response = await this.client.get('/admin/dashboard/stats');
    return response.data;
  }

  async getUsers(page = 0, size = 10, keyword = '') {
    // For mobile find candidates - use admin users but search students
    return this.getAdminUsers('STUDENT', page, size);
  }

  async getAdminUsers(role = null, page = 0, size = 10) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (role) params.append('role', role);
    const response = await this.client.get(`/admin/users?${params}`);
    return response.data;
  }

  async updateUserStatus(userId, status) {
    const response = await this.client.put(`/admin/users/${userId}/status?status=${status}`);
    return response.data;
  }

  async getAdminJobs(status = null, page = 0, size = 10) {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    const response = await this.client.get(`/admin/jobs?${params}`);
    return response.data;
  }

  async getPendingJobs(page = 0, size = 10) {
    const response = await this.client.get(`/admin/jobs/pending?page=${page}&size=${size}`);
    return response.data;
  }

  async approveJob(jobId) {
    const response = await this.client.post(`/admin/jobs/${jobId}/approve`);
    return response.data;
  }

  async rejectJob(jobId) {
    const response = await this.client.post(`/admin/jobs/${jobId}/reject`);
    return response.data;
  }

  async hideJob(jobId, reason) {
    const response = await this.client.post(`/admin/jobs/${jobId}/hide`, { reason });
    return response.data;
  }

  async unhideJob(jobId) {
    const response = await this.client.post(`/admin/jobs/${jobId}/unhide`);
    return response.data;
  }

  async deleteJob(jobId, reason) {
    await this.client.delete(`/admin/jobs/${jobId}`, { data: { reason } });
  }

  async hideArticle(articleId, reason) {
    const response = await this.client.post(`/admin/articles/${articleId}/hide`, { reason });
    return response.data;
  }

  async unhideArticle(articleId) {
    const response = await this.client.post(`/admin/articles/${articleId}/unhide`);
    return response.data;
  }

  async deleteArticle(articleId, reason) {
    await this.client.delete(`/admin/articles/${articleId}`, { data: { reason } });
  }

  async deleteUser(userId) {
    await this.client.delete(`/admin/users/${userId}`);
  }

  async getAuditLogs(page = 0, size = 20) {
    const response = await this.client.get(`/admin/audit-logs?page=${page}&size=${size}`);
    return response.data;
  }

  // Admin Company Management
  async getAdminCompanies(page = 0, size = 10, keyword = '') {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (keyword) params.append('keyword', keyword);
    const response = await this.client.get(`/admin/companies?${params}`);
    return response.data;
  }

  async deleteAdminCompany(companyId, reason) {
    await this.client.delete(`/admin/companies/${companyId}`, { data: { reason } });
  }

  async verifyCompany(companyId, verified) {
    const response = await this.client.put(`/admin/companies/${companyId}/verify?verified=${verified}`);
    return response.data;
  }

  // CV Templates Management
  async getAdminCVTemplates() {
    const response = await this.client.get('/admin/cv-templates');
    return response.data;
  }

  async createCVTemplate(template) {
    const response = await this.client.post('/admin/cv-templates', template);
    return response.data;
  }

  async updateCVTemplate(templateId, template) {
    const response = await this.client.put(`/admin/cv-templates/${templateId}`, template);
    return response.data;
  }

  async deleteCVTemplate(templateId) {
    const response = await this.client.delete(`/admin/cv-templates/${templateId}`);
    return response.data;
  }

  // Student/Public Packages & Subscriptions
  async getPackages() {
    const response = await this.client.get('/packages');
    return response.data;
  }

  async getMySubscription() {
    try {
      const response = await this.client.get('/packages/my-subscription');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getMySubscriptions() {
    const response = await this.client.get('/packages/my-subscriptions');
    return response.data;
  }

  async requestSubscription(packageId) {
    const response = await this.client.post(`/packages/${packageId}/request`);
    return response.data;
  }

  async cancelSubscription(subscriptionId) {
    const response = await this.client.post(`/packages/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  }

  // Packages Management
  async getAdminPackages() {
    const response = await this.client.get('/admin/packages');
    return response.data;
  }

  async createPackage(packageData) {
    const response = await this.client.post('/admin/packages', packageData);
    return response.data;
  }

  async updatePackage(packageId, packageData) {
    const response = await this.client.put(`/admin/packages/${packageId}`, packageData);
    return response.data;
  }

  async deletePackage(packageId) {
    const response = await this.client.delete(`/admin/packages/${packageId}`);
    return response.data;
  }

  async getAdminSubscriptions() {
    const response = await this.client.get('/admin/subscriptions');
    return response.data;
  }

  // Analytics
  async getAdminAnalytics() {
    const response = await this.client.get('/admin/analytics');
    return response.data;
  }

  // ========== NOTIFICATIONS ==========
  async getNotifications(page = 0, size = 20) {
    const response = await this.client.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  }

  async getUnreadNotificationCount() {
    const response = await this.client.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(notificationId) {
    const response = await this.client.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.client.put('/notifications/mark-all-read');
    return response.data;
  }
  // ========== MOCK INTERVIEWS ========== //

  // 1. Recruiter Mock Interviews (Job Service)
  async requestMockInterview(recruiterId, message, studentId) {
    const response = await this.client.post('/jobs/mock-requests', { recruiterId, message, studentId });
    return response.data;
  }

  async getMyMockInterviewRequests(studentId) {
    const response = await this.client.get(`/jobs/mock-requests/my-requests?studentId=${studentId}`);
    return response.data;
  }

  async getRecruiterMockInterviewRequests(recruiterId) {
    const response = await this.client.get(`/jobs/mock-requests/recruiter-requests?recruiterId=${recruiterId}`);
    return response.data;
  }

  async updateMockInterviewRequestStatus(requestId, status) {
    const response = await this.client.put(`/jobs/mock-requests/${requestId}/status`, { status });
    return response.data;
  }

  // 2. AI Mock Interviews (AI Service)
  async startAIMockInterview(jobId, profile) {
    const response = await this.client.post(`/ai/students/mock-interview/start/${jobId}`, { profile });
    return response.data;
  }

  async startCustomAIMockInterview(jobTitle, jobDescription = '') {
    const response = await this.client.post('/ai/students/mock-interview/start-custom', { jobTitle, jobDescription });
    return response.data;
  }

  async getUsersByRole(role) {
    const response = await this.client.post('/users/by-roles', [role]);
    return response.data;
  }

  async getExpertRecruiters() {
    const response = await this.client.get('/recruiters/experts');
    return response.data;
  }

  async finishAIMockInterview(interviewData) {
    const response = await this.client.post('/ai/students/mock-interview/finish', interviewData);
    return response.data;
  }

  async getAIMockInterviewHistory(studentId) {
    const response = await this.client.get(`/ai/students/mock-interview/history/${studentId}`);
    return response.data;
  }

  async getAdminMockInterviewHistory() {
    const response = await this.client.get('/ai/students/mock-interview/admin/history');
    return response.data;
  }

  async evaluateAIAnswer(question, answer, jobContext) {
    const response = await this.client.post('/ai/students/mock-interview/evaluate', { question, answer, jobContext });
    return response.data;
  }
}

// Export singleton instance
const api = new CareerMateAPI();
export default api;

