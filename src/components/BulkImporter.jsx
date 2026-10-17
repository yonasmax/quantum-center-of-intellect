import React, { useState } from 'react';
import mammoth from 'mammoth';
import { saveLesson } from '../services/lessonsAPI';

export default function BulkImporter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [parsedLessons, setParsedLessons] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.docx')) return setError('Please upload a .docx file');

    setLoading(true);
    setError('');
    setSuccess('');
    setParsedLessons([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Convert to HTML so we can read the tags (H1, P, DIV) properly
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, 'text/html');
      
      // Get all elements in order
      const elements = Array.from(doc.body.children);
      let lessonsData = [];
      let currentLesson = null;

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const text = el.textContent.trim();

        // Start a new lesson when we see a "COVER IMAGE" text or an H1
        if (text.includes('COVER IMAGE:') || (el.tagName === 'H1' && currentLesson === null)) {
          if (currentLesson) lessonsData.push(currentLesson);
          
          currentLesson = {
            title: "Untitled Lesson",
            coverImage: null,
            videoUrl: null,
            blocks: []
          };
          
          if (text.includes('COVER IMAGE:')) {
            const urlMatch = text.match(/https?:\/\/[^\s]+/);
            if (urlMatch) currentLesson.coverImage = urlMatch[0];
            continue;
          }
        }

        if (!currentLesson) continue;

        if (text.startsWith('VIDEO URL:')) {
          const urlMatch = text.match(/https?:\/\/[^\s]+/);
          if (urlMatch) currentLesson.videoUrl = urlMatch[0];
          continue;
        }

        // If it's a Title (H1)
        if (el.tagName === 'H1') {
          currentLesson.title = text.replace(/COVER IMAGE:.*/, '').trim();
          continue;
        }

        // Formulas
        if (text.includes('[FORMULA]')) {
          const match = text.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
          if (match) currentLesson.blocks.push({ type: 'formula', content: match[1].trim() });
          continue;
        }

        // Quizzes (Q.1 or Q.2)
        if (text.match(/Q\.\d+/)) {
          let qText = "";
          let options = [];
          let answer = 0;
          let desc = "";
          
          // We look inside this element for the quiz details
          const innerText = el.innerText || el.textContent;
          const lines = innerText.split('\n').map(l => l.trim()).filter(Boolean);
          
          lines.forEach(line => {
            if (line.match(/Q\.\d+/)) qText = line.replace(/^Q\.\d+:?\s*/, '');
            else if (/^[A-D]\)/.test(line)) options.push(line.replace(/^[A-D]\)\s*/, ''));
            else if (line.startsWith('Answer:')) {
              const l = line.replace('Answer:', '').trim().toUpperCase();
              answer = l === 'A' ? 0 : l === 'B' ? 1 : l === 'C' ? 2 : 3;
            }
            else if (line.toLowerCase().startsWith('description:')) desc = line.replace(/description:/i, '').trim();
          });

          if (qText && options.length > 0) {
            currentLesson.blocks.push({ type: 'quiz', question: qText, options, correctAnswer: answer, explanation: desc });
          }
          continue;
        }

        // Callouts
        if (text.startsWith('>')) {
          currentLesson.blocks.push({ type: 'callout', content: text.replace(/^>\s*/, '').trim() });
          continue;
        }

        // Headings (H2, H3)
        if (el.tagName === 'H2' || el.tagName === 'H3') {
          currentLesson.blocks.push({ type: 'heading', content: text });
          continue;
        }

        // Normal Text
        if (text.length > 5 && el.tagName === 'P') {
          currentLesson.blocks.push({ type: 'text', content: text });
        }
      }

      if (currentLesson) lessonsData.push(currentLesson);

      // Clean up empty/broken lessons
      lessonsData = lessonsData.filter(l => l.title !== "Untitled Lesson" && l.blocks.length > 0);

      if (lessonsData.length === 0) throw new Error('No valid lessons found. Check the format.');
      setParsedLessons(lessonsData);
    } catch (err) {
      setError('Failed to parse document: ' + err.message);
    }
    setLoading(false);
  };

  const saveAll = async () => {
    setLoading(true);
    let savedCount = 0;
    try {
      for (let i = 0; i < parsedLessons.length; i++) {
        const lesson = parsedLessons[i];
        await saveLesson({
          title: lesson.title,
          subject: 'Chemistry',
          grade: 'Grade 10',
          duration: 45,
          objectives: [],
          competence: '',
          content_blocks: lesson.blocks,
          cover_image_url: lesson.coverImage,
          video_url: lesson.videoUrl,
          takeaways: [],
          is_published: true,
        });
        savedCount++;
      }
      setSuccess(`Successfully saved ${savedCount} lessons!`);
      setParsedLessons([]);
    } catch (err) {
      setError(`Failed after saving ${savedCount} lessons: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#EBF8FF] p-6 rounded-xl border-2 border-[#3182CE] shadow-md mt-6">
      <h3 className="font-bold text-[#2B6CB0] text-lg mb-2 flex items-center gap-2">
        <span>🚀</span> Bulk Import (Full Unit)
      </h3>
      
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4 border border-green-200">{success}</div>}

      <input
        type="file"
        accept=".docx"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#3182CE] file:text-white hover:file:bg-blue-600 cursor-pointer"
      />

      {loading && <p className="text-sm text-blue-600 mt-4 animate-pulse">Processing...</p>}

      {parsedLessons.length > 0 && (
        <div className="mt-6 border-t border-blue-200 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-[#2B6CB0]">Found {parsedLessons.length} Lessons</h4>
            <button onClick={saveAll} className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-bold">
              Save All to Database
            </button>
          </div>
          <ul className="bg-white p-4 rounded-lg max-h-60 overflow-y-auto border border-blue-100 text-sm">
            {parsedLessons.map((l, i) => (
              <li key={i} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
                <strong>{i + 1}. {l.title}</strong> ({l.blocks.length} blocks)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
