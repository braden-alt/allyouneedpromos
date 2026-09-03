'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SWAGR_FIXTURES } from '../swagr-lab/fixtures';
import { getRequirementGaps } from '../swagr-lab/engine';
import { loadActiveBrief, loadActiveCampaign } from './campaign-store';

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

function readSnapshot() {
  const campaign = loadActiveCampaign();
  const brief = campaign?.brief || loadActiveBrief();
  const missing = brief ? getRequirementGaps(brief) : ['brief'];
  const context = campaign?.decisionContext || {};
  const pinnedConceptIds = Array.isArray(context.pinnedConceptIds) ? context.pinnedConceptIds : [];
  const activeConceptId = context.activeConceptId || '';
  const proposalReview = context.proposalReview || null;

  return {
    campaign,
    brief,
    missing,
    pinnedConceptIds,
    activeConceptId,
    proposalReview,
  };
}

function proposalLabel(review) {
  if (!review) return 'Not started';
  if (review.status === 'HANDOFF_READY_FOR_HUMAN_VALIDATION') return 'Human validation packet ready';
  return 'Customer review in progress';
}

function StepCard({ step, index }) {
  const tone = step.done ? C.green : step.current ? C.gold : C.muted;
  const background = step.done ? `${C.green}0F` : step.current ? `${C.gold}0D` : '#110B19';

  return (
    <Link
      href={step.href}
      aria-current={step.current ? 'step' : undefined}
      className="group rounded-2xl border p-3.5 outline-none motion-safe:transition motion-safe:hover:-translate-y-0.5 focus:ring-2"
      style={{ borderColor: step.done || step.current ? `${tone}66` : C.line, background, '--tw-ring-color': tone }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-black"
          style={{ borderColor: `${tone}66`, color: tone, background: `${tone}12` }}
        >
          {step.done ? '✓' : index + 1}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-black" style={{ color: step.done || step.current ? C.cream : C.muted }}>{step.label}</span>
          <span className="mt-1 block text-[10px] leading-4" style={{ color: C.muted }}>{step.detail}</span>
          <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.11em]" style={{ color: tone }}>
            {step.done ? 'Resume' : step.current ? 'Continue here' : 'Next'} →
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function JourneyHub() {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState(null);

  const refresh = useCallback(() => {
    if (pathname !== '/swagr') return;
    setSnapshot(readSnapshot());
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/swagr') {
      setSnapshot(null);
      return undefined;
    }

    refresh();
    let frame = null;
    const scheduleRefresh = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    };

    document.addEventListener('input', scheduleRefresh);
    document.addEventListener('change', scheduleRefresh);
    document.addEventListener('click', scheduleRefresh);
    window.addEventListener('focus', scheduleRefresh);
    window.addEventListener('pageshow', scheduleRefresh);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener('input', scheduleRefresh);
      document.removeEventListener('change', scheduleRefresh);
      document.removeEventListener('click', scheduleRefresh);
      window.removeEventListener('focus', scheduleRefresh);
      window.removeEventListener('pageshow', scheduleRefresh);
    };
  }, [pathname, refresh]);

  const model = useMemo(() => {
    if (!snapshot) return null;

    const campaign = snapshot.campaign;
    const briefComplete = Boolean(snapshot.brief) && snapshot.missing.length === 0;
    const campaignReady = Boolean(campaign);
    const pinnedCount = snapshot.pinnedConceptIds.length;
    const activeConcept = SWAGR_FIXTURES.find((fixture) => fixture.id === snapshot.activeConceptId) || null;
    const review = snapshot.proposalReview;
    const decisionCount = review
      ? Object.values(review.decisions || {}).filter((value) => value === 'KEEP' || value === 'CHANGE_REQUESTED').length
      : 0;

    const steps = [
      {
        label: 'Brief',
        done: briefComplete,
        href: campaignReady ? '/swagr/campaign' : '/swagr#swagr-main-experience',
        detail: briefComplete ? 'Planning requirements are complete.' : snapshot.brief ? `${snapshot.missing.length} required planning field${snapshot.missing.length === 1 ? '' : 's'} still missing.` : 'Capture audience, moment, quantity, budget, and timing.',
      },
      {
        label: 'Campaign',
        done: campaignReady,
        href: '/swagr/campaign',
        detail: campaignReady ? `${campaign.title} · v${campaign.version}` : 'Save the active brief into a reusable session-local campaign.',
      },
      {
        label: 'Discovery',
        done: pinnedCount > 0,
        href: '/swagr/library',
        detail: pinnedCount > 0 ? `${pinnedCount} governed direction${pinnedCount === 1 ? '' : 's'} pinned.` : 'Rank and pin governed synthetic product directions.',
      },
      {
        label: 'Virtual',
        done: Boolean(snapshot.activeConceptId),
        href: snapshot.activeConceptId ? `/swagr/virtual?concept=${encodeURIComponent(snapshot.activeConceptId)}` : '/swagr/virtual',
        detail: snapshot.activeConceptId ? `${activeConcept?.name || 'Saved concept direction'} is active.` : 'Open an instant concept direction. Concept-only, never a production proof.',
      },
      {
        label: 'Proposal',
        done: Boolean(review),
        href: review ? '/swagr/proposal' : '/swagr#swagr-main-experience',
        detail: review ? `${proposalLabel(review)}${decisionCount ? ` · ${decisionCount} decision${decisionCount === 1 ? '' : 's'}` : ''}.` : 'Create a shortlist, then prepare the controlled review packet.',
      },
    ];

    const firstIncomplete = steps.findIndex((step) => !step.done);
    const currentIndex = firstIncomplete === -1 ? 4 : firstIncomplete;
    const hydratedSteps = steps.map((step, index) => ({ ...step, current: index === currentIndex }));
    const doneCount = hydratedSteps.filter((step) => step.done).length;
    const resume = hydratedSteps[currentIndex];

    return {
      campaign,
      pinnedCount,
      activeConcept,
      activeConceptId: snapshot.activeConceptId,
      review,
      decisionCount,
      steps: hydratedSteps,
      doneCount,
      resume,
    };
  }, [snapshot]);

  if (pathname !== '/swagr' || !model) return null;

  return (
    <section className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: C.line, background: 'linear-gradient(180deg, #100A18 0%, #151020 100%)' }} aria-label="Continue your SWAGR campaign">
      <div className="mx-auto max-w-7xl rounded-[28px] border p-5 shadow-2xl sm:p-6" style={{ borderColor: `${C.purple}44`, background: C.panel }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]" style={{ borderColor: `${C.green}55`, color: C.green, background: `${C.green}0D` }}>Continue where you left off</span>
              <span className="rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: C.line, color: C.muted }}>Session local only</span>
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {model.campaign ? model.campaign.title : 'Turn this brief into an active SWAGR campaign'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: C.muted }}>
              SWAGR keeps the accepted planning context connected across brief, campaign, discovery, concept virtuals, and proposal review so you can resume the exact next useful step without rebuilding the session.
            </p>
          </div>

          <div className="min-w-[220px] rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel2 }}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Journey state</div>
                <div className="mt-1 text-2xl font-black text-white">{model.doneCount}/5</div>
              </div>
              <div className="text-right text-[10px] leading-4" style={{ color: C.muted }}>accepted local<br />planning stages</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: '#0F0A17' }}>
              <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${(model.doneCount / 5) * 100}%`, background: model.doneCount === 5 ? C.green : C.gold }} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          {model.steps.map((step, index) => <StepCard key={step.label} step={step} index={index} />)}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#110B19' }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Pinned directions</div>
            <div className="mt-1 text-xl font-black text-white">{model.pinnedCount}</div>
            <p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Governed synthetic directions retained for the active campaign.</p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#110B19' }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Current concept</div>
            <div className="mt-1 truncate text-sm font-black text-white">{model.activeConcept?.name || (model.activeConceptId ? 'Saved concept direction' : 'Not chosen yet')}</div>
            <p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Concept direction only. Production proof remains a separate controlled workflow.</p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#110B19' }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Proposal review</div>
            <div className="mt-1 text-sm font-black text-white">{proposalLabel(model.review)}</div>
            <p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>{model.decisionCount ? `${model.decisionCount} retained keep/change decision${model.decisionCount === 1 ? '' : 's'}.` : 'No retained customer decision packet yet.'}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}>
          <div>
            <div className="text-xs font-black" style={{ color: C.gold }}>Next useful action: {model.resume.label}</div>
            <p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>{model.resume.detail}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href={model.resume.href} className="rounded-xl px-4 py-2.5 text-xs font-black outline-none motion-safe:transition motion-safe:hover:-translate-y-0.5 focus:ring-2" style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}>Resume {model.resume.label} →</Link>
            <Link href="/swagr/campaign" className="rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purple }}>Campaign workspace</Link>
            <Link href="/swagr/ideas" className="rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Promo intelligence</Link>
          </div>
        </div>

        <div className="mt-4 text-[10px] leading-5" style={{ color: C.muted }}>
          Local planning truth only · no live price, inventory, supplier credential, order, external sharing, production approval, or production-art authority is created here. Nothing is sent externally by this journey hub.
        </div>
      </div>
    </section>
  );
}
