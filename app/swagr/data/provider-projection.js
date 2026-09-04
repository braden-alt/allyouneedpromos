export const PROVIDER_PROJECTION_SCENARIOS = [
  {
    id: 'CONTROLLED_FRESH_SIMULATION',
    label: 'Fresh read-only simulation',
    description: 'Simulates an approved read-only source with current licensed fields. No live provider call occurs.',
  },
  {
    id: 'STALE_SOURCE_SIMULATION',
    label: 'Stale source simulation',
    description: 'Demonstrates fail-safe handling when source freshness exceeds the permitted planning window.',
  },
  {
    id: 'LICENSE_UNKNOWN_SIMULATION',
    label: 'Usage-rights unknown',
    description: 'Demonstrates how media/product projection is blocked when usage rights are not explicit.',
  },
  {
    id: 'PROVIDER_NOT_APPROVED_SIMULATION',
    label: 'Provider not approved',
    description: 'Demonstrates the owner gate: no provider projection is promoted until the provider is approved for read-only use.',
  },
  {
    id: 'SCHEMA_INCOMPLETE_SIMULATION',
    label: 'Incomplete source schema',
    description: 'Demonstrates contract rejection when exact record identity or source revision is missing.',
  },
];

export const PROVIDER_PROJECTION_LIMITS = {
  schemaVersion: 1,
  maxFreshnessHours: 24,
  requiredApprovalState: 'APPROVED_READ_ONLY',
  requiredTransportMode: 'READ_ONLY',
  requiredUsageRightsState: 'AUTHORIZED_FOR_THIS_USE',
  allowedConfidenceStates: ['SOURCE_VERIFIED', 'SOURCE_NORMALIZED', 'UNKNOWN'],
};

const SYNTHETIC_PROVIDER_IDS = {
  'SWAGR-CAT-001': 'SIM-PROVIDER-TEE-001',
  'SWAGR-CAT-002': 'SIM-PROVIDER-FLEECE-002',
  'SWAGR-CAT-003': 'SIM-PROVIDER-CAP-003',
  'SWAGR-CAT-004': 'SIM-PROVIDER-DRINK-004',
  'SWAGR-CAT-005': 'SIM-PROVIDER-TOTE-005',
  'SWAGR-CAT-006': 'SIM-PROVIDER-WRITING-006',
  'SWAGR-CAT-007': 'SIM-PROVIDER-TECH-007',
  'SWAGR-CAT-008': 'SIM-PROVIDER-SAFETY-008',
  'SWAGR-CAT-009': 'SIM-PROVIDER-EVENT-009',
};

function isoHoursAgo(hours) {
  const base = Date.UTC(2026, 8, 3, 18, 0, 0);
  return new Date(base - (hours * 60 * 60 * 1000)).toISOString();
}

export function buildSyntheticProviderEnvelope(concept, scenarioId = 'CONTROLLED_FRESH_SIMULATION') {
  const providerRecordId = SYNTHETIC_PROVIDER_IDS[concept?.id] || null;
  const base = {
    schemaVersion: PROVIDER_PROJECTION_LIMITS.schemaVersion,
    sourceKind: 'SYNTHETIC_PROVIDER_RECORD',
    provider: 'CONTROLLED_PROVIDER_SIMULATION',
    providerApprovalState: 'APPROVED_READ_ONLY',
    transportMode: 'READ_ONLY',
    providerRecordId,
    sourceRevision: 'SIM-REV-2026-09-03',
    sourceUpdatedAt: isoHoursAgo(3),
    fetchedAt: new Date(Date.UTC(2026, 8, 3, 18, 0, 0)).toISOString(),
    usageRightsState: 'AUTHORIZED_FOR_THIS_USE',
    licenseScope: 'SIMULATED_PRODUCT_IDENTITY_AND_PLANNING_MEDIA_ONLY',
    fields: {
      productName: concept?.name || '',
      category: concept?.category || '',
      sourceProductUrl: '',
      primaryImageRef: '',
      imprintSourceRef: '',
      commercialState: 'NOT_PROJECTED',
      inventoryState: 'NOT_PROJECTED',
      leadTimeState: 'NOT_PROJECTED',
    },
    fieldConfidence: {
      productName: concept?.name ? 'SOURCE_VERIFIED' : 'UNKNOWN',
      category: concept?.category ? 'SOURCE_NORMALIZED' : 'UNKNOWN',
      primaryImageRef: 'UNKNOWN',
      imprintSourceRef: 'UNKNOWN',
    },
  };

  if (scenarioId === 'STALE_SOURCE_SIMULATION') {
    return { ...base, sourceUpdatedAt: isoHoursAgo(72) };
  }
  if (scenarioId === 'LICENSE_UNKNOWN_SIMULATION') {
    return { ...base, usageRightsState: 'UNKNOWN', licenseScope: 'NOT_EVALUATED' };
  }
  if (scenarioId === 'PROVIDER_NOT_APPROVED_SIMULATION') {
    return { ...base, providerApprovalState: 'CANDIDATE_NOT_APPROVED' };
  }
  if (scenarioId === 'SCHEMA_INCOMPLETE_SIMULATION') {
    return { ...base, providerRecordId: null, sourceRevision: '' };
  }
  return base;
}

function ageHours(updatedAt, fetchedAt) {
  const updated = Date.parse(updatedAt || '');
  const fetched = Date.parse(fetchedAt || '');
  if (!Number.isFinite(updated) || !Number.isFinite(fetched) || fetched < updated) return null;
  return (fetched - updated) / (60 * 60 * 1000);
}

export function evaluateProviderEnvelope(envelope) {
  const blockers = [];
  const warnings = [];

  if (!envelope || typeof envelope !== 'object') {
    return {
      status: 'PROJECTION_BLOCKED',
      score: 0,
      blockers: ['MISSING_PROVIDER_ENVELOPE'],
      warnings,
      freshnessHours: null,
    };
  }

  if (envelope.schemaVersion !== PROVIDER_PROJECTION_LIMITS.schemaVersion) blockers.push('SCHEMA_VERSION_MISMATCH');
  if (envelope.sourceKind !== 'SYNTHETIC_PROVIDER_RECORD' && envelope.sourceKind !== 'CONTROLLED_PROVIDER_RECORD') blockers.push('UNSUPPORTED_SOURCE_KIND');
  if (!envelope.provider) blockers.push('MISSING_PROVIDER_IDENTITY');
  if (envelope.providerApprovalState !== PROVIDER_PROJECTION_LIMITS.requiredApprovalState) blockers.push('PROVIDER_NOT_APPROVED_READ_ONLY');
  if (envelope.transportMode !== PROVIDER_PROJECTION_LIMITS.requiredTransportMode) blockers.push('TRANSPORT_NOT_READ_ONLY');
  if (!envelope.providerRecordId) blockers.push('MISSING_PROVIDER_RECORD_ID');
  if (!envelope.sourceRevision) blockers.push('MISSING_SOURCE_REVISION');
  if (!envelope.sourceUpdatedAt) blockers.push('MISSING_SOURCE_UPDATED_AT');
  if (!envelope.fetchedAt) blockers.push('MISSING_FETCHED_AT');
  if (envelope.usageRightsState !== PROVIDER_PROJECTION_LIMITS.requiredUsageRightsState) blockers.push('USAGE_RIGHTS_NOT_AUTHORIZED');
  if (!envelope.licenseScope || envelope.licenseScope === 'NOT_EVALUATED') blockers.push('LICENSE_SCOPE_NOT_DECLARED');
  if (!envelope.fields?.productName) blockers.push('MISSING_PRODUCT_NAME');
  if (!envelope.fields?.category) blockers.push('MISSING_CATEGORY');

  const freshnessHours = ageHours(envelope.sourceUpdatedAt, envelope.fetchedAt);
  if (freshnessHours === null) blockers.push('INVALID_SOURCE_TIMESTAMPS');
  else if (freshnessHours > PROVIDER_PROJECTION_LIMITS.maxFreshnessHours) blockers.push('SOURCE_STALE');

  Object.entries(envelope.fieldConfidence || {}).forEach(([field, confidence]) => {
    if (!PROVIDER_PROJECTION_LIMITS.allowedConfidenceStates.includes(confidence)) blockers.push(`INVALID_CONFIDENCE_${field.toUpperCase()}`);
    if (confidence === 'UNKNOWN') warnings.push(`FIELD_UNKNOWN_${field.toUpperCase()}`);
  });

  const requiredGateCount = 11;
  const score = Math.max(0, Math.round(((requiredGateCount - Math.min(blockers.length, requiredGateCount)) / requiredGateCount) * 100));
  return {
    status: blockers.length ? 'PROJECTION_BLOCKED' : 'READ_ONLY_PROJECTION_ELIGIBLE',
    score,
    blockers,
    warnings,
    freshnessHours,
  };
}

export function projectReadOnlyProviderRecord(concept, envelope) {
  const evaluation = evaluateProviderEnvelope(envelope);
  if (evaluation.status !== 'READ_ONLY_PROJECTION_ELIGIBLE') {
    return { evaluation, projection: null };
  }

  return {
    evaluation,
    projection: {
      schemaVersion: 1,
      projectionMode: 'READ_ONLY_PLANNING_PROJECTION',
      authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
      swagrConceptId: concept?.id || null,
      provider: envelope.provider,
      providerRecordId: envelope.providerRecordId,
      sourceRevision: envelope.sourceRevision,
      sourceUpdatedAt: envelope.sourceUpdatedAt,
      fetchedAt: envelope.fetchedAt,
      usageRightsState: envelope.usageRightsState,
      licenseScope: envelope.licenseScope,
      productName: envelope.fields.productName,
      category: envelope.fields.category,
      sourceProductUrl: envelope.fields.sourceProductUrl || '',
      primaryImageRef: envelope.fields.primaryImageRef || '',
      imprintSourceRef: envelope.fields.imprintSourceRef || '',
      commercialState: 'UNVERIFIED_NOT_PROJECTED',
      inventoryState: 'UNVERIFIED_NOT_PROJECTED',
      leadTimeState: 'UNVERIFIED_NOT_PROJECTED',
      confidence: { ...envelope.fieldConfidence },
      nextValidation: [
        'Verify exact product identity against the controlled provider record.',
        'Verify image/media usage rights before customer-facing reuse.',
        'Bind a controlled imprint specification before production virtual work.',
        'Keep price, inventory, MOQ, and lead time outside this projection until separately authorized and verified.',
      ],
    },
  };
}
