'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Boxes, CheckCircle2, Layers3, RotateCcw, Save, ShieldCheck, Sparkles } from 'lucide-react';
import ConceptVisual from '../concept-visual';
import { loadBrandProfile } from '../brand-profile';
import { loadActiveCampaign } from '../campaign-store';
import { SWAGR_GOVERNED_CONCEPTS } from '../coverage/catalog';
import { SWAGR_IDEA_CATALOG } from '../ideas/catalog';
import { explainIdea, rankIdeas } from '../ideas/engine';
import { loadMixDiscoveryFocus, summarizeMixFocus } from '../mix/discovery-focus';
import { buildCampaignKit, clearCampaignKit, conceptsForLane, loadCampaignKit, saveCampaignKit, updateKitItem } from './kit-state';

const C = {
  bg: '#0D0913', panel: '#171022', panel2: '#1E162B', line: '#342844',
  cream: '#F1EAD8', muted: '#A99FB7', purple: '#6C47FF', purpleLt: '#B7A8FF',
  gold: '#F5C842', green: '#34D399', red: '#FB7185',
};

const PLACEMENTS = [
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['alternate', 'Alternate'],
];

function Pill({ children, tone = 'neutral' }) {
  const map = {
    neutral: [C.cream, C.line, '#120C1A'], purple: [C.purpleLt, `${C.purple}66`, `${C.purple}14`],
    good: [C.green, `${C.green}55`, `${C.green}10`], warn: [C.gold, `${C.gold}55`, `${C.gold}10`],
  };
  const [color, border, background] = map[tone] || map.neutral;
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em]" style={{ color, borderColor: border, background }}>{children}</span>;
}

function conceptById(id) {
  return SWAGR_GOVERNED_CONCEPTS.find((concept) => concept.id === id) || null;
}

function formatUpdated(value) {
  if (!value) return 'Not saved yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Saved this session' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function SwagrCampaignKitBoard() {
  const [campaign, setCampaign] = useState(null);
  const [focus, setFocus] = useState(null);
  const [kit, setKit] = useState(null);
  const [brand, setBrand] = useState(null);
  const [message, setMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const activeCampaign = loadActiveCampaign();
    const campaignId = activeCampaign?.id || '';
    const activeFocus = loadMixDiscoveryFocus({ campaignId });
    const previous = loadCampaignKit({ campaignId });
    const nextKit = activeFocus ? buildCampaignKit({ focus: activeFocus, concepts: SWAGR_GOVERNED_CONCEPTS, previous }) : null;
    setCampaign(activeCampaign);
    setFocus(activeFocus);
    setKit(nextKit);
    setBrand(loadBrandProfile());
    setHydrated(true);
  }, []);

  const summary = useMemo(() => summarizeMixFocus(focus), [focus]);
  const rankedIdeas = useMemo(() => rankIdeas(SWAGR_IDEA_CATALOG, campaign?.brief || {}), [campaign]);
  const mappedItems = kit?.items?.filter((item) => conceptById(item.conceptId)) || [];
  const unmappedCount = (kit?.items?.length || 0) - mappedItems.length;

  const mutateItem = (slot, changes, note) => {
    setKit((current) => {
      const next = updateKitItem(current, slot, changes);
      saveCampaignKit(next);
      return next;
    });
    setMessage(note);
  };

  const cycleConcept = (item) => {
    const candidates = conceptsForLane(SWAGR_GOVERNED_CONCEPTS, item.lane);
    if (candidates.length < 2) {
      setMessage(`${item.lane} currently has one governed synthetic concept direction.`);
      return;
    }
    const currentIndex = Math.max(0, candidates.findIndex((candidate) => candidate.id === item.conceptId));
    const next = candidates[(currentIndex + 1) % candidates.length];
    mutateItem(item.slot, { conceptId: next.id }, `Slot ${item.slot} changed to ${next.name}.`);
  };

  const persistKit = () => {
    if (!kit) return;
    const saved = saveCampaignKit(kit);
    setKit(saved);
    setMessage('Campaign kit saved in this browser session only.');
  };

  const resetKit = () => {
    if (!focus) return;
    clearCampaignKit();
    const next = buildCampaignKit({ focus, concepts: SWAGR_GOVERNED_CONCEPTS });
    setKit(next);
    setMessage('Kit reset to governed lane defaults. No live data changed.');
  };

  if (!hydrated) {
    return <main className="min-h-screen p-8" style={{ background: C.bg, color: C.cream }}>Loading SWAGR campaign context…</main>;
  }

  if (!focus || !kit?.items?.length) {
    return (
      <main className="min-h-screen" style={{ background: C.bg, color: C.cream }}>
        <div className="mx-auto max-w-4xl px-5 py-16">
          <Link href="/swagr" className="inline-flex items-center gap-2 text-xs font-black" style={{ color: C.purpleLt }}><ArrowLeft className="h-4 w-4" /> SWAGR AI</Link>
          <section className="mt-6 rounded-[32px] border p-8 sm:p-10" style={{ borderColor: C.line, background: C.panel }}>
            <Pill tone="warn">Mix focus needed</Pill>
            <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Build the campaign mix first.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: C.muted }}>The Kit Board only visualizes an explicit, session-local Campaign Mix. It will not invent product requirements or silently promote legacy ideas into live products.</p>
            <Link href="/swagr/mix" className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black" style={{ background: C.gold, color: '#17101F' }}>Open Campaign Mix <ArrowRight className="h-4 w-4" /></Link>
          </section>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen" style={{ background: `radial-gradient(circle at 12% 0%, ${C.purple}24, transparent 32%), ${C.bg}`, color: C.cream }}>
      <header className="border-b" style={{ borderColor: C.line, background: 'rgba(13,9,19,.95)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <Link href="/swagr/mix" className="flex h-10 w-10 items-center justify-center rounded-2xl border outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }} aria-label="Back to campaign mix"><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <div className="text-sm font-black text-white">SWAGR AI</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Campaign Kit Visual Board</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetKit} className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
            <button type="button" onClick={persistKit} className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}><Save className="h-3.5 w-3.5" /> Save session kit</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-[32px] border p-6 sm:p-8" style={{ borderColor: `${C.purple}55`, background: 'linear-gradient(135deg, rgba(108,71,255,.18), rgba(23,16,34,.96) 58%, rgba(245,200,66,.05))' }}>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="purple">Visual planning board</Pill>
                <Pill tone="good">{mappedItems.length}/{kit.items.length} governed lanes mapped</Pill>
                <Pill>No live price / stock</Pill>
              </div>
              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">See the campaign as a kit, not a list.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7" style={{ color: C.muted }}>SWAGR AI turns the selected campaign mix into one visual board, keeps each item tied to its campaign role, and lets you explore governed concept placements before any live SKU, quote, proof, or production decision exists.</p>
            </div>
            <aside className="rounded-3xl border p-5" style={{ borderColor: C.line, background: '#100A18' }}>
              <div className="flex items-center gap-2 text-xs font-black" style={{ color: campaign ? C.green : C.gold }}><Sparkles className="h-4 w-4" /> {campaign ? 'Active campaign' : 'Session planning'}</div>
              <div className="mt-3 text-xl font-black text-white">{campaign?.title || 'Campaign mix preview'}</div>
              <div className="mt-3 flex flex-wrap gap-2">{summary.categories.map((category) => <Pill key={category}>{category}</Pill>)}</div>
              <div className="mt-3 text-[11px] leading-5" style={{ color: C.muted }}>Saved: {formatUpdated(kit.updatedAt)} · {summary.roles.length} campaign role{summary.roles.length === 1 ? '' : 's'}</div>
            </aside>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border p-5" style={{ borderColor: `${C.gold}55`, background: `${C.gold}08` }}>
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} /><div><div className="text-xs font-black" style={{ color: C.gold }}>Campaign concept kit ≠ quote or production pack</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Every tile below is synthetic/category-level planning. Product identity, price, inventory, MOQ, lead time, delivery, decoration feasibility, imprint geometry, production artwork, and supplier approval still require governed validation.</p></div></div>
        </section>
        {message && <div role="status" aria-live="polite" className="mt-5 rounded-2xl border px-4 py-3 text-xs" style={{ borderColor: `${C.green}55`, background: `${C.green}0B`, color: C.green }}>{message}</div>}

        <section className="mt-6 grid gap-5 lg:grid-cols-2" aria-label="Campaign kit concepts">
          {kit.items.map((item) => {
            const concept = conceptById(item.conceptId);
            const candidates = conceptsForLane(SWAGR_GOVERNED_CONCEPTS, item.lane);
            const idea = rankedIdeas.find((candidate) => candidate.id === item.ideaId);
            const explanation = idea ? explainIdea(idea, campaign?.brief || {}) : `${item.mixRole} direction retained from the explicit Campaign Mix; validate campaign fit before quoting.`;
            return (
              <article key={`${item.slot}-${item.ideaId}`} data-testid={`kit-slot-${item.slot}`} className="overflow-hidden rounded-[28px] border" style={{ borderColor: C.line, background: C.panel }}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b p-5" style={{ borderColor: C.line }}>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.gold }}>Slot {item.slot} · {item.mixRole}</div>
                    <h2 className="mt-2 text-xl font-black text-white">{concept?.name || `${item.lane} direction unavailable`}</h2>
                    <p className="mt-1 text-xs" style={{ color: C.muted }}>Mix origin: {item.ideaName || item.category} · Governed lane: {item.lane}</p>
                  </div>
                  <Pill tone={concept ? 'good' : 'warn'}>{concept ? 'Concept mapped' : 'Needs mapping'}</Pill>
                </div>

                <div className="p-5">
                  {concept ? <ConceptVisual concept={concept} compact brandAsset={brand?.logoDataUrl || ''} brandName={brand?.brandName || campaign?.brand?.brandName || 'YOUR MARK'} placement={item.placement} markScale={item.markScale} conceptLabel={`Slot ${item.slot} concept`} /> : <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-dashed p-6 text-center text-xs" style={{ borderColor: C.line, color: C.muted }}>No governed synthetic concept exists for this selected lane yet.</div>}

                  <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${C.purple}55`, background: `${C.purple}0A` }}>
                    <div className="text-[10px] font-black uppercase tracking-[0.13em]" style={{ color: C.purpleLt }}>Why SWAGR put this here</div>
                    <p className="mt-2 text-xs leading-6" style={{ color: C.cream }}>{explanation}</p>
                    <div className="mt-3 flex flex-wrap gap-2">{(idea?.matchedSignals || []).map((signal) => <Pill tone="purple" key={signal}>{signal}</Pill>)}<Pill>{item.mixRole}</Pill></div>
                    {concept?.rationale && <p className="mt-3 text-[11px] leading-5" style={{ color: C.muted }}><strong style={{ color: C.gold }}>Category rationale:</strong> {concept.rationale}</p>}
                    <div className="mt-3 text-[10px] leading-4" style={{ color: C.muted }}>Deterministic planning explanation from the active campaign and recovered curated promo intelligence — not market proof or supplier truth.</div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }} htmlFor={`placement-${item.slot}`}>Concept placement</label>
                      <select id={`placement-${item.slot}`} value={item.placement} onChange={(event) => mutateItem(item.slot, { placement: event.target.value }, `Slot ${item.slot} placement updated.`)} className="mt-2 min-h-11 w-full rounded-xl border px-3 text-xs outline-none focus:ring-2" style={{ borderColor: C.line, background: C.panel2, color: C.cream, '--tw-ring-color': C.purple }}>
                        {PLACEMENTS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => cycleConcept(item)} disabled={candidates.length < 2} className="min-h-11 rounded-xl border px-3 text-xs font-black outline-none disabled:cursor-not-allowed disabled:opacity-45 focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purple }}>Next concept</button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}><span>Mark scale</span><span>{Math.round(item.markScale * 100)}%</span></div>
                    <input aria-label={`Slot ${item.slot} mark scale`} className="mt-2 w-full accent-purple-500" type="range" min="75" max="125" step="5" value={Math.round(item.markScale * 100)} onChange={(event) => mutateItem(item.slot, { markScale: Number(event.target.value) / 100 }, `Slot ${item.slot} mark scale updated.`)} />
                  </div>

                  <div className="mt-4 grid gap-2 text-[11px] leading-5" style={{ color: C.muted }}>
                    <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.green }} /><span>{item.candidateCount} governed synthetic direction{item.candidateCount === 1 ? '' : 's'} in this lane.</span></div>
                    <div className="flex items-start gap-2"><Layers3 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.purpleLt }} /><span>Placement and scale are conceptual only; certified imprint geometry is not loaded.</span></div>
                  </div>

                  {concept && <Link href={`/swagr/virtual?concept=${encodeURIComponent(concept.id)}&source=kit`} className="mt-4 inline-flex items-center gap-2 text-xs font-black outline-none focus:ring-2" style={{ color: C.gold, '--tw-ring-color': C.gold }}>Open full concept studio <ArrowRight className="h-3.5 w-3.5" /></Link>}
                </div>
              </article>
            );
          })}
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel }}><div className="text-2xl font-black text-white">{kit.items.length}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.muted }}>Mix slots visualized</div></div>
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel }}><div className="text-2xl font-black" style={{ color: C.green }}>{mappedItems.length}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.muted }}>Governed concept mappings</div></div>
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel }}><div className="text-2xl font-black" style={{ color: unmappedCount ? C.gold : C.green }}>{unmappedCount}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.muted }}>Unmapped selected lanes</div></div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t py-6 text-[11px] leading-5" style={{ borderColor: C.line, color: C.muted }}>
          <div><strong style={{ color: C.cream }}>SWAGR AI Kit Board:</strong> session-local, reversible, synthetic planning state only.</div>
          <div className="flex flex-wrap gap-3"><Link href="/swagr/library" className="font-black" style={{ color: C.purpleLt }}>Governed discovery</Link><Link href="/swagr/mix" className="font-black" style={{ color: C.purpleLt }}>Campaign mix</Link><Link href="/swagr" className="font-black" style={{ color: C.purpleLt }}>Journey hub</Link></div>
        </footer>
      </div>
    </main>
  );
}
