// src/components/DocxImporter.jsx
import React, { useState } from 'react';
import { parseDocxToBlocks } from '../utils/docxParser';

export default function DocxImporter({ onImport }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      return setError('Please upload a .docx or .doc file (Word Document).');
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const data = await parseDocxToBlocks(file);
      if (data.blocks.length === 0 && !data.coverImage && !data.videoUrl) {
        throw new Error('No content found in the document.');
      }
      setPreview(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to parse the document.');
    }
    setLoading(false);
  };

  const confirmImport = () => {
    if (preview && onImport) {
      // Send both the blocks and the meta info (coverImage, videoUrl) back to the form
      onImport(preview);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-[#1A365D] text-lg mb-2">Import from Word (.docx)</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload a Word document formatted with Headings, Tables, Quizzes, and Formulas. We'll convert it automatically.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".docx,.doc"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#1A365D] file:text-white hover:file:bg-blue-900 cursor-pointer"
        />
      </div>

      {loading && <p className="text-sm text-blue-600 mt-4 animate-pulse">Parsing document...</p>}

      {preview && (
        <div className="mt-6 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-[#1A365D]">Preview ({preview.blocks.length} blocks found)</h4>
              {preview.coverImage && <p className="text-xs text-green-600 font-bold mt-1">Cover Image Detected</p>}
              {preview.videoUrl && <p className="text-xs text-green-600 font-bold mt-1">Video Detected</p>}
            </div>
            <button
              onClick={confirmImport}
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Confirm Import
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto space-y-2 text-sm text-gray-700">
            {preview.blocks.map((block, i) => (
              <div key={i} className="border-b border-gray-200 pb-2 last:border-0">
                <span className="text-xs font-bold text-gray-400 uppercase mr-2">[{block.type}]</span>
                {block.type === 'heading' && <strong>{block.content}</strong>}
                {block.type === 'text' && <span>{block.content}</span>}
                {block.type === 'callout' && <span className="text-orange-600 italic">{block.content}</span>}
                {block.type === 'list' && <span>{block.items.length} list items</span>}
                {block.type === 'table' && <span>{block.rows.length} rows</span>}
                {block.type === 'formula' && <span className="font-mono bg-gray-200 px-1">{block.content}</span>}
                {block.type === 'quiz' && <span className="text-blue-600">Quiz: {block.question}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
