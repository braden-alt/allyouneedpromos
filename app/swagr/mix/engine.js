import { rankIdeas } from '../ideas/engine';

export const MIX_TRUTH_NOTE = 'Planning mix only. Every direction still requires governed product, price, inventory, decoration, schedule, and production validation before quoting or production use.';

const PROFILE_DEFS = {
  balanced: {
    id: 'balanced',
    label: 'Balanced campaign',
    description: 'Spread the mix across identity, daily utility, carry, and a memorable support item.',
    preferredCategories: ['Drinkware', 'Apparel', 'Bags', 'Tech', 'Writing', 'Headwear', 'Events'],
    tags: ['daily use', 'everyday', 'gift', 'event'],
  },
  onboarding: {
    id: 'onboarding',
    label: 'Employee / onboarding',
    description: 'Prioritize keep-worthy identity, desk or commute utility, and kit-ready packaging.',
    preferredCategories: ['Apparel', 'Drinkware', 'Bags', 'Tech', 'Writing', 'Events', 'Headwear'],
    tags: ['employee', 'welcome kit', 'employee onboarding', 'office', 'daily use', 'gift'],
  },
  event: {
    id: 'event',
    label: 'Event / tradeshow',
    description: 'Balance high-distribution event utility with one or two stronger keep-after-the-event directions.',
    preferredCategories: ['Events', 'Writing', 'Drinkware', 'Bags', 'Apparel', 'Headwear', 'Tech'],
    tags: ['event', 'tradeshow', 'conference', 'budget', 'daily use'],
  },
  client: {
    id: 'client',
    label: 'Client / VIP gifting',
    description: 'Lean toward premium, useful, giftable directions while keeping the mix visually varied.',
    preferredCategories: ['Drinkware', 'Tech', 'Writing', 'Apparel', 'Events', 'Bags', 'Headwear'],
    tags: ['premium', 'gift', 'executive', 'high-end gift', 'lifestyle'],
  },
  field: {
    id: 'field',
    label: 'Field / crew',
    description: 'Prioritize field relevance, durable identity, hydration, carry, and safety-aware directions.',
    preferredCategories: ['Safety', 'Apparel', 'Headwear', 'Drinkware', 'Bags', 'Tech', 'Events'],
    tags: ['trades', 'construction', 'field service', 'crew gear', 'outdoor', 'daily use'],
  },
};

export const MIX_PROFILES = Object.values(PROFILE_DEFS);

const CATEGORY_ROLE = {
  Apparel: 'Identity layer',
  Headwear: 'Identity layer',
  Drinkware: 'Repeat-use utility',
  Tech: 'Repeat-use utility',
  Writing: 'Desk / event utility',
  Bags: 'Carry / kit anchor',
  Safety: 'Field requirement',
  Events: 'Campaign support',
};

const GOVERNED_LIBRARY_LANES = {
  Apparel: 'Apparel',
  Headwear: 'Headwear',
  Drinkware: 'Drinkware',
  Bags: 'Bags',
  Writing: 'Writing',
};

function cleanText(value) {
  return String(value || '').trim().toLowerCase();
}

function itemText(item) {
  return cleanText([item.name, item.category, item.description, item.decorationDirection, ...(item.tags || [])].join(' '));
}

function tagHits(item, profile) {
  const text = itemText(item);
  return profile.tags.filter((tag) => text.includes(cleanText(tag))).length;
}

function profileBoost(item, profile) {
  const index = profile.preferredCategories.indexOf(item.category);
  let score = index === -1 ? 0 : Math.max(2, 14 - index * 2);
  score += tagHits(item, profile) * 3;
  if (profile.id !== 'field' && item.category === 'Safety') score -= 16;
  if (profile.id === 'field' && item.category === 'Safety') score += 10;
  return score;
}

function noveltyBoost(item, selected) {
  const categories = new Set(selected.map((candidate) => candidate.category));
  const roles = new Set(selected.map((candidate) => CATEGORY_ROLE[candidate.category] || 'Support'));
  let score = categories.has(item.category) ? -5 : 10;
  const role = CATEGORY_ROLE[item.category] || 'Support';
  score += roles.has(role) ? -2 : 5;
  return score;
}

function normalizeTargetCount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(5, Math.max(2, Math.round(parsed))) : 4;
}

export function inferMixProfileId(brief = {}) {
  const text = cleanText([brief.audience, brief.useCase, brief.style].join(' '));
  if (/field|crew|jobsite|construction|industrial|trade|technician/.test(text)) return 'field';
  if (/onboard|welcome|employee|recruit|new hire|team kit/.test(text)) return 'onboarding';
  if (/conference|tradeshow|trade show|expo|booth|event/.test(text)) return 'event';
  if (/client|vip|executive|holiday|thank|gift/.test(text)) return 'client';
  return 'balanced';
}

export function getMixProfile(profileId, brief = {}) {
  const resolved = profileId === 'auto' || !PROFILE_DEFS[profileId] ? inferMixProfileId(brief) : profileId;
  return PROFILE_DEFS[resolved] || PROFILE_DEFS.balanced;
}

export function governedLibraryCoverage(item) {
  const lane = GOVERNED_LIBRARY_LANES[item.category];
  return lane
    ? { state: 'MAPPED', lane, note: `Current governed synthetic library has a ${lane} lane for controlled follow-up.` }
    : { state: 'GAP', lane: '', note: `${item.category} does not yet have a like-for-like governed synthetic lane in the current SWAGR library.` };
}

export function buildCampaignMix(catalog, brief = {}, pinnedIds = [], profileId = 'auto', targetCount = 4) {
  const target = normalizeTargetCount(targetCount);
  const profile = getMixProfile(profileId, brief);
  const ranked = rankIdeas(catalog, brief);
  const eligibleIds = new Set(ranked.map((item) => item.id));
  const blockedPins = pinnedIds.filter((id) => !eligibleIds.has(id) && catalog.some((item) => item.id === id));

  const selected = [];
  pinnedIds
    .map((id) => ranked.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, target)
    .forEach((item) => selected.push(item));

  while (selected.length < target) {
    const remaining = ranked.filter((item) => !selected.some((candidate) => candidate.id === item.id));
    if (!remaining.length) break;
    const scored = remaining
      .map((item) => ({
        item,
        score: item.fitScore + profileBoost(item, profile) + noveltyBoost(item, selected),
      }))
      .sort((a, b) => b.score - a.score || a.item.sortOrder - b.item.sortOrder);
    selected.push(scored[0].item);
  }

  const selectedIds = selected.map((item) => item.id);
  const alternates = ranked
    .filter((item) => !selectedIds.includes(item.id))
    .map((item) => ({
      ...item,
      mixCandidateScore: Number((item.fitScore + profileBoost(item, profile) + noveltyBoost(item, selected)).toFixed(1)),
      mixRole: CATEGORY_ROLE[item.category] || 'Support',
      libraryCoverage: governedLibraryCoverage(item),
    }))
    .sort((a, b) => b.mixCandidateScore - a.mixCandidateScore || a.sortOrder - b.sortOrder)
    .slice(0, 8);

  return {
    profile,
    targetCount: target,
    blockedPins,
    selected: selected.map((item, index) => ({
      ...item,
      mixRole: CATEGORY_ROLE[item.category] || 'Support',
      pinnedSource: pinnedIds.includes(item.id),
      slot: index + 1,
      libraryCoverage: governedLibraryCoverage(item),
    })),
    alternates,
  };
}

export function evaluateCampaignMix(catalog, selectedIds = [], brief = {}, pinnedIds = [], profileId = 'auto', targetCount = 4) {
  const target = normalizeTargetCount(targetCount);
  const profile = getMixProfile(profileId, brief);
  const ranked = rankIdeas(catalog, brief);
  const rankMap = new Map(ranked.map((item) => [item.id, item]));
  const selected = selectedIds
    .map((id) => rankMap.get(id) || catalog.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      mixRole: CATEGORY_ROLE[item.category] || 'Support',
      pinnedSource: pinnedIds.includes(item.id),
      slot: index + 1,
      libraryCoverage: governedLibraryCoverage(item),
      matchedSignals: item.matchedSignals || [],
      fitScore: item.fitScore || 0,
    }));

  const categories = new Set(selected.map((item) => item.category));
  const roles = new Set(selected.map((item) => item.mixRole));
  const mapped = selected.filter((item) => item.libraryCoverage.state === 'MAPPED').length;
  const signaled = selected.filter((item) => item.matchedSignals?.length).length;
  const preferred = selected.filter((item) => profile.preferredCategories.includes(item.category)).length;
  const pinnedUsed = selected.filter((item) => pinnedIds.includes(item.id)).length;

  const diversityScore = selected.length ? Math.min(35, (categories.size / selected.length) * 35) : 0;
  const roleScore = selected.length ? Math.min(20, (roles.size / selected.length) * 20) : 0;
  const profileScore = selected.length ? (preferred / selected.length) * 20 : 0;
  const relevanceScore = selected.length ? (signaled / selected.length) * 15 : 0;
  const coverageScore = selected.length ? (mapped / selected.length) * 10 : 0;
  const score = Math.round(diversityScore + roleScore + profileScore + relevanceScore + coverageScore);

  const warnings = [];
  if (selected.length < target) warnings.push(`Mix has ${selected.length} direction${selected.length === 1 ? '' : 's'}; target is ${target}.`);
  if (selected.length && categories.size <= Math.ceil(selected.length / 2)) warnings.push('Category concentration is high; consider a different utility or identity lane.');
  if (selected.length && roles.size < Math.min(3, selected.length)) warnings.push('The current mix repeats similar jobs; add a different role to improve campaign balance.');
  if (selected.some((item) => item.category === 'Safety') && profile.id !== 'field') warnings.push('A safety direction is present outside a field/crew profile; verify it is intentional.');
  if (selected.some((item) => item.libraryCoverage.state === 'GAP')) warnings.push('At least one selected direction exposes a governed-library coverage gap; keep it planning-only until a controlled lane exists.');
  if (!pinnedUsed && pinnedIds.length) warnings.push('None of the currently selected directions use the existing inspiration pins.');
  if (!selected.length) warnings.push('Choose or generate at least two planning directions.');

  return {
    profile,
    targetCount: target,
    selected,
    score: Math.max(0, Math.min(100, score)),
    metrics: {
      categoryVariety: categories.size,
      roleVariety: roles.size,
      mappedCoverage: mapped,
      signaledFit: signaled,
      pinnedUsed,
    },
    warnings,
    coverageGaps: selected.filter((item) => item.libraryCoverage.state === 'GAP'),
  };
}
