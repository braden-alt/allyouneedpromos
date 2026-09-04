export const MIX_DISCOVERY_FOCUS_KEY = 'swagr.mixDiscoveryFocus.v1';

function clean(value) {
  return String(value || '').trim();
}

function normalizeSelected(selected = []) {
  return selected
    .filter((item) => item && typeof item === 'object')
    .slice(0, 5)
    .map((item, index) => ({
      ideaId: clean(item.ideaId || item.id),
      name: clean(item.name),
      category: clean(item.category),
      mixRole: clean(item.mixRole) || 'Campaign support',
      lane: clean(item.lane || item.libraryCoverage?.lane || item.category),
      slot: Number(item.slot) || index + 1,
    }))
    .filter((item) => item.ideaId && item.category);
}

export function buildMixDiscoveryFocus({ campaignId = '', selected = [], profileId = 'auto', targetCount = 4 } = {}) {
  const normalizedSelected = normalizeSelected(selected);
  return {
    schemaVersion: 1,
    persistence: 'SESSION_LOCAL_ONLY',
    source: 'SWAGR_MIX_PLANNER',
    truthState: 'CATEGORY_FOCUS_ONLY',
    campaignId: clean(campaignId),
    profileId: clean(profileId) || 'auto',
    targetCount: Math.min(5, Math.max(2, Number(targetCount) || 4)),
    selected: normalizedSelected,
    updatedAt: new Date().toISOString(),
  };
}
export function saveMixDiscoveryFocus(input) {
  const focus = buildMixDiscoveryFocus(input);
  try {
    if (focus.selected.length) sessionStorage.setItem(MIX_DISCOVERY_FOCUS_KEY, JSON.stringify(focus));
    else sessionStorage.removeItem(MIX_DISCOVERY_FOCUS_KEY);
  } catch {
    // Restricted browser contexts can disable sessionStorage.
  }
  return focus;
}

export function loadMixDiscoveryFocus({ campaignId = '' } = {}) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(MIX_DISCOVERY_FOCUS_KEY) || 'null');
    if (!parsed || parsed.schemaVersion !== 1 || parsed.persistence !== 'SESSION_LOCAL_ONLY') return null;
    const focus = buildMixDiscoveryFocus(parsed);
    focus.updatedAt = typeof parsed.updatedAt === 'string' ? parsed.updatedAt : focus.updatedAt;
    if (!focus.selected.length) return null;
    const expectedCampaignId = clean(campaignId);
    if (expectedCampaignId && focus.campaignId && expectedCampaignId !== focus.campaignId) return null;
    return focus;
  } catch {
    return null;
  }
}

export function clearMixDiscoveryFocus() {
  try { sessionStorage.removeItem(MIX_DISCOVERY_FOCUS_KEY); } catch { /* local storage unavailable */ }
}

export function scoreRecordForMixFocus(record, focus) {
  if (!focus?.selected?.length || !record) return { score: 0, matches: [] };
  const recordCategory = clean(record.categoryKey || record.category).toLowerCase();
  const recordFamily = clean(record.family).toLowerCase();
  const matches = focus.selected.filter((item) => {
    const category = clean(item.category).toLowerCase();
    const lane = clean(item.lane).toLowerCase();
    return recordCategory === category || recordCategory === lane || recordFamily.includes(category) || recordFamily.includes(lane);
  });
  const roleVariety = new Set(matches.map((item) => item.mixRole)).size;
  return {
    score: matches.length ? 24 + Math.min(12, matches.length * 4) + Math.min(4, roleVariety * 2) : 0,
    matches,
  };
}

export function summarizeMixFocus(focus) {
  if (!focus?.selected?.length) return { categories: [], roles: [] };
  return {
    categories: [...new Set(focus.selected.map((item) => item.category).filter(Boolean))],
    roles: [...new Set(focus.selected.map((item) => item.mixRole).filter(Boolean))],
  };
}

