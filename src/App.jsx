import React from 'react';
import ExamRoom from './pages/ExamRoom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProgressProvider } from './context/ProgressContext';
import { AchievementsProvider } from './context/AchievementsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CourseCatalog from './pages/CourseCatalog';
import LessonRenderer from './pages/LessonRenderer';
import StudentLessonViewer from './pages/StudentLessonViewer';
import Progress from './pages/Progress';
import Certificates from './pages/Certificates';
import CertificateView from './pages/CertificateView';
import Leaderboard from './pages/Leaderboard';
import Pricing from './pages/Pricing';
import Payments from './pages/Payments';
import PaymentSuccess from './pages/PaymentSuccess';
import Support from './pages/Support';
import Legal from './pages/Legal';
import PaymentHistory from './pages/PaymentHistory';
import Subscriptions from './pages/Subscriptions';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAnalytics from './pages/TeacherAnalytics';
import TeacherStudents from './pages/TeacherStudents';
import TeacherStudentDetail from './pages/TeacherStudentDetail';
import CreateLesson from './pages/CreateLesson';
import ImportLessons from './pages/ImportLessons';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/catalog" element={<CourseCatalog />} />
      <Route path="/lesson/:lessonId" element={<LessonRenderer />} />
      <Route path="/lesson-view/:lessonId" element={<StudentLessonViewer />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/certificates" element={<Certificates />} />
      <Route path="/certificates/:certificateId" element={<CertificateView />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/payments" element={<Payments />} />`n      <Route path="/payment-success" element={<PaymentSuccess />} />`n      <Route path="/support" element={<Support />} />
      <Route path="/terms" element={<Legal />} />
      <Route path="/privacy" element={<Legal />} />
      <Route path="/refund-policy" element={<Legal />} />
      <Route path="/cookies" element={<Legal />} />
      <Route path="/payments/history" element={<PaymentHistory />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/teacher" element={<ProtectedRoute requireRole="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/analytics" element={<ProtectedRoute requireRole="teacher"><TeacherAnalytics /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute requireRole="teacher"><TeacherStudents /></ProtectedRoute>} />
      <Route path="/teacher/students/:studentId" element={<ProtectedRoute requireRole="teacher"><TeacherStudentDetail /></ProtectedRoute>} />
      <Route path="/teacher/create" element={<ProtectedRoute requireRole="teacher"><CreateLesson /></ProtectedRoute>} />
      <Route path="/teacher/edit/:lessonId" element={<ProtectedRoute requireRole="teacher"><CreateLesson /></ProtectedRoute>} />
      <Route path="/teacher/import" element={<ProtectedRoute requireRole="teacher"><ImportLessons /></ProtectedRoute>} />
    </Routes>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <AppRoutes />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <ProgressProvider>
            <AchievementsProvider>
              <AppLayout />
            </AchievementsProvider>
          </ProgressProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;





