export const MEDIA_READINESS_SCENARIOS = [
  {
    id: 'CONTROLLED_SYNTHETIC_BLANK',
    label: 'Controlled synthetic blank',
    description: 'An identity-bound SWAGR preview asset with declared usage rights and preview-only coordinate geometry.',
  },
  {
    id: 'MEDIA_RIGHTS_UNKNOWN',
    label: 'Media rights unknown',
    description: 'Demonstrates fail-closed behavior when asset reuse rights have not been authorized.',
  },
  {
    id: 'PRODUCT_BINDING_MISMATCH',
    label: 'Product binding mismatch',
    description: 'Demonstrates fail-closed behavior when the media asset points at a different product record.',
  },
  {
    id: 'GEOMETRY_INCOMPLETE',
    label: 'Preview geometry incomplete',
    description: 'Demonstrates withholding when the controlled preview coordinate space is incomplete.',
  },
  {
    id: 'MEDIA_STALE',
    label: 'Media source stale',
    description: 'Demonstrates source-freshness failure for a previously governed media record.',
  },
];

export const MEDIA_READINESS_LIMITS = {
  schemaVersion: 1,
  maxFreshnessHours: 24,
  requiredUsageRightsState: 'AUTHORIZED_FOR_THIS_USE',
  requiredAssetKind: 'CONTROLLED_SYNTHETIC_VECTOR_BLANK',
  requiredGeometryAuthority: 'SYNTHETIC_PREVIEW_COORDINATES_ONLY',
};

function hoursAgo(hours) {
  const fetched = Date.UTC(2026, 8, 3, 18, 0, 0);
  return new Date(fetched - (hours * 60 * 60 * 1000)).toISOString();
}

export function buildSyntheticMediaEnvelope(concept, providerProjection, scenarioId = 'CONTROLLED_SYNTHETIC_BLANK') {
  const productRecordId = providerProjection?.providerRecordId || '';
  const envelope = {
    schemaVersion: 1,
    sourceKind: 'SYNTHETIC_PRODUCT_MEDIA',
    mediaProvider: 'SWAGR_CONTROLLED_MEDIA_SIMULATION',
    mediaRecordId: concept?.id ? `SIM-MEDIA-${concept.id}` : '',
    productRecordId,
    productSourceRevision: providerProjection?.sourceRevision || '',
    mediaRevision: 'SIM-MEDIA-REV-2026-09-03',
    sourceUpdatedAt: hoursAgo(2),
    fetchedAt: new Date(Date.UTC(2026, 8, 3, 18, 0, 0)).toISOString(),
    usageRightsState: 'AUTHORIZED_FOR_THIS_USE',
    licenseScope: 'SWAGR_CONTROLLED_SYNTHETIC_PREVIEW_ONLY',
    assetKind: 'CONTROLLED_SYNTHETIC_VECTOR_BLANK',
    blankRef: concept?.id ? `SWAGR-CONTROLLED-BLANK-${concept.id}` : '',
    geometry: {
      authority: 'SYNTHETIC_PREVIEW_COORDINATES_ONLY',
      canvasWidth: 250,
      canvasHeight: 180,
      coordinateUnit: 'preview-px',
      supplierImprintGeometryState: 'NOT_PROJECTED',
    },
    authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
  };

  if (scenarioId === 'MEDIA_RIGHTS_UNKNOWN') {
    return { ...envelope, usageRightsState: 'UNKNOWN', licenseScope: 'NOT_EVALUATED' };
  }
  if (scenarioId === 'PRODUCT_BINDING_MISMATCH') {
    return { ...envelope, productRecordId: productRecordId ? `${productRecordId}-OTHER` : 'SIM-OTHER-PRODUCT' };
  }
  if (scenarioId === 'GEOMETRY_INCOMPLETE') {
    return { ...envelope, geometry: { ...envelope.geometry, canvasHeight: null } };
  }
  if (scenarioId === 'MEDIA_STALE') {
    return { ...envelope, sourceUpdatedAt: hoursAgo(72) };
  }
  return envelope;
}

function ageHours(updatedAt, fetchedAt) {
  const updated = Date.parse(updatedAt || '');
  const fetched = Date.parse(fetchedAt || '');
  if (!Number.isFinite(updated) || !Number.isFinite(fetched) || fetched < updated) return null;
  return (fetched - updated) / (60 * 60 * 1000);
}

export function evaluateMediaEnvelope(envelope, providerProjection) {
  const blockers = [];
  const warnings = [];

  if (!providerProjection) blockers.push('ELIGIBLE_PROVIDER_PROJECTION_REQUIRED');
  if (!envelope || typeof envelope !== 'object') {
    return { status: 'MEDIA_BLOCKED', score: 0, blockers: [...blockers, 'MISSING_MEDIA_ENVELOPE'], warnings, freshnessHours: null };
  }

  if (envelope.schemaVersion !== MEDIA_READINESS_LIMITS.schemaVersion) blockers.push('MEDIA_SCHEMA_VERSION_MISMATCH');
  if (envelope.sourceKind !== 'SYNTHETIC_PRODUCT_MEDIA' && envelope.sourceKind !== 'CONTROLLED_PRODUCT_MEDIA') blockers.push('UNSUPPORTED_MEDIA_SOURCE_KIND');
  if (!envelope.mediaProvider) blockers.push('MISSING_MEDIA_PROVIDER_IDENTITY');
  if (!envelope.mediaRecordId) blockers.push('MISSING_MEDIA_RECORD_ID');
  if (!envelope.mediaRevision) blockers.push('MISSING_MEDIA_REVISION');
  if (!envelope.productRecordId) blockers.push('MISSING_PRODUCT_BINDING');
  if (providerProjection && envelope.productRecordId !== providerProjection.providerRecordId) blockers.push('MEDIA_PRODUCT_BINDING_MISMATCH');
  if (providerProjection && envelope.productSourceRevision !== providerProjection.sourceRevision) blockers.push('MEDIA_PRODUCT_REVISION_MISMATCH');
  if (envelope.usageRightsState !== MEDIA_READINESS_LIMITS.requiredUsageRightsState) blockers.push('MEDIA_USAGE_RIGHTS_NOT_AUTHORIZED');
  if (!envelope.licenseScope || envelope.licenseScope === 'NOT_EVALUATED') blockers.push('MEDIA_LICENSE_SCOPE_NOT_DECLARED');
  if (envelope.assetKind !== MEDIA_READINESS_LIMITS.requiredAssetKind) blockers.push('UNSUPPORTED_MEDIA_ASSET_KIND');
  if (!envelope.blankRef) blockers.push('MISSING_CONTROLLED_BLANK_REF');
  if (envelope.geometry?.authority !== MEDIA_READINESS_LIMITS.requiredGeometryAuthority) blockers.push('INVALID_PREVIEW_GEOMETRY_AUTHORITY');
  if (!(Number(envelope.geometry?.canvasWidth) > 0) || !(Number(envelope.geometry?.canvasHeight) > 0)) blockers.push('INCOMPLETE_PREVIEW_COORDINATE_SPACE');
  if (envelope.geometry?.supplierImprintGeometryState !== 'NOT_PROJECTED') warnings.push('SUPPLIER_GEOMETRY_MUST_REMAIN_SEPARATE');

  const freshnessHours = ageHours(envelope.sourceUpdatedAt, envelope.fetchedAt);
  if (freshnessHours === null) blockers.push('INVALID_MEDIA_TIMESTAMPS');
  else if (freshnessHours > MEDIA_READINESS_LIMITS.maxFreshnessHours) blockers.push('MEDIA_SOURCE_STALE');

  const requiredGateCount = 14;
  const score = Math.max(0, Math.round(((requiredGateCount - Math.min(blockers.length, requiredGateCount)) / requiredGateCount) * 100));
  return {
    status: blockers.length ? 'MEDIA_BLOCKED' : 'MEDIA_READY_FOR_CONTROLLED_PREVIEW_ASSEMBLY',
    score,
    blockers,
    warnings,
    freshnessHours,
    authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
    productionReady: false,
  };
}

export function createControlledMediaPacket(concept, providerProjection, envelope) {
  const evaluation = evaluateMediaEnvelope(envelope, providerProjection);
  if (evaluation.status !== 'MEDIA_READY_FOR_CONTROLLED_PREVIEW_ASSEMBLY') {
    return { evaluation, packet: null };
  }

  return {
    evaluation,
    packet: {
      schemaVersion: 1,
      packetType: 'SWAGR_CONTROLLED_MEDIA_PACKET',
      state: 'READY_FOR_SYNTHETIC_PREVIEW_ASSEMBLY_ONLY',
      authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
      productionReady: false,
      conceptId: concept?.id || '',
      providerRecordId: providerProjection.providerRecordId,
      providerSourceRevision: providerProjection.sourceRevision,
      mediaProvider: envelope.mediaProvider,
      mediaRecordId: envelope.mediaRecordId,
      mediaRevision: envelope.mediaRevision,
      usageRightsState: envelope.usageRightsState,
      licenseScope: envelope.licenseScope,
      assetKind: envelope.assetKind,
      blankRef: envelope.blankRef,
      previewGeometry: { ...envelope.geometry },
      exactSupplierProductPhotographyState: 'NOT_PROJECTED',
      exactSupplierImprintGeometryState: 'NOT_PROJECTED',
      nextAction: 'A controlled preview assembler may use this synthetic blank coordinate space only. Exact supplier photography and production imprint geometry require a separately authorized source before any production-proof claim.',
    },
  };
}
