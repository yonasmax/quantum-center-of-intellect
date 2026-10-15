import React, { useEffect, useState } from 'react';
import SponsorCard from './SponsorCard';
import { getActiveSponsors } from '../services/sponsorsAPI';

export default function SponsorCarousel({ variant = 'compact', rotateMs = 8000 }) {
  const [sponsors, setSponsors] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getActiveSponsors();
        setSponsors(res.data.sponsors);
      } catch (e) {
        console.warn('[sponsor] Load failed:', e.message);
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

  if (sponsors.length === 0) return null;

  return <SponsorCard sponsor={sponsors[index]} variant={variant} />;
}
