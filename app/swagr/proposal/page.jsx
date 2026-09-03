'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  History,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import ConceptVisual from '../concept-visual';
import { SWAGR_FIXTURES } from '../../swagr-lab/fixtures';
import { buildFitRationale, isFixtureExcluded, scoreFixture } from '../../swagr-lab/engine';
import { loadBrandProfile } from '../brand-profile';
import { saveActiveCampaignProposalReview } from '../campaign-store';

const C = {
  bg: '#120D1A',
  panel: '#1B1530',
  panel2: '#211938',
  purple: '#6C47FF',
  purpleLt: '#B6A6FF',
  gold: '#F5C842',
  cream: '#F1EAD8',
  green: '#34D399',
  muted: '#AAA0B8',
  line: '#352A46',
};

const ACTIVE_BRIEF_KEY = 'swagr.activeBrief.v1';
const PROPOSAL_REVIEW_KEY = 'swagr.proposalReview.v1';

const FALLBACK_BRIEF = {
  audience: 'event attendees',
  useCase: 'recruiting event',
  quantity: 'QTY_MID',
  budget: 'BAND_STANDARD',
  inHandsDate: '',
  location: 'Dallas, TX',
  style: 'Useful, modern, easy to distribute',
  exclusions: '',
};

const REQUIRED_VALIDATIONS = [
  'Exact supplier item, SKU, color, and source',
  'Current sell price, MOQ, setup, freight, and inventory',
  'Lead time and delivery feasibility for the requested in-hands date',
  'Product-specific imprint area and decoration feasibility',
  'Final production artwork and supplier proof approval',
];

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={styles[tone]}>{children}</span>;
}

function loadSession(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Restricted browser contexts can disable sessionStorage. The review remains usable in memory.
  }
}

function rankedIds(brief) {
  return SWAGR_FIXTURES
    .filter((fixture) => !isFixtureExcluded(fixture, brief?.exclusions || ''))
    .map((fixture) => ({ id: fixture.id, score: scoreFixture(fixture, brief || FALLBACK_BRIEF) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map((item) => item.id);
}

function makeEvent(action, reason, priorState, newState, objectId = 'PROPOSAL_REVIEW') {
  return {
    eventTime: new Date().toISOString(),
    actor: 'LOCAL_CUSTOMER_REVIEWER',
    action,
    reason,
    priorState,
    newState,
    objectId,
  };
}

function conceptById(id) {
  return SWAGR_FIXTURES.find((fixture) => fixture.id === id);
}

function isReviewDecision(value) {
  return value === 'KEEP' || value === 'CHANGE_REQUESTED';
}

function isReviewStatus(value) {
  return value === 'CUSTOMER_REVIEW' || value === 'HANDOFF_READY_FOR_HUMAN_VALIDATION';
}

export default function SwagrProposalReview() {
  const [brief, setBrief] = useState(FALLBACK_BRIEF);
  const [brandName, setBrandName] = useState('Sample Brand');
  const [brandAsset, setBrandAsset] = useState('');
  const [conceptIds, setConceptIds] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [changeNotes, setChangeNotes] = useState({});
  const [version, setVersion] = useState(1);
  const [previousVersions, setPreviousVersions] = useState([]);
  const [status, setStatus] = useState('CUSTOMER_REVIEW');
  const [sourceState, setSourceState] = useState('SYNTHETIC_REVIEW_FALLBACK');
  const [audit, setAudit] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const activeBrief = loadSession(ACTIVE_BRIEF_KEY) || FALLBACK_BRIEF;
    const packet = loadSession(PROPOSAL_REVIEW_KEY);
    const brandProfile = loadBrandProfile();
    const idsFromPacket = Array.isArray(packet?.selectedIds)
      ? packet.selectedIds.filter((id) => Boolean(conceptById(id)))
      : [];
    const initialIds = idsFromPacket.length ? idsFromPacket : rankedIds(activeBrief);
    const restoredStatus = isReviewStatus(packet?.status) ? packet.status : 'CUSTOMER_REVIEW';
    const restoredDecisions = Object.fromEntries(
      initialIds.map((id) => [id, isReviewDecision(packet?.decisions?.[id]) ? packet.decisions[id] : 'KEEP'])
    );
    const restoredNotes = Object.fromEntries(
      initialIds
        .filter((id) => typeof packet?.changeNotes?.[id] === 'string' && packet.changeNotes[id])
        .map((id) => [id, packet.changeNotes[id]])
    );
    const restoredHistory = Array.isArray(packet?.previousVersions) ? packet.previousVersions : [];
    const restoredAudit = Array.isArray(packet?.audit) ? packet.audit.slice(0, 49) : [];
    const restoredSourceState = packet?.sourceState === 'CAPTURED_SHORTLIST'
      ? 'CAPTURED_SHORTLIST'
      : 'SYNTHETIC_REVIEW_FALLBACK';
    const openedEvent = makeEvent(
      'PROPOSAL_REVIEW_OPENED',
      packet
        ? 'Existing session-local proposal review state reopened with decisions and version history preserved.'
        : 'No captured shortlist was available, so SWAGR created a reversible synthetic review fallback from the active brief.',
      restoredStatus,
      restoredStatus
    );

    setBrief(packet?.requirements || activeBrief);
    setBrandName(packet?.brandName || brandProfile?.brandName || 'Sample Brand');
    setBrandAsset(packet?.brandAsset || brandProfile?.logoDataUrl || '');
    setConceptIds(initialIds);
    setVersion(Number(packet?.version) || 1);
    setSourceState(restoredSourceState);
    setDecisions(restoredDecisions);
    setChangeNotes(restoredNotes);
    setPreviousVersions(restoredHistory);
    setStatus(restoredStatus);
    setAudit([openedEvent, ...restoredAudit].slice(0, 50));
    setLoaded(true);
  }, []);

  const concepts = useMemo(() => conceptIds.map(conceptById).filter(Boolean), [conceptIds]);
  const keptCount = conceptIds.filter((id) => decisions[id] === 'KEEP').length;
  const changeCount = conceptIds.filter((id) => decisions[id] === 'CHANGE_REQUESTED').length;

  useEffect(() => {
    if (!loaded) return;
    const packet = {
      schemaVersion: 1,
      persistence: 'SESSION_LOCAL_ONLY',
      sourceState,
      requirements: brief,
      brandName,
      brandAsset,
      selectedIds: conceptIds,
      decisions,
      changeNotes,
      version,
      previousVersions,
      status,
      audit,
      updatedAt: new Date().toISOString(),
    };
    saveSession(PROPOSAL_REVIEW_KEY, packet);
    saveActiveCampaignProposalReview(packet);
  }, [audit, brandAsset, brandName, brief, changeNotes, conceptIds, decisions, loaded, previousVersions, sourceState, status, version]);

  const record = (event) => setAudit((items) => [event, ...items].slice(0, 50));

  const setDecision = (id, nextDecision) => {
    const prior = decisions[id] || 'UNREVIEWED';
    setDecisions((items) => ({ ...items, [id]: nextDecision }));
    if (status === 'HANDOFF_READY_FOR_HUMAN_VALIDATION') setStatus('CUSTOMER_REVIEW');
    record(makeEvent('CUSTOMER_DECISION_CHANGED', `${id} changed from ${prior} to ${nextDecision}.`, prior, nextDecision, id));
  };

  const replaceDirection = (oldId) => {
    const alternate = SWAGR_FIXTURES
      .filter((fixture) => !conceptIds.includes(fixture.id) && !isFixtureExcluded(fixture, brief?.exclusions || ''))
      .map((fixture) => ({ fixture, score: scoreFixture(fixture, brief) }))
      .sort((a, b) => b.score - a.score || a.fixture.id.localeCompare(b.fixture.id))[0]?.fixture;
    if (!alternate) return;

    const snapshot = {
      version,
      conceptIds: [...conceptIds],
      decisions: { ...decisions },
      changeNotes: { ...changeNotes },
      status,
      preservedAt: new Date().toISOString(),
    };
    const nextVersion = version + 1;
    const nextIds = conceptIds.map((id) => id === oldId ? alternate.id : id);
    const nextDecisions = { ...decisions };
    delete nextDecisions[oldId];
    nextDecisions[alternate.id] = 'KEEP';
    const nextNotes = { ...changeNotes };
    delete nextNotes[oldId];

    setPreviousVersions((items) => [snapshot, ...items]);
    setConceptIds(nextIds);
    setDecisions(nextDecisions);
    setChangeNotes(nextNotes);
    setVersion(nextVersion);
    setStatus('CUSTOMER_REVIEW');
    record(makeEvent('PROPOSAL_DIRECTION_REPLACED', `${oldId} was replaced with ${alternate.id}; proposal v${version} was preserved before creating v${nextVersion}.`, `PROPOSAL_V${version}`, `PROPOSAL_V${nextVersion}`, alternate.id));
  };

  const prepareHandoff = () => {
    if (!keptCount) return;
    const prior = status;
    setStatus('HANDOFF_READY_FOR_HUMAN_VALIDATION');
    record(makeEvent(
      'HUMAN_VALIDATION_HANDOFF_READY',
      'Customer review decisions were packaged locally for human/source validation. No email, quote transmission, order, payment, artwork approval, or production action occurred.',
      prior,
      'HANDOFF_READY_FOR_HUMAN_VALIDATION',
      `PROPOSAL_V${version}`
    ));
  };

  if (!loaded) {
    return <main className="min-h-screen p-8" style={{ background: C.bg, color: C.cream }}>Loading local SWAGR review packet…</main>;
  }

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(60% 42% at 88% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(40% 28% at 2% 18%, rgba(245,200,66,.08), transparent 76%)' }} />

      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.95)' }}>
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${C.purple}22`, border: `1px solid ${C.purple}55` }}><Sparkles className="h-5 w-5" style={{ color: C.gold }} /></div>
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Proposal review</Pill><Pill tone={sourceState === 'CAPTURED_SHORTLIST' ? 'good' : 'warn'}>{sourceState === 'CAPTURED_SHORTLIST' ? 'Captured shortlist' : 'Synthetic fallback'}</Pill></div>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>A branded decision experience for choosing directions without turning planning concepts into commercial or production truth.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2"><Pill tone="warn">No live price or stock</Pill><Pill tone={status === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? 'good' : 'neutral'}>{status}</Pill></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/swagr" className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-3.5 w-3.5" /> Back to SWAGR</Link>
            <Link href="/swagr/virtual" className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, background: `${C.purple}10`, '--tw-ring-color': C.purple }}>Concept studio <ArrowRight className="h-3.5 w-3.5" /></Link>
            <Link href="/swagr/brand" className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Brand Kit</Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="overflow-hidden rounded-3xl border" style={{ borderColor: `${C.gold}44`, background: 'linear-gradient(135deg, rgba(108,71,255,.16), rgba(27,21,48,.94) 58%, rgba(245,200,66,.06))' }}>
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_300px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2"><Pill tone="purple">Proposal v{version}</Pill><Pill tone="warn">Concept-only artwork</Pill><Pill tone="warn">Source validation required</Pill></div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{brandName || 'Sample Brand'} — curated directions for {brief.useCase || 'the current program'}.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>For {brief.audience || 'the intended audience'} · {brief.location || 'delivery location open'} · quantity {brief.quantity || 'open'} · budget {brief.budget || 'open'}{brief.inHandsDate ? ` · needed ${brief.inHandsDate}` : ' · in-hands date still open'}.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border p-3 text-center" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-xl font-black">{concepts.length}</div><div className="mt-1 text-[10px]" style={{ color: C.muted }}>directions</div></div>
              <div className="rounded-2xl border p-3 text-center" style={{ borderColor: `${C.green}44`, background: `${C.green}08` }}><div className="text-xl font-black" style={{ color: C.green }}>{keptCount}</div><div className="mt-1 text-[10px]" style={{ color: C.muted }}>keep</div></div>
              <div className="rounded-2xl border p-3 text-center" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}><div className="text-xl font-black" style={{ color: C.gold }}>{changeCount}</div><div className="mt-1 text-[10px]" style={{ color: C.muted }}>changes</div></div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2" aria-label="Proposal directions for review">
          {concepts.map((concept) => {
            const decision = decisions[concept.id] || 'KEEP';
            return (
              <article key={`${version}-${concept.id}`} className="overflow-hidden rounded-3xl border" style={{ background: C.panel, borderColor: decision === 'KEEP' ? `${C.green}55` : `${C.gold}66` }}>
                <div className="p-3 pb-0"><ConceptVisual concept={concept} conceptLabel={`Proposal v${version} · concept only`} brandName={brandName || 'YOUR MARK'} brandAsset={brandAsset} /></div>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.purpleLt }}>{concept.category}</p><h2 className="mt-1 text-xl font-black">{concept.name}</h2></div>
                    <Pill tone={decision === 'KEEP' ? 'good' : 'warn'}>{decision}</Pill>
                  </div>
                  <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.gold }}>Why SWAGR included it</div><p className="mt-2 text-sm leading-6" style={{ color: C.cream }}>{buildFitRationale(concept, brief)}</p></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Creative direction</div><p className="mt-1 text-xs leading-5" style={{ color: C.cream }}>{concept.creative}</p></div><div><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Decoration paths to validate</div><p className="mt-1 text-xs leading-5" style={{ color: C.cream }}>{concept.decoration.join(' · ')}</p></div></div>
                  <div className="mt-4 flex flex-wrap gap-2"><Pill tone="warn">Price unverified</Pill><Pill tone="warn">Inventory unknown</Pill><Pill tone="warn">Production proof required</Pill></div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setDecision(concept.id, 'KEEP')} aria-pressed={decision === 'KEEP'} className="rounded-xl px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ background: decision === 'KEEP' ? C.green : C.gold, color: '#15101D', '--tw-ring-color': C.green }}><Check className="mr-1 inline h-3.5 w-3.5" /> Keep</button>
                    <button type="button" onClick={() => setDecision(concept.id, 'CHANGE_REQUESTED')} aria-pressed={decision === 'CHANGE_REQUESTED'} className="rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: decision === 'CHANGE_REQUESTED' ? C.gold : C.line, color: decision === 'CHANGE_REQUESTED' ? C.gold : C.cream, background: decision === 'CHANGE_REQUESTED' ? `${C.gold}0D` : 'transparent', '--tw-ring-color': C.gold }}><X className="mr-1 inline h-3.5 w-3.5" /> Request change</button>
                    <button type="button" onClick={() => replaceDirection(concept.id)} className="rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, background: `${C.purple}0D`, '--tw-ring-color': C.purple }}><RefreshCcw className="mr-1 inline h-3.5 w-3.5" /> Replace direction</button>
                  </div>
                  {decision === 'CHANGE_REQUESTED' && <label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold" style={{ color: C.gold }}>What should change?</span><textarea value={changeNotes[concept.id] || ''} onChange={(event) => setChangeNotes((items) => ({ ...items, [concept.id]: event.target.value }))} rows={3} placeholder="Different category, more premium, simplify the artwork direction…" className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2" style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.gold }} /></label>}
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" style={{ color: C.gold }} /><h2 className="text-lg font-black">Validation before anything becomes real</h2></div>
            <p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>The proposal experience can capture preference. It cannot create verified commercial facts or production authority.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{REQUIRED_VALIDATIONS.map((item) => <div key={item} className="flex gap-2 rounded-2xl border p-3 text-xs leading-5" style={{ borderColor: C.line, background: '#0F0A17', color: C.cream }}><span style={{ color: C.gold }}>•</span><span>{item}</span></div>)}</div>
          </div>

          <div className="rounded-3xl border p-5 sm:p-6" style={{ background: status === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? `${C.green}0A` : C.panel, borderColor: status === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? C.green : C.line }}>
            <div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5" style={{ color: C.green }} /><h2 className="text-lg font-black">Controlled next step</h2></div>
            <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Prepare the local decision packet for a human/source-validation step. This does not send or approve anything.</p>
            <button type="button" onClick={prepareHandoff} disabled={!keptCount} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}>Prepare human validation handoff <ArrowRight className="h-4 w-4" /></button>
            {!keptCount && <p className="mt-2 text-[11px]" style={{ color: C.gold }}>Keep at least one direction before preparing the handoff.</p>}
            {status === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' && <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${C.green}66`, background: `${C.green}0C` }}><div className="text-xs font-bold" style={{ color: C.green }}>Local handoff packet ready</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Human validation is the ceiling. External sharing, pricing verification, commerce, artwork approval, and production remain separately gated.</p></div>}
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border p-5" style={{ background: C.panel2, borderColor: C.line }}>
            <div className="flex items-center gap-2"><History className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-lg font-black">Proposal version history</h2></div>
            <div className="mt-4 space-y-2"><div className="rounded-xl border p-3" style={{ borderColor: C.purple, background: `${C.purple}0D` }}><div className="text-xs font-bold">Current — v{version}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>{conceptIds.length} directions · {keptCount} kept · {changeCount} change requests</div></div>{previousVersions.length === 0 && <p className="text-xs leading-5" style={{ color: C.muted }}>Replacing a direction preserves the current packet before creating the next proposal version.</p>}{previousVersions.map((item) => <div key={`${item.version}-${item.preservedAt}`} className="rounded-xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-xs font-bold">Preserved — v{item.version}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>{item.conceptIds.length} directions · {Object.values(item.decisions).filter((value) => value === 'KEEP').length} kept</div></div>)}</div>
          </div>

          <details className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
            <summary className="cursor-pointer list-none text-lg font-black focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.purple }}><ClipboardCheck className="mr-2 inline h-5 w-5" style={{ color: C.purpleLt }} />Local decision evidence</summary>
            <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Session-local only. Each transition records actor, time, prior state, new state, object, and reason.</p>
            <div className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">{audit.map((event, index) => <div key={`${event.eventTime}-${index}`} className="rounded-xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="flex flex-wrap justify-between gap-2"><span className="text-[10px] font-bold" style={{ color: C.purpleLt }}>{event.action}</span><span className="text-[10px]" style={{ color: C.muted }}>{new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><div className="mt-1 text-[10px]" style={{ color: C.gold }}>{event.priorState} → {event.newState}</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.cream }}>{event.reason}</p></div>)}</div>
          </details>
        </section>

        <footer className="mt-8 border-t py-6 text-center text-[11px] leading-5" style={{ borderColor: C.line, color: C.muted }}>SWAGR AI · PROPOSAL-001 isolated synthetic proposal-review candidate · Session-local state only · No live commercial claims · No production authority</footer>
      </div>
    </main>
  );
}
