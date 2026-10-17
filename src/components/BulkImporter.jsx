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
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Split the document by the literal string "COVER IMAGE:"
      const chunks = text.split(/COVER IMAGE:/i).filter(c => c.trim().length > 0);
      const lessonsData = [];

      for (let chunk of chunks) {
        chunk = chunk.trim();
        
        // 1. Get Cover Image
        const coverMatch = chunk.match(/^\s*(https?:\/\/[^\s]+)/i);
        const coverImage = coverMatch ? coverMatch[1] : null;
        if (coverMatch) chunk = chunk.replace(coverMatch[0], '');

        // 2. Get Video URL
        const videoMatch = chunk.match(/VIDEO URL:\s*(https?:\/\/[^\s]+)/i);
        const videoUrl = videoMatch ? videoMatch[1] : null;
        if (videoMatch) chunk = chunk.replace(videoMatch[0], '');

        // 3. Extract Title (first non-empty line)
        const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
        let title = "Untitled Lesson";
        if (lines.length > 0) {
          title = lines.shift(); // Take the first line as title
        }

        let blocks = [];
        for (let j = 0; j < lines.length; j++) {
          let line = lines[j];

          // Formula
          if (line.includes('[FORMULA]')) {
            const match = line.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) blocks.push({ type: 'formula', content: match[1].trim() });
            continue;
          }

          // Quizzes
          if (line.match(/^Q\.\d+/)) {
            let qText = line.replace(/^Q\.\d+:?\s*/, '');
            let options = [];
            let answer = 0;
            let desc = '';
            
            let k = j + 1;
            while (k < lines.length && !lines[k].match(/^Q\.\d+/)) {
              let next = lines[k];
              if (/^[A-D]\)/.test(next)) options.push(next.replace(/^[A-D]\)\s*/, ''));
              else if (next.startsWith('Answer:')) {
                const l = next.replace('Answer:', '').trim().toUpperCase();
                answer = l === 'A' ? 0 : l === 'B' ? 1 : l === 'C' ? 2 : 3;
              }
              else if (next.toLowerCase().startsWith('description:')) desc = next.replace(/description:/i, '').trim();
              k++;
            }

            if (options.length > 0) blocks.push({ type: 'quiz', question: qText, options, correctAnswer: answer, explanation: desc });
            j = k - 1;
            continue;
          }

          // Callouts
          if (line.startsWith('>')) {
            blocks.push({ type: 'callout', content: line.replace(/^>\s*/, '').trim() });
            continue;
          }

          // Headings (Shorter lines without periods)
          if (line.length < 60 && !line.endsWith('.') && !line.includes('Answer:')) {
            blocks.push({ type: 'heading', content: line, level: 2 });
            continue;
          }

          // Text
          if (line.length > 3) blocks.push({ type: 'text', content: line });
        }

        if (title !== "Untitled Lesson" && blocks.length > 0) {
          lessonsData.push({ title, blocks, coverImage, videoUrl });
        }
      }

      if (lessonsData.length === 0) throw new Error('No valid lessons found. Check the document format.');
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
