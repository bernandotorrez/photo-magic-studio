import { useState, useRef, MouseEvent } from 'react';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  magnifierSize?: number;
  zoomLevel?: number;
  className?: string;
}

export function ImageMagnifier({
  src,
  alt,
  magnifierSize = 150,
  zoomLevel = 2.5,
  className = '',
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current.getBoundingClientRect();
      setImgSize({ width, height });
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;

    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Check if cursor is within image bounds
    if (x >= 0 && x <= width && y >= 0 && y <= height) {
      setShowMagnifier(true);
      setMagnifierPosition({ x, y });
    } else {
      setShowMagnifier(false);
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="rounded-lg w-auto h-auto object-contain"
        style={{ maxHeight: '70vh', maxWidth: '100%' }}
      />

      {showMagnifier && (
        <div
          className="absolute border-2 border-white shadow-2xl rounded-full pointer-events-none z-50"
          style={{
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            left: `${magnifierPosition.x - magnifierSize / 2}px`,
            top: `${magnifierPosition.y - magnifierSize / 2}px`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${imgSize.width * zoomLevel}px ${imgSize.height * zoomLevel}px`,
            backgroundPosition: `-${magnifierPosition.x * zoomLevel - magnifierSize / 2}px -${magnifierPosition.y * zoomLevel - magnifierSize / 2}px`,
          }}
        />
      )}
    </div>
  );
}
