// src/utils/docxParser.js
import mammoth from 'mammoth';

export async function parseDocxToBlocks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // 1. Extract raw text directly
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        let blocks = [];
        let coverImage = null;
        let videoUrl = null;
        
        // 2. Split into lines and process
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        let currentQuiz = null;

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (line.includes('TEACHER INSTRUCTIONS') || line.includes('The parser uses these exact tags')) continue;

          // Cover & Video
          if (line.startsWith('COVER IMAGE:')) {
            coverImage = line.replace('COVER IMAGE:', '').trim();
            continue;
          }
          if (line.startsWith('VIDEO URL:')) {
            videoUrl = line.replace('VIDEO URL:', '').trim();
            continue;
          }

          // Formulas
          if (line.includes('[FORMULA]')) {
            const match = line.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) blocks.push({ type: 'formula', content: match[1].trim() });
            continue;
          }

          // Quizzes
          if (line.match(/^Q\.\d+:/) || line.startsWith('Q.')) {
            if (currentQuiz) blocks.push(currentQuiz); 
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
              currentQuiz = null; 
              continue;
            }
          }

          // Callouts
          if (line.startsWith('>')) {
            blocks.push({ type: 'callout', content: line.replace(/^>\s*/, '').trim() });
            continue;
          }

          // Lists
          if (line.startsWith('-') || line.startsWith('•')) {
            // If the previous block is a list, add to it, otherwise create a new one
            if (blocks.length > 0 && blocks[blocks.length - 1].type === 'list') {
              blocks[blocks.length - 1].items.push(line.replace(/^[-•]\s*/, ''));
            } else {
              blocks.push({ type: 'list', items: [line.replace(/^[-•]\s*/, '')], ordered: false });
            }
            continue;
          }

          // Headings (Heuristics)
          if (line.length < 60 && (line.match(/^\d\./) || line.match(/^[A-Z][a-z]+( [A-Z][a-z]+)*$/) && !line.endsWith('.'))) {
            blocks.push({ type: 'heading', content: line, level: 2 });
            continue;
          }

          // Normal Text
          blocks.push({ type: 'text', content: line });
        }
        
        if (currentQuiz) blocks.push(currentQuiz);

        resolve({ blocks, coverImage, videoUrl });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
