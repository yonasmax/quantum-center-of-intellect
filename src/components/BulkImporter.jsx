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
    if (!file || !file.name.endsWith('.docx')) {
      return setError('Please upload a .docx file');
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setParsedLessons([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, 'text/html');
      
      // Split into lessons based on H1 tags
      const bodyElements = Array.from(doc.body.children);
      let currentLessonElements = [];
      const lessonsToProcess = [];

      bodyElements.forEach(el => {
        if (el.tagName === 'H1' && currentLessonElements.length > 0) {
          lessonsToProcess.push(currentLessonElements);
          currentLessonElements = [];
        }
        currentLessonElements.push(el);
      });
      if (currentLessonElements.length > 0) lessonsToProcess.push(currentLessonElements);

      const lessonsData = [];
      for (const lessonHtml of lessonsToProcess) {
        let title = "Untitled Lesson";
        let coverImage = null;
        let videoUrl = null;
        let blocks = [];

        lessonHtml.forEach(el => {
          const text = el.textContent.trim();
          if (el.tagName === 'H1') title = text;
          else if (text.startsWith('COVER IMAGE:')) coverImage = text.replace('COVER IMAGE:', '').trim();
          else if (text.startsWith('VIDEO URL:')) videoUrl = text.replace('VIDEO URL:', '').trim();
          else if (el.tagName === 'H2') blocks.push({ type: 'heading', content: text });
          else if (el.tagName === 'P') {
            if (text.includes('[FORMULA]')) {
               const match = text.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
               if (match) blocks.push({ type: 'formula', content: match[1].trim() });
            } else if (text.length > 0 && !text.includes('COVER IMAGE') && !text.includes('VIDEO URL')) {
               blocks.push({ type: 'text', content: text });
            }
          }
          else if (el.tagName === 'DIV' && el.className.includes('quiz')) {
            // Parse Quiz
            const qText = el.querySelector('strong')?.textContent || '';
            const lines = el.innerHTML.split('<br>');
            let options = [];
            let answer = '';
            let desc = '';
            
            lines.forEach(line => {
              if (/^[A-D]\)/.test(line)) options.push(line.replace(/^[A-D]\)\s*/, '').replace(/<.*?>/g, ''));
              else if (line.includes('Answer:')) answer = line.replace(/.*Answer:\s*/, '').replace(/<.*?>/g, '').trim();
              else if (line.includes('Description:')) desc = line.replace(/.*Description:\s*/, '').replace(/<.*?>/g, '').trim();
            });

            if (qText && options.length > 0) {
               blocks.push({ 
                 type: 'quiz', 
                 question: qText.replace('Answer:', '').trim(), 
                 options, 
                 correctAnswer: answer === 'A' ? 0 : answer === 'B' ? 1 : answer === 'C' ? 2 : 3, 
                 explanation: desc 
               });
            }
          }
          else if (el.tagName === 'DIV' && el.className.includes('callout')) {
             blocks.push({ type: 'callout', content: el.textContent.replace('Key Takeaways:', '').trim() });
          }
        });

        if (title !== "Untitled Lesson" && blocks.length > 0) {
           lessonsData.push({ title, blocks, coverImage, videoUrl });
        }
      }

      if (lessonsData.length === 0) throw new Error('No lessons found. Make sure the document has <h1> tags.');
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
      setSuccess(`Successfully saved ${savedCount} lessons to the database!`);
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
      <p className="text-sm text-[#2C5282] mb-4">
        Upload a Word document containing multiple lessons. Each <strong>Heading 1</strong> will be split into a separate lesson automatically.
      </p>

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
