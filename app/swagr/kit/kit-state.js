export const CAMPAIGN_KIT_KEY = 'swagr.campaignKit.v1';

export const KIT_REVIEW_DECISIONS = ['UNREVIEWED', 'KEEP', 'CHANGE_REQUESTED', 'HOLD'];
export const KIT_REVIEW_STATUSES = ['KIT_REVIEW', 'HANDOFF_READY_FOR_HUMAN_VALIDATION'];

function clean(value) {
  return String(value || '').trim();
}

function normalizeDecision(value) {
  return KIT_REVIEW_DECISIONS.includes(value) ? value : 'UNREVIEWED';
}

function normalizeReviewStatus(value) {
  return KIT_REVIEW_STATUSES.includes(value) ? value : 'KIT_REVIEW';
}

function normalizeNote(value) {
  return clean(value).slice(0, 280);
}

export function laneKey(value = '') {
  const text = clean(value).toLowerCase();
  if (text.includes('apparel') || text.includes('outerwear') || text.includes('knit')) return 'Apparel';
  if (text.includes('headwear')) return 'Headwear';
  if (text.includes('drinkware')) return 'Drinkware';
  if (text.includes('bag') || text.includes('tote') || text.includes('carry')) return 'Bags';
  if (text.includes('writing')) return 'Writing';
  if (text.includes('tech') || text.includes('charging') || text.includes('power bank')) return 'Tech';
  if (text.includes('safety') || text.includes('visibility')) return 'Safety';
  if (text.includes('event') || text.includes('lanyard') || text.includes('badge')) return 'Events';
  return clean(value);
}

export function conceptsForLane(concepts = [], lane = '') {
  const wanted = laneKey(lane);
  return concepts.filter((concept) => laneKey(concept?.category) === wanted);
}

function normalizePlacement(value) {
  return ['primary', 'secondary', 'alternate'].includes(value) ? value : 'primary';
}

function priorForSlot(previous, selected) {
  return previous?.items?.find((item) => item.ideaId === selected.ideaId || item.slot === selected.slot);
}

function normalizeStoredItem(item = {}) {
  return {
    ...item,
    decision: normalizeDecision(item.decision),
    decisionNote: normalizeNote(item.decisionNote),
    reviewedAt: clean(item.reviewedAt),
    placement: normalizePlacement(item.placement),
    markScale: Math.min(1.25, Math.max(0.75, Number(item.markScale) || 1)),
  };
}

export function summarizeKitReview(kit) {
  const items = Array.isArray(kit?.items) ? kit.items.map(normalizeStoredItem) : [];
  const total = items.length;
  const mapped = items.filter((item) => Boolean(item.conceptId)).length;
  const keep = items.filter((item) => item.decision === 'KEEP').length;
  const change = items.filter((item) => item.decision === 'CHANGE_REQUESTED').length;
  const hold = items.filter((item) => item.decision === 'HOLD').length;
  const unreviewed = items.filter((item) => item.decision === 'UNREVIEWED').length;
  const reviewed = total - unreviewed;
  const ready = total > 0 && mapped === total && keep === total;
  const storedStatus = normalizeReviewStatus(kit?.reviewStatus);
  const status = storedStatus === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' && ready
    ? storedStatus
    : 'KIT_REVIEW';
  return { total, mapped, reviewed, keep, change, hold, unreviewed, ready, status };
}

export function buildCampaignKit({ focus, concepts = [], previous = null } = {}) {
  const selected = Array.isArray(focus?.selected) ? focus.selected : [];
  const items = selected.map((mixItem, index) => {
    const lane = laneKey(mixItem.lane || mixItem.category);
    const candidates = conceptsForLane(concepts, lane);
    const prior = priorForSlot(previous, mixItem);
    const preserved = candidates.find((concept) => concept.id === prior?.conceptId);
    const concept = preserved || candidates[0] || null;
    const sameIdea = Boolean(prior && clean(prior.ideaId) === clean(mixItem.ideaId));
    const sameConcept = Boolean(sameIdea && preserved && preserved.id === prior?.conceptId);
    return {
      slot: Number(mixItem.slot) || index + 1,
      ideaId: clean(mixItem.ideaId),
      ideaName: clean(mixItem.name),
      category: clean(mixItem.category),
      lane,
      mixRole: clean(mixItem.mixRole) || 'Campaign support',
      conceptId: concept?.id || '',
      placement: normalizePlacement(prior?.placement),
      markScale: Math.min(1.25, Math.max(0.75, Number(prior?.markScale) || 1)),
      candidateCount: candidates.length,
      decision: sameConcept ? normalizeDecision(prior?.decision) : 'UNREVIEWED',
      decisionNote: sameConcept ? normalizeNote(prior?.decisionNote) : '',
      reviewedAt: sameConcept ? clean(prior?.reviewedAt) : '',
    };
  });
  const candidate = {
    schemaVersion: 1,
    persistence: 'SESSION_LOCAL_ONLY',
    truthState: 'CONCEPT_KIT_ONLY',
    source: 'SWAGR_MIX_DISCOVERY_FOCUS',
    campaignId: clean(focus?.campaignId),
    focusUpdatedAt: clean(focus?.updatedAt),
    reviewStatus: normalizeReviewStatus(previous?.reviewStatus),
    handoffAt: clean(previous?.handoffAt),
    updatedAt: new Date().toISOString(),
    items,
  };
  const review = summarizeKitReview(candidate);
  if (review.status !== 'HANDOFF_READY_FOR_HUMAN_VALIDATION') {
    candidate.reviewStatus = 'KIT_REVIEW';
    candidate.handoffAt = '';
  }
  return candidate;
}

export function saveCampaignKit(kit) {
  const review = summarizeKitReview(kit);
  const normalized = {
    ...kit,
    schemaVersion: 1,
    persistence: 'SESSION_LOCAL_ONLY',
    truthState: 'CONCEPT_KIT_ONLY',
    reviewStatus: review.status,
    handoffAt: review.status === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? clean(kit?.handoffAt) : '',
    items: Array.isArray(kit?.items) ? kit.items.map(normalizeStoredItem) : [],
    updatedAt: new Date().toISOString(),
  };
  try { sessionStorage.setItem(CAMPAIGN_KIT_KEY, JSON.stringify(normalized)); } catch { /* unavailable */ }
  return normalized;
}

export function loadCampaignKit({ campaignId = '' } = {}) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CAMPAIGN_KIT_KEY) || 'null');
    if (!parsed || parsed.schemaVersion !== 1 || parsed.persistence !== 'SESSION_LOCAL_ONLY') return null;
    if (!Array.isArray(parsed.items)) return null;
    const expected = clean(campaignId);
    if (expected && parsed.campaignId && expected !== parsed.campaignId) return null;
    const normalized = {
      ...parsed,
      reviewStatus: normalizeReviewStatus(parsed.reviewStatus),
      handoffAt: clean(parsed.handoffAt),
      items: parsed.items.map(normalizeStoredItem),
    };
    const review = summarizeKitReview(normalized);
    if (review.status !== 'HANDOFF_READY_FOR_HUMAN_VALIDATION') {
      normalized.reviewStatus = 'KIT_REVIEW';
      normalized.handoffAt = '';
    }
    return normalized;
  } catch {
    return null;
  }
}

export function clearCampaignKit() {
  try { sessionStorage.removeItem(CAMPAIGN_KIT_KEY); } catch { /* unavailable */ }
}

export function updateKitItem(kit, slot, changes = {}) {
  if (!kit) return kit;
  const now = new Date().toISOString();
  const next = {
    ...kit,
    reviewStatus: 'KIT_REVIEW',
    handoffAt: '',
    items: kit.items.map((item) => {
      if (item.slot !== slot) return normalizeStoredItem(item);
      const conceptChanged = Object.prototype.hasOwnProperty.call(changes, 'conceptId') && changes.conceptId !== item.conceptId;
      const decisionChanged = Object.prototype.hasOwnProperty.call(changes, 'decision');
      const nextDecision = conceptChanged
        ? 'UNREVIEWED'
        : normalizeDecision(changes.decision ?? item.decision);
      return normalizeStoredItem({
        ...item,
        ...changes,
        decision: nextDecision,
        decisionNote: conceptChanged ? '' : normalizeNote(changes.decisionNote ?? item.decisionNote),
        reviewedAt: conceptChanged || nextDecision === 'UNREVIEWED'
          ? ''
          : decisionChanged ? now : clean(item.reviewedAt),
      });
    }),
  };
  return next;
}

export function setKitReviewDecision(kit, slot, decision, decisionNote = '') {
  return updateKitItem(kit, slot, { decision, decisionNote });
}

export function markKitReadyForHumanValidation(kit) {
  const review = summarizeKitReview(kit);
  if (!review.ready) return kit;
  return {
    ...kit,
    reviewStatus: 'HANDOFF_READY_FOR_HUMAN_VALIDATION',
    handoffAt: new Date().toISOString(),
  };
}
