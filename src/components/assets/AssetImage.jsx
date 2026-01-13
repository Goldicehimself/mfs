import React, { useState, useEffect } from 'react';

// Simple responsive image component with fallback and lazy loading
export default function AssetImage({ src, alt, className = '', style = {}, fallback = '/placeholder-asset.svg', onClick, imgProps = {} }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [src, fallback]);

  const handleError = (e) => {
    if (currentSrc === fallback) return;
    setCurrentSrc(fallback);
    // avoid infinite error loop
    e?.target?.removeAttribute('onerror');
  };

  // Add cache-busting timestamp to ensure updated images after upload/update
  // encode spaces and ensure the URL is safe for public filenames with spaces
  const safeSrc = currentSrc ? encodeURI(currentSrc) : currentSrc;
  const srcWithT = safeSrc && safeSrc.indexOf('?') === -1 ? `${safeSrc}` : safeSrc;

  return (
    <img
      src={srcWithT}
      alt={alt || 'asset'}
      loading="lazy"
      onError={handleError}
      onClick={onClick}
      className={className}
      style={style}
      {...imgProps}
    />
  );
}
