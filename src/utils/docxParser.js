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
        
        const elements = Array.from(doc.body.children);

        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          let text = el.textContent.trim();
          
          if (!text) continue;

          if (text.startsWith('COVER IMAGE:')) { coverImage = text.replace('COVER IMAGE:', '').trim(); continue; }
          if (text.startsWith('VIDEO URL:')) { videoUrl = text.replace('VIDEO URL:', '').trim(); continue; }

          if (text.includes('[FORMULA]')) {
            const match = text.match(/\[FORMULA\](.*?)\[\/FORMULA\]/s);
            if (match) blocks.push({ type: 'formula', content: match[1].trim() });
            continue;
          }

          if (text.startsWith('>')) {
            blocks.push({ type: 'callout', content: text.replace(/^>\s*/, '').trim() });
            continue;
          }

          if (text.match(/Q\.\d+/)) {
            const qMatch = text.match(/Q\.\d+:?\s*(.*?)A\)\s*(.*?)B\)\s*(.*?)C\)\s*(.*?)D\)\s*(.*?)Answer:\s*([A-D])/i);
            if (qMatch) {
              blocks.push({
                type: 'quiz',
                question: qMatch[1].trim(),
                options: [qMatch[2].trim(), qMatch[3].trim(), qMatch[4].trim(), qMatch[5].trim()],
                correctAnswer: qMatch[6].toUpperCase() === 'A' ? 0 : qMatch[6].toUpperCase() === 'B' ? 1 : qMatch[6].toUpperCase() === 'C' ? 2 : 3,
                explanation: text.match(/Description:\s*(.*)/i) ? text.match(/Description:\s*(.*)/i)[1].trim() : ''
              });
            }
            continue;
          }

          if (el.tagName === 'H1') { blocks.push({ type: 'heading', content: text, level: 1 }); continue; }
          if (el.tagName === 'H2') { blocks.push({ type: 'heading', content: text, level: 2 }); continue; }
          if (el.tagName === 'H3') { blocks.push({ type: 'heading', content: text, level: 3 }); continue; }

          if (el.tagName === 'UL' || el.tagName === 'OL') {
            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent.trim());
            if (items.length > 0) blocks.push({ type: 'list', items, ordered: el.tagName === 'OL' });
            continue;
          }

          if (el.tagName === 'TABLE') {
            const rows = Array.from(el.querySelectorAll('tr')).map(tr => 
              Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim())
            );
            if (rows.length > 0) blocks.push({ type: 'table', rows });
            continue;
          }

          // Normal text
          blocks.push({ type: 'text', content: text });
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
