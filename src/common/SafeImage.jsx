import React from 'react';

const FALLBACK =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

const SafeImage = ({ src, alt, className }) => (
  <img
    src={src || FALLBACK}
    alt={alt}
    className={className}
    onError={(e) => {
      if (e.currentTarget.dataset.fallback === '1') return;
      e.currentTarget.dataset.fallback = '1';
      e.currentTarget.src = FALLBACK;
    }}
  />
);

export default SafeImage;
