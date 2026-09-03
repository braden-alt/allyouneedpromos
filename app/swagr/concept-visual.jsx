const toneMap = {
  apparel: ['#6C47FF', '#C7B9FF'],
  headwear: ['#F5C842', '#FFEAA1'],
  drinkware: ['#2DD4BF', '#99F6E4'],
  bags: ['#FB7185', '#FECDD3'],
  writing: ['#60A5FA', '#BFDBFE'],
  default: ['#A78BFA', '#DDD6FE'],
};

function visualType(category = '') {
  const value = category.toLowerCase();
  if (value.includes('outerwear') || value.includes('knit') || value.includes('apparel')) return 'apparel';
  if (value.includes('headwear')) return 'headwear';
  if (value.includes('drinkware')) return 'drinkware';
  if (value.includes('bag') || value.includes('tote')) return 'bags';
  if (value.includes('writing')) return 'writing';
  return 'default';
}

function Apparel({ stroke }) {
  return <path d="M67 42 91 29l22 17 22-17 24 13-12 25-15-8v60H94V59l-15 8-12-25Z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />;
}

function Headwear({ stroke }) {
  return (
    <>
      <path d="M70 91c3-35 23-52 52-52 29 0 48 16 51 45-19-8-42-10-67-5-15 3-27 7-36 12Z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
      <path d="M71 91c31-9 65-8 102 3 18 6 28 12 29 20-30-7-60-9-90-6-19 2-33-4-41-17Z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
    </>
  );
}

function Drinkware({ stroke }) {
  return (
    <>
      <path d="M91 36h68l-8 84c-2 15-12 23-26 23s-24-8-26-23L91 36Z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
      <path d="M88 36h74M105 69h40" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function Bag({ stroke }) {
  return (
    <>
      <path d="M73 66h104l-9 79H82l-9-79Z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
      <path d="M99 70c1-26 12-38 26-38s25 12 26 38" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function Writing({ stroke }) {
  return (
    <>
      <path d="m85 130 68-82 16 13-68 82-24 8 8-21Z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
      <path d="m147 55 16 13M84 130l17 13" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

function DefaultShape({ stroke }) {
  return <path d="M125 34 174 62v56l-49 28-49-28V62l49-28Z" fill="none" stroke={stroke} strokeWidth="6" strokeLinejoin="round" />;
}

export default function ConceptVisual({ concept, compact = false, brandAsset = '', brandName = 'YOUR MARK' }) {
  const type = visualType(concept?.category);
  const [accent, light] = toneMap[type] || toneMap.default;
  const gradientId = `swagr-${type}-${(concept?.id || 'concept').replace(/[^a-zA-Z0-9]/g, '')}`;
  const Shape = type === 'apparel'
    ? Apparel
    : type === 'headwear'
      ? Headwear
      : type === 'drinkware'
        ? Drinkware
        : type === 'bags'
          ? Bag
          : type === 'writing'
            ? Writing
            : DefaultShape;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${compact ? 'min-h-[150px]' : 'min-h-[210px]'}`}
      style={{
        borderColor: `${accent}55`,
        background: `radial-gradient(circle at 78% 18%, ${accent}28, transparent 34%), linear-gradient(145deg, #181126 0%, #0F0A17 72%)`,
      }}
      aria-label={`${concept?.name || 'Product'} concept illustration`}
    >
      <div className="absolute left-4 top-4 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: light, borderColor: `${accent}55`, background: `${accent}12` }}>
        Concept direction
      </div>
      <svg viewBox="0 0 250 180" className={`mx-auto block w-full ${compact ? 'h-[150px]' : 'h-[210px]'}`} role="img" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={accent} />
          </linearGradient>
        </defs>
        <g opacity="0.96">
          <Shape stroke={`url(#${gradientId})`} />
        </g>
        <rect x="98" y="75" width="54" height="28" rx="7" fill="#140F1E" stroke={light} strokeWidth="2" strokeDasharray={brandAsset ? undefined : '4 4'} />
        {brandAsset ? (
          <image href={brandAsset} x="102" y="78" width="46" height="22" preserveAspectRatio="xMidYMid meet" />
        ) : (
          <text x="125" y="92" fill={light} fontSize="7" fontWeight="700" textAnchor="middle" letterSpacing="1">{brandName.slice(0, 14).toUpperCase()}</text>
        )}
      </svg>
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-3 text-[10px]">
        <span className="font-semibold" style={{ color: light }}>{concept?.category || 'Promo concept'}</span>
        <span style={{ color: '#8F859A' }}>Not a production proof</span>
      </div>
    </div>
  );
}
