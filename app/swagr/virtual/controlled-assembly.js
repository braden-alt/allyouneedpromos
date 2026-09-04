function clean(value) {
  return String(value || '').trim();
}

function boundedMark(value) {
  return clean(value).slice(0, 24);
}

export const CONTROLLED_PRODUCT_SPEC_SCENARIOS = [
  {
    id: 'CONTROLLED_COMPLETE_DECLARATION',
    label: 'Complete controlled declaration',
    description: 'Builds a deterministic, synthetic preview-only product/imprint declaration bound to the exact simulated provider record.',
  },
  {
    id: 'PRODUCT_REFERENCE_MISMATCH',
    label: 'Product reference mismatch',
    description: 'Demonstrates fail-closed assembly when the declared product does not match the governed provider record.',
  },
  {
    id: 'IMPRINT_DECLARATION_INCOMPLETE',
    label: 'Imprint declaration incomplete',
    description: 'Demonstrates fail-closed assembly when required placement, geometry, or restriction review is incomplete.',
  },
];

export function buildControlledPreviewSpec(concept, providerProjection, template, scenarioId = 'CONTROLLED_COMPLETE_DECLARATION') {
  const recordId = clean(providerProjection?.providerRecordId);
  const base = {
    schemaVersion: 1,
    conceptId: clean(concept?.id),
    productRef: recordId,
    sourceLabel: clean(providerProjection?.provider),
    sourceDate: clean(providerProjection?.sourceRevision),
    placement: template?.placementExamples?.[0] || 'Controlled primary preview',
    imprintWidth: '3',
    imprintHeight: '2',
    unit: 'in',
    decorationMethod: template?.methodExamples?.[0] || 'Controlled preview method',
    restrictionsReviewed: true,
    restrictionNotes: 'Synthetic preview declaration only. Exact supplier geometry and production restrictions are not projected.',
    artworkWidth: '2.4',
    artworkHeight: '1.2',
    persistence: 'VOLATILE_CONTROLLED_DEMO_ONLY',
    authority: 'NON_PRODUCTION',
  };

  if (scenarioId === 'PRODUCT_REFERENCE_MISMATCH') {
    return { ...base, productRef: recordId ? `${recordId}-OTHER` : 'SIM-OTHER-PRODUCT' };
  }
  if (scenarioId === 'IMPRINT_DECLARATION_INCOMPLETE') {
    return { ...base, placement: '', imprintHeight: '', restrictionsReviewed: false };
  }
  return base;
}

export function evaluateControlledVirtualAssembly({ concept, productBinding, mediaResult, markText }) {
  const productPacket = productBinding?.packet || null;
  const mediaPacket = mediaResult?.packet || null;
  const blockers = [];
  const checks = [];
  const pushCheck = (id, pass, detail) => {
    checks.push({ id, pass: Boolean(pass), detail: clean(detail) });
    if (!pass) blockers.push(id);
  };

  pushCheck(
    'PRODUCT_SPEC_PACKET_REQUIRED',
    productPacket?.packetType === 'SWAGR_PRODUCT_SPEC_VALIDATION_PACKET' && productPacket?.state === 'READY_FOR_HUMAN_VALIDATION_ONLY',
    productPacket?.state || productBinding?.status || 'MISSING'
  );
  pushCheck(
    'CONTROLLED_MEDIA_PACKET_REQUIRED',
    mediaPacket?.packetType === 'SWAGR_CONTROLLED_MEDIA_PACKET' && mediaPacket?.state === 'READY_FOR_SYNTHETIC_PREVIEW_ASSEMBLY_ONLY',
    mediaPacket?.state || mediaResult?.evaluation?.status || 'MISSING'
  );

  const conceptId = clean(concept?.id);
  pushCheck(
    'CONCEPT_IDENTITY_MISMATCH',
    Boolean(productPacket && mediaPacket && conceptId && productPacket.conceptId === conceptId && mediaPacket.conceptId === conceptId),
    productPacket && mediaPacket ? `${productPacket.conceptId} ↔ ${mediaPacket.conceptId}` : conceptId
  );
  pushCheck(
    'PROVIDER_RECORD_IDENTITY_MISMATCH',
    Boolean(productPacket && mediaPacket && productPacket.providerRecordId === mediaPacket.providerRecordId),
    productPacket && mediaPacket ? `${productPacket.providerRecordId} ↔ ${mediaPacket.providerRecordId}` : 'NOT_AVAILABLE'
  );
  pushCheck(
    'PROVIDER_REVISION_MISMATCH',
    Boolean(productPacket && mediaPacket && productPacket.sourceRevision === mediaPacket.providerSourceRevision),
    productPacket && mediaPacket ? `${productPacket.sourceRevision} ↔ ${mediaPacket.providerSourceRevision}` : 'NOT_AVAILABLE'
  );
  pushCheck(
    'PREVIEW_GEOMETRY_AUTHORITY_INVALID',
    mediaPacket?.previewGeometry?.authority === 'SYNTHETIC_PREVIEW_COORDINATES_ONLY',
    mediaPacket?.previewGeometry?.authority || 'MISSING'
  );
  pushCheck(
    'CONTROLLED_BLANK_REQUIRED',
    Boolean(clean(mediaPacket?.blankRef)),
    mediaPacket?.blankRef || 'MISSING'
  );
  pushCheck(
    'PREVIEW_MARK_REQUIRED',
    Boolean(boundedMark(markText)),
    boundedMark(markText) || 'MISSING'
  );

  const passed = checks.filter((check) => check.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  const ready = blockers.length === 0;
  const state = ready ? 'READY_FOR_SYNTHETIC_CUSTOMER_PREVIEW_ONLY' : 'CONTROLLED_VIRTUAL_ASSEMBLY_BLOCKED';

  return {
    status: ready ? 'CONTROLLED_VIRTUAL_ASSEMBLY_READY' : 'CONTROLLED_VIRTUAL_ASSEMBLY_BLOCKED',
    state,
    score,
    blockers,
    checks,
    authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
    productionReady: false,
    proofReady: false,
    commercialReady: false,
    packet: ready
      ? {
          schemaVersion: 1,
          packetType: 'SWAGR_CONTROLLED_INSTANT_VIRTUAL_PACKET',
          state,
          authority: 'NO_COMMERCIAL_OR_PRODUCTION_AUTHORITY',
          productionReady: false,
          proofReady: false,
          commercialReady: false,
          conceptId,
          provider: productPacket.provider,
          providerRecordId: productPacket.providerRecordId,
          providerSourceRevision: productPacket.sourceRevision,
          productName: productPacket.productName,
          category: productPacket.category,
          mediaProvider: mediaPacket.mediaProvider,
          mediaRecordId: mediaPacket.mediaRecordId,
          mediaRevision: mediaPacket.mediaRevision,
          controlledBlankRef: mediaPacket.blankRef,
          previewGeometry: { ...mediaPacket.previewGeometry },
          imprintDeclaration: { ...productPacket.imprint },
          mark: {
            kind: 'USER_ENTERED_PREVIEW_TEXT',
            text: boundedMark(markText),
            rightsState: 'NOT_EVALUATED_EXTERNALLY',
            trademarkAuthority: 'NOT_INFERRED',
          },
          renderPolicy: {
            mode: 'LOCAL_BROWSER_COMPOSITION_ONLY',
            assetAuthority: 'CONTROLLED_SYNTHETIC_BLANK_ONLY',
            geometryAuthority: 'SYNTHETIC_PREVIEW_COORDINATES_ONLY',
          },
          exactSupplierPhotographyState: 'NOT_PROJECTED',
          exactSupplierImprintGeometryState: 'NOT_PROJECTED',
          priceState: 'UNVERIFIED_NOT_PROJECTED',
          inventoryState: 'UNVERIFIED_NOT_PROJECTED',
          leadTimeState: 'UNVERIFIED_NOT_PROJECTED',
          nextAction: 'Use this packet only for a controlled synthetic customer-facing preview. Before any production-proof claim, separately authorize and validate exact supplier photography, exact production imprint geometry, decoration constraints, artwork, commercial facts, and human proof approval.',
        }
      : null,
  };
}
