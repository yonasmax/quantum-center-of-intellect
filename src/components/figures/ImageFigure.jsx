import React from 'react';
import { urlFor } from '../../sanityClient';

export default function ImageFigure({ block, index }) {
  const imageUrl = block.image ? urlFor(block.image).width(1200).url() : null;

  const alignClass = {
    center: 'mx-auto text-center',
    left: 'text-left',
    right: 'text-right',
    full: 'w-full text-center',
  }[block.alignment || 'center'];

  if (!imageUrl) return null;

  return (
    <figure className={`my-6 ${alignClass}`}>
      <div className="inline-block bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        <span className="text-xs font-bold text-[#ED8936] uppercase block mb-2 text-left">
          🖼️ Figure {index}
        </span>
        <img
          src={imageUrl}
          alt={block.caption || block.title}
          className={`rounded-lg ${
            block.alignment === 'full' ? 'w-full' : 'max-w-2xl'
          }`}
        />
      </div>
      {(block.title || block.caption) && (
        <figcaption className="text-sm text-gray-600 mt-2 italic">
          <strong className="not-italic text-[#1A365D]">{block.title}</strong>
          {block.title && block.caption && ': '}
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}