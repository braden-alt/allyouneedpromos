import { buildSyntheticProviderEnvelope, projectReadOnlyProviderRecord } from '../data/provider-projection';

export const SOURCE_DISCOVERY_MODES = [
  {
    id: 'MIXED_CONTROLLED_READINESS',
    label: 'Mixed controlled readiness',
    description: 'A deterministic simulation with eligible and blocked source states side by side.',
  },
  {
    id: 'ALL_FRESH_SIMULATION',
    label: 'All fresh read-only',
    description: 'Every governed concept receives the controlled fresh read-only simulation.',
  },
  {
    id: 'ALL_STALE_SIMULATION',
    label: 'All stale',
    description: 'Every governed concept demonstrates source-freshness failure.',
  },
];

const MIXED_SCENARIOS = {
  'SWAGR-CAT-001': 'CONTROLLED_FRESH_SIMULATION',
  'SWAGR-CAT-002': 'CONTROLLED_FRESH_SIMULATION',
  'SWAGR-CAT-003': 'LICENSE_UNKNOWN_SIMULATION',
  'SWAGR-CAT-004': 'CONTROLLED_FRESH_SIMULATION',
  'SWAGR-CAT-005': 'STALE_SOURCE_SIMULATION',
  'SWAGR-CAT-006': 'CONTROLLED_FRESH_SIMULATION',
  'SWAGR-CAT-007': 'SCHEMA_INCOMPLETE_SIMULATION',
  'SWAGR-CAT-008': 'CONTROLLED_FRESH_SIMULATION',
  'SWAGR-CAT-009': 'PROVIDER_NOT_APPROVED_SIMULATION',
};

export function scenarioForDiscoveryRecord(conceptId, mode = 'MIXED_CONTROLLED_READINESS') {
  if (mode === 'ALL_FRESH_SIMULATION') return 'CONTROLLED_FRESH_SIMULATION';
  if (mode === 'ALL_STALE_SIMULATION') return 'STALE_SOURCE_SIMULATION';
  return MIXED_SCENARIOS[conceptId] || 'CONTROLLED_FRESH_SIMULATION';
}

function normalized(value) {
  return String(value || '').trim().toLowerCase();
}

function confidenceSummary(projection) {
  if (!projection?.confidence) return { verified: 0, normalized: 0, unknown: 0 };
  return Object.values(projection.confidence).reduce(
    (acc, value) => {
      if (value === 'SOURCE_VERIFIED') acc.verified += 1;
      else if (value === 'SOURCE_NORMALIZED') acc.normalized += 1;
      else acc.unknown += 1;
      return acc;
    },
    { verified: 0, normalized: 0, unknown: 0 }
  );
}

export function buildSourceAwareRecord(concept, mode = 'MIXED_CONTROLLED_READINESS') {
  const scenarioId = scenarioForDiscoveryRecord(concept?.id, mode);
  const envelope = buildSyntheticProviderEnvelope(concept, scenarioId);
  const result = projectReadOnlyProviderRecord(concept, envelope);
  const eligible = result.evaluation.status === 'READ_ONLY_PROJECTION_ELIGIBLE' && Boolean(result.projection);

  return {
    concept,
    scenarioId,
    sourceStatus: result.evaluation.status,
    sourceScore: result.evaluation.score,
    freshnessHours: result.evaluation.freshnessHours,
    blockers: [...result.evaluation.blockers],
    warnings: [...result.evaluation.warnings],
    projection: result.projection,
    confidence: confidenceSummary(result.projection),
    discoveryAuthority: eligible ? 'SOURCE_QUALIFIED_FOR_PLANNING_DISCOVERY' : 'SOURCE_WITHHELD_FROM_QUALIFIED_DISCOVERY',
    eligible,
  };
}

export function buildSourceAwareDiscovery(concepts, options = {}) {
  const mode = options.mode || 'MIXED_CONTROLLED_READINESS';
  const query = normalized(options.query);
  const category = normalized(options.category);
  const eligibleOnly = options.eligibleOnly === true;

  const all = (concepts || []).map((concept) => buildSourceAwareRecord(concept, mode));
  const matching = all.filter((record) => {
    if (eligibleOnly && !record.eligible) return false;
    if (category && category !== 'all' && normalized(record.concept?.category).indexOf(category) === -1) return false;
    if (!query) return true;
    const haystack = [
      record.concept?.name,
      record.concept?.category,
      ...(record.concept?.audiences || []),
      ...(record.concept?.useCases || []),
      ...(record.concept?.decoration || []),
      record.projection?.providerRecordId,
    ].map(normalized).join(' ');
    return haystack.includes(query);
  }).sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return String(a.concept?.name || '').localeCompare(String(b.concept?.name || ''));
  });

  return {
    mode,
    records: matching,
    summary: {
      total: all.length,
      matching: matching.length,
      eligible: all.filter((record) => record.eligible).length,
      blocked: all.filter((record) => !record.eligible).length,
      unknownFields: all.reduce((sum, record) => sum + record.confidence.unknown, 0),
    },
    authority: 'READ_ONLY_PLANNING_DISCOVERY_ONLY',
    commercialAuthority: false,
    productionAuthority: false,
  };
}
