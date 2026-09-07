'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Gift, Wand2, ImageIcon, Truck, Check, ArrowRight,
  Cog, Printer, Palette, PackageCheck, Crown, ShieldCheck, Clock, Zap,
} from 'lucide-react';
import { Kruz, Cappy, Tee, Steele } from './mascots';

/* ------------------------------------------------------------------ */
/*  Brand palette — "royal swag": deep aubergine, royal purple, gold,  */
/*  khaki/cream. Tuned to the mascot art.                              */
/* ------------------------------------------------------------------ */
const C = {
  bg: '#140F1E',
  bg2: '#1B1530',
  purple: '#6C47FF',
  purpleLt: '#9B7DFF',
  gold: '#F5C842',
  cream: '#E8DFC8',
  khaki: '#D9CDB0',
  green: '#34D399',
};

/* ------------------------------------------------------------------ */
/*  Governed storefront planning model                                 */
/* ------------------------------------------------------------------ */
const TIERS = [
  { min: 500,   name: 'Koozie Drop',        gift: 'Koozie bundle concept',           value: 'Illustrative tier', mascot: Kruz },
  { min: 1000,  name: 'Cap Club',           gift: 'Embroidered-cap bundle concept',  value: 'Illustrative tier', mascot: Cappy },
  { min: 2500,  name: 'Steel Status',       gift: 'Drinkware bundle concept',        value: 'Illustrative tier', mascot: Steele },
  { min: 5000,  name: 'Tee Royalty',        gift: 'Premium-tee bundle concept',      value: 'Illustrative tier', mascot: Tee },
  { min: 7500,  name: 'Full Squad Kit',     gift: 'Multi-product kit concept',       value: 'Illustrative tier', mascot: Kruz },
  { min: 10000, name: 'Executive Crown',    gift: 'Executive merch-program concept', value: 'Illustrative tier', mascot: Steele },
];

const STOREFRONT_TRUTH = {
  status: 'PREVIEW / VALIDATION REQUIRED',
  headline: 'Explore the experience without mistaking planning data for a live offer.',
  detail: 'Gift thresholds, pricing, MOQs, supplier identity, inventory, lead times, decoration, setup charges, production routing, and timing must be validated for the actual request before they become commercial terms.',
};

const fmt = (n) => '$' + n.toLocaleString('en-US');

/* ------------------------------------------------------------------ */
/*  The AI agent squad — each "works" with its own animation           */
/* ------------------------------------------------------------------ */
const SQUAD = [
  {
    key: 'cappy', Mascot: Cappy, bob: 'swagr-bob-2', accent: C.gold,
    name: 'CAPPY', role: 'Account Manager', icon: Cog, visual: 'office',
    tagline: 'Shows how quote intake and order coordination can be organized.',
    tasks: [
      'Reviewing a sample quote intake...',
      'Previewing an order-calendar workflow...',
      'Checking which dates still need validation...',
      'Mapping a sample reorder handoff...',
    ],
  },
  {
    key: 'tee', Mascot: Tee, bob: 'swagr-bob-3', accent: C.purpleLt,
    name: 'TEE', role: 'Creative & Artwork', icon: Palette, visual: 'art',
    tagline: 'Shows artwork-readiness and controlled virtual-preview workflows.',
    tasks: [
      'Reviewing a sample artwork-readiness case...',
      'Rendering a controlled virtual-preview example...',
      'Flagging color details that need confirmation...',
      'Previewing a multi-product review layout...',
    ],
  },
  {
    key: 'steele', Mascot: Steele, bob: 'swagr-bob-4', accent: '#B8C0CC',
    name: 'STEELE', role: 'Print Production', icon: Printer, visual: 'print',
    tagline: 'Shows how decoration and production-validation lanes can be coordinated.',
    tasks: [
      'Reviewing a sample decoration route...',
      'Checking a sample imprint-readiness lane...',
      'Comparing decoration-method requirements...',
      'Previewing a production-QC checklist...',
    ],
  },
  {
    key: 'kruz', Mascot: Kruz, bob: 'swagr-bob', accent: C.purple,
    name: 'KRUZ', role: 'Fulfillment & Orders', icon: PackageCheck, visual: 'orders',
    tagline: 'Shows fulfillment, kitting, and delivery-planning workflows.',
    tasks: [
      'Previewing a sample kit configuration...',
      'Mapping a sample multi-address shipment...',
      'Checking fulfillment constraints...',
      'Previewing a delivery-status workflow...',
    ],
  },
];

/* small animated "work" panel per agent */
function WorkVisual({ type, accent }) {
  if (type === 'office') {
    return (
      <svg viewBox="0 0 120 48" className="w-full h-12">
        <g transform="translate(28 24)">
          <Gear r={13} className="swagr-gear" fill={accent} />
        </g>
        <g transform="translate(54 16)">
          <Gear r={9} className="swagr-gear-rev" fill={C.gold} />
        </g>
        <g transform="translate(86 28)">
          <Gear r={11} className="swagr-gear" fill={C.purpleLt} />
        </g>
      </svg>
    );
  }
  if (type === 'print') {
    return (
      <svg viewBox="0 0 120 48" className="w-full h-12">
        {/* press head */}
        <g className="swagr-press">
          <rect x="46" y="2" width="28" height="12" rx="2" fill={accent} />
          <rect x="56" y="14" width="8" height="6" fill={accent} />
        </g>
        {/* belt */}
        <rect x="6" y="34" width="108" height="8" rx="2" fill="#2C2438" />
        <rect x="6" y="34" width="108" height="8" rx="2" className="swagr-conveyor" opacity="0.7" />
        {/* items on belt */}
        <rect x="14" y="26" width="12" height="8" rx="1.5" fill={C.cream} />
        <rect x="52" y="24" width="14" height="10" rx="1.5" fill={C.gold} />
        <rect x="92" y="26" width="12" height="8" rx="1.5" fill={C.cream} />
      </svg>
    );
  }
  if (type === 'art') {
    return (
      <svg viewBox="0 0 120 48" className="w-full h-12">
        <rect x="14" y="6" width="92" height="36" rx="4" fill="#0F0B18" stroke={accent} strokeWidth="1.5" />
        <circle cx="34" cy="24" r="6" fill={C.purple} />
        <rect x="48" y="14" width="44" height="5" rx="2.5" fill={accent} opacity="0.8" />
        <rect x="48" y="24" width="34" height="5" rx="2.5" fill={C.gold} opacity="0.7" />
        <rect x="48" y="34" width="26" height="4" rx="2" fill="#3A3050" />
        {/* scanning shimmer */}
        <rect x="14" y="6" width="92" height="36" rx="4" className="swagr-shimmer" />
      </svg>
    );
  }
  // orders
  return (
    <svg viewBox="0 0 120 48" className="w-full h-12">
      <rect x="12" y="20" width="22" height="20" rx="2" fill={C.khaki} stroke="#B9A97F" />
      <rect x="40" y="14" width="22" height="26" rx="2" fill={C.cream} stroke="#B9A97F" />
      <rect x="68" y="22" width="22" height="18" rx="2" fill={C.khaki} stroke="#B9A97F" />
      <circle cx="104" cy="26" r="9" fill="none" stroke={accent} strokeWidth="2" />
      <path d="M100 26 l3 3 l5 -6" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 30 h12 M40 24 h12 M68 30 h12" stroke={accent} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function Gear({ r, className, fill }) {
  const teeth = 8;
  const spokes = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    spokes.push(
      <rect key={i} x={-2} y={-r - 3} width={4} height={5} fill={fill} transform={`rotate(${(a * 180) / Math.PI})`} />
    );
  }
  return (
    <g className={className}>
      {spokes}
      <circle r={r} fill={fill} />
      <circle r={r * 0.4} fill="#140F1E" />
    </g>
  );
}

function AgentCard({ agent }) {
  const [taskIdx, setTaskIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTaskIdx((i) => (i + 1) % agent.tasks.length), 2600);
    return () => clearInterval(id);
  }, [agent.tasks.length]);
  const Icon = agent.icon;

  return (
    <div
      className="relative rounded-2xl p-5 border bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm transition-transform hover:-translate-y-1"
      style={{ borderColor: `${agent.accent}40` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-display text-xl font-black tracking-tight" style={{ color: '#fff' }}>{agent.name}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: agent.accent }}>{agent.role}</div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.12)' }}>
          <span className="w-2 h-2 rounded-full swagr-pulse" style={{ background: C.green }} />
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.green }}>demo</span>
        </div>
      </div>

      {/* mascot */}
      <div className="h-44 flex items-end justify-center">
        <div className={`h-44 w-32 ${agent.bob}`}>
          <agent.Mascot />
        </div>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed mt-1 mb-3 min-h-[2.5rem]">{agent.tagline}</p>

      {/* live work readout */}
      <div className="rounded-lg p-3 border" style={{ background: '#0F0B18', borderColor: '#2A2240' }}>
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-3.5 h-3.5" style={{ color: agent.accent }} />
          <span className="font-mono text-[10px] text-zinc-300 truncate">{agent.tasks[taskIdx]}</span>
        </div>
        <WorkVisual type={agent.visual} accent={agent.accent} />
        {/* indeterminate bar */}
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: '#2A2240' }}>
          <div className="h-full w-1/3 rounded-full swagr-work" style={{ background: agent.accent }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Shop() {
  const [order, setOrder] = useState(2500);
  const [sent, setSent] = useState(false);

  const { current, next, pct } = useMemo(() => {
    const unlocked = TIERS.filter((t) => order >= t.min);
    const current = unlocked[unlocked.length - 1] || null;
    const next = TIERS.find((t) => order < t.min) || null;
    let pct = 100;
    if (next) {
      const floor = current ? current.min : 0;
      pct = Math.min(100, Math.round(((order - floor) / (next.min - floor)) * 100));
    }
    return { current, next, pct };
  }, [order]);

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      {/* ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background:
          'radial-gradient(60% 50% at 80% 0%, rgba(108,71,255,0.22), transparent 70%),' +
          'radial-gradient(50% 40% at 10% 10%, rgba(245,200,66,0.10), transparent 70%)',
      }} />

      {/* ---------------- NAV ---------------- */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ borderColor: '#2A2240', background: 'rgba(20,15,30,0.72)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.gold})` }}>
              <Crown className="w-5 h-5 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl font-black tracking-tight">SWAGR</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-300">
            <a href="#gifts" className="hover:text-white transition-colors">Gift concepts</a>
            <a href="#free" className="hover:text-white transition-colors">Virtual previews</a>
            <a href="#squad" className="hover:text-white transition-colors">Meet the Squad</a>
            <a href="#shop" className="hover:text-white transition-colors">Shop</a>
          </nav>
          <a href="#quote" className="px-4 py-2 rounded-lg text-sm font-semibold transition-transform hover:scale-105" style={{ background: C.gold, color: '#1a1326' }}>
            Build a virtual preview
          </a>
        </div>
      </header>

      <main id="top" className="relative z-10">
        {/* ---------------- HERO ---------------- */}
        <section className="max-w-6xl mx-auto px-5 pt-16 pb-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-5 font-mono text-[11px] uppercase tracking-widest" style={{ borderColor: `${C.gold}55`, color: C.gold }}>
              <Sparkles className="w-3.5 h-3.5" /> Storefront preview / terms validated before quote
            </div>
            <h1 className="font-display font-black leading-[1.02] tracking-tight text-5xl md:text-6xl">
              Promo products with a <span style={{ color: C.gold }}>royal</span> treatment.
            </h1>
            <p className="mt-5 text-lg text-zinc-300 max-w-md leading-relaxed">
              Explore branded-product directions with an AI-assisted workflow for virtual previews, artwork readiness,
              product comparison, and production handoff. This storefront keeps commercial facts visibly
              separate until the actual item and request are validated.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#gifts" className="px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-transform hover:scale-105" style={{ background: C.purple }}>
                Explore gift concepts <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#quote" className="px-5 py-3 rounded-xl font-semibold border transition-colors hover:bg-white/5" style={{ borderColor: '#3A3050' }}>
                Build a virtual preview
              </a>
            </div>
            <div className="mt-7 flex items-center gap-5 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: C.green }} /> Controlled virtual previews</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: C.green }} /> Artwork-readiness guidance</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: C.green }} /> Terms validated before quote</span>
            </div>
          </div>

          {/* hero mascot lineup */}
          <div className="relative flex items-end justify-center gap-1">
            <div className="h-52 w-28 swagr-bob"><Kruz /></div>
            <div className="h-60 w-32 swagr-bob-2 -mb-2"><Cappy /></div>
            <div className="h-56 w-28 swagr-bob-3"><Steele /></div>
            <div className="h-52 w-28 swagr-bob-4"><Tee /></div>
          </div>
        </section>

        {/* ---------------- GOVERNED TRUTH STRIP ---------------- */}
        <section className="max-w-6xl mx-auto px-5 pt-2">
          <div className="rounded-2xl border p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:justify-between" style={{ borderColor: `${C.gold}55`, background: 'rgba(245,200,66,0.08)' }}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.gold }} />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.gold }}>{STOREFRONT_TRUTH.status}</div>
                <div className="font-display text-lg font-bold mt-1">{STOREFRONT_TRUTH.headline}</div>
                <p className="text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">{STOREFRONT_TRUTH.detail}</p>
              </div>
            </div>
            <a href="/swagr/library" className="shrink-0 px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-white/5" style={{ borderColor: '#3A3050' }}>
              Open governed discovery
            </a>
          </div>
        </section>

        {/* ---------------- CAPABILITY PREVIEW ---------------- */}
        <section id="free" className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: ImageIcon, title: 'Controlled virtual previews', desc: 'Compare product directions with governed or clearly synthetic media. Exact production geometry and supplier media stay validation-gated.', accent: C.purpleLt },
              { icon: Wand2, title: 'Artwork readiness', desc: 'Surface source-quality, vector, color, and imprint concerns before production. A production-ready status requires validated artwork.', accent: C.gold },
              { icon: Truck, title: 'Delivery planning', desc: 'Treat inventory, lead time, rush, and ship-date claims as validation lanes until the actual supplier and order are confirmed.', accent: C.green },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl p-6 border" style={{ borderColor: '#2A2240', background: C.bg2 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.accent}22`, border: `1px solid ${f.accent}55` }}>
                    <Icon className="w-5 h-5" style={{ color: f.accent }} />
                  </div>
                  <div className="font-display text-lg font-bold mb-1.5">{f.title}</div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------- GIFT PROGRAM CONCEPT ---------------- */}
        <section id="gifts" className="max-w-6xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: C.gold }}>Gift-program concept</div>
            <h2 className="font-display text-4xl font-black tracking-tight">Explore how a tiered gift experience could feel.</h2>
            <p className="text-zinc-400 mt-3 max-w-xl mx-auto">Move the planning slider to preview the experience. Thresholds, quantities, gift contents, values, credits, and eligibility are illustrative until commercially approved.</p>
          </div>

          {/* interactive calculator */}
          <div className="rounded-2xl p-6 md:p-8 border mb-10" style={{ borderColor: `${C.purple}44`, background: `linear-gradient(135deg, ${C.bg2}, ${C.bg})` }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 mb-1">Illustrative order value</div>
                <div className="font-display text-5xl font-black" style={{ color: C.gold }}>{fmt(order)}</div>
              </div>
              <div className="md:text-right">
                {current ? (
                  <>
                    <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.green }}>Preview tier / {current.name}</div>
                    <div className="text-lg font-semibold mt-0.5">🎁 {current.gift}</div>
                  </>
                ) : (
                  <div className="text-zinc-400 text-sm">Move the slider to preview the first illustrative tier.</div>
                )}
              </div>
            </div>

            <input
              type="range" min="0" max="10000" step="100" value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full accent-[#6C47FF] cursor-pointer"
              aria-label="Order total"
            />
            <div className="flex justify-between font-mono text-[10px] text-zinc-500 mt-2">
              <span>$0</span><span>$2.5k</span><span>$5k</span><span>$7.5k</span><span>$10k</span>
            </div>

            {next && (
              <div className="mt-6">
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Preview progress to <span className="text-white font-semibold">{next.name}</span></span>
                  <span>{fmt(next.min - order)} to go</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#2A2240' }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.purple}, ${C.gold})` }} />
                </div>
              </div>
            )}
          </div>

          {/* tier cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIERS.map((t) => {
              const unlocked = order >= t.min;
              const M = t.mascot;
              return (
                <div
                  key={t.min}
                  className="relative rounded-2xl p-5 border overflow-hidden transition-all"
                  style={{
                    borderColor: unlocked ? `${C.gold}88` : '#2A2240',
                    background: unlocked ? `linear-gradient(135deg, rgba(245,200,66,0.10), ${C.bg2})` : C.bg2,
                    boxShadow: unlocked ? `0 0 28px rgba(245,200,66,0.12)` : 'none',
                  }}
                >
                  {unlocked && <div className="absolute inset-0 swagr-shimmer pointer-events-none" />}
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">Illustrative {fmt(t.min)}+</div>
                      <div className="font-display text-xl font-black mt-0.5">{t.name}</div>
                    </div>
                    <div className="h-16 w-12 shrink-0"><M /></div>
                  </div>
                  <div className="relative mt-3 flex items-center gap-2">
                    <Gift className="w-4 h-4 shrink-0" style={{ color: unlocked ? C.gold : '#6B6580' }} />
                    <span className="text-sm text-zinc-200">{t.gift}</span>
                  </div>
                  <div className="relative mt-4 flex items-center justify-between">
                    <span className="font-mono text-[11px]" style={{ color: C.gold }}>{t.value}</span>
                    {unlocked ? (
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.green }}>
                        <Check className="w-3.5 h-3.5" /> Preview active
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">Preview later</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------- MEET THE SQUAD ---------------- */}
        <section id="squad" className="max-w-6xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: C.purpleLt }}>AI workflow preview</div>
            <h2 className="font-display text-4xl font-black tracking-tight">Meet the squad behind the intended experience.</h2>
            <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
              The mascots demonstrate intended workflow roles across intake, artwork, production validation, and fulfillment planning.
              Animated tasks are product-demo states, not live customer orders or live production activity.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SQUAD.map((a) => <AgentCard key={a.key} agent={a} />)}
          </div>
        </section>

        {/* ---------------- SHOP ---------------- */}
        <section id="shop" className="max-w-6xl mx-auto px-5 py-12">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: C.gold }}>Shop the squad</div>
            <h2 className="font-display text-4xl font-black tracking-tight">Explore the product families before commercial validation.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { Mascot: Kruz, name: 'Koozie direction', category: 'Drinkware', state: 'Planning family', validation: 'Price / MOQ / material / decoration TBD', note: 'Soft-sided drinkware accessory family' },
              { Mascot: Cappy, name: 'Cap direction', category: 'Headwear', state: 'Planning family', validation: 'Price / MOQ / blank / embroidery TBD', note: 'Headwear family' },
              { Mascot: Steele, name: 'Tumbler direction', category: 'Drinkware', state: 'Planning family', validation: 'Price / MOQ / material / imprint TBD', note: 'Drinkware family' },
              { Mascot: Tee, name: 'Tee direction', category: 'Apparel', state: 'Planning family', validation: 'Price / MOQ / blank / decoration TBD', note: 'Apparel family' },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl border p-5 flex flex-col items-center text-center transition-transform hover:-translate-y-1" style={{ borderColor: '#2A2240', background: C.bg2 }}>
                <div className="h-40 w-28 swagr-bob"><p.Mascot /></div>
                <div className="font-display text-lg font-bold mt-2">{p.name}</div>
                <div className="text-xs text-zinc-400 mb-3">{p.note}</div>
                <div className="flex items-center justify-between w-full text-sm">
                  <span className="font-semibold text-white">{p.state}</span>
                  <span className="font-mono text-[10px] text-zinc-500 text-right">Validation required</span>
                </div>
                <div className="mt-3 text-[11px] text-zinc-500 leading-relaxed">{p.validation}</div>
                <div className="mt-4 grid w-full gap-2">
                  <a href={`/swagr/library?source=storefront&storefrontCategory=${encodeURIComponent(p.category)}`} className="w-full py-2 rounded-lg text-sm font-semibold transition-colors" style={{ background: `${C.purple}`, color: '#fff' }}>
                    Explore governed {p.category.toLowerCase()}
                  </a>
                  <a href="#quote" className="w-full py-2 rounded-lg border text-sm font-semibold transition-colors hover:bg-white/5" style={{ borderColor: '#3A3050', color: C.cream }}>
                    Add to request brief
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section className="max-w-6xl mx-auto px-5 py-12">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Palette, n: '01', t: 'Share brand context', d: 'Bring the available logo or artwork source. SWAGR flags what is usable and what still needs production validation.' },
              { icon: ImageIcon, n: '02', t: 'Build a controlled virtual', d: 'Compare governed product directions and clearly labeled preview media before commercial commitment.' },
              { icon: ShieldCheck, n: '03', t: 'Validate before ordering', d: 'Confirm supplier, price, MOQ, stock, lead time, decoration, proof, freight, gift terms, and production readiness before anything moves.' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="rounded-2xl p-6 border" style={{ borderColor: '#2A2240', background: C.bg2 }}>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-6 h-6" style={{ color: C.gold }} />
                    <span className="font-display text-3xl font-black text-white/10">{s.n}</span>
                  </div>
                  <div className="font-display text-lg font-bold mb-1.5">{s.t}</div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{s.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------- QUOTE CTA ---------------- */}
        <section id="quote" className="max-w-3xl mx-auto px-5 py-14">
          <div className="rounded-3xl p-8 md:p-10 border text-center" style={{ borderColor: `${C.gold}55`, background: `linear-gradient(135deg, ${C.bg2}, ${C.bg})` }}>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="h-28 w-20 swagr-bob-2"><Cappy /></div>
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 swagr-rise" style={{ color: C.gold }}>✦</span>
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight">Stage a request brief without sending anything.</h2>
            <p className="text-zinc-400 mt-3 mb-7 max-w-md mx-auto">Use this preview form to shape the information SWAGR would need. This isolated build stores nothing and sends nothing externally.</p>

            {sent ? (
              <div className="rounded-xl p-6 border" style={{ borderColor: `${C.green}55`, background: 'rgba(52,211,153,0.08)' }}>
                <Check className="w-8 h-8 mx-auto mb-2" style={{ color: C.green }} />
                <div className="font-semibold">Local request brief staged.</div>
                <p className="text-sm text-zinc-400 mt-1">Nothing was transmitted. Reset or continue exploring the governed SWAGR preview.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="grid sm:grid-cols-2 gap-3 text-left"
              >
                <input required placeholder="Name" className="px-4 py-3 rounded-lg bg-black/30 border outline-none focus:border-[#6C47FF]" style={{ borderColor: '#3A3050' }} />
                <input required type="email" placeholder="Work email" className="px-4 py-3 rounded-lg bg-black/30 border outline-none focus:border-[#6C47FF]" style={{ borderColor: '#3A3050' }} />
                <input placeholder="Company" className="px-4 py-3 rounded-lg bg-black/30 border outline-none focus:border-[#6C47FF]" style={{ borderColor: '#3A3050' }} />
                <select className="px-4 py-3 rounded-lg bg-black/30 border outline-none focus:border-[#6C47FF]" style={{ borderColor: '#3A3050', color: '#fff' }} defaultValue="">
                  <option value="" disabled>Estimated budget</option>
                  <option>Under $500</option>
                  <option>$500 – $2,500</option>
                  <option>$2,500 – $5,000</option>
                  <option>$5,000 – $10,000</option>
                  <option>$10,000+</option>
                </select>
                <textarea placeholder="What do you need? (products, quantities, logo)" rows={3} className="sm:col-span-2 px-4 py-3 rounded-lg bg-black/30 border outline-none focus:border-[#6C47FF]" style={{ borderColor: '#3A3050' }} />
                <button type="submit" className="sm:col-span-2 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]" style={{ background: C.gold, color: '#1a1326' }}>
                  <Zap className="w-4 h-4" /> Stage request brief locally
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ---------------- FOOTER ---------------- */}
        <footer className="border-t" style={{ borderColor: '#2A2240' }}>
          <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.gold})` }}>
                <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-display text-xl font-black">SWAGR</span>
              <span className="text-xs text-zinc-500 ml-2">by All You Need Promos</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" style={{ color: C.gold }} /> Interactive planning preview</span>
              <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" style={{ color: C.gold }} /> Commercial terms validated before quote</span>
            </div>
          </div>
          <div className="text-center pb-8 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">
            © 2026 All You Need Promos · SWAGR
          </div>
        </footer>
      </main>
    </div>
  );
}
