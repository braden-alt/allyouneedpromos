export const SWAGR_CAMPAIGNS_KEY = 'swagr.campaigns.v1';
export const SWAGR_ACTIVE_CAMPAIGN_KEY = 'swagr.activeCampaign.v1';
export const SWAGR_ACTIVE_BRIEF_KEY = 'swagr.activeBrief.v1';
export const SWAGR_LIBRARY_PINNED_KEY = 'swagr.libraryPinned.v1';
export const SWAGR_ACTIVE_CONCEPT_KEY = 'swagr.activeConcept.v1';
export const SWAGR_PROPOSAL_REVIEW_KEY = 'swagr.proposalReview.v1';

const MAX_CAMPAIGNS = 8;
const MAX_VERSIONS = 8;
const MAX_PINNED = 4;
const MAX_REVIEW_HISTORY = 6;
const MAX_AUDIT_EVENTS = 20;

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanIdArray(input, max = MAX_PINNED) {
  return Array.isArray(input)
    ? [...new Set(input.map((value) => cleanText(value, 120)).filter(Boolean))].slice(0, max)
    : [];
}

function normalizeBrief(input = {}) {
  return {
    audience: cleanText(input.audience, 160),
    useCase: cleanText(input.useCase, 160),
    quantity: cleanText(input.quantity, 80),
    budget: cleanText(input.budget, 80),
    inHandsDate: cleanText(input.inHandsDate, 40),
    location: cleanText(input.location, 160),
    style: cleanText(input.style, 240),
    exclusions: cleanText(input.exclusions, 300),
    source: 'SWAGR_CAMPAIGN_WORKSPACE',
    persistence: 'SESSION_LOCAL_ONLY',
  };
}

function normalizeBrandSnapshot(input = {}) {
  return {
    brandName: cleanText(input.brandName, 80) || 'Sample Brand',
    tagline: cleanText(input.tagline, 140),
    primaryColor: /^#[0-9a-f]{6}$/i.test(input.primaryColor || '') ? input.primaryColor.toUpperCase() : '#6C47FF',
    secondaryColor: /^#[0-9a-f]{6}$/i.test(input.secondaryColor || '') ? input.secondaryColor.toUpperCase() : '#F5C842',
    visualDirection: cleanText(input.visualDirection, 120),
    audienceNote: cleanText(input.audienceNote, 240),
    source: 'SWAGR_BRAND_KIT_SNAPSHOT',
  };
}

function normalizeReviewDecision(value) {
  return value === 'CHANGE_REQUESTED' ? 'CHANGE_REQUESTED' : value === 'KEEP' ? 'KEEP' : '';
}

function normalizeReviewStatus(value) {
  return value === 'HANDOFF_READY_FOR_HUMAN_VALIDATION' ? value : 'CUSTOMER_REVIEW';
}

function normalizeReviewSnapshot(input = {}) {
  const conceptIds = cleanIdArray(Array.isArray(input.conceptIds) ? input.conceptIds : input.selectedIds);
  const decisions = Object.fromEntries(
    conceptIds
      .map((id) => [id, normalizeReviewDecision(input.decisions?.[id])])
      .filter(([, value]) => Boolean(value))
  );
  const changeNotes = Object.fromEntries(
    conceptIds
      .map((id) => [id, cleanText(input.changeNotes?.[id], 500)])
      .filter(([, value]) => Boolean(value))
  );

  return {
    version: Number.isFinite(Number(input.version)) ? Math.max(1, Number(input.version)) : 1,
    conceptIds,
    decisions,
    changeNotes,
    status: normalizeReviewStatus(input.status),
    preservedAt: cleanText(input.preservedAt, 60),
  };
}

function normalizeAuditEvent(input = {}) {
  return {
    eventTime: cleanText(input.eventTime, 60),
    actor: cleanText(input.actor, 80),
    action: cleanText(input.action, 100),
    reason: cleanText(input.reason, 700),
    priorState: cleanText(input.priorState, 120),
    newState: cleanText(input.newState, 120),
    objectId: cleanText(input.objectId, 120),
  };
}

function normalizeProposalReview(input = {}) {
  const selectedIds = cleanIdArray(input.selectedIds);
  const decisions = Object.fromEntries(
    selectedIds
      .map((id) => [id, normalizeReviewDecision(input.decisions?.[id])])
      .filter(([, value]) => Boolean(value))
  );
  const changeNotes = Object.fromEntries(
    selectedIds
      .map((id) => [id, cleanText(input.changeNotes?.[id], 500)])
      .filter(([, value]) => Boolean(value))
  );

  return {
    schemaVersion: 1,
    persistence: 'SESSION_LOCAL_ONLY',
    sourceState: input.sourceState === 'CAPTURED_SHORTLIST' ? 'CAPTURED_SHORTLIST' : 'SYNTHETIC_REVIEW_FALLBACK',
    selectedIds,
    decisions,
    changeNotes,
    version: Number.isFinite(Number(input.version)) ? Math.max(1, Number(input.version)) : 1,
    previousVersions: Array.isArray(input.previousVersions)
      ? input.previousVersions.slice(0, MAX_REVIEW_HISTORY).map(normalizeReviewSnapshot)
      : [],
    status: normalizeReviewStatus(input.status),
    audit: Array.isArray(input.audit) ? input.audit.slice(0, MAX_AUDIT_EVENTS).map(normalizeAuditEvent) : [],
    updatedAt: cleanText(input.updatedAt, 60),
  };
}

function normalizeDecisionContext(input = {}) {
  const proposalReview = input.proposalReview && typeof input.proposalReview === 'object'
    ? normalizeProposalReview(input.proposalReview)
    : null;
  return {
    pinnedConceptIds: cleanIdArray(input.pinnedConceptIds),
    activeConceptId: cleanText(input.activeConceptId, 120),
    proposalReview,
    updatedAt: cleanText(input.updatedAt, 60),
    persistence: 'SESSION_LOCAL_ONLY',
  };
}

function normalizeVersion(input = {}) {
  return {
    version: Number.isFinite(Number(input.version)) ? Math.max(1, Number(input.version)) : 1,
    title: cleanText(input.title, 100),
    objective: cleanText(input.objective, 320),
    notes: cleanText(input.notes, 500),
    brief: normalizeBrief(input.brief),
    brand: normalizeBrandSnapshot(input.brand),
    savedAt: cleanText(input.savedAt, 60),
  };
}

export function normalizeCampaign(input = {}) {
  const versions = Array.isArray(input.versions)
    ? input.versions.slice(0, MAX_VERSIONS).map(normalizeVersion)
    : [];

  return {
    schemaVersion: 1,
    id: cleanText(input.id, 120),
    title: cleanText(input.title, 100) || 'Untitled campaign',
    objective: cleanText(input.objective, 320),
    notes: cleanText(input.notes, 500),
    status: input.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
    version: Number.isFinite(Number(input.version)) ? Math.max(1, Number(input.version)) : 1,
    brief: normalizeBrief(input.brief),
    brand: normalizeBrandSnapshot(input.brand),
    decisionContext: normalizeDecisionContext(input.decisionContext),
    versions,
    source: 'SWAGR_CAMPAIGN_WORKSPACE',
    persistence: 'SESSION_LOCAL_ONLY',
    createdAt: cleanText(input.createdAt, 60),
    updatedAt: cleanText(input.updatedAt, 60),
  };
}

export function loadCampaigns() {
  try {
    const raw = sessionStorage.getItem(SWAGR_CAMPAIGNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_CAMPAIGNS).map(normalizeCampaign) : [];
  } catch {
    return [];
  }
}

export function saveCampaigns(input) {
  const campaigns = Array.isArray(input)
    ? input.slice(0, MAX_CAMPAIGNS).map(normalizeCampaign)
    : [];
  try {
    sessionStorage.setItem(SWAGR_CAMPAIGNS_KEY, JSON.stringify(campaigns));
  } catch {
    // Restricted browser contexts may disable sessionStorage.
  }
  return campaigns;
}

export function loadActiveCampaignId() {
  try {
    return sessionStorage.getItem(SWAGR_ACTIVE_CAMPAIGN_KEY) || '';
  } catch {
    return '';
  }
}

export function loadActiveCampaign() {
  const activeId = loadActiveCampaignId();
  if (!activeId) return null;
  return loadCampaigns().find((campaign) => campaign.id === activeId) || null;
}

export function loadActiveCampaignDecisionContext() {
  return loadActiveCampaign()?.decisionContext || normalizeDecisionContext();
}

function updateActiveCampaignDecisionContext(patch = {}) {
  const activeId = loadActiveCampaignId();
  if (!activeId) return null;
  const campaigns = loadCampaigns();
  const existing = campaigns.find((campaign) => campaign.id === activeId);
  if (!existing) return null;

  const updated = normalizeCampaign({
    ...existing,
    decisionContext: {
      ...existing.decisionContext,
      ...patch,
      updatedAt: new Date().toISOString(),
    },
  });
  saveCampaigns([updated, ...campaigns.filter((campaign) => campaign.id !== activeId)]);
  return updated;
}

export function saveActiveCampaignPinnedConceptIds(ids) {
  const pinnedConceptIds = cleanIdArray(ids);
  try { sessionStorage.setItem(SWAGR_LIBRARY_PINNED_KEY, JSON.stringify(pinnedConceptIds)); } catch { /* session-only fallback */ }
  return updateActiveCampaignDecisionContext({ pinnedConceptIds });
}

export function saveActiveCampaignConceptId(id) {
  const activeConceptId = cleanText(id, 120);
  try {
    if (activeConceptId) sessionStorage.setItem(SWAGR_ACTIVE_CONCEPT_KEY, activeConceptId);
    else sessionStorage.removeItem(SWAGR_ACTIVE_CONCEPT_KEY);
  } catch { /* session-only fallback */ }
  return updateActiveCampaignDecisionContext({ activeConceptId });
}

export function saveActiveCampaignProposalReview(packet) {
  const proposalReview = normalizeProposalReview(packet);
  try { sessionStorage.setItem(SWAGR_PROPOSAL_REVIEW_KEY, JSON.stringify(packet)); } catch { /* session-only fallback */ }
  return updateActiveCampaignDecisionContext({ proposalReview });
}

export function activateCampaign(campaign) {
  const normalized = normalizeCampaign(campaign);
  try {
    sessionStorage.setItem(SWAGR_ACTIVE_CAMPAIGN_KEY, normalized.id);
    sessionStorage.setItem(SWAGR_ACTIVE_BRIEF_KEY, JSON.stringify({
      ...normalized.brief,
      campaignId: normalized.id,
      campaignVersion: normalized.version,
      campaignTitle: normalized.title,
      capturedAt: new Date().toISOString(),
    }));

    const decisionContext = normalized.decisionContext || normalizeDecisionContext();
    sessionStorage.setItem(SWAGR_LIBRARY_PINNED_KEY, JSON.stringify(decisionContext.pinnedConceptIds || []));
    if (decisionContext.activeConceptId) sessionStorage.setItem(SWAGR_ACTIVE_CONCEPT_KEY, decisionContext.activeConceptId);
    else sessionStorage.removeItem(SWAGR_ACTIVE_CONCEPT_KEY);

    if (decisionContext.proposalReview) {
      sessionStorage.setItem(SWAGR_PROPOSAL_REVIEW_KEY, JSON.stringify({
        ...decisionContext.proposalReview,
        requirements: normalized.brief,
        brandName: normalized.brand.brandName,
        brandAsset: '',
      }));
    } else {
      sessionStorage.removeItem(SWAGR_PROPOSAL_REVIEW_KEY);
    }
  } catch {
    // The workspace still operates visually if browser session storage is unavailable.
  }
  return normalized;
}

export function loadActiveBrief() {
  try {
    const raw = sessionStorage.getItem(SWAGR_ACTIVE_BRIEF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? normalizeBrief(parsed) : null;
  } catch {
    return null;
  }
}

export function makeCampaignId() {
  return `SWAGR-CAM-${Date.now().toString(36).toUpperCase()}`;
}

export function makeVersionSnapshot(campaign) {
  const normalized = normalizeCampaign(campaign);
  return normalizeVersion({
    version: normalized.version,
    title: normalized.title,
    objective: normalized.objective,
    notes: normalized.notes,
    brief: normalized.brief,
    brand: normalized.brand,
    savedAt: normalized.updatedAt || new Date().toISOString(),
  });
}
