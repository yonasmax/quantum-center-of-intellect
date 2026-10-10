import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import LessonRenderer from './pages/LessonRenderer';
import CourseCatalog from './pages/CourseCatalog';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateLesson from './pages/CreateLesson';
import ImportLessons from './pages/ImportLessons';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F7FA]">
              <h1 className="text-4xl font-bold text-[#1A365D] mb-4">
                Quantum Center of Intellect
              </h1>
              <p className="text-gray-600 mb-6">Welcome to your learning platform.</p>
              <div className="flex gap-3">
                <Link
                  to="/catalog"
                  className="bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Browse Course Catalog
                </Link>
                <Link
                  to="/teacher"
                  className="bg-[#1A365D] hover:bg-blue-900 text-white px-6 py-3 rounded-lg font-bold"
                >
                  Teacher Dashboard
                </Link>
              </div>
            </div>
          }
        />

        {/* Student routes */}
        <Route path="/catalog" element={<CourseCatalog />} />
        <Route path="/lesson/:lessonId" element={<LessonRenderer />} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/create" element={<CreateLesson />} />
        <Route path="/teacher/edit/:lessonId" element={<CreateLesson />} />
        <Route path="/teacher/import" element={<ImportLessons />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;