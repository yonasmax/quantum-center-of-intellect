import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { client } from '../sanityClient';

export default function ImportLessons() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

  // ---------- DOWNLOAD EXCEL TEMPLATE ----------
  const downloadTemplate = () => {
    const template = [
      {
        Title: 'Introduction to the Atom',
        Subject: 'Chemistry',
        Grade: 9,
        'Lesson Number': 3,
        'Main Topic': 'Atomic Structure',
        Competence: 'Atomic Theory Fundamentals',
        Objectives: 'Understand the Bohr Model | Identify subatomic particles',
        Takeaways: 'Atoms have a nucleus | Electrons orbit in shells',
        'Video URL': 'https://youtube.com/watch?v=abc',
        'Video Title': 'Atomic Structure Animation',
        'Video Duration': '3 min',
        'Content Text': 'The Bohr model describes the atom as a small, positively charged nucleus surrounded by electrons.',
        'Callout Text': 'Remember: Protons are positive, Neutrons are neutral, Electrons are negative.',
        'Callout Type': 'info',
        'Table Title': 'Electron Shell Capacities',
        'Table Rows': 'Shell,Formula,Max|K,2(1)²=2,2|L,2(2)²=8,8|M,2(3)²=18,18',
        'Formula LaTeX': '2n^2',
        'Formula Caption': 'Maximum electrons per shell',
        'Quiz Question': 'What is the charge of a neutron?',
        'Quiz Options': '+1 | -1 | 0',
        'Quiz Correct': '0',
        'Practice Question': 'What is the charge of a neutron?',
        'Practice A': '+1',
        'Practice B': '-1',
        'Practice C': '0',
        'Practice Correct': 'C',
      },
      {
        Title: 'Chemical Bonds',
        Subject: 'Chemistry',
        Grade: 9,
        'Lesson Number': 4,
        'Main Topic': 'Ionic and Covalent Bonds',
        Competence: 'Bonding Basics',
        Objectives: 'Differentiate ionic and covalent bonds',
        Takeaways: 'Ionic = transfer of electrons | Covalent = sharing of electrons',
        'Video URL': '',
        'Video Title': '',
        'Video Duration': '',
        'Content Text': 'Atoms bond to achieve stable electron configurations.',
        'Callout Text': '',
        'Callout Type': 'info',
        'Table Title': '',
        'Table Rows': '',
        'Formula LaTeX': '',
        'Formula Caption': '',
        'Quiz Question': 'Which bond involves sharing electrons?',
        'Quiz Options': 'Ionic | Covalent | Metallic',
        'Quiz Correct': 'Covalent',
        'Practice Question': 'What type of bond is in NaCl?',
        'Practice A': 'Ionic',
        'Practice B': 'Covalent',
        'Practice C': 'Metallic',
        'Practice Correct': 'A',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    // Column widths for readability
    ws['!cols'] = [
      { wch: 30 }, { wch: 12 }, { wch: 8 }, { wch: 12 },
      { wch: 25 }, { wch: 25 }, { wch: 40 }, { wch: 40 },
      { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 50 },
      { wch: 50 }, { wch: 12 }, { wch: 25 }, { wch: 40 },
      { wch: 20 }, { wch: 20 }, { wch: 30 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }, { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lessons');
    XLSX.writeFile(wb, 'lesson-import-template.xlsx');
  };

  // ---------- HANDLE FILE UPLOAD ----------
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setResults(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        setPreviewData(jsonData);
      } catch (err) {
        console.error(err);
        alert('Error reading Excel file: ' + err.message);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  // ---------- IMPORT TO SANITY ----------
  const handleImport = async () => {
    if (previewData.length === 0) return;

    setImporting(true);
    const importResults = { success: [], failed: [] };

    for (const row of previewData) {
      try {
        const title = row.Title || row.title;
        const subject = row.Subject || row.subject;
        const grade = row.Grade || row.grade;

        if (!title || !subject || !grade) {
          importResults.failed.push({
            title: title || 'Unknown',
            reason: 'Missing title, subject, or grade',
          });
          continue;
        }

        const doc = {
          _type: 'lesson',
          title: String(title),
          subject: String(subject),
          grade: String(grade),
          lessonNumber: parseInt(row['Lesson Number'] || row.lessonNumber) || 1,
          mainTopic: row['Main Topic'] || row.mainTopic || '',
          competence: row.Competence || row.competence || '',
          objectives: (row.Objectives || '')
            .toString()
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean),
          takeaways: (row.Takeaways || '')
            .toString()
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean),
        };

        // Video
        if (row['Video URL']) {
          doc.video = {
            title: row['Video Title'] || 'Lesson Video',
            url: row['Video URL'],
            duration: row['Video Duration'] || '',
          };
        }

        // Content blocks
        const contentBlocks = [];

        if (row['Content Text']) {
          contentBlocks.push({
            _type: 'block',
            _key: `block-${Date.now()}-${Math.random()}`,
            children: [
              {
                _type: 'span',
                _key: `span-${Date.now()}-${Math.random()}`,
                text: String(row['Content Text']),
              },
            ],
            markDefs: [],
            style: 'normal',
          });
        }

        if (row['Callout Text']) {
          contentBlocks.push({
            _type: 'calloutBlock',
            _key: `callout-${Date.now()}-${Math.random()}`,
            type: row['Callout Type'] || 'info',
            text: String(row['Callout Text']),
          });
        }

        if (row['Table Title'] && row['Table Rows']) {
          const rowsArray = row['Table Rows']
            .toString()
            .split('|')
            .map((rowStr) => ({
              _key: `row-${Date.now()}-${Math.random()}`,
              cells: rowStr.split(',').map((c) => c.trim()),
            }));

          contentBlocks.push({
            _type: 'tableFigure',
            _key: `table-${Date.now()}-${Math.random()}`,
            title: String(row['Table Title']),
            hasHeader: true,
            rows: rowsArray,
          });
        }

        if (row['Formula LaTeX']) {
          contentBlocks.push({
            _type: 'formulaFigure',
            _key: `formula-${Date.now()}-${Math.random()}`,
            latex: String(row['Formula LaTeX']),
            caption: row['Formula Caption'] || '',
          });
        }

        if (contentBlocks.length > 0) {
          doc.contentBlocks = contentBlocks;
        }

        // Practice Questions
        if (row['Practice Question']) {
          doc.practiceQuestions = [
            {
              _key: `pq-${Date.now()}-${Math.random()}`,
              question: String(row['Practice Question']),
              optionA: row['Practice A'] || '',
              optionB: row['Practice B'] || '',
              optionC: row['Practice C'] || '',
              correctAnswer: row['Practice Correct'] || 'A',
            },
          ];
        }

        // Auto Quiz
        if (row['Quiz Question'] && row['Quiz Options']) {
          doc.quiz = [
            {
              _key: `quiz-${Date.now()}-${Math.random()}`,
              question: String(row['Quiz Question']),
              options: row['Quiz Options']
                .toString()
                .split('|')
                .map((s) => s.trim()),
              correctAnswer: String(row['Quiz Correct'] || ''),
            },
          ];
        }

        await client.create(doc);
        importResults.success.push(title);
      } catch (err) {
        console.error('Import error:', err);
        importResults.failed.push({
          title: row.Title || row.title || 'Unknown',
          reason: err.message,
        });
      }
    }

    setResults(importResults);
    setImporting(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#1A365D] text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">📥 Bulk Lesson Importer</h1>
            <p className="text-sm opacity-80 mt-1">
              Import lessons from an Excel file (.xlsx)
            </p>
          </div>
          <Link
            to="/teacher"
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Instructions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] text-lg mb-3">
            How to Import Lessons
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>
              <strong>Download the Excel template</strong> below.
            </li>
            <li>
              <strong>Open in Excel or Google Sheets</strong> and fill in your
              lessons (one row per lesson).
            </li>
            <li>
              <strong>Save as .xlsx</strong> (keep the column headers unchanged).
            </li>
            <li>
              <strong>Upload below</strong> and click Import.
            </li>
          </ol>

          <div className="mt-4 flex gap-3 flex-wrap">
            <button
              onClick={downloadTemplate}
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2"
            >
              ⬇️ Download Excel Template (.xlsx)
            </button>
          </div>
        </div>

        {/* Upload area */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1A365D] text-lg mb-3">
            Upload Your Excel File
          </h2>

          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-[#ED8936] transition-colors bg-gray-50">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="text-5xl mb-3">📊</div>
            <p className="font-bold text-[#1A365D] text-lg">
              {file ? `✓ ${file.name}` : 'Click to upload Excel file'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {previewData.length > 0
                ? `${previewData.length} lesson(s) detected — ready to import`
                : 'Supported formats: .xlsx, .xls'}
            </p>
          </label>
        </div>

        {/* Preview */}
        {previewData.length > 0 && !results && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#1A365D] text-lg mb-3">
              Preview ({previewData.length} lessons)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Title</th>
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-left">Grade</th>
                    <th className="px-3 py-2 text-left">Lesson #</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">
                        {row.Title || row.title || '⚠️ Missing'}
                      </td>
                      <td className="px-3 py-2">
                        {row.Subject || row.subject || '⚠️ Missing'}
                      </td>
                      <td className="px-3 py-2">
                        {row.Grade || row.grade || '⚠️ Missing'}
                      </td>
                      <td className="px-3 py-2">
                        {row['Lesson Number'] || row.lessonNumber || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">
                  ... and {previewData.length - 10} more lessons
                </p>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="mt-4 bg-[#ED8936] hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
            >
              {importing
                ? `Importing... please wait`
                : `🚀 Import All ${previewData.length} Lessons`}
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-[#1A365D] text-lg mb-3">
              Import Results
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-xs font-bold text-green-700">
                  ✅ Successfully Imported
                </p>
                <p className="text-3xl font-bold text-green-800">
                  {results.success.length}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-xs font-bold text-red-700">❌ Failed</p>
                <p className="text-3xl font-bold text-red-800">
                  {results.failed.length}
                </p>
              </div>
            </div>

            {results.success.length > 0 && (
              <details className="mb-3">
                <summary className="cursor-pointer text-sm font-bold text-green-700">
                  Show imported lessons
                </summary>
                <ul className="text-xs text-green-800 mt-2 space-y-1 pl-4">
                  {results.success.map((t, i) => (
                    <li key={i}>✅ {t}</li>
                  ))}
                </ul>
              </details>
            )}

            {results.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-bold text-red-800 mb-2">Failed Lessons:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {results.failed.map((f, i) => (
                    <li key={i}>
                      • <strong>{f.title}</strong>: {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => navigate('/teacher')}
              className="mt-4 bg-[#1A365D] hover:bg-blue-900 text-white px-6 py-2.5 rounded-lg font-bold"
            >
              View Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}