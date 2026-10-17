// src/utils/docxParser.js
import mammoth from 'mammoth';

export async function parseDocxToBlocks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        // Convert DOCX to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        let html = result.value;

        // We will parse the HTML into our JSON block structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const blocks = [];

        // Iterate over top-level elements
        const elements = Array.from(doc.body.children);

        for (const el of elements) {
          if (el.tagName === 'H1') {
            blocks.push({ type: 'heading', content: el.textContent, level: 1 });
          } else if (el.tagName === 'H2') {
            blocks.push({ type: 'heading', content: el.textContent, level: 2 });
          } else if (el.tagName === 'H3') {
            blocks.push({ type: 'heading', content: el.textContent, level: 3 });
          } else if (el.tagName === 'P') {
            const text = el.textContent.trim();
            if (!text) continue;
            
            // Check if it's a callout (Blockquote or starts with >)
            if (text.startsWith('>')) {
              blocks.push({ type: 'callout', content: text.replace(/^>\s*/, '') });
            } else {
              blocks.push({ type: 'text', content: text });
            }
          } else if (el.tagName === 'UL' || el.tagName === 'OL') {
            const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent.trim());
            blocks.push({ type: 'list', items, ordered: el.tagName === 'OL' });
          } else if (el.tagName === 'TABLE') {
            // Parse table
            const rows = Array.from(el.querySelectorAll('tr')).map(tr => 
              Array.from(tr.querySelectorAll('th, td')).map(td => td.textContent.trim())
            );
            if (rows.length > 0) {
              blocks.push({ type: 'table', rows });
            }
          } else if (el.tagName === 'IMG') {
            blocks.push({ type: 'image', url: el.getAttribute('src') });
          }
        }

        resolve(blocks);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
