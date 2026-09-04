import { evaluateImprintReadiness } from './imprint-readiness';

function text(value) {
  return String(value || '').trim();
}

export function evaluateProductSpecBinding(providerResult, spec) {
  const projection = providerResult?.projection || null;
  const providerEvaluation = providerResult?.evaluation || {
    status: 'PROJECTION_BLOCKED',
    score: 0,
    blockers: ['MISSING_PROVIDER_PROJECTION'],
    warnings: [],
  };
  const imprint = evaluateImprintReadiness(spec || {});
  const blockers = [];
  const warnings = [...(providerEvaluation.warnings || [])];

  const providerEligible = providerEvaluation.status === 'READ_ONLY_PROJECTION_ELIGIBLE' && Boolean(projection);
  if (!providerEligible) blockers.push('PROVIDER_PROJECTION_REQUIRED');

  const conceptMatch = providerEligible && text(spec?.conceptId) === text(projection?.swagrConceptId);
  const productMatch = providerEligible && text(spec?.productRef) === text(projection?.providerRecordId);
  const sourceRevisionMatch = providerEligible && text(spec?.sourceDate) === text(projection?.sourceRevision);
  const sourceLabelMatch = providerEligible && text(spec?.sourceLabel) === text(projection?.provider);

  if (providerEligible && !conceptMatch) blockers.push('CONCEPT_BINDING_MISMATCH');
  if (providerEligible && !productMatch) blockers.push('PRODUCT_REFERENCE_MISMATCH');
  if (providerEligible && !sourceRevisionMatch) blockers.push('SOURCE_REVISION_MISMATCH');
  if (providerEligible && !sourceLabelMatch) blockers.push('SOURCE_IDENTITY_MISMATCH');
  if (imprint.status !== 'DECLARED_SPEC_READY_FOR_HUMAN_VALIDATION') blockers.push('IMPRINT_SPEC_INCOMPLETE');

  const identityScore = [conceptMatch, productMatch, sourceRevisionMatch, sourceLabelMatch].filter(Boolean).length * 25;
  const score = Math.round((providerEvaluation.score * 0.35) + (identityScore * 0.25) + (imprint.score * 0.40));

  let status = 'PRODUCT_SPEC_BINDING_REQUIRED';
  if (!providerEligible) status = 'PROVIDER_PROJECTION_REQUIRED';
  else if (!conceptMatch || !productMatch || !sourceRevisionMatch || !sourceLabelMatch) status = 'PRODUCT_BINDING_MISMATCH';
  else if (imprint.status !== 'DECLARED_SPEC_READY_FOR_HUMAN_VALIDATION') status = 'IMPRINT_SPEC_REQUIRED';
  else status = 'PRODUCT_SPEC_READY_FOR_HUMAN_VALIDATION';

  return {
    status,
    score,
    blockers,
    warnings,
    provider: providerEvaluation,
    imprint,
    checks: {
      providerEligible,
      conceptMatch,
      productMatch,
      sourceRevisionMatch,
      sourceLabelMatch,
      imprintComplete: imprint.status === 'DECLARED_SPEC_READY_FOR_HUMAN_VALIDATION',
    },
    authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
    productionReady: false,
    packet: status === 'PRODUCT_SPEC_READY_FOR_HUMAN_VALIDATION'
      ? {
          schemaVersion: 1,
          packetType: 'SWAGR_PRODUCT_SPEC_VALIDATION_PACKET',
          state: 'READY_FOR_HUMAN_VALIDATION_ONLY',
          authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
          conceptId: projection.swagrConceptId,
          provider: projection.provider,
          providerRecordId: projection.providerRecordId,
          sourceRevision: projection.sourceRevision,
          sourceUpdatedAt: projection.sourceUpdatedAt,
          usageRightsState: projection.usageRightsState,
          licenseScope: projection.licenseScope,
          productName: projection.productName,
          category: projection.category,
          imprint: {
            placement: spec.placement,
            width: Number(spec.imprintWidth),
            height: Number(spec.imprintHeight),
            unit: spec.unit,
            decorationMethod: spec.decorationMethod,
            restrictionsReviewed: spec.restrictionsReviewed === true,
            restrictionNotes: text(spec.restrictionNotes),
            artworkWidth: text(spec.artworkWidth) ? Number(spec.artworkWidth) : null,
            artworkHeight: text(spec.artworkHeight) ? Number(spec.artworkHeight) : null,
          },
          commercialState: 'UNVERIFIED_NOT_PROJECTED',
          inventoryState: 'UNVERIFIED_NOT_PROJECTED',
          leadTimeState: 'UNVERIFIED_NOT_PROJECTED',
          nextAction: 'Human validation must compare the exact product record and declared imprint specification against the controlled source before any production virtual or proof step.',
        }
      : null,
  };
}
