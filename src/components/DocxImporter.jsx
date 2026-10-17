import React, { useState } from 'react';
import { parseDocxToBlocks } from '../utils/docxParser';

export default function DocxImporter({ onImport }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      return setError('Please upload a .docx file (Word Document).');
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const blocks = await parseDocxToBlocks(file);
      if (blocks.length === 0) {
        throw new Error('No content found in the document.');
      }
      setPreview(blocks);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to parse the document.');
    }
    setLoading(false);
  };

  const confirmImport = () => {
    if (preview && onImport) {
      onImport(preview);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-[#1A365D] text-lg mb-2">Import from Word (.docx)</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload a Word document formatted with Headings and Tables. We'll convert it into lesson blocks automatically.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".docx"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#1A365D] file:text-white hover:file:bg-blue-900 cursor-pointer"
        />
      </div>

      {loading && <p className="text-sm text-blue-600 mt-4 animate-pulse">Parsing document...</p>}

      {preview && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-[#1A365D]">Preview ({preview.length} blocks found)</h4>
            <button
              onClick={confirmImport}
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Confirm Import
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto space-y-2 text-sm text-gray-700">
            {preview.map((block, i) => (
              <div key={i} className="border-b border-gray-200 pb-2 last:border-0">
                <span className="text-xs font-bold text-gray-400 uppercase mr-2">[{block.type}]</span>
                {block.type === 'heading' && <strong>{block.content}</strong>}
                {block.type === 'text' && <span>{block.content}</span>}
                {block.type === 'callout' && <span className="text-orange-600 italic">{block.content}</span>}
                {block.type === 'list' && <span>{block.items.length} list items</span>}
                {block.type === 'table' && <span>{block.rows.length} rows</span>}
                {block.type === 'image' && <span>[Image]</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
