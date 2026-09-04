'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  SWAGR_PROMO_FACTS,
  SWAGR_PROMO_FACT_CATEGORIES,
  SWAGR_PROMO_FACT_META,
} from './promo-facts/catalog';

const C = {
  panel: '#171022',
  panel2: '#211938',
  line: '#352A46',
  purple: '#6C47FF',
  purpleLt: '#B6A6FF',
  gold: '#F5C842',
  cream: '#F1EAD8',
  green: '#34D399',
  muted: '#AAA0B8',
};

function Pill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { color: C.cream, borderColor: C.line, background: '#110B19' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}0D` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}0D` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}12` },
  };
  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]"
      style={tones[tone]}
    >
      {children}
    </span>
  );
}

export default function JourneyPromoFacts() {
  const pathname = usePathname();
  const [category, setCategory] = useState('All');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const filtered = useMemo(
    () => (category === 'All'
      ? SWAGR_PROMO_FACTS
      : SWAGR_PROMO_FACTS.filter((fact) => fact.category === category)),
    [category],
  );

  const currentIndex = index % Math.max(filtered.length, 1);
  const fact = filtered[currentIndex] || SWAGR_PROMO_FACTS[0];

  useEffect(() => {
    setIndex(0);
  }, [category]);

  useEffect(() => {
    if (pathname !== '/swagr') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/swagr' || paused || reducedMotion || filtered.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % filtered.length);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [pathname, paused, reducedMotion, filtered.length]);

  if (pathname !== '/swagr') return null;

  const go = (delta) => {
    setIndex((current) => (current + delta + filtered.length) % filtered.length);
  };

  return (
    <section
      className="border-b px-4 py-5 sm:px-6 lg:px-8"
      style={{ borderColor: C.line, background: '#0E0915' }}
      aria-label="SWAGR source-labeled promo intelligence"
    >
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border"
        style={{ borderColor: `${C.purple}44`, background: C.panel }}
      >
        <div className="grid lg:grid-cols-[1.15fr_.85fr]">
          <div
            className="relative p-5 sm:p-7"
            style={{
              background: `radial-gradient(circle at 0% 0%, ${C.purple}24, transparent 42%), ${C.panel}`,
            }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="purple">Promo signal rail</Pill>
              <Pill tone="good">Source-labeled</Pill>
              <Pill>No live AI/API</Pill>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border"
                style={{ borderColor: `${C.gold}55`, background: `${C.gold}0D` }}
              >
                <BarChart3 className="h-5 w-5" style={{ color: C.gold }} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: C.purpleLt }}>
                  {fact.category} Â· research context
                </div>
                <div className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {fact.signal}
                </div>
                <h2 className="mt-3 max-w-3xl text-xl font-black leading-tight text-white sm:text-2xl">
                  {fact.headline}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>
                  {fact.detail}
                </p>
              </div>
            </div>

            <div
              className="mt-5 rounded-2xl border p-4"
              style={{ borderColor: `${C.green}35`, background: `${C.green}08` }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.green }}>
                What SWAGR can responsibly do with this
              </div>
              <p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>
                {fact.planningSignal}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous promo research fact"
                  className="rounded-xl border p-2.5 outline-none focus:ring-2"
                  style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[78px] text-center text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>
                  {currentIndex + 1} / {filtered.length}
                </div>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next promo research fact"
                  className="rounded-xl border p-2.5 outline-none focus:ring-2"
                  style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {!reducedMotion && (
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-label={paused ? 'Resume promo research rotation' : 'Pause promo research rotation'}
                    className="rounded-xl border p-2.5 outline-none focus:ring-2"
                    style={{ borderColor: C.line, color: paused ? C.green : C.muted, '--tw-ring-color': C.purple }}
                  >
                    {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                )}
              </div>

              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {SWAGR_PROMO_FACT_CATEGORIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    aria-pressed={category === value}
                    className="shrink-0 rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] outline-none focus:ring-2"
                    style={{
                      borderColor: category === value ? C.purple : C.line,
                      background: category === value ? `${C.purple}1F` : '#100A18',
                      color: category === value ? C.purpleLt : C.muted,
                      '--tw-ring-color': C.purple,
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="border-t p-5 sm:p-7 lg:border-l lg:border-t-0" style={{ borderColor: C.line, background: C.panel2 }}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: C.gold }} />
              <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.gold }}>
                Exact source label
              </div>
            </div>

            <div className="mt-4 text-lg font-black text-white">{fact.source.publisher}</div>
            <p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>
              {fact.source.title}
            </p>

            <div className="mt-4 grid gap-3 text-[11px] leading-5">
              <div>
                <div className="font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Published</div>
                <div style={{ color: C.cream }}>{fact.source.published}</div>
              </div>
              <div>
                <div className="font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Method / basis</div>
                <div style={{ color: C.cream }}>{fact.source.method}</div>
              </div>
              <div>
                <div className="font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Library verification</div>
                <div style={{ color: C.cream }}>{SWAGR_PROMO_FACT_META.verifiedThrough}</div>
              </div>
            </div>

            <a
              href={fact.source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2"
              style={{ borderColor: `${C.purple}66`, color: C.purpleLt, '--tw-ring-color': C.purple }}
            >
              Open published source <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <div
              className="mt-5 flex items-start gap-3 rounded-2xl border p-4"
              style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.gold }} />
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.gold }}>
                  Truth boundary
                </div>
                <p className="mt-1 text-[10px] leading-5" style={{ color: C.muted }}>
                  {SWAGR_PROMO_FACT_META.truthBoundary}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[9px] leading-4" style={{ color: C.muted }}>
              Runtime mode: {SWAGR_PROMO_FACT_META.runtimeMode}. Facts are pre-generated in the build; the browser does not call an AI model, news feed, supplier API, or customer-data source to produce them.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
