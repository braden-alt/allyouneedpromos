'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, CircleAlert, Save, ShieldCheck } from 'lucide-react';
import ConceptVisual from '../../concept-visual';
import { loadBrandProfile } from '../../brand-profile';
import { loadActiveCampaign } from '../../campaign-store';
import { SWAGR_GOVERNED_CONCEPTS } from '../../coverage/catalog';
import {
  loadCampaignKit,
  markKitReadyForHumanValidation,
  saveCampaignKit,
  setKitReviewDecision,
  summarizeKitReview,
  updateKitItem,
} from '../kit-state';

const C = {
  bg: '#0D0913', panel: '#171022', panel2: '#1E162B', line: '#342844',
  cream: '#F1EAD8', muted: '#A99FB7', purple: '#6C47FF', purpleLt: '#B7A8FF',
  gold: '#F5C842', green: '#34D399', red: '#FB7185',
};

const DECISIONS = [
  ['KEEP', 'Keep', C.green],
  ['CHANGE_REQUESTED', 'Change', C.gold],
  ['HOLD', 'Hold', C.purpleLt],
];

function conceptById(id) {
  return SWAGR_GOVERNED_CONCEPTS.find((concept) => concept.id === id) || null;
}

function Pill({ children, tone = 'neutral' }) {
  const map = {
    neutral: [C.cream, C.line, '#120C1A'],
    good: [C.green, `${C.green}55`, `${C.green}10`],
    warn: [C.gold, `${C.gold}55`, `${C.gold}10`],
    purple: [C.purpleLt, `${C.purple}66`, `${C.purple}14`],
  };
  const [color, borderColor, background] = map[tone] || map.neutral;
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em]" style={{ color, borderColor, background }}>{children}</span>;
}

function decisionTone(decision) {
  if (decision === 'KEEP') return 'good';
  if (decision === 'CHANGE_REQUESTED') return 'warn';
  if (decision === 'HOLD') return 'purple';
  return 'neutral';
}

export default function SwagrCampaignKitReview() {
  const [kit, setKit] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [brand, setBrand] = useState(null);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const activeCampaign = loadActiveCampaign();
    const nextKit = loadCampaignKit({ campaignId: activeCampaign?.id || '' });
    setCampaign(activeCampaign);
    setBrand(loadBrandProfile());
    setKit(nextKit);
    setLoaded(true);
  }, []);

  const review = useMemo(() => summarizeKitReview(kit), [kit]);

  const persist = (next, note = '') => {
    const saved = saveCampaignKit(next);
    setKit(saved);
    if (note) setMessage(note);
    return saved;
  };

  const choose = (item, decision) => {
    persist(
      setKitReviewDecision(kit, item.slot, decision, decision === item.decision ? item.decisionNote : ''),
      `Slot ${item.slot} marked ${decision === 'CHANGE_REQUESTED' ? 'Change' : decision === 'HOLD' ? 'Hold' : 'Keep'} for this browser session.`
    );
  };

  const note = (item, value) => {
    setKit((current) => updateKitItem(current, item.slot, { decisionNote: value }));
  };

  const saveNote = (item) => {
    if (!kit) return;
    persist(kit, `Slot ${item.slot} note saved locally.`);
  };

  const markReady = () => {
    if (!review.ready || !kit) return;
    persist(markKitReadyForHumanValidation(kit), 'Kit marked ready for a later governed human-validation step. Nothing was sent externally.');
  };

  if (!loaded) return <main className="min-h-screen p-8" style={{ background: C.bg, color: C.cream }}>Loading SWAGR kit review…</main>;

  if (!kit?.items?.length) {
    return (
      <main className="min-h-screen" style={{ background: C.bg, color: C.cream }}>
        <div className="mx-auto max-w-3xl px-5 py-16">
          <Link href="/swagr/kit" className="inline-flex items-center gap-2 text-xs font-black" style={{ color: C.purpleLt }}><ArrowLeft className="h-4 w-4" /> Campaign Kit</Link>
          <section className="mt-6 rounded-[32px] border p-8" style={{ borderColor: C.line, background: C.panel }}>
            <Pill tone="warn">Saved kit needed</Pill>
            <h1 className="mt-4 text-3xl font-black text-white">Save the visual kit first.</h1>
            <p className="mt-3 text-sm leading-7" style={{ color: C.muted }}>This review workspace only evaluates the current session-local Campaign Kit. It will not invent a kit or promote a planning direction into a live product.</p>
            <Link href="/swagr/kit" className="mt-6 inline-flex rounded-xl px-4 py-3 text-xs font-black" style={{ background: C.gold, color: '#17101F' }}>Open Campaign Kit</Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: `radial-gradient(circle at 10% 0%, ${C.purple}20, transparent 30%), ${C.bg}`, color: C.cream }}>
      <header className="border-b" style={{ borderColor: C.line, background: 'rgba(13,9,19,.96)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <Link href="/swagr/kit" aria-label="Back to campaign kit" className="flex h-10 w-10 items-center justify-center rounded-2xl border outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link>
            <div><div className="text-sm font-black text-white">SWAGR AI</div><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Campaign Kit Review</div></div>
          </div>
          <button type="button" onClick={() => persist(kit, 'Kit review saved in this browser session only.')} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-black outline-none focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}><Save className="h-4 w-4" /> Save review</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-[32px] border p-6 sm:p-8" style={{ borderColor: `${C.purple}55`, background: C.panel }}>
          <div className="flex flex-wrap gap-2"><Pill tone="purple">Decision continuity</Pill><Pill>{review.reviewed}/{review.total} reviewed</Pill><Pill tone={review.ready ? 'good' : 'warn'}>{review.ready ? 'All current directions kept' : 'Review still open'}</Pill></div>
          <h1 className="mt-4 max-w-4xl text-3xl font-black text-white sm:text-5xl">Keep the campaign decision attached to the visual.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7" style={{ color: C.muted }}>Review each current concept direction as Keep, Change, or Hold. Decisions stay session-local and are invalidated when the underlying concept changes, so SWAGR cannot silently carry an approval onto a different visual.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Pill>{campaign?.title || 'Session campaign'}</Pill><Pill tone="good">{review.mapped}/{review.total} mapped</Pill></div>
        </section>

        <section className="mt-5 rounded-3xl border p-5" style={{ borderColor: `${C.gold}55`, background: `${C.gold}08` }}>
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} /><p className="text-[11px] leading-5" style={{ color: C.muted }}><strong style={{ color: C.gold }}>Local Keep is not product, quote, artwork, proof, or production approval.</strong> Live SKU identity, price, inventory, MOQ, lead time, decoration feasibility, imprint geometry, supplier approval, and final production proof remain governed validation steps.</p></div>
        </section>

        {message && <div role="status" aria-live="polite" className="mt-5 rounded-2xl border px-4 py-3 text-xs" style={{ borderColor: `${C.green}55`, color: C.green }}>{message}</div>}

        <section className="mt-6 grid gap-5 lg:grid-cols-2" aria-label="Campaign kit review cards">
          {kit.items.map((item) => {
            const concept = conceptById(item.conceptId);
            return (
              <article key={`${item.slot}-${item.ideaId}-${item.conceptId}`} className="overflow-hidden rounded-[28px] border" style={{ borderColor: C.line, background: C.panel }}>
                <div className="flex items-start justify-between gap-3 border-b p-5" style={{ borderColor: C.line }}>
                  <div><div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.gold }}>Slot {item.slot} · {item.mixRole}</div><h2 className="mt-2 text-xl font-black text-white">{concept?.name || `${item.lane} direction unavailable`}</h2><p className="mt-1 text-xs" style={{ color: C.muted }}>{item.ideaName || item.category} · {item.lane}</p></div>
                  <Pill tone={decisionTone(item.decision)}>{item.decision === 'CHANGE_REQUESTED' ? 'Change' : item.decision === 'UNREVIEWED' ? 'Unreviewed' : item.decision}</Pill>
                </div>
                <div className="p-5">
                  {concept ? <ConceptVisual concept={concept} compact brandAsset={brand?.logoDataUrl || ''} brandName={brand?.brandName || campaign?.brand?.brandName || 'YOUR MARK'} placement={item.placement} markScale={item.markScale} conceptLabel={`Slot ${item.slot} review concept`} /> : <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-dashed p-6 text-center text-xs" style={{ borderColor: C.line, color: C.muted }}>No governed concept is currently mapped.</div>}

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {DECISIONS.map(([value, label, accent]) => {
                      const active = item.decision === value;
                      return <button key={value} type="button" aria-pressed={active} onClick={() => choose(item, value)} disabled={!concept} className="min-h-11 rounded-xl border px-2 text-xs font-black outline-none disabled:opacity-40 focus:ring-2" style={{ borderColor: active ? accent : C.line, background: active ? `${accent}18` : C.panel2, color: active ? accent : C.cream, '--tw-ring-color': accent }}>{label}</button>;
                    })}
                  </div>

                  {(item.decision === 'CHANGE_REQUESTED' || item.decision === 'HOLD') && <div className="mt-4"><label htmlFor={`review-note-${item.slot}`} className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>{item.decision === 'CHANGE_REQUESTED' ? 'What should change?' : 'Why hold it?'}</label><textarea id={`review-note-${item.slot}`} rows={2} maxLength={280} value={item.decisionNote || ''} onChange={(event) => note(item, event.target.value)} onBlur={() => saveNote(item)} className="mt-2 w-full rounded-xl border px-3 py-2 text-xs leading-5 outline-none focus:ring-2" style={{ borderColor: C.line, background: C.panel2, color: C.cream, '--tw-ring-color': C.purple }} placeholder="Optional session-local note" /></div>}

                  <div className="mt-4 flex items-start gap-2 text-[11px] leading-5" style={{ color: C.muted }}>{concept ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.green }} /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.gold }} />}<span>{concept ? 'Current governed synthetic concept is present. Decision applies only to this exact concept direction.' : 'No mapped concept; this slot cannot be marked ready.'}</span></div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-6 rounded-[28px] border p-5 sm:p-6" style={{ borderColor: kit.reviewStatus === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? `${C.green}66` : `${C.purple}55`, background: kit.reviewStatus === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? `${C.green}08` : `${C.purple}08` }}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl"><Pill tone={kit.reviewStatus === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? 'good' : 'purple'}>{kit.reviewStatus === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? 'Local handoff ready' : 'Kit review in progress'}</Pill><h2 className="mt-3 text-2xl font-black text-white">Preserve the current selection before human validation.</h2><p className="mt-2 text-xs leading-6" style={{ color: C.muted }}>{kit.reviewStatus === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? 'Every current mapped direction is explicitly kept. Nothing has been sent, priced, ordered, or approved for production.' : 'All mapped slots must be explicitly kept before this session can be marked ready for a later human-validation step.'}</p></div>
            <button type="button" onClick={markReady} disabled={!review.ready || kit.reviewStatus === 'HANDOFF_READY_FOR_HUMAN_VALIDATION'} className="min-h-11 rounded-xl px-4 text-xs font-black outline-none disabled:cursor-not-allowed disabled:opacity-45 focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}>Mark ready for human validation</button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl border p-3" style={{ borderColor: C.line }}><div className="text-xl font-black" style={{ color: C.green }}>{review.keep}</div><div className="text-[10px] uppercase" style={{ color: C.muted }}>Keep</div></div><div className="rounded-2xl border p-3" style={{ borderColor: C.line }}><div className="text-xl font-black" style={{ color: C.gold }}>{review.change}</div><div className="text-[10px] uppercase" style={{ color: C.muted }}>Change</div></div><div className="rounded-2xl border p-3" style={{ borderColor: C.line }}><div className="text-xl font-black" style={{ color: C.purpleLt }}>{review.hold}</div><div className="text-[10px] uppercase" style={{ color: C.muted }}>Hold</div></div><div className="rounded-2xl border p-3" style={{ borderColor: C.line }}><div className="text-xl font-black text-white">{review.unreviewed}</div><div className="text-[10px] uppercase" style={{ color: C.muted }}>Unreviewed</div></div></div>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t py-6 text-[11px]" style={{ borderColor: C.line, color: C.muted }}><div>SWAGR AI · session-local campaign-kit review only.</div><div className="flex gap-4"><Link href="/swagr/kit" className="font-black" style={{ color: C.purpleLt }}>Visual kit</Link><Link href="/swagr" className="font-black" style={{ color: C.purpleLt }}>Journey hub</Link></div></footer>
      </div>
    </main>
  );
}
