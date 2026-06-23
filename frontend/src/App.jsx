import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OtpVerification from './pages/auth/OtpVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AccountRecovery from './pages/auth/AccountRecovery';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import JobList from './pages/student/JobList';
import JobDetail from './pages/student/JobDetail';
import JobRecommendations from './pages/student/JobRecommendations';
import CVUpload from './pages/student/CVUpload';
import CVAnalysis from './pages/student/CVAnalysis';
import CareerRoadmap from './pages/student/CareerRoadmap';
import Quiz from './pages/student/Quiz';
import Applications from './pages/student/Applications';
import Profile from './pages/student/Profile';
import ProfileView from './pages/student/ProfileView';
import Articles from './pages/student/Articles';
import ArticleDetail from './pages/student/ArticleDetail';
import Companies from './pages/student/Companies';
import CompanyDetail from './pages/student/CompanyDetail';
import CVTemplates from './pages/student/CVTemplates';
import CVTemplateEditor from './pages/student/CVTemplateEditor';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import CoursePlayer from './pages/student/CoursePlayer';
import Challenges from './pages/student/Challenges';
import ChallengeDetail from './pages/student/ChallengeDetail';
import Packages from './pages/student/Packages';
import Messages from './pages/student/Messages';
import MockInterview from './pages/student/MockInterview';
import AIMockInterviewRoom from './pages/student/AIMockInterviewRoom';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import PostJob from './pages/recruiter/PostJob';
import Applicants from './pages/recruiter/Applicants';
import FindCandidates from './pages/recruiter/FindCandidates';
import RecruiterCompany from './pages/recruiter/Company';
import CompanyView from './pages/recruiter/CompanyView';
import CompanyEdit from './pages/recruiter/CompanyEdit';
import RecruiterProfile from './pages/recruiter/Profile';
import RecruiterCreateArticle from './pages/recruiter/CreateArticle';
import MyArticles from './pages/recruiter/MyArticles';
import RecruiterMessages from './pages/recruiter/Messages';
import InterviewRequests from './pages/recruiter/InterviewRequests';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CompanyManagement from './pages/admin/CompanyManagement';
import JobManagement from './pages/admin/JobManagement';
import AdminCreateArticle from './pages/admin/CreateArticle';
import ArticleManagement from './pages/admin/ArticleManagement';
import CVTemplatesManagement from './pages/admin/CVTemplatesManagement';
import PackagesManagement from './pages/admin/PackagesManagement';
import Analytics from './pages/admin/Analytics';
import AdminMessages from './pages/admin/Messages';
import AdminMockInterviews from './pages/admin/AdminMockInterviews';



// Mobile App Components
import MobileLayout from './mobile/MobileLayout';
import MobileStudentHome from './mobile/MobileStudentHome';
import MobileRecruiterHome from './mobile/MobileRecruiterHome';
import MobileAdminHome from './mobile/MobileAdminHome';
import MobileSettings from './mobile/MobileSettings';
import MobileProfileView from './mobile/MobileProfileView';
import MobileJobList from './mobile/MobileJobList';
import MobileJobDetail from './mobile/MobileJobDetail';
import MobileApplications from './mobile/MobileApplications';
import MobileArticles from './mobile/MobileArticles';
import MobileArticleDetail from './mobile/MobileArticleDetail';
import MobileCourses from './mobile/MobileCourses';
import MobileCourseDetail from './mobile/MobileCourseDetail';
import MobileCoursePlayer from './mobile/MobileCoursePlayer';
import MobileCompanies from './mobile/MobileCompanies';
import MobileCompanyDetail from './mobile/MobileCompanyDetail';
import MobileRoadmap from './mobile/MobileRoadmap';
import MobileChallenges from './mobile/MobileChallenges';
import MobileMessages from './mobile/MobileMessages';
import MobileNotifications from './mobile/MobileNotifications';
import MobileApplicants from './mobile/MobileApplicants';
import MobilePostJob from './mobile/MobilePostJob';
import MobileCVUpload from './mobile/MobileCVUpload';
import MobileCVAnalysis from './mobile/MobileCVAnalysis';
import MobileJobRecommendations from './mobile/MobileJobRecommendations';
import MobileQuiz from './mobile/MobileQuiz';
import MobileCVTemplates from './mobile/MobileCVTemplates';
import MobilePackages from './mobile/MobilePackages';
import MobileProfileEdit from './mobile/MobileProfileEdit';
import MobileUserManagement from './mobile/MobileUserManagement';
import MobileFindCandidates from './mobile/MobileFindCandidates';
import MobileRecruiterCompany from './mobile/MobileRecruiterCompany';
import MobileMyArticles from './mobile/MobileMyArticles';
import MobileCreateArticle from './mobile/MobileCreateArticle';
import MobileJobManagement from './mobile/MobileJobManagement';
import MobileArticleManagement from './mobile/MobileArticleManagement';
import MobileCVTemplatesManagement from './mobile/MobileCVTemplatesManagement';
import MobilePackagesManagement from './mobile/MobilePackagesManagement';
import MobileAnalytics from './mobile/MobileAnalytics';
import MobileCVTemplateEditor from './mobile/MobileCVTemplateEditor';
import MobileChallengeDetail from './mobile/MobileChallengeDetail';
import MobileRecruiterProfile from './mobile/MobileRecruiterProfile';
import MobileCompanyEdit from './mobile/MobileCompanyEdit';
import MobileLogin from './mobile/MobileLogin';
import MobileRegister from './mobile/MobileRegister';

// Shared Pages
import Notifications from './pages/Notifications';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { useIsMobile } from './hooks/useIsMobile';

// Responsive Components
function ResponsiveLogin() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileLogin /> : <Login />;
}

function ResponsiveRegister() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileRegister /> : <Register />;
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [], isMobileRoute = false }) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to appropriate login page based on device type
    const loginPath = isMobileRoute || isMobile ? '/mobile/login' : '/login';
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RoleBasedMobileHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <MobileStudentHome />;
  if (user.role === 'RECRUITER') return <MobileRecruiterHome />;
  if (user.role === 'ADMIN') return <MobileAdminHome />;
  return <div>Unknown Role</div>;
}

function RoleBasedProfileView() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <MobileProfileView />;
  if (user.role === 'RECRUITER') return <MobileRecruiterProfile />;
  if (user.role === 'ADMIN') return <MobileSettings />;
  return <div>Unknown Role</div>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <ResponsiveLogin /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <ResponsiveRegister /> : <Navigate to="/" replace />} />
      <Route path="/mobile/login" element={!user ? <MobileLogin /> : <Navigate to="/mobile/dashboard" replace />} />
      <Route path="/mobile/register" element={!user ? <MobileRegister /> : <Navigate to="/mobile/dashboard" replace />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account-recovery" element={<AccountRecovery />} />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="jobs" element={<JobList />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="recommendations" element={<JobRecommendations />} />
                <Route path="cv" element={<CVUpload />} />
                <Route path="cv/:cvId/analysis" element={<CVAnalysis />} />
                <Route path="roadmap" element={<CareerRoadmap />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="applications" element={<Applications />} />
                <Route path="articles" element={<Articles />} />
                <Route path="articles/:id" element={<ArticleDetail />} />
                <Route path="companies" element={<Companies />} />
                <Route path="companies/:id" element={<CompanyDetail />} />
                <Route path="messages" element={<Messages />} />
                <Route path="cv-templates" element={<CVTemplates />} />
                <Route path="cv-templates/:id" element={<CVTemplateEditor />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="courses/:courseId/learn/:enrollmentId/:lessonId?" element={<CoursePlayer />} />
                <Route path="challenges" element={<Challenges />} />
                <Route path="challenges/:id" element={<ChallengeDetail />} />
                <Route path="packages" element={<Packages />} />
                <Route path="profile" element={<ProfileView />} />
                <Route path="profile/view" element={<ProfileView />} />
                <Route path="profile/edit" element={<Profile />} />
                <Route path="mock-interview" element={<MockInterview />} />
                <Route path="mock-interview/ai/:jobId" element={<AIMockInterviewRoom />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      {/* Recruiter Routes */}
      <Route
        path="/recruiter/*"
        element={
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <RecruiterLayout>
              <Routes>
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="post-job" element={<PostJob />} />
                <Route path="applicants" element={<Applicants />} />
                <Route path="find-candidates" element={<FindCandidates />} />
                <Route path="company" element={<Navigate to="company/view" replace />} />
                <Route path="company/view" element={<CompanyView />} />
                <Route path="company/edit" element={<CompanyEdit />} />
                <Route path="profile" element={<RecruiterProfile />} />
                <Route path="articles/create" element={<RecruiterCreateArticle />} />
                <Route path="articles" element={<MyArticles />} />
                <Route path="articles/:id" element={<ArticleDetail />} />
                <Route path="messages" element={<RecruiterMessages />} />
                <Route path="mock-requests" element={<InterviewRequests />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </RecruiterLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="companies" element={<CompanyManagement />} />
                <Route path="jobs" element={<JobManagement />} />
                <Route path="articles" element={<ArticleManagement />} />
                <Route path="articles/:id" element={<ArticleDetail />} />
                <Route path="articles/create" element={<AdminCreateArticle />} />
                <Route path="cv-templates" element={<CVTemplatesManagement />} />
                <Route path="packages" element={<PackagesManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="mock-interviews" element={<AdminMockInterviews />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Mobile App Routes */}
      <Route
        path="/mobile/*"
        element={
          <ProtectedRoute isMobileRoute={true}>
            <Routes>
              <Route element={<MobileLayout />}>
                <Route path="dashboard" element={<RoleBasedMobileHome />} />
                <Route path="home" element={<RoleBasedMobileHome />} />
                <Route path="profile" element={<RoleBasedProfileView />} />
                <Route path="profile/settings" element={<MobileSettings />} />
                <Route path="profile/edit" element={<MobileProfileEdit />} />
                <Route path="profile/recruiter" element={<MobileRecruiterProfile />} />
                <Route path="jobs" element={<MobileJobList />} />
                <Route path="jobs/:id" element={<MobileJobDetail />} />
                <Route path="recommendations" element={<MobileJobRecommendations />} />
                <Route path="cv" element={<MobileCVUpload />} />
                <Route path="cv/:cvId/analysis" element={<MobileCVAnalysis />} />
                <Route path="cv-templates" element={<MobileCVTemplates />} />
                <Route path="cv-templates/:id" element={<MobileCVTemplateEditor />} />
                <Route path="packages" element={<MobilePackages />} />
                <Route path="quiz" element={<MobileQuiz />} />
                <Route path="applications" element={<MobileApplications />} />
                <Route path="articles" element={<MobileArticles />} />
                <Route path="articles/my" element={<MobileMyArticles />} />
                <Route path="articles/create" element={<MobileCreateArticle />} />
                <Route path="articles/:id" element={<MobileArticleDetail />} />
                <Route path="courses" element={<MobileCourses />} />
                <Route path="courses/:id" element={<MobileCourseDetail />} />
                <Route path="courses/learn/:enrollmentId/:lessonId?" element={<MobileCoursePlayer />} />
                <Route path="companies" element={<MobileCompanies />} />
                <Route path="companies/:id" element={<MobileCompanyDetail />} />
                <Route path="company" element={<Navigate to="company/edit" replace />} />
                <Route path="company/view" element={<MobileCompanyDetail />} />
                <Route path="company/edit" element={<MobileCompanyEdit />} />
                <Route path="find-candidates" element={<MobileFindCandidates />} />
                <Route path="roadmap" element={<MobileRoadmap />} />
                <Route path="challenges" element={<MobileChallenges />} />
                <Route path="challenges/:id" element={<MobileChallengeDetail />} />
                <Route path="messages" element={<MobileMessages />} />
                <Route path="notifications" element={<MobileNotifications />} />
                <Route path="applicants" element={<MobileApplicants />} />
                <Route path="post-job" element={<MobilePostJob />} />
                <Route path="users" element={<MobileUserManagement />} />
                <Route path="job-management" element={<MobileJobManagement />} />
                <Route path="article-management" element={<MobileArticleManagement />} />
                <Route path="cv-management" element={<MobileCVTemplatesManagement />} />
                <Route path="package-management" element={<MobilePackagesManagement />} />
                <Route path="analytics" element={<MobileAnalytics />} />
                <Route path="" element={<Navigate to="dashboard" replace />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Shared Routes - Notifications (accessible by all authenticated users) */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            {user?.role === 'STUDENT' ? (
              <StudentLayout>
                <Notifications />
              </StudentLayout>
            ) : user?.role === 'RECRUITER' ? (
              <RecruiterLayout>
                <Notifications />
              </RecruiterLayout>
            ) : user?.role === 'ADMIN' ? (
              <AdminLayout>
                <Notifications />
              </AdminLayout>
            ) : (
              <Navigate to="/login" replace />
            )}
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          user ? (
            user.role === 'STUDENT' ? (
              <Navigate to="/student/dashboard" replace />
            ) : user.role === 'RECRUITER' ? (
              <Navigate to="/recruiter/dashboard" replace />
            ) : user.role === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes >
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
