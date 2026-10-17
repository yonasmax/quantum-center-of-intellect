// src/utils/docxParser.js
import mammoth from 'mammoth';

export async function parseDocxToBlocks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        
        let blocks = [];
        let coverImage = null;
        let videoUrl = null;
        
        // 1. Get the entire text content of the document
        const fullText = doc.body.innerText || "";
        const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];

          if (line.startsWith('COVER IMAGE:')) { coverImage = line.replace('COVER IMAGE:', '').trim(); continue; }
          if (line.startsWith('VIDEO URL:')) { videoUrl = line.replace('VIDEO URL:', '').trim(); continue; }

          if (line.startsWith('[FORMULA]')) {
            const match = line.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) blocks.push({ type: 'formula', content: match[1].trim() });
            continue;
          }

          if (line.startsWith('>')) {
            blocks.push({ type: 'callout', content: line.replace(/^>\s*/, '').trim() });
            continue;
          }

          // REGEX MATCH FOR QUIZZES (Handles mashed text)
          if (line.match(/Q\.\d+/)) {
            // Check if it's all mashed into one line
            const qMatch = line.match(/Q\.\d+:?\s*(.*?)A\)\s*(.*?)B\)\s*(.*?)C\)\s*(.*?)D\)\s*(.*?)Answer:\s*([A-D])/i);
            
            if (qMatch) {
              blocks.push({
                type: 'quiz',
                question: qMatch[1].trim(),
                options: [qMatch[2].trim(), qMatch[3].trim(), qMatch[4].trim(), qMatch[5].trim()],
                correctAnswer: qMatch[6].toUpperCase() === 'A' ? 0 : qMatch[6].toUpperCase() === 'B' ? 1 : qMatch[6].toUpperCase() === 'C' ? 2 : 3,
                explanation: line.match(/Description:\s*(.*)/i) ? line.match(/Description:\s*(.*)/i)[1].trim() : ''
              });
            } else {
              // If it's on separate lines
              let question = line.replace(/^Q\.\d+:?\s*/, '');
              let options = [];
              let correct = 0;
              let desc = '';
              let j = i + 1;
              while (j < lines.length && !lines[j].match(/Q\.\d+/)) {
                let next = lines[j];
                if (/^[A-D]\)/.test(next)) options.push(next.replace(/^[A-D]\)\s*/, ''));
                else if (next.startsWith('Answer:')) {
                   const letter = next.replace('Answer:', '').trim().toUpperCase();
                   correct = letter === 'A' ? 0 : letter === 'B' ? 1 : letter === 'C' ? 2 : 3;
                }
                else if (next.toLowerCase().startsWith('description:')) desc = next.replace(/description:/i, '').trim();
                else if (next.includes('Description:')) desc = next.split('Description:')[1].trim();
                j++;
              }
              if (options.length > 0) {
                blocks.push({ type: 'quiz', question, options, correctAnswer: correct, explanation: desc });
              }
              i = j - 1;
            }
            continue;
          }

          // Headings (Simple heuristic)
          if (line.length < 60 && (line.match(/^\d\./) || line.match(/^[A-Z][a-z]+( [A-Z][a-z]+)*$/))) {
            blocks.push({ type: 'heading', content: line, level: 2 });
            continue;
          }

          // Normal Text
          blocks.push({ type: 'text', content: line });
        }

        resolve({ blocks, coverImage, videoUrl });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
