// Coordinate mapping utilities
// Converts world coordinates to image pixel coordinates.
// - world: { x, y }
// - bounds: { minX, maxX, minY, maxY }  (world coordinate bounds)
// - imgWidth, imgHeight: displayed image size in pixels
// - invertY: if true flips Y (use only if your game's Y origin is bottom-left)
export function worldToImageCoord(world, bounds, imgWidth, imgHeight, invertY = false) {
    const { x, y } = world;
    const { minX, maxX, minY, maxY } = bounds;
  
    const width = maxX - minX || 1; // prevent div by 0
    const height = maxY - minY || 1;
  
    const nx = (x - minX) / width; // 0..1
    const ny = (y - minY) / height; // 0..1
  
    // Do NOT flip vertically by default (invertY=false)
    const finalY = invertY ? 1 - ny : ny;
  
    return {
      x: nx * imgWidth,
      y: finalY * imgHeight,
    };
  }
  
  // Infer bounds from a set of points for a particular map
  export function inferBounds(points = [], paddingRatio = 0.02) {
    if (!points || points.length === 0) {
      return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }
  
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
  
    points.forEach((p) => {
      if (typeof p.x === 'number') {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
      }
      if (typeof p.y === 'number') {
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
    });
  
    // Fallback if degenerate
    if (!isFinite(minX) || !isFinite(minY)) {
      return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }
  
    // add small padding so points don't sit at image edge
    const padX = (maxX - minX) * paddingRatio || 1;
    const padY = (maxY - minY) * paddingRatio || 1;
  
    return {
      minX: minX - padX,
      maxX: maxX + padX,
      minY: minY - padY,
      maxY: maxY + padY,
    };
  }