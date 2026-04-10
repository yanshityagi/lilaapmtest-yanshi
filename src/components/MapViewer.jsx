import React, { useEffect, useRef, useState } from 'react';
import { worldToImageCoord, inferBounds } from '../utils/coordUtils';
import '../styles/mapViewer.css';

/**
 * MapViewer
 * Props:
 * - mapSrc: image source URL (string)
 * - points: [{ x, y, type }] (world coordinates)
 * - bounds: optional { minX, maxX, minY, maxY } - if omitted will be inferred from points
 * - invertY: boolean (default false) - do NOT flip by default
 *
 * Renders an <img> and overlays points absolutely positioned.
 * Keeps overlay in sync on resize using ResizeObserver.
 */
export default function MapViewer({ mapSrc, points = [], bounds = null, invertY = false }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const effectiveBounds = bounds || inferBounds(points);

  // Compute displayed image size (clientWidth/clientHeight)
  useEffect(() => {
    const imgEl = imgRef.current;
    const container = containerRef.current;
    if (!imgEl || !container) return;

    // ResizeObserver to react to layout/img size changes
    const ro = new ResizeObserver(() => {
      // Use the image's client size (rendered size)
      const width = imgEl.clientWidth;
      const height = imgEl.clientHeight;
      setImgSize({ width, height });
    });

    ro.observe(imgEl);
    ro.observe(container);

    // also set initial size after load
    function onLoad() {
      setImgSize({ width: imgEl.clientWidth, height: imgEl.clientHeight });
    }
    imgEl.addEventListener('load', onLoad);
    onLoad();

    return () => {
      ro.disconnect();
      imgEl.removeEventListener('load', onLoad);
    };
  }, [mapSrc]);

  // Render overlay points mapped to pixel positions
  const mappedPoints = points.map((pt) => {
    const { x, y } = worldToImageCoord(pt, effectiveBounds, imgSize.width || 1, imgSize.height || 1, invertY);
    return { ...pt, px: x, py: y };
  });

  return (
    <div className="map-viewer-container" ref={containerRef}>
      <img
        ref={imgRef}
        src={mapSrc}
        alt="minimap"
        className="map-image"
        draggable={false}
        style={{ display: 'block', maxWidth: '100%', height: 'auto', width: '100%' }}
      />

      {/* overlay layer - absolute within container */}
      <div className="map-overlay" aria-hidden="false">
        {mappedPoints.map((p, i) => {
          const color = p.type === 'bot' ? '#f97316' : '#16a34a'; // bot: orange, human: green
          const size = 10; // px diameter
          const left = `${p.px - size / 2}px`;
          const top = `${p.py - size / 2}px`;
          return (
            <div
              key={`${p.x}-${p.y}-${i}`}
              className="map-point"
              title={`${p.type} (${p.x.toFixed ? p.x.toFixed(1) : p.x}, ${p.y.toFixed ? p.y.toFixed(1) : p.y})`}
              style={{
                left,
                top,
                width: size,
                height: size,
                background: color,
                borderRadius: p.type === 'bot' ? 2 : '50%', // bots as small squares, humans as circles
                border: '2px solid rgba(248,250,252,0.95)', // subtle white stroke for contrast
                boxShadow: '0 1px 3px rgba(2,6,23,0.15)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}