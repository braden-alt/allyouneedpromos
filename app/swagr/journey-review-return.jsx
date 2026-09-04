'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { SWAGR_GOVERNED_CONCEPTS } from './coverage/catalog';
import { loadActiveCampaign } from './campaign-store';

const C = {
  panel: '#171022', panel2: '#211938', line: '#352A46', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', muted: '#AAA0B8',
};

const REVIEW_RETURN_OUTCOMES = {
  CONTINUE_DISCUSSION: {
    label: 'Continue discussion',
    detail: 'The direction returned from the controlled review flow for more human discussion.',
    tone: C.green,
  },
  REQUEST_REVISION: {
    label: 'Revision requested',
    detail: 'The direction returned with a bounded request for another reversible local revision pass.',
    tone: C.purpleLt,
  },
  DEFER_DIRECTION: {
    label: 'Direction deferred',
    detail: 'The direction returned to the campaign journey without approval, rejection, or production authority.',
    tone: C.gold,
  },
};

const RELATION_STATES = {
  MATCHES_ACTIVE_CAMPAIGN_DIRECTION: {
    label: 'Matches active campaign direction',
    detail: 'The reviewed direction matches the governed concept currently recorded in the active campaign.',
    tone: C.green,
  },
  DIFFERS_FROM_ACTIVE_CAMPAIGN_DIRECTION: {
    label: 'Differs from active campaign direction',
    detail: 'The reviewed direction and the governed concept currently recorded in the active campaign are different. No change is made automatically.',
    tone: C.gold,
  },
  NO_ACTIVE_GOVERNED_DIRECTION: {
    label: 'No active governed direction',
    detail: 'There is no currently recognized governed concept recorded as the active campaign direction. The reviewed direction remains review context only.',
    tone: C.muted,
  },
};

function relationFor(concept, campaign) {
  const activeConceptId = campaign?.decisionContext?.activeConceptId || '';
  const activeConcept = SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === activeConceptId) || null;

  if (!activeConcept) {
    return {
      key: 'NO_ACTIVE_GOVERNED_DIRECTION',
      activeConcept: null,
      meta: RELATION_STATES.NO_ACTIVE_GOVERNED_DIRECTION,
    };
  }

  if (activeConcept.id === concept.id) {
    return {
      key: 'MATCHES_ACTIVE_CAMPAIGN_DIRECTION',
      activeConcept,
      meta: RELATION_STATES.MATCHES_ACTIVE_CAMPAIGN_DIRECTION,
    };
  }

  return {
    key: 'DIFFERS_FROM_ACTIVE_CAMPAIGN_DIRECTION',
    activeConcept,
    meta: RELATION_STATES.DIFFERS_FROM_ACTIVE_CAMPAIGN_DIRECTION,
  };
}

function safeNextStep(outcome, reviewHref) {
  if (outcome === 'REQUEST_REVISION') {
    return {
      label: 'Open controlled revision review',
      detail: 'Return to the controlled review workspace where the existing reversible revision path is available.',
      href: reviewHref,
    };
  }

  if (outcome === 'DEFER_DIRECTION') {
    return {
      label: 'Open campaign workspace',
      detail: 'Leave the reviewed direction preserved as context and continue campaign planning without changing the active direction.',
      href: '/swagr/campaign',
    };
  }

  return {
    label: 'Continue controlled discussion',
    detail: 'Return to the controlled review workspace with the reviewed direction preserved for human discussion.',
    href: reviewHref,
  };
}

export default function JourneyReviewReturn() {
  const pathname = usePathname();
  const [reviewReturn, setReviewReturn] = useState(null);

  useEffect(() => {
    if (pathname !== '/swagr') {
      setReviewReturn(null);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const conceptId = params.get('reviewConcept') || '';
    const outcome = params.get('reviewOutcome') || '';
    const concept = SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === conceptId) || null;
    const outcomeMeta = REVIEW_RETURN_OUTCOMES[outcome] || null;

    if (!concept || !outcomeMeta) {
      setReviewReturn(null);
      return;
    }

    const campaign = loadActiveCampaign();
    const relation = relationFor(concept, campaign);
    setReviewReturn({ concept, outcome, outcomeMeta, campaign, relation });
  }, [pathname]);

  if (pathname !== '/swagr' || !reviewReturn) return null;

  const reviewHref = `/swagr/virtual/assembled?concept=${encodeURIComponent(reviewReturn.concept.id)}`;
  const nextStep = safeNextStep(reviewReturn.outcome, reviewHref);
  const relation = reviewReturn.relation;

  return <section data-testid="swagr-campaign-review-return" className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: C.line, background: '#0F0917' }} aria-label="Review returned to campaign">
    <div className="mx-auto max-w-7xl rounded-[28px] border p-5 sm:p-6" style={{ borderColor: `${reviewReturn.outcomeMeta.tone}66`, background: 'linear-gradient(135deg, rgba(108,71,255,.10), rgba(23,16,34,.98))' }}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]" style={{ borderColor: `${C.green}55`, color: C.green, background: `${C.green}0D` }}><CheckCircle2 className="h-3.5 w-3.5" /> Review returned to campaign</span>
            <span className="rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]" style={{ borderColor: C.line, color: C.muted }}>Validated transient context</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white">{reviewReturn.concept.name}</h2>
          <div className="mt-2 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]" style={{ borderColor: `${reviewReturn.outcomeMeta.tone}55`, color: reviewReturn.outcomeMeta.tone, background: `${reviewReturn.outcomeMeta.tone}0D` }}>{reviewReturn.outcomeMeta.label}</div>
          <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: C.muted }}>{reviewReturn.outcomeMeta.detail}</p>
          <p className="mt-2 text-[10px] leading-5" style={{ color: C.muted }}>Only the governed concept ID and one bounded review outcome were carried back. Reviewer notes, supplier facts, commercial data, approval semantics, and production authority are not transported in this return bridge.</p>
        </div>

        <div className="min-w-[260px] rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel2 }}>
          <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Return packet</div>
          <div className="mt-2 text-sm font-black" style={{ color: C.cream }}>{reviewReturn.concept.id}</div>
          <div className="mt-1 text-[10px] font-black" style={{ color: reviewReturn.outcomeMeta.tone }}>{reviewReturn.outcome}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={reviewHref} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-white outline-none focus:ring-2" style={{ background: C.purple, '--tw-ring-color': C.purpleLt }}>Back to controlled review <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/swagr" onClick={() => setReviewReturn(null)} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.purple }}><RotateCcw className="h-4 w-4" /> Clear return context</Link>
          </div>
        </div>
      </div>

      <div data-testid="swagr-returned-review-context-lens" className="mt-5 rounded-[24px] border p-4 sm:p-5" style={{ borderColor: `${relation.meta.tone}55`, background: '#130D1C' }}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: C.muted }}>Returned review campaign context lens</div>
            <div className="mt-2 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]" style={{ borderColor: `${relation.meta.tone}55`, color: relation.meta.tone, background: `${relation.meta.tone}0D` }}>{relation.meta.label}</div>
            <p className="mt-3 text-sm leading-6" style={{ color: C.muted }}>{relation.meta.detail}</p>
          </div>
          <div className="min-w-[260px] rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel2 }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Active campaign</div>
            <div className="mt-2 text-sm font-black" style={{ color: C.cream }}>{reviewReturn.campaign?.title || 'No active campaign'}</div>
            <div className="mt-1 text-[10px]" style={{ color: C.muted }}>{reviewReturn.campaign ? `Version ${reviewReturn.campaign.version}` : 'No session-local campaign context found.'}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Returned reviewed direction</div>
            <div className="mt-2 text-sm font-black" style={{ color: C.cream }}>{reviewReturn.concept.name}</div>
            <div className="mt-1 text-[10px] font-black" style={{ color: C.purpleLt }}>{reviewReturn.concept.id}</div>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.muted }}>Current active governed direction</div>
            <div className="mt-2 text-sm font-black" style={{ color: C.cream }}>{relation.activeConcept?.name || 'None recorded'}</div>
            <div className="mt-1 text-[10px] font-black" style={{ color: relation.activeConcept ? C.gold : C.muted }}>{relation.activeConcept?.id || 'NO_ACTIVE_GOVERNED_DIRECTION'}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${C.purple}55`, background: `${C.purple}08` }}>
          <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Safe next navigation from {reviewReturn.outcomeMeta.label}</div>
          <div className="mt-2 text-sm font-black" style={{ color: C.cream }}>{nextStep.label}</div>
          <p className="mt-1 text-[10px] leading-5" style={{ color: C.muted }}>{nextStep.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={nextStep.href} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-white outline-none focus:ring-2" style={{ background: C.purple, '--tw-ring-color': C.purpleLt }}>{nextStep.label} <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/swagr/campaign" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Campaign workspace</Link>
            <Link href="/swagr/library" className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Governed discovery</Link>
            <Link href={reviewHref} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Controlled review</Link>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border p-3 text-[10px] leading-5" style={{ borderColor: `${C.gold}44`, background: `${C.gold}07`, color: C.muted }}>
        This continuity lens reads the existing session-local campaign direction only. It does not mutate the active campaign decision, select a product, retain reviewer notes, call a supplier/customer system, create a quote/order/payment, approve artwork/proof, or authorize production.
      </div>
    </div>
  </section>;
}
