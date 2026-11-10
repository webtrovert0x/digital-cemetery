"use client";

interface TombstoneArtProps {
  isDugUp: boolean;
  graveId?: string;
}

export function TombstoneArt({ isDugUp, graveId }: TombstoneArtProps) {
  if (isDugUp) {
    return (
      <svg
        viewBox="0 0 180 118"
        className="h-28 w-full select-none"
        fill="none"
        aria-hidden="true"
      >
        {/* Spectral rising aura */}
        <ellipse cx="90" cy="60" rx="54" ry="34" fill="#a855f7" fillOpacity="0.12" />
        {/* Tilted & cracked headstone */}
        <g transform="rotate(-7 90 88)">
          <path
            d="M52 94V44C52 24.118 69.013 8 90 8C110.987 8 128 24.118 128 44V94H52Z"
            fill="#1f1b2e"
            stroke="#c084fc"
            strokeOpacity="0.6"
            strokeWidth="2"
          />
          {/* Crack */}
          <path
            d="M94 10L87 28L95 40L85 57L91 72"
            stroke="#a855f7"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="90"
            y="38"
            textAnchor="middle"
            fill="#d8b4fe"
            fontSize="11"
            fontWeight="700"
            letterSpacing="2"
          >
            DUG UP
          </text>
          {graveId && (
            <text
              x="90"
              y="55"
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="9"
              fontFamily="monospace"
            >
              #{graveId}
            </text>
          )}
        </g>

        {/* Excavated dirt mounds */}
        <path
          d="M20 104C35 89 58 92 72 104H20Z"
          fill="#2d233a"
          stroke="#7e22ce"
          strokeOpacity="0.4"
        />
        <path
          d="M108 104C122 90 146 89 162 104H108Z"
          fill="#2d233a"
          stroke="#7e22ce"
          strokeOpacity="0.4"
        />
        <rect x="14" y="102" width="152" height="8" rx="4" fill="#181224" />
        {/* Rising spirit sparks */}
        <circle cx="62" cy="24" r="2.2" fill="#e9d5ff" fillOpacity="0.8" />
        <circle cx="122" cy="20" r="1.8" fill="#7dd3fc" fillOpacity="0.7" />
        <circle cx="90" cy="4" r="1.6" fill="#c084fc" fillOpacity="0.9" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 180 118"
      className="h-28 w-full select-none"
      fill="none"
      aria-hidden="true"
    >
      {/* Moonlight halo */}
      <ellipse cx="90" cy="56" rx="52" ry="34" fill="#7dd3fc" fillOpacity="0.09" />
      {/* Headstone */}
      <path
        d="M48 98V46C48 25.013 66.804 8 90 8C113.196 8 132 25.013 132 46V98H48Z"
        fill="#1c2132"
        stroke="#7dd3fc"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      <path
        d="M55 95V47C55 29.327 70.67 15 90 15C109.33 15 125 29.327 125 47V95"
        stroke="#334155"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      {/* Carved Cross / Pixel Glyph */}
      <path
        d="M84 31H96M90 24V42"
        stroke="#7dd3fc"
        strokeOpacity="0.85"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <text
        x="90"
        y="60"
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize="12"
        fontWeight="700"
        letterSpacing="3"
      >
        R.I.P.
      </text>
      {graveId && (
        <text
          x="90"
          y="76"
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9.5"
          fontFamily="monospace"
        >
          GRAVE #{graveId}
        </text>
      )}
      {/* Mossy Stone Base */}
      <rect
        x="36"
        y="94"
        width="108"
        height="10"
        rx="3"
        fill="#242b3d"
        stroke="#475569"
        strokeWidth="1.2"
      />
      {/* Grass / Moss blades */}
      <path
        d="M28 104C38 96 46 98 54 104M126 104C134 97 142 97 152 104"
        stroke="#4ade80"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="16" y="103" width="148" height="6" rx="3" fill="#121c1b" />
    </svg>
  );
}

