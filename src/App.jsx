import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { AchievementsProvider } from './context/AchievementsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LessonRenderer from './pages/LessonRenderer';
import CourseCatalog from './pages/CourseCatalog';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherStudents from './pages/TeacherStudents';
import TeacherStudentDetail from './pages/TeacherStudentDetail';
import CreateLesson from './pages/CreateLesson';
import ImportLessons from './pages/ImportLessons';
import Progress from './pages/Progress';
import Certificates from './pages/Certificates';
import CertificateView from './pages/CertificateView';
import Leaderboard from './pages/Leaderboard';
import Pricing from './pages/Pricing';
import Payments from './pages/Payments';
import Subscriptions from './pages/Subscriptions';
import PaymentHistory from './pages/PaymentHistory';

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
        <ProgressProvider>
          <AchievementsProvider>
            <AppRoutes />
          </AchievementsProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
