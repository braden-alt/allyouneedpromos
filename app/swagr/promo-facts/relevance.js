const RELEVANCE_RULES = {
  'market-2025-sales': {
    keywords: ['campaign', 'marketing', 'event', 'conference', 'recruit', 'client', 'employee', 'awareness'],
    reason: 'Useful as broad channel context when planning a branded-merchandise campaign, but it does not predict demand for this campaign.',
  },
  'market-q4-2025': {
    keywords: ['campaign', 'marketing', 'event', 'conference', 'seasonal', 'year end', 'q4', 'awareness'],
    reason: 'A dated market pulse can help frame timing conversations, while current supplier and buyer conditions still need separate validation.',
  },
  'retention-usefulness-2025': {
    keywords: ['employee', 'onboarding', 'client', 'gift', 'gifting', 'event', 'recruit', 'conference', 'useful', 'utility', 'practical', 'repeat', 'daily'],
    reason: 'This campaign context points toward repeat-use or utility considerations, so the usefulness research may be a relevant planning check.',
  },
  'quality-look-feel-2025': {
    keywords: ['premium', 'client', 'gift', 'gifting', 'executive', 'polished', 'quality', 'brand', 'recruit', 'employee', 'apparel'],
    reason: 'The campaign language suggests brand presentation or perceived quality matters, making look-and-feel research relevant to concept selection.',
  },
  'quality-rejection-2025': {
    keywords: ['giveaway', 'event', 'conference', 'recruit', 'bulk', 'high volume', 'generic', 'quality', 'cheap', 'budget', 'employee'],
    reason: 'This campaign may face quality or sameness risk, so rejection signals are useful as a guardrail before narrowing product directions.',
  },
  'brand-action-2025': {
    keywords: ['awareness', 'marketing', 'lead', 'event', 'conference', 'client', 'customer', 'prospect', 'launch', 'brand', 'recruit'],
    reason: 'The campaign appears connected to brand discovery or downstream action, so this self-reported behavior research can inform planning without implying causation.',
  },
  'audience-apparel-2025': {
    keywords: ['apparel', 'shirt', 'hoodie', 'jacket', 'employee', 'team', 'onboarding', 'recruit', 'gen z', 'millennial', 'workwear', 'uniform'],
    reason: 'The campaign audience or concept language overlaps apparel or team-wear use cases, so the category-preference research may help challenge or support the mix.',
  },
  'retention-five-years-2021': {
    keywords: ['retention', 'employee', 'client', 'gift', 'gifting', 'evergreen', 'repeat', 'useful', 'utility', 'long term'],
    reason: 'The campaign suggests a retention or longer-use objective, so this older study can provide directional context when clearly labeled by date.',
  },
  'sustainability-carbon-2026': {
    keywords: ['sustainability', 'sustainable', 'eco', 'environment', 'esg', 'carbon', 'recycled', 'responsible', 'green'],
    reason: 'The campaign language includes sustainability-related intent, so the channel-level carbon research may be relevant while item-level claims remain out of scope.',
  },
};

function clean(value) {
  return String(value || '').trim().toLowerCase();
}

function contextParts(campaign) {
  if (!campaign || typeof campaign !== 'object') return [];
  const brief = campaign.brief || {};
  const decision = campaign.decisionContext || {};
  return [
    campaign.title,
    campaign.objective,
    campaign.notes,
    brief.audience,
    brief.useCase,
    brief.location,
    brief.style,
    decision.activeConceptId,
    ...(Array.isArray(decision.pinnedConceptIds) ? decision.pinnedConceptIds : []),
  ].map(clean).filter(Boolean);
}

export function buildCampaignResearchContext(campaign) {
  const parts = contextParts(campaign);
  return {
    hasCampaign: parts.length > 0,
    text: parts.join(' | '),
    campaignTitle: String(campaign?.title || '').trim(),
    audience: String(campaign?.brief?.audience || '').trim(),
    useCase: String(campaign?.brief?.useCase || '').trim(),
    style: String(campaign?.brief?.style || '').trim(),
    activeConceptId: String(campaign?.decisionContext?.activeConceptId || '').trim(),
  };
}

export function scoreCampaignFactRelevance(fact, campaign) {
  const context = buildCampaignResearchContext(campaign);
  if (!context.hasCampaign) {
    return {
      score: 0,
      level: 'LIBRARY',
      matched: [],
      reason: 'No active campaign context is available. Showing the reviewed research library without campaign ranking.',
    };
  }

  const rule = RELEVANCE_RULES[fact?.id] || { keywords: [], reason: '' };
  const haystack = ` ${context.text} `;
  const matched = rule.keywords.filter((keyword) => haystack.includes(clean(keyword)));
  const score = Math.min(100, matched.length * 24 + (matched.length ? 12 : 0));
  const level = score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : score > 0 ? 'LOW' : 'GENERAL';

  return {
    score,
    level,
    matched: matched.slice(0, 4),
    reason: matched.length
      ? rule.reason
      : 'This reviewed signal is not specifically matched to the active campaign. Keep it as general research context rather than a campaign recommendation.',
  };
}

export function rankFactsForCampaign(facts, campaign) {
  return [...facts]
    .map((fact, originalIndex) => ({
      fact,
      originalIndex,
      relevance: scoreCampaignFactRelevance(fact, campaign),
    }))
    .sort((a, b) => b.relevance.score - a.relevance.score || a.originalIndex - b.originalIndex);
}

export const SWAGR_PROMO_RELEVANCE_META = {
  mode: 'SESSION_LOCAL_READ_ONLY_RULE_MATCHING',
  truthBoundary: 'Campaign relevance is a deterministic planning aid. It does not prove causation, product fit, availability, price, production feasibility, or campaign outcome.',
};
