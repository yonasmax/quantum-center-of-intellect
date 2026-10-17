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
        
        // We will parse blocks and extract meta info
        const elements = Array.from(doc.body.children);
        let currentQuiz = null;

        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          let text = el.textContent.trim();
          if (!text) continue;

          // Check for Cover Image and Video
          if (text.startsWith('COVER IMAGE:')) {
            coverImage = text.replace('COVER IMAGE:', '').trim();
            continue;
          }
          if (text.startsWith('VIDEO URL:')) {
            videoUrl = text.replace('VIDEO URL:', '').trim();
            continue;
          }

          // Headings
          if (el.tagName === 'H1') {
            blocks.push({ type: 'heading', content: text, level: 1 });
          } else if (el.tagName === 'H2') {
            blocks.push({ type: 'heading', content: text, level: 2 });
          } else if (el.tagName === 'H3') {
            blocks.push({ type: 'heading', content: text, level: 3 });
          
          // Formulas
          } else if (text.includes('[FORMULA]')) {
            const match = text.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) {
              blocks.push({ type: 'formula', content: match[1].trim() });
            }
          
          // Callouts (Blockquotes or starting with >)
          } else if (text.startsWith('>')) {
             const cleanText = text.replace(/^>\s*/, '').replace(/Key Takeaway/i, '').trim();
             blocks.push({ type: 'callout', content: cleanText });
          
          // Lists
          } else if (el.tagName === 'UL' || el.tagName === 'OL') {
            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent.trim());
            blocks.push({ type: 'list', items, ordered: el.tagName === 'OL' });
          
          // Tables
          } else if (el.tagName === 'TABLE') {
            const rows = Array.from(el.querySelectorAll('tr')).map(tr => 
              Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim())
            );
            if (rows.length > 0) {
              blocks.push({ type: 'table', rows });
            }
          
          // Quizzes (Q.1 format)
          } else if (text.includes('Q.') || (el.className && el.className.includes('quiz'))) {
            // Parse the quiz block
            const rawHtml = el.innerHTML;
            const lines = el.innerText.split('\n').map(l => l.trim()).filter(Boolean);
            
            let questionText = lines[0].replace(/<[^>]*>/g, '').replace(/^Q\.\d+:?\s*/, '');
            let choices = [];
            let correctAnswer = '';
            let description = '';

            lines.forEach(line => {
              if (line.startsWith('A)') || line.startsWith('B)') || line.startsWith('C)') || line.startsWith('D)')) {
                choices.push(line.replace(/^[A-D]\)\s*/, ''));
              } else if (line.startsWith('Answer:')) {
                correctAnswer = line.replace('Answer:', '').trim();
              } else if (line.toLowerCase().startsWith('description:')) {
                description = line.replace(/description:/i, '').trim();
              }
            });

            if (questionText && choices.length > 0) {
              // Convert letter answer to index (A=0, B=1, etc.)
              let answerIndex = 0;
              if (correctAnswer === 'A') answerIndex = 0;
              else if (correctAnswer === 'B') answerIndex = 1;
              else if (correctAnswer === 'C') answerIndex = 2;
              else if (correctAnswer === 'D') answerIndex = 3;
              
              blocks.push({ 
                type: 'quiz', 
                question: questionText,
                options: choices,
                correctAnswer: answerIndex,
                explanation: description
              });
            }
          } 
          
          // Normal Text
          else if (el.tagName === 'P') {
            blocks.push({ type: 'text', content: text });
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
