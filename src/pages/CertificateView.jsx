// src/pages/CertificateView.jsx
// Individual printable certificate view + PDF download
import React, { useMemo, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function CertificateView() {
  const { certificateId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { progressMap } = useProgress();
  const certificateRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const certificate = useMemo(() => {
    if (!certificateId) return null;

    const parts = certificateId.split('-');
    const rawSubject = parts.length >= 2 ? parts[1] : parts[0];
    const uniqueId = parts.length >= 3 ? parts.slice(2).join('-') : parts[parts.length - 1];

    const lessons = Object.values(progressMap).filter((p) => {
      if (!p.completed || !p.lesson?.subject) return false;
      return p.lesson.subject.toLowerCase() === rawSubject.toLowerCase();
    });

    const displaySubject = lessons[0]?.lesson?.subject
      || rawSubject.charAt(0).toUpperCase() + rawSubject.slice(1);

    const verificationCode = rawSubject.toUpperCase() + '-' + uniqueId.toUpperCase();

    return {
      id: certificateId,
      subject: displaySubject,
      lessonsCompleted: lessons.length,
      studentName: user?.fullName || user?.email || 'Student',
      issuedAt: new Date().toISOString(),
      verificationCode,
    };
  }, [certificateId, progressMap, user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!certificate) return <div className="p-10 text-center text-gray-500">Certificate not found</div>;

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const availableWidth = pdfWidth - margin * 2;
      const availableHeight = pdfHeight - margin * 2;

      const imgRatio = canvas.width / canvas.height;
      let imgWidth = availableWidth;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > availableHeight) {
        imgHeight = availableHeight;
        imgWidth = imgHeight * imgRatio;
      }

      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

      const safeSubject = certificate.subject.replace(/\s+/g, '-').toLowerCase();
      pdf.save('certificate-' + safeSubject + '-' + certificate.verificationCode + '.pdf');
    } catch (err) {
      console.error('[certificate] PDF generation failed:', err);
      alert('Failed to generate PDF: ' + err.message);
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to="/certificates" className="text-[#1A365D] hover:underline font-bold">
            Back to Certificates
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-gray-100 text-[#1A365D] border-2 border-[#1A365D] px-5 py-2.5 rounded-lg font-bold"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold disabled:opacity-50"
            >
              {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div
          ref={certificateRef}
          className="bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-double border-[#ED8936]"
        >
          <div className="bg-gradient-to-br from-[#1A365D] to-[#2C4A7C] p-8 text-center text-white">
            <div className="text-6xl mb-3">[ATOM]</div>
            <h1 className="text-3xl font-bold">Quantum Center of Intellect</h1>
            <p className="text-sm opacity-80 mt-2 tracking-widest uppercase">
              Certificate of Achievement
            </p>
          </div>

          <div className="p-12 text-center bg-white">
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
          Click "Download PDF" to save this certificate as a PDF file, or "Print" to print it.
        </p>
      </div>
    </div>
  );
}
