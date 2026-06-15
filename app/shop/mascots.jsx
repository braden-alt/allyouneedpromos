'use client';

/* ============================================================
   SWAGR mascot squad — pure SVG so they animate crisply and
   ship with zero image assets. Each character shares a face,
   crown, gloves and sneakers; the body is product-specific.
   ============================================================ */

const SKIN = '#1A1326';
const GLOVE = '#FFFFFF';
const GOLD = '#F5C842';
const PURPLE = '#6C47FF';
const PURPLE_DK = '#4C2FB5';

function Crown({ x = 80, y = 14 }) {
  return (
    <g transform={`translate(${x - 18} ${y})`}>
      <path
        d="M0 14 L0 4 L6 9 L12 0 L18 9 L24 0 L30 9 L36 4 L36 14 Z"
        fill={GOLD}
        stroke="#C99A22"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="6" r="1.6" fill="#fff" opacity="0.8" />
      <circle cx="30" cy="6" r="1.6" fill="#fff" opacity="0.8" />
    </g>
  );
}

function Face({ cx = 80, cy = 90, scale = 1 }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {/* eye whites */}
      <ellipse className="swagr-eye" cx="-16" cy="0" rx="12" ry="13" fill="#fff" stroke="#2a2238" strokeWidth="1.5" />
      <ellipse className="swagr-eye" cx="16" cy="0" rx="12" ry="13" fill="#fff" stroke="#2a2238" strokeWidth="1.5" />
      {/* pupils */}
      <circle cx="-13" cy="2" r="5.5" fill={SKIN} />
      <circle cx="19" cy="2" r="5.5" fill={SKIN} />
      <circle cx="-11" cy="0" r="1.8" fill="#fff" />
      <circle cx="21" cy="0" r="1.8" fill="#fff" />
      {/* smile */}
      <path d="M-15 16 Q0 30 15 16 Q0 24 -15 16 Z" fill="#C0392B" stroke="#7a2018" strokeWidth="1" />
      <path d="M-15 16 Q0 22 15 16" fill="#fff" opacity="0.9" />
    </g>
  );
}

function Limbs({ bodyBottom = 168, leftX = 52, rightX = 108 }) {
  return (
    <g>
      {/* legs */}
      <rect x={leftX} y={bodyBottom} width="9" height="22" rx="4" fill={SKIN} />
      <rect x={rightX - 9} y={bodyBottom} width="9" height="22" rx="4" fill={SKIN} />
      {/* sneakers */}
      <g>
        <path d={`M${leftX - 6} ${bodyBottom + 18} h20 a5 5 0 0 1 5 5 v3 h-25 Z`} fill="#EDE6D2" stroke="#B9A97F" strokeWidth="1" />
        <rect x={leftX - 6} y={bodyBottom + 26} width="25" height="3" rx="1.5" fill={PURPLE} />
        <path d={`M${rightX - 19} ${bodyBottom + 18} h20 a5 5 0 0 1 5 5 v3 h-25 Z`} fill="#EDE6D2" stroke="#B9A97F" strokeWidth="1" />
        <rect x={rightX - 19} y={bodyBottom + 26} width="25" height="3" rx="1.5" fill={PURPLE} />
      </g>
    </g>
  );
}

function Arms({ bodyTop = 110, leftX = 44, rightX = 116, wave = true }) {
  return (
    <g>
      {/* left arm, relaxed */}
      <path d={`M${leftX} ${bodyTop} q-16 6 -18 26`} stroke={SKIN} strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx={leftX - 18} cy={bodyTop + 26} r="7" fill={GLOVE} stroke="#cfcfcf" strokeWidth="1" />
      {/* right arm, thumbs up + wave */}
      <g className={wave ? 'swagr-wave' : ''} style={{ transformOrigin: `${rightX}px ${bodyTop}px` }}>
        <path d={`M${rightX} ${bodyTop} q18 -2 24 -20`} stroke={SKIN} strokeWidth="7" fill="none" strokeLinecap="round" />
        <g transform={`translate(${rightX + 24} ${bodyTop - 22})`}>
          <circle r="7.5" fill={GLOVE} stroke="#cfcfcf" strokeWidth="1" />
          <rect x="-2" y="-12" width="4" height="8" rx="2" fill={GLOVE} stroke="#cfcfcf" strokeWidth="1" />
        </g>
      </g>
    </g>
  );
}

function Wordmark({ y, fill = PURPLE, size = 22 }) {
  return (
    <text
      x="80"
      y={y}
      textAnchor="middle"
      fontFamily="Fraunces, Georgia, serif"
      fontWeight="900"
      fontSize={size}
      fill={fill}
      style={{ letterSpacing: '0.5px' }}
    >
      SWAGR
    </text>
  );
}

const wrap = { width: '100%', height: '100%', overflow: 'visible' };

/* ---------- KRUZ · the koozie ---------- */
export function Kruz() {
  return (
    <svg viewBox="0 0 160 220" style={wrap} role="img" aria-label="Kruz the koozie mascot">
      <Limbs bodyBottom={166} />
      <Arms bodyTop={108} />
      <rect x="46" y="48" width="68" height="120" rx="14" fill="#D9CDB0" stroke="#B9A97F" strokeWidth="2.5" />
      <rect x="50" y="52" width="60" height="112" rx="11" fill="#E4DAC2" />
      <Crown x={80} y={26} />
      <Face cx={80} cy={84} scale={0.92} />
      <Wordmark y={140} />
      {/* side streetwear tag */}
      <rect x="104" y="120" width="18" height="26" rx="3" fill={PURPLE} transform="rotate(8 113 133)" />
      <text x="113" y="137" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="7" fill="#fff" transform="rotate(8 113 133)">SWAGR</text>
    </svg>
  );
}

/* ---------- CAPPY · the dad hat ---------- */
export function Cappy() {
  return (
    <svg viewBox="0 0 160 220" style={wrap} role="img" aria-label="Cappy the dad hat mascot">
      <Limbs bodyBottom={150} />
      <Arms bodyTop={96} />
      {/* cap crown */}
      <path d="M40 96 Q40 44 80 44 Q120 44 120 96 Z" fill="#D9CDB0" stroke="#B9A97F" strokeWidth="2.5" />
      {/* panels */}
      <path d="M80 44 L80 96" stroke="#B9A97F" strokeWidth="1.2" opacity="0.6" />
      <path d="M80 44 Q56 50 52 96" stroke="#B9A97F" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M80 44 Q104 50 108 96" stroke="#B9A97F" strokeWidth="1.2" fill="none" opacity="0.5" />
      {/* brim */}
      <path d="M34 96 Q80 86 126 96 Q126 108 80 110 Q34 108 34 96 Z" fill="#CFC3A4" stroke="#B9A97F" strokeWidth="2" />
      <circle cx="80" cy="48" r="3" fill="#B9A97F" />
      <Crown x={80} y={26} />
      <Face cx={80} cy={74} scale={0.78} />
      <text x="80" y="92" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="13" fill={PURPLE}>SWAGR</text>
    </svg>
  );
}

/* ---------- TEE · the t-shirt ---------- */
export function Tee() {
  return (
    <svg viewBox="0 0 160 220" style={wrap} role="img" aria-label="Tee the t-shirt mascot">
      <Limbs bodyBottom={164} leftX={56} rightX={104} />
      {/* shirt body */}
      <path
        d="M52 70 L36 86 L26 74 L40 56 Q56 44 80 44 Q104 44 120 56 L134 74 L124 86 L108 70 L108 166 L52 166 Z"
        fill="#F7F5EF"
        stroke="#C9C3B2"
        strokeWidth="2.5"
      />
      {/* collar */}
      <path d="M66 48 Q80 62 94 48 Q80 56 66 48 Z" fill={PURPLE} />
      {/* paint splatter */}
      <circle cx="62" cy="120" r="4" fill={PURPLE} opacity="0.85" />
      <circle cx="98" cy="108" r="3" fill={GOLD} />
      <circle cx="92" cy="140" r="5" fill={PURPLE} opacity="0.7" />
      <circle cx="70" cy="150" r="2.5" fill={GOLD} />
      <path d="M58 132 q8 -6 16 0" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Crown x={80} y={20} />
      <Face cx={80} cy={62} scale={0.62} />
      <text x="80" y="112" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="17" fill={PURPLE} transform="rotate(-4 80 112)">SWAGR</text>
      {/* hem label */}
      <rect x="96" y="156" width="14" height="9" rx="2" fill={PURPLE} />
    </svg>
  );
}

/* ---------- STEELE · the stainless steel cup ---------- */
export function Steele() {
  return (
    <svg viewBox="0 0 160 220" style={wrap} role="img" aria-label="Steele the stainless steel tumbler mascot">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#A7AEB8" />
          <stop offset="22%" stopColor="#EDF1F5" />
          <stop offset="48%" stopColor="#C2C9D2" />
          <stop offset="74%" stopColor="#9AA2AD" />
          <stop offset="100%" stopColor="#BCC3CC" />
        </linearGradient>
      </defs>
      <Limbs bodyBottom={166} leftX={54} rightX={106} />
      <Arms bodyTop={110} leftX={48} rightX={112} />
      {/* tumbler body — slight taper */}
      <path d="M50 52 L110 52 L104 168 L56 168 Z" fill="url(#steel)" stroke="#8A929C" strokeWidth="2.5" />
      {/* lid */}
      <rect x="46" y="40" width="68" height="14" rx="5" fill="#2C2438" stroke="#1A1326" strokeWidth="1.5" />
      <rect x="64" y="32" width="32" height="10" rx="4" fill="#3A3050" />
      {/* purple band */}
      <rect x="51" y="92" width="58" height="22" fill={PURPLE} opacity="0.92" />
      <rect x="51" y="92" width="58" height="3" fill={PURPLE_DK} />
      <Crown x={80} y={20} />
      <Face cx={80} cy={74} scale={0.7} />
      <text x="80" y="109" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="13" fill="#fff">SWAGR</text>
      {/* metallic highlight */}
      <rect x="60" y="56" width="5" height="106" rx="2.5" fill="#fff" opacity="0.55" />
    </svg>
  );
}

export const MASCOTS = { Kruz, Cappy, Tee, Steele };
