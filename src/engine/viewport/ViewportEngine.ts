/**
 * ViewportEngine.ts
 * 
 * TradingView-grade Infinite 2D Viewport Engine
 * 
 * Guarantees:
 * 1. Constant world point under cursor during zoom (zero drift / jump)
 * 2. Mathematical symmetry between screenToWorld and worldToScreen
 * 3. Mobile two-finger pinch with anchored midpoint
 * 4. Decoupled transient transform pipeline (60/120fps zero React re-render)
 */

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

export interface Point {
  x: number;
  y: number;
}

export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 3.0;

/**
 * Transforms screen-space coordinates (e.g. mouse client relative to container) to world-space coordinates.
 */
export function screenToWorld(screenPoint: Point, viewport: Viewport): Point {
  return {
    x: (screenPoint.x - viewport.panX) / viewport.zoom,
    y: (screenPoint.y - viewport.panY) / viewport.zoom
  };
}

/**
 * Transforms world-space coordinates to screen-space coordinates.
 */
export function worldToScreen(worldPoint: Point, viewport: Viewport): Point {
  return {
    x: worldPoint.x * viewport.zoom + viewport.panX,
    y: worldPoint.y * viewport.zoom + viewport.panY
  };
}

/**
 * Calculates new pan and zoom such that the world point currently under cursorScreenPoint
 * remains at EXACTLY the same cursorScreenPoint after zooming.
 * 
 * worldPointUnderCursor = constant
 */
export function zoomAtPoint(
  cursorScreenPoint: Point,
  targetZoom: number,
  currentViewport: Viewport,
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM
): Viewport {
  const clampedZoom = Math.min(Math.max(Number(targetZoom.toFixed(4)), minZoom), maxZoom);
  
  // 1. Identify the world point under the cursor before zoom
  const worldPoint = screenToWorld(cursorScreenPoint, currentViewport);

  // 2. Derive new pan so worldPoint projects to the exact same screen position:
  //    cursorScreenPoint.x = worldPoint.x * clampedZoom + newPanX
  // => newPanX = cursorScreenPoint.x - worldPoint.x * clampedZoom
  const newPanX = cursorScreenPoint.x - worldPoint.x * clampedZoom;
  const newPanY = cursorScreenPoint.y - worldPoint.y * clampedZoom;

  return {
    panX: newPanX,
    panY: newPanY,
    zoom: clampedZoom
  };
}

/**
 * Offsets the viewport by screen delta (dx, dy).
 */
export function panBy(
  delta: { dx: number; dy: number },
  currentViewport: Viewport
): Viewport {
  return {
    panX: currentViewport.panX + delta.dx,
    panY: currentViewport.panY + delta.dy,
    zoom: currentViewport.zoom
  };
}

/**
 * Calculates pinch-zoom transformation around the touch midpoint.
 * Keeps the initial world midpoint anchored directly under the fingers' current midpoint.
 */
export function calculatePinch(
  touch1: Point,
  touch2: Point,
  initialDistance: number,
  worldMidpoint: Point,
  startZoom: number,
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM
): Viewport {
  if (initialDistance <= 0) {
    return { panX: 0, panY: 0, zoom: startZoom };
  }

  // Current midpoint and distance
  const currentMidpoint: Point = {
    x: (touch1.x + touch2.x) / 2,
    y: (touch1.y + touch2.y) / 2
  };
  const currentDistance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y);

  // Zoom scale factor
  const scale = currentDistance / initialDistance;
  const newZoom = Math.min(Math.max(Number((startZoom * scale).toFixed(4)), minZoom), maxZoom);

  // Anchor world midpoint to current touch midpoint
  const newPanX = currentMidpoint.x - worldMidpoint.x * newZoom;
  const newPanY = currentMidpoint.y - worldMidpoint.y * newZoom;

  return {
    panX: newPanX,
    panY: newPanY,
    zoom: newZoom
  };
}
