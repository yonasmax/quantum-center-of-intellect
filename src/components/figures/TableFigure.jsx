import React from 'react';

export default function TableFigure({ block, index }) {
  const rows = block.rows || [];
  if (rows.length === 0) return null;

  // Aggressive normalizer — handles every possible shape
  const normalizeCells = (cells) => {
    if (!cells) return [];
    
    // Case 1: cells is a proper array of strings
    if (Array.isArray(cells)) {
      // If it's an array with ONE string that looks like a JSON array
      if (cells.length === 1 && typeof cells[0] === 'string' && cells[0].trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(cells[0]);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // Fallback: split by comma
          return cells[0].split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
        }
      }
      // Otherwise use as-is
      return cells;
    }

    // Case 2: cells is a single string
    if (typeof cells === 'string') {
      // Try JSON parse
      if (cells.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(cells);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // Fallback
        }
      }
      // Fallback: split by comma
      return cells.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    }

    return [];
  };

  const header = block.hasHeader ? rows[0] : null;
  const body = block.hasHeader ? rows.slice(1) : rows;

  return (
    <figure className="my-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-[#1A365D] to-[#2C4A7C] px-4 py-3">
          <span className="text-xs font-bold text-[#ED8936] uppercase tracking-wider">
            📋 Table {index}
          </span>
          {block.title && (
            <h4 className="text-base font-bold text-white mt-1">{block.title}</h4>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            {header && (
              <thead>
                <tr className="bg-gray-100 border-b-2 border-[#1A365D]">
                  {normalizeCells(header.cells).map((cell, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left font-bold text-[#1A365D] uppercase text-xs tracking-wide"
                    >
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, ri) => (
                <tr
                  key={ri}
                  className={`${
                    ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0`}
                >
                  {normalizeCells(row.cells).map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2.5 text-gray-700"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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