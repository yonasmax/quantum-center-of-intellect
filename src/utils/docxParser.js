// src/utils/docxParser.js
import mammoth from 'mammoth';

export async function parseDocxToBlocks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        let html = result.value;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        let blocks = [];
        let coverImage = null;
        let videoUrl = null;
        
        // Get all text first to process line-by-line
        const textContent = doc.body.innerText || doc.body.textContent || "";
        const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);

        let currentQuiz = null;
        let currentList = null;

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (line.includes('TEACHER INSTRUCTIONS') || line.includes('The parser uses these exact tags')) continue;

          // 1. Cover & Video
          if (line.startsWith('COVER IMAGE:')) {
            coverImage = line.replace('COVER IMAGE:', '').trim();
            continue;
          }
          if (line.startsWith('VIDEO URL:')) {
            videoUrl = line.replace('VIDEO URL:', '').trim();
            continue;
          }

          // 2. Formulas
          if (line.includes('[FORMULA]')) {
            const match = line.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) blocks.push({ type: 'formula', content: match[1].trim() });
            continue;
          }

          // 3. Quizzes
          if (line.startsWith('Q.') || line.match(/^Q\.\d+:/)) {
            if (currentQuiz) blocks.push(currentQuiz); // push previous quiz
            currentQuiz = { type: 'quiz', question: line.replace(/^Q\.\d+:?\s*/, ''), options: [], correctAnswer: 0, explanation: '' };
            continue;
          }
          if (currentQuiz) {
            if (/^[A-Z]\)/.test(line)) {
              currentQuiz.options.push(line.replace(/^[A-Z]\)\s*/, ''));
              continue;
            } else if (line.startsWith('Answer:')) {
              const letter = line.replace('Answer:', '').trim().toUpperCase();
              currentQuiz.correctAnswer = letter === 'A' ? 0 : letter === 'B' ? 1 : letter === 'C' ? 2 : 3;
              continue;
            } else if (line.toLowerCase().startsWith('description:')) {
              currentQuiz.explanation = line.replace(/description:/i, '').trim();
              blocks.push(currentQuiz);
              currentQuiz = null; // Quiz is done
              continue;
            }
          }

          // 4. Callouts
          if (line.startsWith('>')) {
            blocks.push({ type: 'callout', content: line.replace(/^>\s*/, '').trim() });
            continue;
          }

          // 5. Headings
          if (line.length < 60 && (line.match(/^\d\./) || line.match(/^#/))) {
            // Fallback for headings based on numbers
            blocks.push({ type: 'heading', content: line.replace(/^#+\s*/, ''), level: 2 });
            continue;
          }

          // 6. Lists
          if (line.startsWith('-') || line.startsWith('•')) {
            if (!currentList) currentList = { type: 'list', items: [], ordered: false };
            currentList.items.push(line.replace(/^[-•]\s*/, ''));
            continue;
          } else if (currentList) {
            blocks.push(currentList);
            currentList = null;
          }

          // 7. Normal Text
          blocks.push({ type: 'text', content: line });
        }
        
        if (currentQuiz) blocks.push(currentQuiz);
        if (currentList) blocks.push(currentList);

        resolve({ blocks, coverImage, videoUrl });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
