export const SWAGR_IMPRINT_READINESS_KEY = 'swagr.imprintReadiness.v1';

const TEMPLATE_LIBRARY = {
  apparel: {
    label: 'Apparel / outerwear template',
    placementExamples: ['Left chest', 'Center chest', 'Sleeve'],
    methodExamples: ['Embroidery', 'Screen print', 'Heat transfer'],
    criticalChecks: ['Seams and pockets', 'Garment construction', 'Decoration method compatibility'],
  },
  headwear: {
    label: 'Headwear template',
    placementExamples: ['Front panel', 'Side panel', 'Back arch'],
    methodExamples: ['Embroidery', 'Patch', 'Heat transfer'],
    criticalChecks: ['Panel construction', 'Stitch/detail limits', 'Structured-area restrictions'],
  },
  drinkware: {
    label: 'Drinkware template',
    placementExamples: ['Front body', 'Back body', 'Wrap area'],
    methodExamples: ['Laser engrave', 'Pad print', 'Full-color print'],
    criticalChecks: ['Vessel geometry', 'Handle/lid interference', 'Wrap and curvature limits'],
  },
  bags: {
    label: 'Bag / carry template',
    placementExamples: ['Front panel', 'Upper pocket', 'Side panel'],
    methodExamples: ['Screen print', 'Embroidery', 'Heat transfer'],
    criticalChecks: ['Pocket and seam interference', 'Panel access', 'Decoration method compatibility'],
  },  writing: {
    label: 'Writing instrument template',
    placementExamples: ['Barrel', 'Clip side', 'Cap'],
    methodExamples: ['Pad print', 'Laser engrave'],
    criticalChecks: ['Curved barrel geometry', 'Readable mark size', 'Clip and mechanism interference'],
  },
  tech: {
    label: 'Technology accessory template',
    placementExamples: ['Center face', 'Corner', 'Back panel'],
    methodExamples: ['Pad print', 'UV print', 'Laser marking'],
    criticalChecks: ['Protected surfaces', 'Enclosure material', 'Battery/safety specification separation'],
  },
  safety: {
    label: 'Field visibility template',
    placementExamples: ['Chest', 'Back panel', 'Sleeve'],
    methodExamples: ['Heat transfer', 'Screen print', 'Patch'],
    criticalChecks: ['Reflective-area restrictions', 'Regulated zones', 'Garment class must be verified separately'],
  },
  events: {
    label: 'Event identity template',
    placementExamples: ['Badge face', 'Lanyard strap', 'Badge corner'],
    methodExamples: ['Dye sublimation', 'Screen print', 'Full-color insert'],
    criticalChecks: ['Badge dimensions', 'Hardware clearance', 'Credential/access-system separation'],
  },
  default: {
    label: 'General controlled template',
    placementExamples: ['Primary area', 'Secondary area'],
    methodExamples: ['Supplier-approved method'],
    criticalChecks: ['Exact product identity', 'Exact imprint boundary', 'Decoration method compatibility'],
  },
};
function categoryKey(category = '') {
  const value = String(category).toLowerCase();
  if (value.includes('outerwear') || value.includes('knit') || value.includes('apparel')) return 'apparel';
  if (value.includes('headwear')) return 'headwear';
  if (value.includes('drinkware')) return 'drinkware';
  if (value.includes('bag') || value.includes('tote')) return 'bags';
  if (value.includes('writing')) return 'writing';
  if (value.includes('tech') || value.includes('charging') || value.includes('power bank')) return 'tech';
  if (value.includes('safety') || value.includes('high-visibility')) return 'safety';
  if (value.includes('event') || value.includes('lanyard') || value.includes('badge')) return 'events';
  return 'default';
}

export function controlledTemplateForConcept(concept) {
  const key = categoryKey(concept?.category);
  return {
    templateId: `SWAGR-IMPRINT-${key.toUpperCase()}-001`,
    categoryKey: key,
    sourceState: 'CONTROLLED_NON_LIVE_TEMPLATE',
    productBinding: 'UNKNOWN_UNTIL_EXACT_PRODUCT_DECLARED',
    ...TEMPLATE_LIBRARY[key],
  };
}

function positive(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function createEmptyImprintSpec(concept) {  return {
    schemaVersion: 1,
    conceptId: concept?.id || '',
    productRef: '',
    sourceLabel: '',
    sourceDate: '',
    placement: '',
    imprintWidth: '',
    imprintHeight: '',
    unit: 'in',
    decorationMethod: '',
    restrictionsReviewed: false,
    restrictionNotes: '',
    artworkWidth: '',
    artworkHeight: '',
    updatedAt: '',
    persistence: 'SESSION_LOCAL_ONLY',
    authority: 'NON_PRODUCTION',
  };
}

export function normalizeImprintSpec(raw, concept) {
  const fallback = createEmptyImprintSpec(concept);
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    ...fallback,
    ...raw,
    conceptId: concept?.id || raw.conceptId || '',
    unit: raw.unit === 'mm' ? 'mm' : 'in',
    restrictionsReviewed: raw.restrictionsReviewed === true,
    authority: 'NON_PRODUCTION',
    persistence: 'SESSION_LOCAL_ONLY',
  };
}
export function evaluateArtworkFit(spec) {
  const areaWidth = positive(spec?.imprintWidth);
  const areaHeight = positive(spec?.imprintHeight);
  const artWidth = positive(spec?.artworkWidth);
  const artHeight = positive(spec?.artworkHeight);
  if (!areaWidth || !areaHeight || !artWidth || !artHeight) {
    return { status: 'UNKNOWN', label: 'Artwork fit unknown', detail: 'Enter both declared imprint dimensions and target artwork dimensions.' };
  }
  const within = artWidth <= areaWidth && artHeight <= areaHeight;
  return within
    ? {
        status: 'WITHIN_DECLARED_AREA',
        label: 'Fits declared rectangle',
        detail: 'The target dimensions fit inside the declared rectangle. This does not validate curvature, seams, decoration method, or supplier approval.',
      }
    : {
        status: 'EXCEEDS_DECLARED_AREA',
        label: 'Exceeds declared rectangle',
        detail: 'Reduce the target artwork dimensions or obtain a different controlled imprint specification before continuing.',
      };
}

export function evaluateImprintReadiness(spec) {
  const checks = [
    ['productRef', Boolean(String(spec?.productRef || '').trim()), 'Exact product reference'],
    ['sourceLabel', Boolean(String(spec?.sourceLabel || '').trim()), 'Controlled specification source'],
    ['sourceDate', Boolean(String(spec?.sourceDate || '').trim()), 'Source date / revision'],
    ['placement', Boolean(String(spec?.placement || '').trim()), 'Named imprint placement'],
    ['dimensions', Boolean(positive(spec?.imprintWidth) && positive(spec?.imprintHeight)), 'Positive imprint width and height'],
    ['decorationMethod', Boolean(String(spec?.decorationMethod || '').trim()), 'Decoration method'],
    ['restrictionsReviewed', spec?.restrictionsReviewed === true, 'Restrictions reviewed'],
  ];  const completed = checks.filter(([, pass]) => pass).length;
  const missing = checks.filter(([, pass]) => !pass).map(([, , label]) => label);
  const anySignal = checks.some(([, pass]) => pass) || Boolean(String(spec?.restrictionNotes || '').trim());
  const fit = evaluateArtworkFit(spec);
  const score = Math.round((completed / checks.length) * 100);
  const status = !anySignal
    ? 'SPEC_REQUIRED'
    : missing.length
      ? 'SPEC_PARTIAL'
      : 'DECLARED_SPEC_READY_FOR_HUMAN_VALIDATION';

  return {
    status,
    score,
    completed,
    total: checks.length,
    missing,
    checks: checks.map(([id, pass, label]) => ({ id, pass, label })),
    fit,
    authority: 'NON_PRODUCTION',
    productionReady: false,
    nextAction: missing.length
      ? `Resolve ${missing[0].toLowerCase()} before treating the declared spec as complete.`
      : 'Human validation may compare this declaration against the controlled source. Production proof authority is still not granted.',
  };
}

export function loadImprintSpecMap() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SWAGR_IMPRINT_READINESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
export function loadImprintSpec(concept) {
  const map = loadImprintSpecMap();
  return normalizeImprintSpec(map[concept?.id], concept);
}

export function saveImprintSpec(concept, spec) {
  try {
    const map = loadImprintSpecMap();
    const next = normalizeImprintSpec({
      ...spec,
      updatedAt: new Date().toISOString(),
    }, concept);
    map[concept?.id] = next;
    sessionStorage.setItem(SWAGR_IMPRINT_READINESS_KEY, JSON.stringify(map));
    return next;
  } catch {
    return normalizeImprintSpec(spec, concept);
  }
}

export function clearImprintSpec(concept) {
  try {
    const map = loadImprintSpecMap();
    delete map[concept?.id];
    sessionStorage.setItem(SWAGR_IMPRINT_READINESS_KEY, JSON.stringify(map));
  } catch {
    // Fail safely when session storage is unavailable.
  }
  return createEmptyImprintSpec(concept);
}
