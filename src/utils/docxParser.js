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
        
        const elements = Array.from(doc.body.children);

        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          let text = el.textContent.trim();
          if (!text) continue;

          if (text.startsWith('COVER IMAGE:')) {
            coverImage = text.replace('COVER IMAGE:', '').trim();
            continue;
          }
          if (text.startsWith('VIDEO URL:')) {
            videoUrl = text.replace('VIDEO URL:', '').trim();
            continue;
          }

          if (el.tagName === 'H1') {
            blocks.push({ type: 'heading', content: text, level: 1 });
          } else if (el.tagName === 'H2') {
            blocks.push({ type: 'heading', content: text, level: 2 });
          } else if (el.tagName === 'H3') {
            blocks.push({ type: 'heading', content: text, level: 3 });
          } else if (text.includes('[FORMULA]')) {
            const match = text.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) {
              blocks.push({ type: 'formula', content: match[1].trim() });
            }
          } else if (text.startsWith('>')) {
             const cleanText = text.replace(/^>\s*/, '').replace(/Key Takeaway/i, '').trim();
             blocks.push({ type: 'callout', content: cleanText });
          } else if (el.tagName === 'UL' || el.tagName === 'OL') {
            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent.trim());
            blocks.push({ type: 'list', items, ordered: el.tagName === 'OL' });
          } else if (el.tagName === 'TABLE') {
            const rows = Array.from(el.querySelectorAll('tr')).map(tr => 
              Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim())
            );
            if (rows.length > 0) {
              blocks.push({ type: 'table', rows });
            }
          } else if (el.tagName === 'IMG' || text.includes('Uploaded Image')) {
             blocks.push({ type: 'text', content: '[Image Placeholder: Upload your graph/figure below]' });
          } else if (text.includes('Q.')) {
            const lines = el.innerText.split('\n').map(l => l.trim()).filter(Boolean);
            
            let questionText = lines[0].replace(/<[^>]*>/g, '').replace(/^Q\.\d+:?\s*/, '');
            let choices = [];
            let correctAnswer = '';
            let description = '';

            lines.forEach(line => {
              if (/^[A-Z]\)/.test(line)) {
                choices.push(line.replace(/^[A-Z]\)\s*/, ''));
              } else if (line.startsWith('Answer:')) {
                correctAnswer = line.replace('Answer:', '').trim();
              } else if (line.toLowerCase().startsWith('description:')) {
                description = line.replace(/description:/i, '').trim();
              }
            });

            if (questionText && choices.length > 0) {
              let answerIndex = 0;
              const letter = correctAnswer.toUpperCase();
              if (letter === 'A') answerIndex = 0;
              else if (letter === 'B') answerIndex = 1;
              else if (letter === 'C') answerIndex = 2;
              else if (letter === 'D') answerIndex = 3;
              
              blocks.push({ 
                type: 'quiz', 
                question: questionText,
                options: choices,
                correctAnswer: answerIndex,
                explanation: description
              });
            }
          } else if (el.tagName === 'P') {
            if (!text.includes('TEACHER INSTRUCTIONS') && !text.includes('The parser uses these exact tags')) {
              blocks.push({ type: 'text', content: text });
            }
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
