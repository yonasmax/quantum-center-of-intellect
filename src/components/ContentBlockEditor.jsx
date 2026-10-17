import React, { useState, useRef } from 'react';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'paragraph', label: 'Paragraph', icon: 'P' },
  { type: 'callout', label: 'Callout', icon: '!' },
  { type: 'image', label: 'Image', icon: 'IMG' },
  { type: 'animation', label: 'Animation', icon: 'ANIM' },
  { type: 'formula', label: 'Formula', icon: 'fx' },
  { type: 'quiz', label: 'Quiz', icon: '?' },
];

// Pre-built animation library (files live in /public/animations/)
const ANIMATION_LIBRARY = [
  { key: 'atom', label: 'Atom', icon: 'A', url: '/animations/atom.json', description: 'Rotating atom with orbiting electrons' },
  { key: 'molecule', label: 'Molecule', icon: 'M', url: '/animations/molecule.json', description: 'Bouncing molecule with atoms' },
  { key: 'dna', label: 'DNA Helix', icon: 'D', url: '/animations/dna.json', description: 'Rotating DNA double helix' },
];

function emptyBlock(type) {
  const id = 'blk-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  switch (type) {
    case 'heading':
      return { _id: id, _type: 'heading', text: '', level: 2 };
    case 'paragraph':
      return { _id: id, _type: 'paragraph', text: '' };
    case 'callout':
      return { _id: id, _type: 'callout', variant: 'info', text: '' };
    case 'image':
      return { _id: id, _type: 'image', url: '', caption: '' };
    case 'animation':
      return { _id: id, _type: 'animation', animationUrl: '', loop: true, autoplay: true, caption: '' };
    case 'formula':
      return { _id: id, _type: 'formula', expression: '', description: '' };
    case 'quiz':
      return {
        _id: id,
        _type: 'quiz',
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
      };
    default:
      return { _id: id, _type: 'paragraph', text: '' };
  }
}

// ???????????????????????????????????????????????????????????
// Image Block Editor
// ???????????????????????????????????????????????????????????
function ImageBlockEditor({ block, updateBlock }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { uploadImage } = await import('../services/storageAPI');
      const result = await uploadImage(file);
      updateBlock(block._id, { url: result.url });
    } catch (err) {
      setError(err.message);
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-[#ED8936] bg-orange-50' : 'border-gray-300 hover:border-[#1A365D] hover:bg-gray-50'
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#ED8936] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 font-bold">Click to choose image</p>
            <p className="text-xs text-gray-500 mt-1">or drag & drop - JPG, PNG, WEBP, GIF, max 5 MB</p>
          </>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="text-xs text-gray-400">OR paste URL</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <input
        type="url"
        value={block.url}
        onChange={(e) => updateBlock(block._id, { url: e.target.value })}
        placeholder="https://example.com/image.jpg"
        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
      />

      <input
        type="text"
        value={block.caption}
        onChange={(e) => updateBlock(block._id, { caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full px-3 py-2 border rounded-lg text-xs outline-none"
      />

      {block.url && (
        <img src={block.url} alt="preview" className="max-h-40 rounded-lg border border-gray-200" onError={(e) => { e.target.style.display = 'none'; }} />
      )}
    </div>
  );
}

// ???????????????????????????????????????????????????????????
// Animation Block Editor
// ???????????????????????????????????????????????????????????
function AnimationBlockEditor({ block, updateBlock }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-bold text-gray-600 mb-2">Quick Add from Library</p>
        <div className="flex flex-wrap gap-2">
          {ANIMATION_LIBRARY.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => updateBlock(block._id, { animationUrl: a.url })}
              className={`px-3 py-2 border rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                block.animationUrl === a.url
                  ? 'border-[#ED8936] bg-orange-50 text-[#ED8936]'
                  : 'border-gray-200 hover:border-[#1A365D] hover:bg-blue-50 text-gray-700'
              }`}
              title={a.description}
            >
              <span className="text-xs font-bold">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="text-xs text-gray-400">OR paste Lottie JSON URL</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <input
        type="url"
        value={block.animationUrl}
        onChange={(e) => updateBlock(block._id, { animationUrl: e.target.value })}
        placeholder="https://assets.lottiefiles.com/packages/.../animation.json"
        className="w-full px-3 py-2 border rounded-lg text-sm outline-none font-mono"
      />

      <input
        type="text"
        value={block.caption}
        onChange={(e) => updateBlock(block._id, { caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full px-3 py-2 border rounded-lg text-xs outline-none"
      />

      <div className="flex gap-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.loop !== false}
            onChange={(e) => updateBlock(block._id, { loop: e.target.checked })}
          />
          Loop
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={block.autoplay !== false}
            onChange={(e) => updateBlock(block._id, { autoplay: e.target.checked })}
          />
          Autoplay
        </label>
      </div>

      {block.animationUrl && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500">
            Animation URL set ? preview will render on the student view
          </p>
          <p className="text-xs text-gray-400 mt-1 font-mono break-all">
            {block.animationUrl.slice(0, 60)}{block.animationUrl.length > 60 ? '...' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ???????????????????????????????????????????????????????????
// Main Editor
// ???????????????????????????????????????????????????????????
export default function ContentBlockEditor({ blocks, onChange }) {
  const [expandedId, setExpandedId] = useState(null);

  const addBlock = (type) => {
    const block = emptyBlock(type);
    onChange([...blocks, block]);
    setExpandedId(block._id);
  };

  const updateBlock = (id, patch) => {
    onChange(blocks.map((b) => (b._id === id ? { ...b, ...patch } : b)));
  };

  const removeBlock = (id) => {
    if (!confirm('Delete this block?')) return;
    onChange(blocks.filter((b) => b._id !== id));
  };

  const moveBlock = (id, direction) => {
    const idx = blocks.findIndex((b) => b._id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3">
        <p className="text-xs text-gray-600 font-bold mb-2">+ Add Content Block</p>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((bt) => (
            <button
              key={bt.type}
              type="button"
              onClick={() => addBlock(bt.type)}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#1A365D] hover:bg-blue-50 rounded-lg text-sm font-bold text-gray-700 flex items-center gap-2"
            >
              <span className="text-xs font-bold">{bt.icon}</span>
              {bt.label}
            </button>
          ))}
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-6">
          No blocks yet. Click a block type above to add content.
        </p>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, idx) => {
            const isExpanded = expandedId === block._id;
            return (
              <div key={block._id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold text-[#1A365D] uppercase">{block._type}</span>
                  <span className="text-xs text-gray-400 truncate flex-1">
                    {block.text || block.question || block.expression || block.url || block.animationUrl || ''}
                  </span>
                  <button type="button" onClick={() => moveBlock(block._id, 'up')} disabled={idx === 0} className="text-xs px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-30" title="Move up">Up</button>
                  <button type="button" onClick={() => moveBlock(block._id, 'down')} disabled={idx === blocks.length - 1} className="text-xs px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-30" title="Move down">Dn</button>
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : block._id)} className="text-xs px-2 py-1 hover:bg-gray-200 rounded">
                    {isExpanded ? 'Collapse' : 'Edit'}
                  </button>
                  <button type="button" onClick={() => removeBlock(block._id)} className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded">X</button>
                </div>

                {isExpanded && (
                  <div className="p-3 bg-white">
                    {block._type === 'heading' && (
                      <div className="space-y-2">
                        <input type="text" value={block.text} onChange={(e) => updateBlock(block._id, { text: e.target.value })} placeholder="Heading text" className="w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none" />
                        <select value={block.level} onChange={(e) => updateBlock(block._id, { level: Number(e.target.value) })} className="px-3 py-1.5 border rounded-lg text-xs bg-white">
                          <option value={2}>H2 (Large)</option>
                          <option value={3}>H3 (Medium)</option>
                          <option value={4}>H4 (Small)</option>
                        </select>
                      </div>
                    )}

                    {block._type === 'paragraph' && (
                      <textarea value={block.text} onChange={(e) => updateBlock(block._id, { text: e.target.value })} rows={4} placeholder="Write a paragraph..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
                    )}

                    {block._type === 'callout' && (
                      <div className="space-y-2">
                        <select value={block.variant} onChange={(e) => updateBlock(block._id, { variant: e.target.value })} className="px-3 py-1.5 border rounded-lg text-xs bg-white">
                          <option value="info">Info (blue)</option>
                          <option value="warning">Warning (yellow)</option>
                          <option value="success">Success (green)</option>
                          <option value="tip">Tip (purple)</option>
                        </select>
                        <textarea value={block.text} onChange={(e) => updateBlock(block._id, { text: e.target.value })} rows={2} placeholder="Callout text..." className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
                      </div>
                    )}

                    {block._type === 'image' && <ImageBlockEditor block={block} updateBlock={updateBlock} />}
                    {block._type === 'animation' && <AnimationBlockEditor block={block} updateBlock={updateBlock} />}

                    {block._type === 'formula' && (
                      <div className="space-y-2">
                        <input type="text" value={block.expression} onChange={(e) => updateBlock(block._id, { expression: e.target.value })} placeholder="e.g. 2n2" className="w-full px-3 py-2 border rounded-lg text-sm font-mono outline-none" />
                        <input type="text" value={block.description} onChange={(e) => updateBlock(block._id, { description: e.target.value })} placeholder="What this formula means (optional)" className="w-full px-3 py-2 border rounded-lg text-xs outline-none" />
                      </div>
                    )}

                    {block._type === 'quiz' && (
                      <div className="space-y-2">
                        <input type="text" value={block.question} onChange={(e) => updateBlock(block._id, { question: e.target.value })} placeholder="Question?" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
                        {block.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input type="radio" name={`correct-${block._id}`} checked={block.correctIndex === oi} onChange={() => updateBlock(block._id, { correctIndex: oi })} />
                            <input type="text" value={opt} onChange={(e) => {
                              const next = [...block.options];
                              next[oi] = e.target.value;
                              updateBlock(block._id, { options: next });
                            }} placeholder={`Option ${oi + 1}`} className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none" />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">Radio button marks the correct answer</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


