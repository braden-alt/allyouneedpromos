export const CAMPAIGN_KIT_KEY = 'swagr.campaignKit.v1';

function clean(value) {
  return String(value || '').trim();
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

export function buildCampaignKit({ focus, concepts = [], previous = null } = {}) {
  const selected = Array.isArray(focus?.selected) ? focus.selected : [];
  const items = selected.map((mixItem, index) => {
    const lane = laneKey(mixItem.lane || mixItem.category);
    const candidates = conceptsForLane(concepts, lane);
    const prior = priorForSlot(previous, mixItem);
    const preserved = candidates.find((concept) => concept.id === prior?.conceptId);
    const concept = preserved || candidates[0] || null;
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
    };
  });
  return {
    schemaVersion: 1,
    persistence: 'SESSION_LOCAL_ONLY',
    truthState: 'CONCEPT_KIT_ONLY',
    source: 'SWAGR_MIX_DISCOVERY_FOCUS',
    campaignId: clean(focus?.campaignId),
    focusUpdatedAt: clean(focus?.updatedAt),
    updatedAt: new Date().toISOString(),
    items,
  };
}

export function saveCampaignKit(kit) {
  const normalized = {
    ...kit,
    schemaVersion: 1,
    persistence: 'SESSION_LOCAL_ONLY',
    truthState: 'CONCEPT_KIT_ONLY',
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
    return parsed;
  } catch {
    return null;
  }
}

export function clearCampaignKit() {
  try { sessionStorage.removeItem(CAMPAIGN_KIT_KEY); } catch { /* unavailable */ }
}

export function updateKitItem(kit, slot, changes = {}) {
  if (!kit) return kit;
  return {
    ...kit,
    items: kit.items.map((item) => item.slot === slot ? {
      ...item,
      ...changes,
      placement: normalizePlacement(changes.placement ?? item.placement),
      markScale: Math.min(1.25, Math.max(0.75, Number(changes.markScale ?? item.markScale) || 1)),
    } : item),
  };
}
