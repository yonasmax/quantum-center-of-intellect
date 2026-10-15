import React, { useState } from 'react';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'paragraph', label: 'Paragraph', icon: 'P' },
  { type: 'callout', label: 'Callout', icon: '!' },
  { type: 'image', label: 'Image', icon: '??' },
  { type: 'formula', label: 'Formula', icon: '?' },
  { type: 'quiz', label: 'Quiz', icon: '?' },
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
      {/* Add Block Toolbar */}
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
              <span className="text-base">{bt.icon}</span>
              {bt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Existing Blocks */}
      {blocks.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-6">
          No blocks yet. Click a block type above to add content.
        </p>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, idx) => {
            const isExpanded = expandedId === block._id;
            return (
              <div
                key={block._id}
                className="border border-gray-200 rounded-lg bg-white overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-bold text-[#1A365D] uppercase">
                    {block._type}
                  </span>
                  <span className="text-xs text-gray-400 truncate flex-1">
                    {block.text || block.question || block.expression || block.url || ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveBlock(block._id, 'up')}
                    disabled={idx === 0}
                    className="text-xs px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="Move up"
                  >?</button>
                  <button
                    type="button"
                    onClick={() => moveBlock(block._id, 'down')}
                    disabled={idx === blocks.length - 1}
                    className="text-xs px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="Move down"
                  >?</button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : block._id)}
                    className="text-xs px-2 py-1 hover:bg-gray-200 rounded"
                  >
                    {isExpanded ? 'Collapse' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block._id)}
                    className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    ?
                  </button>
                </div>

                {/* Body (expanded) */}
                {isExpanded && (
                  <div className="p-3 bg-white">
                    {block._type === 'heading' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.text}
                          onChange={(e) => updateBlock(block._id, { text: e.target.value })}
                          placeholder="Heading text"
                          className="w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none"
                        />
                        <select
                          value={block.level}
                          onChange={(e) => updateBlock(block._id, { level: Number(e.target.value) })}
                          className="px-3 py-1.5 border rounded-lg text-xs bg-white"
                        >
                          <option value={2}>H2 (Large)</option>
                          <option value={3}>H3 (Medium)</option>
                          <option value={4}>H4 (Small)</option>
                        </select>
                      </div>
                    )}

                    {block._type === 'paragraph' && (
                      <textarea
                        value={block.text}
                        onChange={(e) => updateBlock(block._id, { text: e.target.value })}
                        rows={4}
                        placeholder="Write a paragraph..."
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                      />
                    )}

                    {block._type === 'callout' && (
                      <div className="space-y-2">
                        <select
                          value={block.variant}
                          onChange={(e) => updateBlock(block._id, { variant: e.target.value })}
                          className="px-3 py-1.5 border rounded-lg text-xs bg-white"
                        >
                          <option value="info">Info (blue)</option>
                          <option value="warning">Warning (yellow)</option>
                          <option value="success">Success (green)</option>
                          <option value="tip">Tip (purple)</option>
                        </select>
                        <textarea
                          value={block.text}
                          onChange={(e) => updateBlock(block._id, { text: e.target.value })}
                          rows={2}
                          placeholder="Callout text..."
                          className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                        />
                      </div>
                    )}

                    {block._type === 'image' && (
                      <div className="space-y-2">
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
                          <img
                            src={block.url}
                            alt="preview"
                            className="max-h-40 rounded-lg border border-gray-200"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    )}

                    {block._type === 'formula' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.expression}
                          onChange={(e) => updateBlock(block._id, { expression: e.target.value })}
                          placeholder="e.g. 2n?"
                          className="w-full px-3 py-2 border rounded-lg text-sm font-mono outline-none"
                        />
                        <input
                          type="text"
                          value={block.description}
                          onChange={(e) => updateBlock(block._id, { description: e.target.value })}
                          placeholder="What this formula means (optional)"
                          className="w-full px-3 py-2 border rounded-lg text-xs outline-none"
                        />
                      </div>
                    )}

                    {block._type === 'quiz' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.question}
                          onChange={(e) => updateBlock(block._id, { question: e.target.value })}
                          placeholder="Question?"
                          className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                        />
                        {block.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${block._id}`}
                              checked={block.correctIndex === oi}
                              onChange={() => updateBlock(block._id, { correctIndex: oi })}
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const next = [...block.options];
                                next[oi] = e.target.value;
                                updateBlock(block._id, { options: next });
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none"
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">? Radio button marks the correct answer</p>
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
