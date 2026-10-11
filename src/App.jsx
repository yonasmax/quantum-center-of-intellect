import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LessonRenderer from './pages/LessonRenderer';
import CourseCatalog from './pages/CourseCatalog';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateLesson from './pages/CreateLesson';
import ImportLessons from './pages/ImportLessons';

// Home / Dashboard
function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA] p-6">
      <h1 className="text-4xl font-bold text-[#1A365D] mb-4">
        Quantum Center of Intellect
      </h1>
      <p className="text-gray-600 mb-6">Welcome to your learning platform.</p>

      {isAuthenticated ? (
        <div className="text-center">
          <p className="mb-4 text-gray-700">
            Signed in as <strong>{user?.fullName}</strong> ({user?.role})
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/catalog"
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Browse Catalog
            </Link>
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <Link
                to="/teacher"
                className="bg-[#1A365D] hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Teacher Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/login"
            className="bg-[#1A365D] hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            Create Account
          </Link>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-8">
        © 2026 Quantum Center of Intellect · Free for Ethiopian Students
      </p>
    </div>
  );
}

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

      {/* Public content */}
      <Route path="/catalog" element={<CourseCatalog />} />
      <Route path="/lesson/:lessonId" element={<LessonRenderer />} />

      {/* Teacher-only (protected) */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/create"
        element={
          <ProtectedRoute>
            <CreateLesson />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/edit/:lessonId"
        element={
          <ProtectedRoute>
            <CreateLesson />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/import"
        element={
          <ProtectedRoute>
            <ImportLessons />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;