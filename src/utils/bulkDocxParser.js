// src/utils/bulkDocxParser.js
import { parseDocxToBlocks } from './docxParser';
import mammoth from 'mammoth';

export async function parseBulkDocx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        // Split the document by the special break tag
        const chunks = text.split('=== LESSON BREAK ===');
        
        const lessons = [];

        for (let i = 0; i < chunks.length; i++) {
          const chunkText = chunks[i].trim();
          if (!chunkText) continue;

          // Create a temporary Blob from the text to pass to our existing parser
          // Note: Since our existing parser uses HTML, we do a quick conversion here
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer: new Blob([chunkText]).arrayBuffer ? await new Blob([chunkText]).arrayBuffer() : arrayBuffer });
          
          // Use the single parser on this chunk
          const fileBlob = new File([chunkText], "chunk.txt", { type: "text/plain" });
          const parsed = await parseDocxToBlocks(fileBlob);
          
          lessons.push({
            rawText: chunkText,
            parsedData: parsed
          });
        }

        resolve(lessons);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
