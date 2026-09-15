import React from "react";

interface KanLogoKProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Ultra-quality vector SVG logo for the custom stylized "K" glyph.
 * Infinitely scalable with mathematically exact geometric bezier coordinates.
 * Cap-height matches Gotham Bold 700/1000 units (0.70em) and rests on the typography baseline.
 */
export function KanLogoK({ className, style }: KanLogoKProps) {
  return (
    <svg
      viewBox="0 0 636 636"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className || "h-[0.70em] w-auto inline-block align-baseline"}
      style={{
        display: "inline-block",
        verticalAlign: "baseline",
        shapeRendering: "geometricPrecision",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        willChange: "transform, height, width",
        ...style,
      }}
      aria-label="K"
      role="img"
    >
      {/* Left vertical stem with subtle rounded corners */}
      <rect
        x="0"
        y="0"
        width="166"
        height="636"
        rx="16"
        ry="16"
        fill="currentColor"
      />

      {/* Upper diagonal arm with inner acute wedge cut */}
      <path
        d="M 426 0 L 636 0 L 370 284 L 166 336 L 206 240 Z"
        fill="currentColor"
      />

      {/* Lower diagonal arm */}
      <path
        d="M 166 336 L 370 336 L 636 636 L 438 636 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface KanHeroWordmarkProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Mathematically unified master vector wordmark for KAN.
 * Integrates the custom stylized 'K' glyph and the exact Gotham Bold vector paths
 * for 'A' and 'N' within a single SVG viewport (viewBox="0 -5 2316 705").
 *
 * Solves the root cause of layout jitter and vibration during resize/maximize/restore down:
 * 1. Eliminates flexbox baseline conflict between SVG and text span elements.
 * 2. Eliminates font hinting quantization jumps on subpixel font sizes.
 * 3. Binds K, A, and N into a locked coordinate system with zero relative movement.
 * 4. Enables pure GPU-accelerated scaling with flawless subpixel interpolation.
 */
export function KanHeroWordmark({ className = "", style }: KanHeroWordmarkProps) {
  return (
    <svg
      viewBox="0 -5 2316 705"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        shapeRendering: "geometricPrecision",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        willChange: "transform, width, height",
        contain: "paint layout",
        ...style,
      }}
      aria-label="KAN"
      role="img"
    >
      {/* K Glyph (scaled to 700 units cap-height, resting on baseline y=700) */}
      <g transform="scale(1.10062893081761)">
        <rect x="0" y="0" width="166" height="636" rx="16" ry="16" fill="currentColor" />
        <path d="M 426 0 L 636 0 L 370 284 L 166 336 L 206 240 Z" fill="currentColor" />
        <path d="M 166 336 L 370 336 L 636 636 L 438 636 Z" fill="currentColor" />
      </g>
      {/* 'A' Glyph from Gotham Bold (baseline at y=700, apex at y=-5) */}
      <path
        d="M1365 700L1526 700L1226-5L1084-5L784 700L941 700L1005 543L1301 543M1153 180L1246 407L1060 407"
        fill="currentColor"
      />
      {/* 'N' Glyph from Gotham Bold (baseline at y=700, cap at y=0) */}
      <path
        d="M2185 700L2316 700L2316 0L2164 0L2164 431L1836 0L1694 0L1694 700L1846 700L1846 255"
        fill="currentColor"
      />
    </svg>
  );
}

export interface KanWordmarkProps {
  className?: string;
  logoClassName?: string;
  style?: React.CSSProperties;
}

/**
 * Standard KAN wordmark using the unified master vector wordmark
 * to maintain consistent typography and eliminate jitter everywhere.
 */
export function KanWordmark({ className = "", style }: KanWordmarkProps) {
  return (
    <span
      className={`inline-flex items-center justify-center select-none text-[#F1F2F2] ${className}`}
      style={style}
    >
      <KanHeroWordmark className="h-[0.70em] w-auto inline-block align-middle" />
    </span>
  );
}

export default KanLogoK;

