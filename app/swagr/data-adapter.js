export const DATA_SCENARIOS = [
  {
    id: 'SYNTHETIC_CURRENT',
    label: 'Synthetic current',
    freshnessState: 'SYNTHETIC_CURRENT',
    sourceConfidence: 'PLANNING_ONLY',
    errorState: null,
  },
  {
    id: 'STALE_SIMULATION',
    label: 'Stale simulation',
    freshnessState: 'STALE_SIMULATION',
    sourceConfidence: 'STALE_SOURCE',
    errorState: 'SOURCE_STALE_SIMULATION',
  },
  {
    id: 'UNAVAILABLE_SIMULATION',
    label: 'Provider unavailable',
    freshnessState: 'UNAVAILABLE_SIMULATION',
    sourceConfidence: 'UNAVAILABLE',
    errorState: 'PROVIDER_UNAVAILABLE_SIMULATION',
  },
];

const SYNTHETIC_SAGE_RECORDS = {
  'SWAGR-CAT-001': 'SAGE-SYNTH-TEE-001',
  'SWAGR-CAT-002': 'SAGE-SYNTH-FLEECE-002',
  'SWAGR-CAT-003': 'SAGE-SYNTH-CAP-003',
  'SWAGR-CAT-004': 'SAGE-SYNTH-DRINKWARE-004',
  'SWAGR-CAT-005': 'SAGE-SYNTH-TOTE-005',
  'SWAGR-CAT-006': 'SAGE-SYNTH-WRITING-006',
};

export function getDataScenario(id = 'SYNTHETIC_CURRENT') {
  return DATA_SCENARIOS.find((scenario) => scenario.id === id) || DATA_SCENARIOS[0];
}

export function normalizeProviderRecord(record, scenarioId = 'SYNTHETIC_CURRENT') {
  const scenario = getDataScenario(scenarioId);
  const providerProductId = SYNTHETIC_SAGE_RECORDS[record.id] || null;
  const contractErrors = [];

  if (!record.id) contractErrors.push('MISSING_SWAGR_RECORD_ID');
  if (!providerProductId) contractErrors.push('MISSING_PROVIDER_PRODUCT_ID');
  if (!record.name) contractErrors.push('MISSING_PRODUCT_NAME');
  if (!record.category) contractErrors.push('MISSING_CATEGORY');

  const providerUnavailable = scenario.id === 'UNAVAILABLE_SIMULATION';
  const errorState = providerUnavailable
    ? scenario.errorState
    : contractErrors.length
      ? contractErrors.join('|')
      : scenario.errorState;
  return {
    ...record,
    providerState: {
      provider: 'SAGE_CONNECT_CANDIDATE',
      providerMode: 'SYNTHETIC_CONTRACT_ONLY',
      providerProductId,
      isLive: false,
      isVerified: false,
      sourceConfidence: errorState ? scenario.sourceConfidence : 'PLANNING_ONLY',
      freshnessState: scenario.freshnessState,
      priceState: 'PLANNING_ONLY',
      inventoryState: providerUnavailable ? 'UNAVAILABLE' : 'UNKNOWN',
      mediaState: 'CONCEPT_ONLY',
      usageRightsState: 'NOT_EVALUATED',
      sourceUpdatedAt: null,
      sourceVerifiedAt: null,
      fetchedAt: null,
      expiresAt: null,
      errorState,
    },
  };
}

export function buildProviderView(records, scenarioId = 'SYNTHETIC_CURRENT') {
  return records.map((record) => normalizeProviderRecord(record, scenarioId));
}

export function providerStateIsDegraded(providerState) {
  return Boolean(providerState?.errorState) || providerState?.freshnessState !== 'SYNTHETIC_CURRENT';
}
