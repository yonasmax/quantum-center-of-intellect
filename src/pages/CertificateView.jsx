// src/pages/CertificateView.jsx
// Individual printable certificate view
import React, { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';

export default function CertificateView() {
  const { certificateId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { progressMap } = useProgress();

  const certificate = useMemo(() => {
    // Parse subject from certificateId (e.g., "chemistry-abc123")
    const subject = certificateId?.split('-')[0];
    if (!subject) return null;

    const lessons = Object.values(progressMap).filter(
      (p) => p.completed && p.lesson?.subject?.toLowerCase() === subject
    );

    return {
      id: certificateId,
      subject: lessons[0]?.lesson?.subject || subject,
      lessonsCompleted: lessons.length,
      studentName: user?.fullName || 'Student',
      issuedAt: new Date().toISOString(),
      verificationCode: certificateId?.toUpperCase().slice(0, 12),
    };
  }, [certificateId, progressMap, user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!certificate) return <div className="p-10 text-center text-gray-500">Certificate not found</div>;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to="/certificates" className="text-[#1A365D] hover:underline font-bold">
            ← Back to Certificates
          </Link>
          <button
            onClick={handlePrint}
            className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-double border-[#ED8936]">
          <div className="bg-gradient-to-br from-[#1A365D] to-[#2C4A7C] p-8 text-center text-white">
            <div className="text-6xl mb-3">⚛️</div>
            <h1 className="text-3xl font-bold">Quantum Center of Intellect</h1>
            <p className="text-sm opacity-80 mt-2 tracking-widest uppercase">
              Certificate of Achievement
            </p>
          </div>

          <div className="p-12 text-center">
            <p className="text-gray-600 mb-3">This certifies that</p>
            <h2 className="text-4xl font-bold text-[#1A365D] mb-6" style={{ fontFamily: 'serif' }}>
              {certificate.studentName}
            </h2>
            <p className="text-gray-600 mb-2">has successfully completed</p>
            <h3 className="text-3xl font-bold text-[#ED8936] mb-8">
              {certificate.subject}
            </h3>
            <p className="text-gray-600 mb-8">
              with <strong>{certificate.lessonsCompleted} lessons completed</strong>
            </p>

            <div className="flex justify-around mt-12 pt-8 border-t-2 border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Issued</p>
                <p className="font-bold text-[#1A365D]">
                  {new Date(certificate.issuedAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Verification Code</p>
                <p className="font-bold text-[#1A365D] font-mono">{certificate.verificationCode}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                This certificate can be verified at quantumcenter.et/verify/{certificate.verificationCode}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 print:hidden">
          Tip: Use "Print / Save as PDF" to download this certificate.
        </p>
      </div>
    </div>
  );
}
