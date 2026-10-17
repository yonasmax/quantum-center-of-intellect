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
          
          // IGNORE EMPTY BLOCKS
          if (!text && el.tagName !== 'TABLE' && el.tagName !== 'IMG') continue;

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
             // Group all sequential ">" lines into one callout
             let calloutText = text.replace(/^>\s*/, '').replace(/Key Takeaway/i, '').trim();
             
             // Look ahead to see if next items are also part of the callout
             let j = i + 1;
             while (j < elements.length) {
                 let nextText = elements[j].textContent.trim();
                 if (nextText.startsWith('-') || nextText.startsWith('>') || (nextText.length > 0 && !nextText.startsWith('Q.'))) {
                    // If it's a bullet point or continuation
                    calloutText += '\n' + nextText.replace(/^[-•>]\s*/, '').trim();
                    j++;
                 } else {
                    break;
                 }
             }
             blocks.push({ type: 'callout', content: calloutText });
             i = j - 1; // Skip the elements we just grouped
             
          } else if (el.tagName === 'UL' || el.tagName === 'OL') {
            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent.trim()).filter(Boolean);
            if (items.length > 0) blocks.push({ type: 'list', items, ordered: el.tagName === 'OL' });
          } else if (el.tagName === 'TABLE') {
            const rows = Array.from(el.querySelectorAll('tr')).map(tr => 
              Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim())
            ).filter(r => r.some(c => c));
            if (rows.length > 0) blocks.push({ type: 'table', rows });
          } else if (el.tagName === 'IMG' || text.includes('Uploaded Image')) {
             blocks.push({ type: 'text', content: '[Image Placeholder: Upload your graph/figure below]' });
          } else if (text.includes('Q.')) {
             const lines = el.innerText.split('\n').map(l => l.trim()).filter(Boolean);
             let questionText = '';
             let choices = [];
             let correctAnswer = '';
             let description = '';

             lines.forEach(line => {
               if (line.match(/^Q\.\d+:/) || line.startsWith('Q.')) {
                 questionText = line.replace(/^Q\.\d+:?\s*/, '');
               } else if (/^[A-Z]\)/.test(line)) {
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
             } else {
               blocks.push({ type: 'text', content: text });
             }
          } else if (el.tagName === 'P') {
            if (!text.includes('TEACHER INSTRUCTIONS') && !text.includes('The parser uses these exact tags')) {
              blocks.push({ type: 'text', content: text });
            }
          }
        }

        // Final pass to remove any accidental empty text blocks
        blocks = blocks.filter(b => {
           if (b.type === 'text' && !b.content) return false;
           return true;
        });

        resolve({ blocks, coverImage, videoUrl });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
