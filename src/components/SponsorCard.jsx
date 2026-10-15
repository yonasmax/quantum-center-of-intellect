import React, { useState } from 'react';
import { trackClick, trackImpression } from '../services/sponsorsAPI';

export default function SponsorCard({ sponsor, variant = 'compact' }) {
  const [hidden, setHidden] = useState(false);

  React.useEffect(() => {
    if (sponsor?.id) trackImpression(sponsor.id);
  }, [sponsor?.id]);

  if (!sponsor || hidden) return null;

  const handleClick = () => {
    if (sponsor.id) trackClick(sponsor.id);
  };

  if (variant === 'banner') {
    return (
      <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 my-4">
        <button
          onClick={() => setHidden(true)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          title="Hide"
        >?</button>
        <div className="flex items-center gap-4 pr-6">
          {sponsor.logo_url && (
            <img src={sponsor.logo_url} alt={sponsor.company_name} className="w-12 h-12 object-contain rounded-lg bg-white p-1" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Sponsored</p>
            <p className="font-bold text-[#1A365D] truncate">{sponsor.company_name}</p>
            {sponsor.message && <p className="text-xs text-gray-600 truncate">{sponsor.message}</p>}
          </div>
          {sponsor.target_url && (
            <a
              href={sponsor.target_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="text-xs bg-[#1A365D] hover:bg-blue-900 text-white px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
            >
              Visit
            </a>
          )}
        </div>
      </div>
    );
  }

  // Default compact card
  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-4">
      <button
        onClick={() => setHidden(true)}
        className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 text-sm leading-none"
        title="Hide"
      >?</button>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sponsored</p>
      <div className="flex items-center gap-3 pr-4">
        {sponsor.logo_url && (
          <img src={sponsor.logo_url} alt={sponsor.company_name} className="w-10 h-10 object-contain rounded-lg" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#1A365D] text-sm truncate">{sponsor.company_name}</p>
          {sponsor.message && <p className="text-xs text-gray-500 truncate">{sponsor.message}</p>}
        </div>
      </div>
      {sponsor.target_url && (
        <a
          href={sponsor.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-block mt-3 text-xs text-[#ED8936] hover:underline font-bold"
        >
          Learn more ?
        </a>
      )}
    </div>
  );
}
