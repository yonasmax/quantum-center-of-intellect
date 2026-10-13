import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProgressProvider } from './context/ProgressContext';
import { AchievementsProvider } from './context/AchievementsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Content
import CourseCatalog from './pages/CourseCatalog';
import LessonRenderer from './pages/LessonRenderer';

// Student features
import Progress from './pages/Progress';
import Certificates from './pages/Certificates';
import CertificateView from './pages/CertificateView';
import Leaderboard from './pages/Leaderboard';

// Payments
import Pricing from './pages/Pricing';
import Payments from './pages/Payments';
import PaymentHistory from './pages/PaymentHistory';
import Subscriptions from './pages/Subscriptions';

// Admin
import AdminDashboard from './pages/AdminDashboard';

// Teacher
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherStudents from './pages/TeacherStudents';
import TeacherStudentDetail from './pages/TeacherStudentDetail';
import CreateLesson from './pages/CreateLesson';
import ImportLessons from './pages/ImportLessons';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Content */}
      <Route path="/catalog" element={<CourseCatalog />} />
      <Route path="/lesson/:lessonId" element={<LessonRenderer />} />

      {/* Student features */}
      <Route path="/progress" element={<Progress />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/certificates/:certificateId" element={<CertificateView />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Payments */}
      <Route path="/payments" element={<Payments />} />
      <Route path="/payments/history" element={<PaymentHistory />} />
      <Route path="/subscriptions" element={<Subscriptions />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/analytics" element={<ProtectedRoute><TeacherAnalytics /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute><TeacherStudents /></ProtectedRoute>} />
      <Route path="/teacher/students/:studentId" element={<ProtectedRoute><TeacherStudentDetail /></ProtectedRoute>} />
      <Route path="/teacher/create" element={<ProtectedRoute><CreateLesson /></ProtectedRoute>} />
      <Route path="/teacher/edit/:lessonId" element={<ProtectedRoute><CreateLesson /></ProtectedRoute>} />
      <Route path="/teacher/import" element={<ProtectedRoute><ImportLessons /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <ProgressProvider>
            <AchievementsProvider>
              <AppRoutes />
            </AchievementsProvider>
          </ProgressProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;