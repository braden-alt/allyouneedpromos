export const SWAGR_CAMPAIGNS_KEY = 'swagr.campaigns.v1';
export const SWAGR_ACTIVE_CAMPAIGN_KEY = 'swagr.activeCampaign.v1';
export const SWAGR_ACTIVE_BRIEF_KEY = 'swagr.activeBrief.v1';

const MAX_CAMPAIGNS = 8;
const MAX_VERSIONS = 8;

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
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
