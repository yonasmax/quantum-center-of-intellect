// src/components/DocxImporter.jsx
import React, { useState } from 'react';
import { parseDocxToBlocks } from '../utils/docxParser';
import { supabase } from '../supabaseClient';

export default function DocxImporter({ onImport }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  // 1. Parse the DOCX
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setPreview(null);
    setUploadedImages([]);

    try {
      const data = await parseDocxToBlocks(file);
      setPreview(data);
    } catch (err) {
      setError(err.message || 'Failed to parse the document.');
    }
    setLoading(false);
  };

  // 2. Upload Images to Supabase
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    const newUrls = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `lesson-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images') // Assumes you have a public bucket named 'images'
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      } catch (err) {
        console.error("Image upload failed", err);
        setError('Failed to upload some images. Check your storage bucket.');
      }
    }

    setUploadedImages(prev => [...prev, ...newUrls]);
    setUploadingImages(false);
  };

  const confirmImport = () => {
    if (preview && onImport) {
      // Append the uploaded images as new blocks at the end
      const imageBlocks = uploadedImages.map(url => ({ type: 'image', url }));
      const finalBlocks = [...preview.blocks, ...imageBlocks];
      
      onImport({
        blocks: finalBlocks,
        coverImage: preview.coverImage,
        videoUrl: preview.videoUrl
      });
    }
  };

  return (
    // NEW BLUE UI COLOR
    <div className="bg-[#EBF8FF] p-6 rounded-xl border-2 border-[#3182CE] shadow-md">
      <h3 className="font-bold text-[#2B6CB0] text-lg mb-2 flex items-center gap-2">
        <span>📘</span> Import from Word (.docx)
      </h3>
      <p className="text-sm text-[#2C5282] mb-4">
        Upload your formatted Word document first, then upload your figures and graphs below.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 border border-red-200">
          {error}
        </div>
      )}

      {/* 1. DOCX UPLOAD */}
      <div className="mb-6">
        <label className="text-sm font-bold text-[#2B6CB0] block mb-2">Step 1: Select Word Document</label>
        <input
          type="file"
          accept=".docx,.doc"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#3182CE] file:text-white hover:file:bg-blue-600 cursor-pointer"
        />
      </div>

      {loading && <p className="text-sm text-blue-600 animate-pulse mb-4">Parsing document...</p>}

      {/* 2. IMAGE UPLOAD */}
      <div className="mb-6 bg-white p-4 rounded-lg border border-blue-200">
        <label className="text-sm font-bold text-[#2B6CB0] block mb-2">Step 2: Upload Figures & Graphs</label>
        <p className="text-xs text-gray-500 mb-2">Select the images from your desktop to append them to this lesson.</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-600 file:text-white hover:file:bg-gray-700 cursor-pointer"
        />
        {uploadingImages && <p className="text-sm text-blue-600 animate-pulse mt-2">Uploading images...</p>}
        
        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {uploadedImages.map((url, i) => (
              <img key={i} src={url} alt="Uploaded" className="h-16 w-16 object-cover rounded border shadow-sm" />
            ))}
          </div>
        )}
      </div>

      {/* PREVIEW & CONFIRM */}
      {preview && (
        <div className="border-t border-blue-200 pt-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-bold text-[#2B6CB0]">Preview ({preview.blocks.length} blocks found)</h4>
              {uploadedImages.length > 0 && <p className="text-xs text-green-600 font-bold mt-1">{uploadedImages.length} Images ready</p>}
            </div>
            <button
              onClick={confirmImport}
              className="bg-[#ED8936] hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm"
            >
              Confirm Import
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg max-h-60 overflow-y-auto space-y-2 text-sm text-gray-700 border border-blue-100">
            {preview.blocks.map((block, i) => (
              <div key={i} className="border-b border-gray-100 pb-2 last:border-0">
                <span className="text-xs font-bold text-blue-400 uppercase mr-2">[{block.type}]</span>
                {block.type === 'heading' && <strong>{block.content}</strong>}
                {block.type === 'text' && <span>{block.content}</span>}
                {block.type === 'callout' && <span className="text-orange-600 italic">{block.content}</span>}
                {block.type === 'list' && <span>{block.items.length} list items</span>}
                {block.type === 'table' && <span>{block.rows.length} rows</span>}
                {block.type === 'formula' && <span className="font-mono bg-gray-100 px-1">{block.content}</span>}
                {block.type === 'quiz' && <span className="text-blue-600 font-bold">Quiz: {block.question}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
