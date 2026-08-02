import { describe, it, expect } from 'vitest';
import {
  RETAINER_TIERS,
  ELIGIBLE_EVIDENCE,
  BARRED_EVIDENCE,
  isEligibleEvidence,
  resolveRetainer,
  computeVertexSettlement,
} from './retainer.js';

// A clean, converted engagement with a single fully-verified savings line.
// Reused across cases so tier/retainer behavior is the only variable.
const engagement = (overrides = {}) => ({
  tier: 'CORE',
  retainerMonthly: 5000,
  performanceFeeRate: 0.25,
  programConverted: true,
  savingsLines: [{ id: 'S1', amount: 100000, evidence: 'VERIFIED' }],
  ...overrides,
});

describe('L2 retainer tiers', () => {
  it('encodes the leadership-selected structure exactly', () => {
    expect(RETAINER_TIERS.CORE.monthly).toBe(5000);
    expect(RETAINER_TIERS.GROWTH.monthly).toBe(8500);
    expect(RETAINER_TIERS.ENTERPRISE.monthly).toBe(15000);
    expect(RETAINER_TIERS.CORE.label).toBe('Core Governance');
    expect(RETAINER_TIERS.GROWTH.label).toBe('Growth Program');
    expect(RETAINER_TIERS.ENTERPRISE.label).toBe('Enterprise Governance');
  });
});

describe('Core tier', () => {
  it('applies the $5,000 Core Governance retainer once, after conversion', () => {
    const r = computeVertexSettlement(engagement({ tier: 'CORE', retainerMonthly: 5000 }));
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('CORE');
    expect(r.retainerApplied).toBe(5000);
    // 100000 verified − 25000 fee = 75000 retained − 5000 retainer = 70000
    expect(r.verifiedNetSavings).toBe(100000);
    expect(r.performanceFee).toBe(25000);
    expect(r.clientRetainedBeforeFixedFees).toBe(75000);
    expect(r.clientNetBenefitAfterVertexFees).toBe(70000);
  });
});

describe('Growth tier', () => {
  it('applies the $8,500 Growth Program retainer', () => {
    const r = computeVertexSettlement(engagement({ tier: 'GROWTH', retainerMonthly: 8500 }));
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('GROWTH');
    expect(r.retainerApplied).toBe(8500);
    expect(r.clientRetainedBeforeFixedFees).toBe(75000);
    expect(r.clientNetBenefitAfterVertexFees).toBe(66500); // 75000 − 8500
  });
});

describe('Enterprise tier', () => {
  it('applies the $15,000 Enterprise Governance retainer', () => {
    const r = computeVertexSettlement(engagement({ tier: 'ENTERPRISE', retainerMonthly: 15000 }));
    expect(r.ok).toBe(true);
    expect(r.tier).toBe('ENTERPRISE');
    expect(r.retainerApplied).toBe(15000);
    expect(r.clientRetainedBeforeFixedFees).toBe(75000);
    expect(r.clientNetBenefitAfterVertexFees).toBe(60000); // 75000 − 15000
  });
});

describe('Missing tier (Rule 7 — no silent default)', () => {
  it('blocks when tier is omitted', () => {
    const r = computeVertexSettlement(engagement({ tier: undefined }));
    expect(r.ok).toBe(false);
    expect(r.blockers.some((b) => b.startsWith('MISSING_TIER'))).toBe(true);
    expect(r.tier).toBeNull();
    expect(r.retainerApplied).toBe(0);
  });

  it('blocks when tier is not an approved L2 tier', () => {
    const r = computeVertexSettlement(engagement({ tier: 'PLATINUM' }));
    expect(r.ok).toBe(false);
    expect(r.blockers.some((b) => b.startsWith('UNKNOWN_TIER'))).toBe(true);
  });

  it('resolveRetainer refuses to invent a tier', () => {
    expect(resolveRetainer(undefined, 5000).ok).toBe(false);
    expect(resolveRetainer('', 5000).ok).toBe(false);
  });
});

describe('Missing retainer amount (Rule 7 & 8)', () => {
  it('blocks when the engagement omits the retainer amount, even though the tier is known', () => {
    const r = computeVertexSettlement(engagement({ tier: 'CORE', retainerMonthly: undefined }));
    expect(r.ok).toBe(false);
    expect(r.blockers.some((b) => b.startsWith('MISSING_RETAINER_AMOUNT'))).toBe(true);
    expect(r.retainerApplied).toBe(0);
  });

  it('blocks when the provided amount does not match the approved tier structure', () => {
    const r = computeVertexSettlement(engagement({ tier: 'CORE', retainerMonthly: 4000 }));
    expect(r.ok).toBe(false);
    expect(r.blockers.some((b) => b.startsWith('RETAINER_MISMATCH'))).toBe(true);
  });

  it('engagement-specific input controls: correct amount for the tier passes', () => {
    expect(resolveRetainer('GROWTH', 8500).ok).toBe(true);
    expect(resolveRetainer('GROWTH', 5000).ok).toBe(false); // Core amount on a Growth tier is a mismatch
  });
});

describe('BLOCKED evidence (Rule 9)', () => {
  it('never contributes to Verified Net Savings or the Performance Fee', () => {
    const r = computeVertexSettlement(engagement({
      savingsLines: [
        { id: 'S1', amount: 100000, evidence: 'VERIFIED' },
        { id: 'S2', amount: 50000, evidence: 'BLOCKED' },
      ],
    }));
    expect(r.verifiedNetSavings).toBe(100000); // BLOCKED 50000 excluded
    expect(r.performanceFee).toBe(25000);
    expect(r.internal.excludedLines).toEqual([
      expect.objectContaining({ id: 'S2', evidence: 'BLOCKED', reason: 'BLOCKED evidence' }),
    ]);
  });
});

describe('Sourced-Estimate (Rule 9)', () => {
  it('is excluded from the Performance Fee base', () => {
    const r = computeVertexSettlement(engagement({
      savingsLines: [
        { id: 'S1', amount: 80000, evidence: 'VERIFIED' },
        { id: 'S2', amount: 40000, evidence: 'SOURCED_ESTIMATE' },
      ],
    }));
    expect(r.verifiedNetSavings).toBe(80000);
    expect(r.performanceFee).toBe(20000);
    expect(r.internal.excludedLines[0].reason).toBe('Sourced-Estimate');
  });
});

describe('Undocumented Method C vs documented Method C (Rule 9)', () => {
  it('bars Undocumented Method C but allows documented Method C', () => {
    const r = computeVertexSettlement(engagement({
      savingsLines: [
        { id: 'S1', amount: 60000, evidence: 'DOCUMENTED_METHOD_C' },
        { id: 'S2', amount: 30000, evidence: 'METHOD_C_UNDOCUMENTED' },
      ],
    }));
    expect(r.verifiedNetSavings).toBe(60000); // documented counts, undocumented does not
    expect(r.internal.excludedLines[0].reason).toBe('Undocumented Method C');
  });
});

describe('Projected volume and fictional demonstration data (Rule 9)', () => {
  it('excludes projected volume', () => {
    const r = computeVertexSettlement(engagement({
      savingsLines: [{ id: 'S1', amount: 100000, evidence: 'PROJECTED_VOLUME' }],
    }));
    expect(r.verifiedNetSavings).toBe(0);
    expect(r.performanceFee).toBe(0);
    expect(r.internal.excludedLines[0].reason).toBe('Projected volume');
  });

  it('excludes fictional demonstration records so they can never generate a fee', () => {
    const r = computeVertexSettlement(engagement({
      savingsLines: [
        { id: 'REAL', amount: 20000, evidence: 'VERIFIED' },
        { id: 'DEMO', amount: 999999, evidence: 'FICTIONAL' },
      ],
    }));
    expect(r.verifiedNetSavings).toBe(20000);
    expect(r.performanceFee).toBe(5000);
    expect(r.internal.excludedLines[0].reason).toBe('Fictional records');
  });

  it('fail-closed: an unrecognized evidence status is excluded, not counted', () => {
    const r = computeVertexSettlement(engagement({
      savingsLines: [{ id: 'S1', amount: 100000, evidence: 'MYSTERY' }],
    }));
    expect(r.verifiedNetSavings).toBe(0);
    expect(r.internal.excludedLines[0].reason).toContain('Unrecognized evidence status');
  });
});

describe('Disputed savings (Rule 9)', () => {
  it('is excluded until resolved', () => {
    const r = computeVertexSettlement(engagement({
      savingsLines: [
        { id: 'S1', amount: 70000, evidence: 'VERIFIED' },
        { id: 'S2', amount: 25000, evidence: 'DISPUTED' },
      ],
    }));
    expect(r.verifiedNetSavings).toBe(70000);
    expect(r.performanceFee).toBe(17500);
    expect(r.internal.excludedLines[0].reason).toBe('Disputed savings');
  });
});

describe('No double deduction (Rules 2, 3, 4)', () => {
  it('keeps the retainer out of Verified Net Savings and the Performance Fee base', () => {
    const r = computeVertexSettlement(engagement({ tier: 'ENTERPRISE', retainerMonthly: 15000 }));
    // Verified Net Savings and the fee ignore the retainer entirely.
    expect(r.verifiedNetSavings).toBe(100000);
    expect(r.performanceFee).toBe(25000);
    // The retainer shows up once, only in Net Benefit.
    expect(r.clientRetainedBeforeFixedFees).toBe(75000);
    expect(r.clientNetBenefitAfterVertexFees).toBe(60000);
  });

  it('deducts the retainer exactly once (Net Benefit = Retained − one retainer)', () => {
    const r = computeVertexSettlement(engagement({ tier: 'GROWTH', retainerMonthly: 8500 }));
    const singleDeduction = r.clientRetainedBeforeFixedFees - r.retainerApplied;
    expect(r.clientNetBenefitAfterVertexFees).toBe(singleDeduction);
    // A double deduction would land at 58000; assert we are NOT there.
    expect(r.clientNetBenefitAfterVertexFees).not.toBe(75000 - 8500 - 8500);
  });

  it('applies no retainer before conversion into an ongoing program (Rule 1)', () => {
    const r = computeVertexSettlement(engagement({ programConverted: false }));
    expect(r.retainerApplied).toBe(0);
    // Before conversion, Net Benefit equals Retained-before-fees (no retainer yet).
    expect(r.clientNetBenefitAfterVertexFees).toBe(r.clientRetainedBeforeFixedFees);
    expect(r.clientNetBenefitAfterVertexFees).toBe(75000);
  });
});

describe('Client-Retained Savings reconciliation (Rule 5)', () => {
  it('equals Verified Net Savings − Performance Fee for many inputs', () => {
    const cases = [
      { amount: 100000, rate: 0.25 },
      { amount: 250000, rate: 0.3 },
      { amount: 33333.33, rate: 0.2 },
      { amount: 5000, rate: 0.5 },
    ];
    for (const c of cases) {
      const r = computeVertexSettlement(engagement({
        savingsLines: [{ id: 'S1', amount: c.amount, evidence: 'VERIFIED' }],
        performanceFeeRate: c.rate,
      }));
      expect(r.clientRetainedBeforeFixedFees).toBe(
        Math.round((r.verifiedNetSavings - r.performanceFee) * 100) / 100,
      );
    }
  });
});

describe('Client Net Benefit reconciliation (Rule 6)', () => {
  it('equals Client-Retained Savings − applicable retainer, end to end', () => {
    const r = computeVertexSettlement(engagement({ tier: 'ENTERPRISE', retainerMonthly: 15000 }));
    expect(r.clientNetBenefitAfterVertexFees).toBe(
      Math.round((r.clientRetainedBeforeFixedFees - r.retainerApplied) * 100) / 100,
    );
    // Full chain identity: Verified − Fee − Retainer.
    expect(r.clientNetBenefitAfterVertexFees).toBe(
      Math.round((r.verifiedNetSavings - r.performanceFee - r.retainerApplied) * 100) / 100,
    );
  });
});

describe('Internal-only fields are separated from buyer-safe output (Rule 10)', () => {
  it('keeps the fee rate and per-line evidence detail under `internal`', () => {
    const r = computeVertexSettlement(engagement());
    expect(r).not.toHaveProperty('performanceFeeRate');
    expect(r).not.toHaveProperty('eligibleLines');
    expect(r).not.toHaveProperty('excludedLines');
    expect(r.internal.performanceFeeRate).toBe(0.25);
    expect(Array.isArray(r.internal.eligibleLines)).toBe(true);
  });
});

describe('Evidence helper surface', () => {
  it('treats only the allow-list as eligible', () => {
    expect(ELIGIBLE_EVIDENCE).toContain('VERIFIED');
    expect(isEligibleEvidence('VERIFIED')).toBe(true);
    expect(isEligibleEvidence('DOCUMENTED_METHOD_C')).toBe(true);
    for (const barred of Object.keys(BARRED_EVIDENCE)) {
      expect(isEligibleEvidence(barred)).toBe(false);
    }
  });
});
