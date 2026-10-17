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
        
        const fullText = doc.body.innerText || "";
        const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];

          // Ignore Teacher Tags
          if (line.match(/^(> HHeading|> PParagraph!|ANIMAnimation|IMGImage|fxFormula|Media \(optional\)|Key Takeaways|Takeaways \(one per line\) one by one:|Learning Objectives|Objectives \(one per|line\)|Learning|Competence|Lesson Content|- Add Content Block)/i)) {
            continue;
          }
          if (line.includes('Which of the following') || line.includes('What are the starting')) {
             // Just let the quiz parser handle it below
          } else if (line.match(/^>/) && !line.includes('> HHeading') && !line.includes('> PParagraph')) {
             const cleanText = line.replace(/^>\s*/, '').trim();
             if (cleanText.length > 5) {
                 blocks.push({ type: 'callout', content: cleanText });
             }
             continue;
          }

          if (line.startsWith('COVER IMAGE:')) { coverImage = line.replace('COVER IMAGE:', '').trim(); continue; }
          if (line.startsWith('VIDEO URL:')) { videoUrl = line.replace('VIDEO URL:', '').trim(); continue; }

          if (line.startsWith('[FORMULA]')) {
            const match = line.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) blocks.push({ type: 'formula', content: match[1].trim() });
            continue;
          }

          // Mashed Quizzes
          if (line.match(/Q\.\d+/)) {
            const qMatch = line.match(/Q\.\d+:?\s*(.*?)A\)\s*(.*?)B\)\s*(.*?)C\)\s*(.*?)D\)\s*(.*?)Answer:\s*([A-D])/i);
            if (qMatch) {
              blocks.push({
                type: 'quiz',
                question: qMatch[1].trim(),
                options: [qMatch[2].trim(), qMatch[3].trim(), qMatch[4].trim(), qMatch[5].trim()],
                correctAnswer: qMatch[6].toUpperCase() === 'A' ? 0 : qMatch[6].toUpperCase() === 'B' ? 1 : qMatch[6].toUpperCase() === 'C' ? 2 : 3,
                explanation: line.match(/Description:\s*(.*)/i) ? line.match(/Description:\s*(.*)/i)[1].trim() : ''
              });
            }
            continue;
          }

          // Headings
          if (line.length < 60 && (line.match(/^\d\./) || line.match(/^[A-Z][a-z]+( [A-Z][a-z]+)*$/))) {
            blocks.push({ type: 'heading', content: line, level: 2 });
            continue;
          }

          // Normal Text
          if (line.length > 20) {
            blocks.push({ type: 'text', content: line });
          }
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
