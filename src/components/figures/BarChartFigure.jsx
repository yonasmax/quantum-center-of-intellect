import React from 'react';

export default function BarChartFigure({ block, index }) {
  const data = block.data || [];
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value || 0));
  const chartHeight = 240;

  return (
    <figure className="my-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4">
        <div className="border-b border-gray-100 pb-2 mb-4">
          <span className="text-xs font-bold text-[#ED8936] uppercase">
            📊 Graph {index}
          </span>
          {block.title && (
            <h4 className="text-sm font-bold text-[#1A365D] mt-1">{block.title}</h4>
          )}
        </div>
        <div className="flex items-end gap-3 h-60 pt-6">
          {data.map((item, i) => {
            const height = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                <span className="text-xs font-bold text-[#1A365D]">
                  {item.value}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-[#1A365D] to-[#ED8936] rounded-t-md transition-all hover:opacity-80"
                  style={{ height: `${height}px`, minHeight: '8px' }}
                />
                <span className="text-xs text-gray-600 text-center mt-1">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
        {block.xLabel && (
          <p className="text-xs text-gray-500 text-center mt-3 italic">
            {block.xLabel}
          </p>
        )}
      </div>
      {block.caption && (
        <figcaption className="text-sm text-gray-600 mt-2 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}