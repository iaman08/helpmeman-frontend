"use client";

interface GoldenVerifiedBadgeProps {
  className?: string;
  size?: number;
}

/**
 * GoldenVerifiedBadge
 * Matches the official sharp spiky star verified badge from the reference image:
 * A crisp multi-point starburst in metallic gold with a bold black checkmark inside.
 * NOT a circle.
 */
export function GoldenVerifiedBadge({
  className = "h-4 w-4",
  size = 18,
}: GoldenVerifiedBadgeProps) {
  return (
    <span
      className="inline-flex items-center shrink-0 select-none align-middle"
      title="Verified Official"
      aria-label="Verified Official"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={`${className} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="goldStarGrad"
            x1="2"
            y1="2"
            x2="22"
            y2="22"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Top highlight sheen */}
          <linearGradient
            id="goldStarSheen"
            x1="12"
            y1="2"
            x2="12"
            y2="14"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Sharp Multi-point Starburst Seal (Not a circle) */}
        <polygon
          points="12,1.5 14.63,3.92 18.17,3.51 18.88,7.00 21.99,8.76 20.50,12.00 21.99,15.24 18.88,17.00 18.17,20.49 14.63,20.08 12,22.50 9.37,20.08 5.83,20.49 5.12,17.00 2.01,15.24 3.50,12.00 2.01,8.76 5.12,7.00 5.83,3.51 9.37,3.92"
          fill="url(#goldStarGrad)"
          stroke="#92400E"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />

        {/* Subtle Sheen Layer */}
        <polygon
          points="12,1.5 14.63,3.92 18.17,3.51 18.88,7.00 21.99,8.76 20.50,12.00 21.99,15.24 18.88,17.00 18.17,20.49 14.63,20.08 12,22.50 9.37,20.08 5.83,20.49 5.12,17.00 2.01,15.24 3.50,12.00 2.01,8.76 5.12,7.00 5.83,3.51 9.37,3.92"
          fill="url(#goldStarSheen)"
        />

        {/* Bold Black Checkmark (Matching Image) */}
        <path
          d="M 8.2 12.2 L 10.8 14.8 L 15.8 9.2"
          stroke="#000000"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
