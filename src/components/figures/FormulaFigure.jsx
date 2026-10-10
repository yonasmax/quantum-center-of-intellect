import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

export default function FormulaFigure({ block, index }) {
  if (!block.latex) return null;

  return (
    <figure className="my-6">
      <div className="bg-[#1A365D] text-white rounded-xl shadow-md p-6">
        <div className="border-b border-white/20 pb-2 mb-4">
          <span className="text-xs font-bold text-[#ED8936] uppercase">
            📐 Formula {index}
          </span>
        </div>
        <div className="text-center py-4 text-2xl overflow-x-auto bg-white/5 rounded-lg">
          <BlockMath math={block.latex} />
        </div>
      </div>
      {block.caption && (
        <figcaption className="text-sm text-gray-600 mt-2 italic text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}