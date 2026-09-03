export const SWAGR_BRAND_PROFILE_KEY = 'swagr.brandProfile.v1';

export const VISUAL_DIRECTIONS = [
  'Clean + modern',
  'Premium + restrained',
  'Bold + energetic',
  'Practical + industrial',
  'Warm + community-focused',
];

export const DEFAULT_BRAND_PROFILE = {
  schemaVersion: 1,
  source: 'SWAGR_BRAND_KIT',
  persistence: 'SESSION_LOCAL_ONLY',
  brandName: 'Sample Brand',
  tagline: '',
  primaryColor: '#6C47FF',
  secondaryColor: '#F5C842',
  visualDirection: 'Clean + modern',
  audienceNote: '',
  doNotes: '',
  avoidNotes: '',
  logoDataUrl: '',
  updatedAt: '',
};

function normalizeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || '') ? value.toUpperCase() : fallback;
}

export function normalizeBrandProfile(input = {}) {
  return {
    ...DEFAULT_BRAND_PROFILE,
    ...input,
    schemaVersion: 1,
    source: 'SWAGR_BRAND_KIT',
    persistence: 'SESSION_LOCAL_ONLY',
    brandName: String(input.brandName || DEFAULT_BRAND_PROFILE.brandName).slice(0, 80),
    tagline: String(input.tagline || '').slice(0, 140),
    primaryColor: normalizeColor(input.primaryColor, DEFAULT_BRAND_PROFILE.primaryColor),
    secondaryColor: normalizeColor(input.secondaryColor, DEFAULT_BRAND_PROFILE.secondaryColor),
    visualDirection: VISUAL_DIRECTIONS.includes(input.visualDirection)
      ? input.visualDirection
      : DEFAULT_BRAND_PROFILE.visualDirection,
    audienceNote: String(input.audienceNote || '').slice(0, 240),
    doNotes: String(input.doNotes || '').slice(0, 500),
    avoidNotes: String(input.avoidNotes || '').slice(0, 500),
    logoDataUrl: typeof input.logoDataUrl === 'string' && input.logoDataUrl.startsWith('data:image/')
      ? input.logoDataUrl
      : '',
  };
}

export function loadBrandProfile() {
  try {
    const raw = sessionStorage.getItem(SWAGR_BRAND_PROFILE_KEY);
    return raw ? normalizeBrandProfile(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveBrandProfile(input) {
  const profile = normalizeBrandProfile({ ...input, updatedAt: new Date().toISOString() });
  try {
    sessionStorage.setItem(SWAGR_BRAND_PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    return profile;
  }
}

export function clearBrandProfile() {
  try {
    sessionStorage.removeItem(SWAGR_BRAND_PROFILE_KEY);
  } catch {
    // Restricted browser contexts may disable sessionStorage.
  }
}
