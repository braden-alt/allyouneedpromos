// ============================================================================
// HM VERTEX GROUP — L2 RETAINER + SAVINGS SETTLEMENT ENGINE
// ----------------------------------------------------------------------------
// Claude Code is the sole owner of these workbook formulas and the evidence-
// gating logic below. This module encodes the leadership-selected L2 retainer
// structure on top of the approved savings methodology. The approved
// methodology itself (how a savings line becomes verified) is NOT changed here.
//
// Money math convention (matches the Quote Engine): round to cents with
// Math.round(x * 100) / 100.
//
// The two reconciliation identities this engine guarantees:
//   Client-Retained Savings Before Fixed Program Fees
//        = Verified Net Savings − Performance Fee
//   Client Net Benefit After Vertex Fees
//        = Client-Retained Savings Before Fixed Program Fees − Program Retainer
//
// Retainer is applied EXACTLY ONCE, only at the Net Benefit line, and only
// after the engagement has converted into an ongoing program. It is never part
// of Verified Net Savings and never part of the Performance Fee base.
// ============================================================================

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// ---------------------------------------------------------------------------
// L2 retainer tiers (leadership-selected structure). This is the canonical
// reference used to VALIDATE engagement inputs — it is never silently applied
// as a default (see resolveRetainer / Rule 7).
// ---------------------------------------------------------------------------
export const RETAINER_TIERS = Object.freeze({
  CORE:       { key: 'CORE',       label: 'Core Governance',       monthly: 5000 },
  GROWTH:     { key: 'GROWTH',     label: 'Growth Program',        monthly: 8500 },
  ENTERPRISE: { key: 'ENTERPRISE', label: 'Enterprise Governance', monthly: 15000 },
});

// ---------------------------------------------------------------------------
// Evidence statuses.
//
// A savings line may ONLY enter Verified Net Savings (and therefore the
// Performance Fee base) when its evidence is on the eligible allow-list.
// Everything else — including every barred category named in the L2 rules and
// any unrecognized status — is fail-closed: excluded from the fee base.
// ---------------------------------------------------------------------------
export const ELIGIBLE_EVIDENCE = Object.freeze([
  'VERIFIED',             // documented, actual, method A/B
  'DOCUMENTED_METHOD_C',  // Method C WITH documentation (only *Undocumented* Method C is barred)
]);

// Barred categories, mapped to the exact reason each is excluded (Rule 9).
export const BARRED_EVIDENCE = Object.freeze({
  BLOCKED:              'BLOCKED evidence',
  SOURCED_ESTIMATE:     'Sourced-Estimate',
  METHOD_C_UNDOCUMENTED: 'Undocumented Method C',
  PROJECTED_VOLUME:     'Projected volume',
  FICTIONAL:            'Fictional records',
  DISPUTED:             'Disputed savings',
});

export const isEligibleEvidence = (status) => ELIGIBLE_EVIDENCE.includes(status);

// ---------------------------------------------------------------------------
// Resolve the applicable monthly retainer from engagement-specific inputs.
//
// Rule 7 — nothing is silently defaulted:
//   • a missing / unknown tier is a blocker
//   • a missing retainer amount is a blocker (even though the tier is known)
// Rule 8 — engagement-specific commercial inputs control the calculation:
//   the engagement must declare the amount, and it must match the approved
//   L2 structure for the chosen tier (a mismatch is a blocker, not a silent
//   override).
// ---------------------------------------------------------------------------
export function resolveRetainer(tier, retainerMonthly) {
  if (tier === undefined || tier === null || tier === '') {
    return { ok: false, blocker: 'MISSING_TIER: retainer tier is required and must not be defaulted' };
  }
  const canonical = RETAINER_TIERS[tier];
  if (!canonical) {
    return { ok: false, blocker: `UNKNOWN_TIER: "${tier}" is not an approved L2 tier` };
  }
  if (retainerMonthly === undefined || retainerMonthly === null) {
    return { ok: false, blocker: 'MISSING_RETAINER_AMOUNT: engagement retainer amount is required and must not be defaulted' };
  }
  if (typeof retainerMonthly !== 'number' || !Number.isFinite(retainerMonthly) || retainerMonthly < 0) {
    return { ok: false, blocker: 'INVALID_RETAINER_AMOUNT: retainer amount must be a non-negative number' };
  }
  if (round2(retainerMonthly) !== canonical.monthly) {
    return {
      ok: false,
      blocker: `RETAINER_MISMATCH: ${tier} retainer must be ${canonical.monthly}, engagement provided ${retainerMonthly}`,
    };
  }
  return { ok: true, tier: canonical.key, label: canonical.label, monthly: canonical.monthly };
}

// ---------------------------------------------------------------------------
// Compute the full Vertex settlement for an engagement.
//
// inputs = {
//   tier,                 // 'CORE' | 'GROWTH' | 'ENTERPRISE'  (required)
//   retainerMonthly,      // engagement-specific amount        (required)
//   performanceFeeRate,   // e.g. 0.25                          (required)
//   programConverted,     // retainer applies only when true    (Rule 1)
//   savingsLines: [ { id, amount, evidence } ],
// }
//
// Returns a settlement object plus `blockers` (empty when clean) and an
// `internal` block that MUST NOT be surfaced in buyer-facing output (Rule 10).
// ---------------------------------------------------------------------------
export function computeVertexSettlement(inputs = {}) {
  const blockers = [];
  const {
    tier,
    retainerMonthly,
    performanceFeeRate,
    programConverted = false,
    savingsLines = [],
  } = inputs;

  // --- Commercial input gating (Rules 7 & 8) -----------------------------
  const retainer = resolveRetainer(tier, retainerMonthly);
  if (!retainer.ok) blockers.push(retainer.blocker);

  if (performanceFeeRate === undefined || performanceFeeRate === null) {
    blockers.push('MISSING_PERFORMANCE_FEE_RATE: engagement Performance Fee rate is required and must not be defaulted');
  } else if (typeof performanceFeeRate !== 'number' || !Number.isFinite(performanceFeeRate) || performanceFeeRate < 0) {
    blockers.push('INVALID_PERFORMANCE_FEE_RATE: Performance Fee rate must be a non-negative number');
  }

  // --- Evidence gating of savings lines (Rule 9) -------------------------
  // Fail-closed: only explicitly-eligible evidence contributes to Verified
  // Net Savings. Every barred/unknown line is excluded with a recorded reason.
  const eligibleLines = [];
  const excludedLines = [];
  for (const line of savingsLines) {
    const amount = round2(Number(line?.amount) || 0);
    if (isEligibleEvidence(line?.evidence)) {
      eligibleLines.push({ id: line.id, amount, evidence: line.evidence });
    } else {
      excludedLines.push({
        id: line?.id,
        amount,
        evidence: line?.evidence,
        reason: BARRED_EVIDENCE[line?.evidence] || `Unrecognized evidence status: ${String(line?.evidence)}`,
      });
    }
  }

  // --- Core methodology math ---------------------------------------------
  // Rule 3: the retainer is NOT part of Verified Net Savings.
  const verifiedNetSavings = round2(eligibleLines.reduce((sum, l) => sum + l.amount, 0));

  // Rule 9: the Performance Fee is derived ONLY from eligible verified savings.
  const rate = (typeof performanceFeeRate === 'number' && Number.isFinite(performanceFeeRate)) ? performanceFeeRate : 0;
  const performanceFee = round2(verifiedNetSavings * rate);

  // Rule 5.
  const clientRetainedBeforeFixedFees = round2(verifiedNetSavings - performanceFee);

  // Rule 1: retainer begins only after conversion into an ongoing program.
  // Rule 4: it is deducted exactly once, here and nowhere else.
  const retainerApplied = (retainer.ok && programConverted) ? retainer.monthly : 0;

  // Rule 6.
  const clientNetBenefitAfterVertexFees = round2(clientRetainedBeforeFixedFees - retainerApplied);

  return {
    ok: blockers.length === 0,
    blockers,

    // Buyer-safe settlement figures.
    tier: retainer.ok ? retainer.tier : null,
    tierLabel: retainer.ok ? retainer.label : null,
    programConverted: !!programConverted,
    retainerMonthly: retainer.ok ? retainer.monthly : null,
    retainerApplied,

    verifiedNetSavings,
    performanceFee,
    clientRetainedBeforeFixedFees,
    clientNetBenefitAfterVertexFees,

    // Internal-only — never expose in buyer-facing assets (Rule 10).
    internal: {
      performanceFeeRate: rate,
      eligibleLines,
      excludedLines,
    },
  };
}
