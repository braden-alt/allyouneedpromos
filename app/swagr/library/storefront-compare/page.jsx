'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bookmark, Check, ShieldCheck, Target, X } from 'lucide-react';
import ConceptVisual from '../../concept-visual';
import { SWAGR_GOVERNED_CONCEPTS } from '../../coverage/catalog';
import {
  SWAGR_LIBRARY_PINNED_KEY,
  loadActiveCampaignDecisionContext,
  saveActiveCampaignPinnedConceptIds,
} from '../../campaign-store';

const C = {
  bg: '#120D1A', panel: '#1B1530', panel2: '#211938', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', muted: '#AAA0B8', line: '#352A46',
};

const FAMILY_META = {
  'SWAGR-CAT-001': ['Identity wearables', 'WEARABLE_IDENTITY'],
  'SWAGR-CAT-002': ['Premium wearables', 'WEARABLE_PREMIUM'],
  'SWAGR-CAT-003': ['Identity wearables', 'WEARABLE_IDENTITY'],
  'SWAGR-CAT-004': ['Everyday use', 'DAILY_USE'],
  'SWAGR-CAT-005': ['Event utility', 'EVENT_UTILITY'],
  'SWAGR-CAT-006': ['Broad distribution', 'BROAD_DISTRIBUTION'],
  'SWAGR-CAT-007': ['Mobile utility', 'TECH_UTILITY'],
  'SWAGR-CAT-008': ['Field visibility', 'FIELD_VISIBILITY'],
  'SWAGR-CAT-009': ['Event identity', 'EVENT_IDENTITY'],
};

const RECORDS = SWAGR_GOVERNED_CONCEPTS.map((record) => ({
  ...record,
  family: FAMILY_META[record.id]?.[0] || 'Planning family open',
  substituteGroup: FAMILY_META[record.id]?.[1] || 'SUBSTITUTE_OPEN',
}));

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={styles[tone]}>{children}</span>;
}

function cleanPinned(ids) {
  const governed = new Set(RECORDS.map((record) => record.id));
  return [...new Set((Array.isArray(ids) ? ids : []).filter((id) => governed.has(id)))].slice(0, 4);
}

function readPinnedFallback() {
  try {
    const raw = sessionStorage.getItem(SWAGR_LIBRARY_PINNED_KEY);
    return cleanPinned(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function sharedValues(left = [], right = []) {
  return left.filter((value) => right.includes(value));
}

export default function StorefrontCompareStaging() {
  const [pair, setPair] = useState(null);
  const [initialPinned, setInitialPinned] = useState([]);
  const [currentPinned, setCurrentPinned] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [pairConfirmed, setPairConfirmed] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const focusId = params.get('focus') || '';
      const compareId = params.get('compare') || '';
      const focus = RECORDS.find((record) => record.id === focusId) || null;
      const compare = RECORDS.find((record) => record.id === compareId) || null;
      setPair(focus && compare && focus.id !== compare.id ? { focus, compare } : null);

      const campaignPins = cleanPinned(loadActiveCampaignDecisionContext().pinnedConceptIds || []);
      const pins = campaignPins.length ? campaignPins : readPinnedFallback();
      setInitialPinned(pins);
      setCurrentPinned(pins);
    } catch {
      setPair(null);
      setInitialPinned([]);
      setCurrentPinned([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const staging = useMemo(() => {
    if (!pair) return null;
    const pairIds = [pair.focus.id, pair.compare.id];
    const additions = pairIds.filter((id) => !currentPinned.includes(id));
    const nextPins = [...currentPinned, ...additions].slice(0, 4);
    return {
      pairIds,
      additions,
      nextPins,
      overCap: currentPinned.length + additions.length > 4,
      alreadyStaged: additions.length === 0,
    };
  }, [pair, currentPinned]);

  const comparisonRows = useMemo(() => {
    if (!pair) return [];
    const { focus, compare } = pair;
    const rows = [
      ['Planning family', focus.family, compare.family],
      ['Category', focus.category, compare.category],
      ['Substitute family', focus.substituteGroup, compare.substituteGroup],
      ['Shared use cases', sharedValues(focus.useCases, compare.useCases).join(', ') || 'No governed overlap'],
      ['Shared audiences', sharedValues(focus.audiences, compare.audiences).join(', ') || 'No governed overlap'],
      ['Shared planning bands', sharedValues(focus.budgets, compare.budgets).join(', ') || 'No governed overlap'],
      ['Evidence state', focus.evidence || 'Planning evidence', compare.evidence || 'Planning evidence'],
      ['Production state', 'VALIDATION REQUIRED', 'VALIDATION REQUIRED'],
    ];
    return rows.map(([label, left, right]) => ({ label, left, right, relation: left === right ? 'Same' : 'Different' }));
  }, [pair]);

  const commitStage = () => {
    if (!staging || staging.overCap) return;
    saveActiveCampaignPinnedConceptIds(staging.nextPins);
    setCurrentPinned(staging.nextPins);
    setPairConfirmed(true);
    setLastAction(staging.alreadyStaged ? 'Pair confirmed in the pinned comparison board.' : 'Pair staged in the pinned comparison board.');
  };

  const restoreInitialPins = () => {
    saveActiveCampaignPinnedConceptIds(initialPinned);
    setCurrentPinned(initialPinned);
    setPairConfirmed(false);
    setLastAction('Pinned board restored to the state that existed when this staging view opened.');
  };

  const confirmedPairStillPinned = Boolean(pairConfirmed && pair && staging?.pairIds.every((id) => currentPinned.includes(id)));
  const returnToDiscoveryHref = confirmedPairStillPinned
    ? `/swagr/library?source=storefront-compare-return&pairFocus=${encodeURIComponent(pair.focus.id)}&pairCompare=${encodeURIComponent(pair.compare.id)}`
    : '';

  if (!loaded) return <main className="min-h-screen" style={{ background: C.bg }} />;

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(60% 42% at 88% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(42% 28% at 2% 18%, rgba(245,200,66,.08), transparent 76%)' }} />
      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.96)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <Link href="/swagr/library" aria-label="Back to governed discovery" className="flex h-10 w-10 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link>
            <div><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Alternatives compare staging</Pill></div><p className="mt-1 text-xs" style={{ color: C.muted }}>Stage a storefront direction and one governed alternative for comparison without selecting a campaign winner.</p></div>
          </div>
          <div className="flex gap-2"><Pill tone="warn">Planning only</Pill><Pill tone="good">Reversible</Pill></div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        {!pair ? (
          <section className="rounded-3xl border p-6" style={{ borderColor: `${C.gold}66`, background: C.panel }}>
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" style={{ color: C.gold }} /><Pill tone="warn">Fail closed</Pill></div>
            <h1 className="mt-3 text-2xl font-black">A valid governed pair is required.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>SWAGR did not stage anything because the requested focus/compare pair was missing, unknown, or identical. Return to governed discovery and choose two distinct accepted planning directions.</p>
            <Link href="/swagr/library" className="mt-5 inline-flex rounded-xl border px-4 py-2.5 text-xs font-bold" style={{ borderColor: C.purple, color: C.purpleLt }}>Return to governed discovery</Link>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.green}55`, background: 'linear-gradient(135deg, rgba(52,211,153,.08), rgba(27,21,48,.96))' }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-4xl"><div className="flex flex-wrap items-center gap-2"><Target className="h-5 w-5" style={{ color: C.green }} /><Pill tone="good">Validated governed pair</Pill><Pill>Session-local comparison</Pill><Pill tone="warn">No winner</Pill></div><h1 className="mt-3 text-2xl font-black">Stage these directions side by side.</h1><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>The pair is validated against SWAGR's governed concept catalog. Staging only changes the reversible pinned comparison board; it does not change the active campaign direction, create a live product, or authorize commerce or production.</p></div>
                <div className="rounded-2xl border p-4 text-right" style={{ borderColor: staging?.overCap ? `${C.gold}66` : C.line, background: '#0F0A17' }}><div className="text-[10px] uppercase tracking-[.12em]" style={{ color: C.muted }}>Pinned capacity</div><div className="mt-1 text-2xl font-black">{currentPinned.length}/4</div><div className="mt-1 text-[10px]" style={{ color: staging?.overCap ? C.gold : C.green }}>{staging?.overCap ? 'Pair would exceed cap' : staging?.alreadyStaged ? 'Pair already included' : `${staging?.additions.length || 0} addition${staging?.additions.length === 1 ? '' : 's'} available`}</div></div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {[pair.focus, pair.compare].map((record, index) => <article key={record.id} className="overflow-hidden rounded-3xl border" style={{ borderColor: index === 0 ? `${C.gold}55` : `${C.purple}66`, background: '#0F0A17' }}><div className="p-3 pb-0"><ConceptVisual concept={record} compact conceptLabel={index === 0 ? 'Storefront direction' : 'Governed alternative'} /></div><div className="p-4"><div className="flex flex-wrap items-center gap-2"><Pill tone={index === 0 ? 'warn' : 'purple'}>{index === 0 ? 'Storefront focus' : 'Alternative'}</Pill><Pill>{record.id}</Pill></div><h2 className="mt-3 text-lg font-black">{record.name}</h2><p className="mt-1 text-xs" style={{ color: C.muted }}>{record.family} · {record.category}</p><p className="mt-3 text-xs leading-5" style={{ color: C.cream }}>{record.rationale}</p></div></article>)}
              </div>

              {staging?.overCap && <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: `${C.gold}66`, background: `${C.gold}08` }}><div className="flex items-center gap-2"><X className="h-4 w-4" style={{ color: C.gold }} /><strong style={{ color: C.gold }}>Four-pin limit preserved.</strong></div><p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>This pair needs {staging.additions.length} additional slot{staging.additions.length === 1 ? '' : 's'}, but only {Math.max(0, 4 - currentPinned.length)} remain. SWAGR will not silently remove an existing direction. Remove or reorder pins in the governed library first.</p></div>}

              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" disabled={staging?.overCap} onClick={commitStage} className="rounded-xl border px-4 py-2.5 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2" style={{ borderColor: C.green, color: C.green, '--tw-ring-color': C.green }}><Bookmark className="mr-2 inline h-4 w-4" />{staging?.alreadyStaged ? 'Confirm pair is staged' : 'Stage pair in pinned board'}</button>
                <button type="button" onClick={restoreInitialPins} disabled={currentPinned.join('|') === initialPinned.join('|')} className="rounded-xl border px-4 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-35" style={{ borderColor: C.line, color: C.cream }}>Restore opening pin state</button>
                {confirmedPairStillPinned && <Link href={returnToDiscoveryHref} className="rounded-xl border px-4 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ borderColor: C.gold, color: C.gold, '--tw-ring-color': C.gold }}>Return with staged pair</Link>}
                <Link href={`/swagr/library?source=storefront&concept=${encodeURIComponent(pair.focus.id)}`} className="rounded-xl border px-4 py-2.5 text-xs font-bold" style={{ borderColor: C.purple, color: C.purpleLt }}>Open pinned comparison board</Link>
              </div>
              {lastAction && <div role="status" className="mt-4 rounded-xl border p-3 text-xs" style={{ borderColor: `${C.green}44`, background: `${C.green}08`, color: C.cream }}><Check className="mr-2 inline h-4 w-4" style={{ color: C.green }} />{lastAction}</div>}
            </section>

            <section className="mt-6 rounded-3xl border p-5 sm:p-6" style={{ borderColor: C.line, background: C.panel2 }}>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="purple">Planning comparison</Pill><Pill tone="warn">Commercial truth unresolved</Pill></div><h2 className="mt-3 text-xl font-black">What the governed evidence says now</h2><p className="mt-2 max-w-4xl text-xs leading-5" style={{ color: C.muted }}>Same/Different describes accepted planning metadata only. It is not a rank, recommendation, substitute guarantee, price advantage, supplier match, or production decision.</p></div></div>
              <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: C.line }}>
                <div className="grid grid-cols-[minmax(120px,.65fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 border-b px-3 py-2 text-[9px] font-black uppercase tracking-[.1em]" style={{ borderColor: C.line, color: C.muted }}><span>Signal</span><span>{pair.focus.name}</span><span>{pair.compare.name}</span><span>Relation</span></div>
                {comparisonRows.map((row) => <div key={row.label} className="grid grid-cols-[minmax(120px,.65fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 border-b px-3 py-3 text-[9px] leading-4 last:border-b-0" style={{ borderColor: C.line }}><span className="font-black" style={{ color: C.muted }}>{row.label}</span><span className="break-words" style={{ color: C.cream }}>{row.left}</span><span className="break-words" style={{ color: C.cream }}>{row.right}</span><Pill tone={row.relation === 'Same' ? 'neutral' : 'purple'}>{row.relation}</Pill></div>)}
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2"><div className="rounded-2xl border p-4" style={{ borderColor: `${C.gold}44`, background: '#0F0A17' }}><div className="text-[10px] font-black uppercase tracking-[.12em]" style={{ color: C.gold }}>Still unresolved</div><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Exact supplier item, SKU, price, MOQ, setup, inventory, lead time, media rights, imprint geometry, decoration feasibility, and delivery fit.</p></div><div className="rounded-2xl border p-4" style={{ borderColor: `${C.purple}55`, background: '#0F0A17' }}><div className="text-[10px] font-black uppercase tracking-[.12em]" style={{ color: C.purpleLt }}>Authority boundary</div><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>No campaign selection, quote, order, payment, supplier approval, artwork/proof approval, production release, external communication, or production authority occurs here.</p></div></div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
