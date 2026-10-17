import React, { useEffect, useState } from 'react';
import SponsorCard from './SponsorCard';
import { getActiveSponsors } from '../services/sponsorsAPI';

export default function SponsorCarousel({ variant = 'compact', rotateMs = 8000 }) {
  const [sponsors, setSponsors] = useState([]);
  const [index, setIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveSponsors();
        // Ensure we have an array, otherwise default to empty
        const sponsorList = res?.data?.sponsors;
        if (Array.isArray(sponsorList)) {
          setSponsors(sponsorList);
        }
      } catch (e) {
        console.warn('[sponsor] Load failed silently:', e.message);
        setHasError(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (sponsors.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % sponsors.length);
    }, rotateMs);
    return () => clearInterval(t);
  }, [sponsors.length, rotateMs]);

  // If no sponsors or error, render nothing (prevents white screen crash)
  if (sponsors.length === 0 || hasError) return null;

  return <SponsorCard sponsor={sponsors[index]} variant={variant} />;
}
