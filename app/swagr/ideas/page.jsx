'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Compass, Pin, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import { loadActiveCampaign } from '../campaign-store';
import { SWAGR_IDEA_CATALOG, SWAGR_IDEA_CATEGORIES } from './catalog';
import { explainIdea, IDEA_TRUTH_NOTE, rankIdeas } from './engine';

const PIN_KEY = 'swagr.ideaPins.v1';
const MAX_PINS = 5;
const C = {
  bg: '#0D0913', panel: '#171022', panel2: '#211938', line: '#352A46',
  purple: '#6C47FF', purpleLt: '#B6A6FF', gold: '#F5C842', cream: '#F1EAD8',
  green: '#34D399', muted: '#AAA0B8',
};

function loadPins() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(PIN_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => SWAGR_IDEA_CATALOG.some((item) => item.id === id)).slice(0, MAX_PINS) : [];
  } catch { return []; }
}

function savePins(ids) {
  try { sessionStorage.setItem(PIN_KEY, JSON.stringify(ids)); } catch { /* session-only fallback */ }
}

function Pill({ children, tone = 'muted' }) {
  const color = tone === 'good' ? C.green : tone === 'gold' ? C.gold : tone === 'purple' ? C.purpleLt : C.muted;
  return <span className="rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]" style={{ borderColor: `${color}55`, color }}>{children}</span>;
}function IdeaCard({ item, rank, pinned, onToggle, brief }) {
  return (
    <article data-testid="swagr-idea-card" className="flex h-full flex-col rounded-3xl border p-5" style={{ borderColor: pinned ? `${C.green}66` : C.line, background: pinned ? `${C.green}08` : C.panel }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl" style={{ borderColor: C.line, background: C.panel2 }}>{item.emoji}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><Pill tone="purple">#{rank}</Pill><Pill>{item.category}</Pill></div>
            <h2 className="mt-2 text-lg font-black leading-tight text-white">{item.name}</h2>
          </div>
        </div>
        <button type="button" aria-pressed={pinned} onClick={() => onToggle(item.id)} className="rounded-xl border p-2.5 outline-none focus:ring-2" style={{ borderColor: pinned ? C.green : C.line, color: pinned ? C.green : C.muted, '--tw-ring-color': C.green }} aria-label={pinned ? `Unpin ${item.name}` : `Pin ${item.name}`}>
          {pinned ? <Check className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(item.matchedSignals.length ? item.matchedSignals : item.tags.slice(0, 4)).map((tag) => <span key={tag} className="rounded-lg px-2 py-1 text-[10px] font-bold" style={{ background: `${C.purple}18`, color: C.purpleLt }}>{tag}</span>)}
      </div>
      <p className="mt-4 text-sm font-semibold leading-6" style={{ color: C.cream }}>{explainIdea(item, brief)}</p>
      <div className="mt-4 rounded-2xl border p-3.5" style={{ borderColor: C.line, background: '#100A18' }}>
        <div className="text-[9px] font-black uppercase tracking-[0.13em]" style={{ color: C.muted }}>Decoration direction</div>
        <div className="mt-1 text-xs font-bold leading-5" style={{ color: C.cream }}>{item.decorationDirection}</div>
      </div>      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-2"><Pill>Price unverified</Pill><Pill>Inventory unknown</Pill><Pill tone="gold">Proof required</Pill></div>
        <p className="mt-3 text-[10px] leading-5" style={{ color: C.muted }}>{IDEA_TRUTH_NOTE}</p>
      </div>
    </article>
  );
}

export default function SwagrIdeasPage() {
  const [campaign, setCampaign] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [pins, setPins] = useState([]);

  useEffect(() => {
    setCampaign(loadActiveCampaign());
    setPins(loadPins());
  }, []);

  const brief = campaign?.brief || {};
  const ranked = useMemo(() => rankIdeas(SWAGR_IDEA_CATALOG, brief), [campaign]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ranked.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (!term) return true;
      const haystack = [item.name, item.category, item.decorationDirection, ...(item.tags || [])].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [ranked, query, category]);

  const pinnedItems = pins.map((id) => ranked.find((item) => item.id === id)).filter(Boolean);
  const togglePin = (id) => {
    setPins((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : current.length >= MAX_PINS ? current : [...current, id];
      savePins(next);
      return next;
    });
  };  return (
    <main className="min-h-screen" style={{ background: `radial-gradient(circle at 15% 0%, ${C.purple}24, transparent 34%), ${C.bg}`, color: C.cream }}>
      <header className="border-b px-5 py-5" style={{ borderColor: C.line, background: 'rgba(13,9,19,.92)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border" style={{ borderColor: `${C.purple}66`, background: `${C.purple}16`, color: C.purpleLt }}><Sparkles className="h-5 w-5" /></div>
            <div><div className="text-sm font-black text-white">SWAGR AI</div><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Promo Intelligence Board</div></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/swagr" className="rounded-xl border px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>← Main journey</Link>
            <Link href="/swagr/library" className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}>Governed discovery <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section data-testid="swagr-ideas-hero" className="overflow-hidden rounded-[32px] border p-6 sm:p-8" style={{ borderColor: `${C.purple}55`, background: 'linear-gradient(135deg, rgba(108,71,255,.15), rgba(23,16,34,.96) 55%, rgba(245,200,66,.05))' }}>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2"><Pill tone="purple">37 recovered directions</Pill><Pill tone="good">Local deterministic ranking</Pill><Pill>No external AI call</Pill></div>
              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">Turn a campaign into sharper promo directions.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7" style={{ color: C.muted }}>SWAGR AI recovered the useful product-intelligence corpus from the legacy idea tool, stripped live-price implications, and ranks it against your active session-local campaign. Pin the strongest planning directions, compare them, then move into governed discovery for the controlled product path.</p>
            </div>            <div className="rounded-3xl border p-5" style={{ borderColor: C.line, background: '#100A18' }}>
              <div className="flex items-center gap-2 text-xs font-black" style={{ color: campaign ? C.green : C.gold }}><Compass className="h-4 w-4" />{campaign ? 'Ranked from active campaign' : 'Generic planning mode'}</div>
              <div className="mt-3 text-xl font-black text-white">{campaign?.title || 'No active campaign yet'}</div>
              <div className="mt-3 grid gap-2 text-[11px] leading-5" style={{ color: C.muted }}>
                <div><span className="font-black" style={{ color: C.cream }}>Audience:</span> {brief.audience || 'Add campaign context'}</div>
                <div><span className="font-black" style={{ color: C.cream }}>Moment:</span> {brief.useCase || 'Add use case'}</div>
                <div><span className="font-black" style={{ color: C.cream }}>Style:</span> {brief.style || 'Open'}</div>
                <div><span className="font-black" style={{ color: C.cream }}>Avoid:</span> {brief.exclusions || 'None captured'}</div>
              </div>
              <Link href="/swagr/campaign" className="mt-4 inline-flex items-center gap-2 text-xs font-black outline-none focus:underline" style={{ color: C.purpleLt }}>{campaign ? 'Refine campaign' : 'Create campaign'} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        </section>
        <section className="mt-6 rounded-3xl border p-4" style={{ borderColor: C.line, background: C.panel }} aria-label="Promo intelligence filters">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: C.muted }} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search directions, tags, or categories"
                className="w-full rounded-2xl border py-3 pl-10 pr-10 text-sm outline-none focus:ring-2"
                style={{ borderColor: C.line, background: '#100A18', color: C.cream, '--tw-ring-color': C.purple }}
              />
              {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-3 rounded-lg p-1" style={{ color: C.muted }}><X className="h-4 w-4" /></button>}
            </label>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {SWAGR_IDEA_CATEGORIES.map((value) => (
                <button key={value} type="button" onClick={() => setCategory(value)} aria-pressed={category === value} className="shrink-0 rounded-xl border px-3 py-2.5 text-[10px] font-black outline-none focus:ring-2" style={{ borderColor: category === value ? C.purple : C.line, background: category === value ? `${C.purple}1F` : '#100A18', color: category === value ? C.purpleLt : C.muted, '--tw-ring-color': C.purple }}>{value}</button>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-6" aria-label="Ranked promo directions">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Ranked planning directions</div>
              <h2 className="mt-1 text-2xl font-black text-white">{filtered.length} direction{filtered.length === 1 ? '' : 's'} matched{filtered.length > 18 ? ' · showing top 18' : ''}</h2>
            </div>
            <div className="text-right text-[10px] leading-5" style={{ color: C.muted }}>Ranking is deterministic and browser-local.<br />Historical price ranges are intentionally not shown.</div>
          </div>

          {filtered.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, 18).map((item) => (
                <IdeaCard key={item.id} item={item} rank={ranked.findIndex((candidate) => candidate.id === item.id) + 1} pinned={pins.includes(item.id)} onToggle={togglePin} brief={brief} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border p-8 text-center" style={{ borderColor: C.line, background: C.panel }}>
              <div className="text-lg font-black text-white">No planning directions match those filters.</div>
              <button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="mt-3 text-xs font-black" style={{ color: C.purpleLt }}>Reset filters</button>
            </div>
          )}
        </section>
        <section data-testid="swagr-ideas-board" className="mt-8 rounded-[32px] border p-5 sm:p-6" style={{ borderColor: pinnedItems.length ? `${C.green}55` : C.line, background: C.panel }} aria-label="Pinned promo intelligence board">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2"><Pill tone={pinnedItems.length ? 'good' : 'muted'}>{pinnedItems.length}/{MAX_PINS} pinned</Pill><Pill>Session local</Pill></div>
              <h2 className="mt-3 text-2xl font-black text-white">Your inspiration board</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>Pin planning directions here for quick comparison. These recovered ideas do not become governed products automatically; move into SWAGR discovery to validate a controlled product direction.</p>
            </div>
            <Link href="/swagr/library" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}>Find governed directions <ArrowRight className="h-4 w-4" /></Link>
          </div>

          {pinnedItems.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-5">
              {pinnedItems.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#100A18' }}>
                  <div className="flex items-start justify-between gap-2"><span className="text-2xl">{item.emoji}</span><button type="button" onClick={() => togglePin(item.id)} aria-label={`Remove ${item.name} from board`} style={{ color: C.muted }}><X className="h-4 w-4" /></button></div>
                  <div className="mt-3 text-sm font-black text-white">{item.name}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.purpleLt }}>{item.category}</div>
                  <p className="mt-3 text-[10px] leading-5" style={{ color: C.muted }}>{explainIdea(item, brief)}</p>
                </div>
              ))}
            </div>
          ) : <div className="mt-5 rounded-2xl border border-dashed p-6 text-center text-sm" style={{ borderColor: C.line, color: C.muted }}>Pin up to five directions above to compare a campaign mix.</div>}
        </section>
        <section className="mt-6 flex items-start gap-3 rounded-3xl border p-5" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}>
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} />
          <div>
            <div className="text-sm font-black" style={{ color: C.gold }}>Planning intelligence, not catalog truth</div>
            <p className="mt-1 text-[11px] leading-6" style={{ color: C.muted }}>The legacy idea corpus is useful for ideation, but its historical price ranges and product claims are not treated as current. This board makes no supplier call, AI-model call, live inventory claim, quote, proof approval, order, or external handoff.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
