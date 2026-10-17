import React, { useState } from 'react';

export default function ContentBlockEditor({ blocks, onChange }) {
  const [editingIndex, setEditingIndex] = useState(null);

  const addBlock = (type) => {
    const newBlock = { type, content: '', level: 2, items: [], rows: [], question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' };
    onChange([...blocks, newBlock]);
    setEditingIndex(blocks.length); // Auto-open editor for new block
  };

  const updateBlock = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    onChange(newBlocks);
  };

  const removeBlock = (index) => {
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    onChange(newBlocks);
    if (editingIndex === index) setEditingIndex(null);
  };

  const moveBlock = (index, dir) => {
    if (dir === 'up' && index === 0) return;
    if (dir === 'down' && index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    const target = dir === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      {/* ADD BLOCK BUTTONS */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <span className="text-xs font-bold text-gray-400 w-full mb-1">+ ADD BLOCK</span>
        <button onClick={() => addBlock('heading')} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">H Heading</button>
        <button onClick={() => addBlock('text')} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">P Paragraph</button>
        <button onClick={() => addBlock('callout')} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">! Callout</button>
        <button onClick={() => addBlock('formula')} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">fx Formula</button>
        <button onClick={() => addBlock('quiz')} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100">? Quiz</button>
      </div>

      {/* BLOCK LIST */}
      {blocks.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">No blocks yet. Import a Word doc or click a block type above.</p>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm group">
              
              {/* Block Header (Controls) */}
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-blue-500 uppercase">{block.type}</span>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => moveBlock(i, 'up')} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">Up</button>
                  <button onClick={() => moveBlock(i, 'down')} disabled={i === blocks.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30">Dn</button>
                  <button onClick={() => setEditingIndex(editingIndex === i ? null : i)} className="text-blue-500 font-bold ml-2">Edit</button>
                  <button onClick={() => removeBlock(i)} className="text-red-500 font-bold ml-1">X</button>
                </div>
              </div>

              {/* Block Display / Editor */}
              {editingIndex === i ? (
                <div className="space-y-3">
                  {block.type === 'heading' && (
                    <input type="text" value={block.content} onChange={(e) => updateBlock(i, 'content', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold text-lg" placeholder="Heading text" autoFocus />
                  )}
                  {block.type === 'text' && (
                    <textarea value={block.content} onChange={(e) => updateBlock(i, 'content', e.target.value)} className="w-full px-3 py-2 border rounded-lg h-24" placeholder="Paragraph text" autoFocus />
                  )}
                  {block.type === 'callout' && (
                    <textarea value={block.content} onChange={(e) => updateBlock(i, 'content', e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-yellow-50 border-yellow-200 h-24" placeholder="Callout text" autoFocus />
                  )}
                  {block.type === 'formula' && (
                    <input type="text" value={block.content} onChange={(e) => updateBlock(i, 'content', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-mono" placeholder="e.g. 2n^2" autoFocus />
                  )}
                  {block.type === 'quiz' && (
                    <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
                      <input type="text" value={block.question} onChange={(e) => updateBlock(i, 'question', e.target.value)} className="w-full px-3 py-2 border rounded-lg font-bold" placeholder="Question" />
                      {block.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input type="radio" checked={block.correctAnswer === optIdx} onChange={() => updateBlock(i, 'correctAnswer', optIdx)} />
                          <input type="text" value={opt} onChange={(e) => {
                            const newOpts = [...block.options];
                            newOpts[optIdx] = e.target.value;
                            updateBlock(i, 'options', newOpts);
                          }} className="flex-1 px-3 py-1 border rounded" placeholder={`Option ${optIdx + 1}`} />
                        </div>
                      ))}
                      <input type="text" value={block.explanation} onChange={(e) => updateBlock(i, 'explanation', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Explanation for the answer" />
                    </div>
                  )}
                  <button onClick={() => setEditingIndex(null)} className="bg-[#1A365D] text-white px-4 py-1.5 rounded-lg text-sm font-bold">Done Editing</button>
                </div>
              ) : (
                <div>
                  {block.type === 'heading' && <h3 className="font-bold text-xl text-[#1A365D]">{block.content || 'Empty Heading'}</h3>}
                  {block.type === 'text' && <p className="text-gray-700 text-sm">{block.content || 'Empty paragraph'}</p>}
                  {block.type === 'callout' && <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-gray-700">{block.content || 'Empty callout'}</div>}
                  {block.type === 'formula' && <div className="bg-gray-100 p-3 rounded font-mono text-center">{block.content || 'Empty formula'}</div>}
                  {block.type === 'quiz' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="font-bold text-[#1A365D] mb-2">{block.question}</p>
                      <ul className="space-y-1 text-sm">
                        {block.options.map((opt, optIdx) => (
                          <li key={optIdx} className={block.correctAnswer === optIdx ? 'text-green-600 font-bold' : 'text-gray-600'}>
                            {String.fromCharCode(65 + optIdx)}) {opt} {block.correctAnswer === optIdx && '✓'}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-blue-500 mt-2 italic">{block.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
