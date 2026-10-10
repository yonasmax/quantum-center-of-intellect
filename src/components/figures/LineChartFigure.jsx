import React from 'react';

export default function LineChartFigure({ block, index }) {
  const data = block.data || [];
  if (data.length < 2) return null;

  const width = 600;
  const height = 280;
  const padding = 40;

  const maxY = Math.max(...data.map((d) => d.y || 0));
  const minY = Math.min(...data.map((d) => d.y || 0));
  const maxX = Math.max(...data.map((d) => d.x || 0));
  const minX = Math.min(...data.map((d) => d.x || 0));

  const scaleX = (x) =>
    padding + ((x - minX) / (maxX - minX || 1)) * (width - padding * 2);

  const scaleY = (y) =>
    height - padding - ((y - minY) / (maxY - minY || 1)) * (height - padding * 2);

  const pathPoints = data.map((d) => `${scaleX(d.x)},${scaleY(d.y)}`).join(' ');

  return (
    <figure className="my-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4">
        <div className="border-b border-gray-100 pb-2 mb-4">
          <span className="text-xs font-bold text-[#ED8936] uppercase">
            📈 Graph {index}
          </span>
          {block.title && (
            <h4 className="text-sm font-bold text-[#1A365D] mt-1">{block.title}</h4>
          )}
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line
              key={i}
              x1={padding}
              x2={width - padding}
              y1={padding + frac * (height - padding * 2)}
              y2={padding + frac * (height - padding * 2)}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          <line x1={padding} x2={padding} y1={padding} y2={height - padding} stroke="#9CA3AF" strokeWidth="2" />
          <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="#9CA3AF" strokeWidth="2" />

          {/* Line */}
          <polyline
            points={pathPoints}
            fill="none"
            stroke="#1A365D"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Dots */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={scaleX(d.x)}
              cy={scaleY(d.y)}
              r="5"
              fill="#ED8936"
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 px-8 italic">
          {block.xLabel && <span>{block.xLabel}</span>}
          {block.yLabel && <span>{block.yLabel}</span>}
        </div>
      </div>
      {block.caption && (
        <figcaption className="text-sm text-gray-600 mt-2 italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}