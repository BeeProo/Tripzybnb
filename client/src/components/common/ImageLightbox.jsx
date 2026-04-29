import { useState, useEffect, useCallback } from 'react';

export default function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {images.length > 1 && (
          <button className="lightbox-nav lightbox-prev" onClick={prev} aria-label="Previous">
            ‹
          </button>
        )}

        <div className="lightbox-image-wrapper">
          <img
            src={images[current]}
            alt={`Image ${current + 1} of ${images.length}`}
            className="lightbox-image"
          />
        </div>

        {images.length > 1 && (
          <button className="lightbox-nav lightbox-next" onClick={next} aria-label="Next">
            ›
          </button>
        )}

        {images.length > 1 && (
          <div className="lightbox-counter">
            {current + 1} / {images.length}
          </div>
        )}

        {images.length > 1 && (
          <div className="lightbox-thumbs">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className={`lightbox-thumb ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
