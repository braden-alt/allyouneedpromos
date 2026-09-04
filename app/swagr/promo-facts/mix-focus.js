const FOCUS_BY_FACT_ID = {
  'market-2025-sales': {
    emphasis: 'Market context',
    categories: [],
    rationale: 'Use the growth signal as category-neutral context. It does not justify changing the campaign mix by itself.',
  },
  'market-q4-2025': {
    emphasis: 'Timing context',
    categories: [],
    rationale: 'Use the dated Q4 signal as a timing discussion prompt, not as a reason to force a product category.',
  },
  'retention-usefulness-2025': {
    emphasis: 'Daily utility',
    categories: ['Drinkware', 'Tech', 'Writing', 'Bags'],
    rationale: 'Inspect repeat-use utility lanes first, then keep only directions that fit the actual audience and campaign moment.',
  },
  'quality-look-feel-2025': {
    emphasis: 'Perceived quality',
    categories: ['Apparel', 'Drinkware', 'Bags', 'Headwear'],
    rationale: 'Give visible and tactile brand surfaces an explicit quality review instead of optimizing only for apparent unit cost.',
  },
  'quality-rejection-2025': {
    emphasis: 'Quality filter',
    categories: ['Apparel', 'Drinkware', 'Bags', 'Headwear'],
    rationale: 'Use quality and originality as rejection checks before advancing a direction. No category is automatically approved.',
  },  'brand-action-2025': {
    emphasis: 'Brand attention',
    categories: ['Apparel', 'Drinkware', 'Headwear', 'Bags'],
    rationale: 'Favor directions with enough brand presence to support recognition, while treating the research as self-reported behavior rather than guaranteed lift.',
  },
  'audience-apparel-2025': {
    emphasis: 'Apparel audience fit',
    categories: ['Apparel', 'Headwear'],
    rationale: 'Inspect wearable identity lanes, then verify sizing, climate, distribution friction, and campaign fit before keeping them.',
  },
  'retention-five-years-2021': {
    emphasis: 'Long-term retention',
    categories: ['Drinkware', 'Tech', 'Bags', 'Apparel'],
    rationale: 'Look for durable, repeat-use directions, while keeping the older study date visible and avoiding a current-year retention claim.',
  },
  'sustainability-carbon-2026': {
    emphasis: 'Sustainability scrutiny',
    categories: [],
    rationale: 'Use the channel-level finding as a prompt to inspect material, manufacturing, freight, longevity, and disposal. Do not infer that a selected item is sustainable.',
  },
};

const CATEGORY_FALLBACK = {
  Retention: ['Drinkware', 'Tech', 'Bags', 'Writing'],
  Quality: ['Apparel', 'Drinkware', 'Bags', 'Headwear'],
  Audience: ['Apparel', 'Headwear'],
};
export function getPromoFactMixFocus(fact) {
  if (!fact) return null;
  const configured = FOCUS_BY_FACT_ID[fact.id] || {};
  const categories = configured.categories || CATEGORY_FALLBACK[fact.category] || [];
  return {
    factId: fact.id,
    emphasis: configured.emphasis || `${fact.category} context`,
    categories,
    mode: categories.length ? 'CATEGORY_LENS' : 'CONTEXT_ONLY',
    rationale: configured.rationale || fact.planningSignal,
    source: fact.source,
    signal: fact.signal,
    headline: fact.headline,
  };
}

export function researchFocusMatchesItem(focus, item) {
  if (!focus || !item || !focus.categories?.length) return false;
  return focus.categories.includes(item.category);
}

export const SWAGR_PROMO_MIX_FOCUS_META = {
  mode: 'TRANSIENT_QUERY_PARAM_RESEARCH_LENS',
  truthBoundary: 'Research emphasis only. It does not change campaign decisions, supplier facts, product truth, mix selections, pricing, inventory, artwork, proof state, quote/order/payment state, or production authority unless the user makes a separate explicit choice later.',
};
