'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, CheckCircle2, GitCompareArrows, RotateCcw } from 'lucide-react';
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

function reconciliationOptionsFor(concept, relation) {
  const sharedRemains = [
    'The bounded review outcome and returned governed concept identity remain visible.',
    'Campaign notes, supplier facts, pricing, reviewer notes, and controlled review lineage stay untouched.',
    'No product selection, quote, order, payment, artwork/proof approval, supplier authority, or production authority is created.',
  ];

  if (relation.key === 'MATCHES_ACTIVE_CAMPAIGN_DIRECTION') {
    return [{
      key: 'ALREADY_ALIGNED',
      label: 'Direction already aligned',
      tone: C.green,
      summary: 'The returned reviewed direction and the active governed campaign direction are already the same.',
      effects: [
        `The active governed direction remains ${concept.name}.`,
        'No reconciliation change would be necessary before the next human discussion.',
      ],
      remains: sharedRemains,
    }];
  }

  if (relation.key === 'DIFFERS_FROM_ACTIVE_CAMPAIGN_DIRECTION') {
    return [
      {
        key: 'KEEP_CURRENT',
        label: 'Keep current active direction',
        tone: C.gold,
        summary: `Preview the campaign continuing with ${relation.activeConcept.name} while ${concept.name} remains returned review context.`,
        effects: [
          `The active governed direction would remain ${relation.activeConcept.name}.`,
          `${concept.name} would remain visible as the returned reviewed direction only.`,
        ],
        remains: sharedRemains,
      },
      {
        key: 'CONTINUE_RETURNED',
        label: 'Continue with returned reviewed direction',
        tone: C.purpleLt,
        summary: `Preview what a later explicit human decision could mean if ${concept.name} replaced ${relation.activeConcept.name} as the active governed direction.`,
        effects: [
          `${concept.name} would become the candidate active governed direction only after a separate authorized human decision.`,
          `${relation.activeConcept.name} would remain the currently recorded direction until that later decision actually occurs.`,
        ],
        remains: sharedRemains,
      },
    ];
  }

  return [
    {
      key: 'KEEP_UNSET',
      label: 'Keep active direction unset',
      tone: C.muted,
      summary: `Preview the campaign remaining without an active governed direction while ${concept.name} stays returned review context.`,
      effects: [
        'No active governed direction would be introduced.',
        `${concept.name} would remain a reviewed direction available for later human discussion.`,
      ],
      remains: sharedRemains,
    },
    {
      key: 'CONTINUE_RETURNED',
      label: 'Continue with returned reviewed direction',
      tone: C.purpleLt,
      summary: `Preview ${concept.name} as the candidate direction a later explicit human decision could activate.`,
      effects: [
        `${concept.name} would remain a candidate only until a separate authorized human decision exists.`,
        'The active governed direction remains unset during this preview.',
      ],
      remains: sharedRemains,
    },
  ];
}

export default function JourneyReviewReturn() {
  const pathname = usePathname();
  const [reviewReturn, setReviewReturn] = useState(null);
  const [reconciliationPreview, setReconciliationPreview] = useState(null);
  const [stagedReconciliation, setStagedReconciliation] = useState(null);

  useEffect(() => {
    if (pathname !== '/swagr') {
      setReviewReturn(null);
      setReconciliationPreview(null);
      setStagedReconciliation(null);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const conceptId = params.get('reviewConcept') || '';
    const outcome = params.get('reviewOutcome') || '';
    const concept = SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === conceptId) || null;
    const outcomeMeta = REVIEW_RETURN_OUTCOMES[outcome] || null;

    if (!concept || !outcomeMeta) {
      setReviewReturn(null);
      setReconciliationPreview(null);
      setStagedReconciliation(null);
      return;
    }

    const campaign = loadActiveCampaign();
    const relation = relationFor(concept, campaign);
    const reconciliationOptions = reconciliationOptionsFor(concept, relation);
    setReviewReturn({ concept, outcome, outcomeMeta, campaign, relation });
    setReconciliationPreview(reconciliationOptions[0]?.key || null);
    setStagedReconciliation(null);
  }, [pathname]);

  if (pathname !== '/swagr' || !reviewReturn) return null;

  const reviewHref = `/swagr/virtual/assembled?concept=${encodeURIComponent(reviewReturn.concept.id)}`;
  const nextStep = safeNextStep(reviewReturn.outcome, reviewHref);
  const relation = reviewReturn.relation;
  const reconciliationOptions = reconciliationOptionsFor(reviewReturn.concept, relation);
  const selectedReconciliation = reconciliationOptions.find((option) => option.key === reconciliationPreview) || reconciliationOptions[0];
  const currentBinding = {
    returnedConceptId: reviewReturn.concept.id,
    activeConceptId: relation.activeConcept?.id || null,
    outcome: reviewReturn.outcome,
    relationKey: relation.key,
  };
  const stagedOption = stagedReconciliation
    ? reconciliationOptions.find((option) => option.key === stagedReconciliation.optionKey) || null
    : null;
  const stagedBindingIsCurrent = Boolean(stagedReconciliation
    && stagedReconciliation.returnedConceptId === currentBinding.returnedConceptId
    && stagedReconciliation.activeConceptId === currentBinding.activeConceptId
    && stagedReconciliation.outcome === currentBinding.outcome
    && stagedReconciliation.relationKey === currentBinding.relationKey
    && stagedOption);

  const stageSelectedReconciliation = () => {
    if (!selectedReconciliation) return;
    setStagedReconciliation({ ...currentBinding, optionKey: selectedReconciliation.key });
  };

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



        <div data-testid="swagr-returned-review-reconciliation-preview" className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${C.purple}55`, background: '#171022' }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: C.purpleLt }}><GitCompareArrows className="h-3.5 w-3.5" /> Returned review reconciliation preview</div>
              <h3 className="mt-2 text-lg font-black text-white">See the consequence before any campaign decision exists.</h3>
              <p className="mt-1 max-w-3xl text-xs leading-5" style={{ color: C.muted }}>These are page-local, read-only previews. Clicking a preview changes only the explanation below; it does not update the campaign, choose a product, persist a preference, or create approval authority.</p>
            </div>
            <span className="w-fit rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]" style={{ borderColor: `${C.green}44`, color: C.green, background: `${C.green}0A` }}>Preview only - no campaign write</span>
          </div>

          <div className={`mt-4 grid gap-3 ${reconciliationOptions.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {reconciliationOptions.map((option, index) => {
              const isPreviewing = selectedReconciliation?.key === option.key;
              return <button key={option.key} type="button" onClick={() => setReconciliationPreview(option.key)} className="rounded-2xl border p-4 text-left outline-none transition focus:ring-2" style={{ borderColor: isPreviewing ? option.tone : C.line, background: isPreviewing ? `${option.tone}10` : C.panel2, '--tw-ring-color': C.purpleLt }} aria-pressed={isPreviewing}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: option.tone }}>{reconciliationOptions.length > 1 ? `Preview path ${index + 1}` : 'Current relationship'}</div>
                    <div className="mt-2 text-sm font-black" style={{ color: C.cream }}>{option.label}</div>
                  </div>
                  <span className="rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em]" style={{ borderColor: isPreviewing ? `${option.tone}66` : C.line, color: isPreviewing ? option.tone : C.muted }}>{isPreviewing ? 'Previewing' : 'Preview'}</span>
                </div>
                <p className="mt-2 text-[10px] leading-5" style={{ color: C.muted }}>{option.summary}</p>
              </button>;
            })}
          </div>

          {selectedReconciliation && <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${selectedReconciliation.tone}55`, background: `${selectedReconciliation.tone}08` }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: selectedReconciliation.tone }}>Previewing: {selectedReconciliation.label}</div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: C.cream }}>Preview effect</div>
                <div className="mt-2 space-y-2">
                  {selectedReconciliation.effects.map((item) => <div key={item} className="flex gap-2 text-[10px] leading-5" style={{ color: C.muted }}><span aria-hidden="true" style={{ color: selectedReconciliation.tone }}>-</span><span>{item}</span></div>)}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: C.cream }}>Still unchanged</div>
                <div className="mt-2 space-y-2">
                  {selectedReconciliation.remains.map((item) => <div key={item} className="flex gap-2 text-[10px] leading-5" style={{ color: C.muted }}><span aria-hidden="true" style={{ color: C.green }}>-</span><span>{item}</span></div>)}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em]" style={{ borderColor: `${C.gold}44`, color: C.gold, background: `${C.gold}07` }}>No decision is applied here. A later explicit human decision surface would be required before any active campaign direction could change.</div>
          </div>}
        </div>

        <div data-testid="swagr-reconciliation-decision-staging" className="mt-4 rounded-2xl border p-4" style={{ borderColor: stagedBindingIsCurrent && stagedOption ? `${stagedOption.tone}66` : `${C.purple}55`, background: stagedBindingIsCurrent && stagedOption ? `${stagedOption.tone}08` : '#171022' }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.16em]" style={{ color: stagedBindingIsCurrent && stagedOption ? stagedOption.tone : C.purpleLt }}>Reconciliation decision staging</div>
              <h3 className="mt-2 text-lg font-black text-white">Stage human intent without applying a campaign decision.</h3>
              <p className="mt-1 max-w-3xl text-xs leading-5" style={{ color: C.muted }}>Staging is page-local and reversible. It binds the selected preview to this returned concept, the current active governed direction, the bounded review outcome, and the current relationship state.</p>
            </div>
            <span className="w-fit rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]" style={{ borderColor: stagedBindingIsCurrent && stagedOption ? `${stagedOption.tone}66` : C.line, color: stagedBindingIsCurrent && stagedOption ? stagedOption.tone : C.muted }}>{stagedBindingIsCurrent && stagedOption ? 'Intent staged locally' : 'No intent staged'}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={stageSelectedReconciliation} className="rounded-xl px-4 py-2.5 text-xs font-black text-white outline-none focus:ring-2" style={{ background: C.purple, '--tw-ring-color': C.purpleLt }}>{stagedBindingIsCurrent && stagedOption ? (stagedOption.key === selectedReconciliation?.key ? 'Re-stage current preview' : 'Change staged intent to this preview') : 'Stage this preview as intent'}</button>
            {stagedReconciliation && <button type="button" onClick={() => setStagedReconciliation(null)} className="rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.purpleLt }}>Clear staged intent</button>}
          </div>

          {stagedBindingIsCurrent && stagedOption ? <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${stagedOption.tone}55`, background: C.panel2 }}>
            <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: stagedOption.tone }}>Staged intent - not applied</div>
            <div className="mt-2 text-sm font-black" style={{ color: C.cream }}>{stagedOption.label}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border p-3" style={{ borderColor: C.line }}><div className="text-[8px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Returned concept</div><div className="mt-1 text-[10px] font-black" style={{ color: C.cream }}>{stagedReconciliation.returnedConceptId}</div></div>
              <div className="rounded-xl border p-3" style={{ borderColor: C.line }}><div className="text-[8px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Active concept at staging</div><div className="mt-1 text-[10px] font-black" style={{ color: C.cream }}>{stagedReconciliation.activeConceptId || 'NONE_RECORDED'}</div></div>
              <div className="rounded-xl border p-3" style={{ borderColor: C.line }}><div className="text-[8px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Review outcome</div><div className="mt-1 text-[10px] font-black" style={{ color: C.cream }}>{stagedReconciliation.outcome}</div></div>
              <div className="rounded-xl border p-3" style={{ borderColor: C.line }}><div className="text-[8px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Relationship</div><div className="mt-1 text-[10px] font-black" style={{ color: C.cream }}>{stagedReconciliation.relationKey}</div></div>
            </div>
          </div> : <div className="mt-4 rounded-xl border px-3 py-3 text-[10px] leading-5" style={{ borderColor: C.line, color: C.muted }}>Preview a reconciliation path above, then stage it here if you want to preserve your current human intent for this page session. Nothing is written back to the campaign.</div>}

          <div className="mt-3 rounded-xl border px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em]" style={{ borderColor: `${C.gold}44`, color: C.gold, background: `${C.gold}07` }}>Staged intent is not approval, not persistence, and not an applied campaign decision. A later explicit authorized apply surface would still be required.</div>
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
