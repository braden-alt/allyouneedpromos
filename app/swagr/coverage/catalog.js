import { SWAGR_FIXTURES } from '../../swagr-lab/fixtures';

// SWAGR-COVERAGE-001: additive planning-only lanes.
// These records deliberately avoid live SKU, price, inventory, compliance, or delivery claims.
export const SWAGR_COVERAGE_FIXTURES = [
  {
    id: 'SWAGR-CAT-007',
    name: 'Portable Charging / Power Bank Concept',
    category: 'Tech — portable charging',
    audiences: ['employees', 'clients', 'event attendees', 'traveling teams'],
    useCases: ['employee', 'gifting', 'event', 'recruiting'],
    quantities: ['QTY_SMALL', 'QTY_MID'],
    budgets: ['BAND_STANDARD', 'BAND_PREMIUM'],
    rationale: 'A repeat-use technology direction for travel, onboarding, client gifting, and event programs when useful desk or mobile utility matters.',
    decoration: ['Pad print', 'UV print', 'Laser marking where compatible'],
    creative: 'Use a compact centered mark or restrained corner treatment. Exact enclosure material, battery specification, safety certification, and imprint geometry require later validation.',
    evidence: 'FICTIONAL_CONCEPT + CATEGORY_LEVEL_INFERENCE',
    cautions: ['No battery-capacity claim', 'No charging-speed claim', 'No safety-certification claim', 'No price, stock, or lead-time claim', 'Decoration requires validation'],
  },
  {
    id: 'SWAGR-CAT-008',
    name: 'High-Visibility Crew Identification Concept',
    category: 'Safety — high-visibility identification',
    audiences: ['field crews', 'construction teams', 'warehouse teams', 'event operations staff'],
    useCases: ['field', 'safety', 'employee', 'onboarding'],
    quantities: ['QTY_SMALL', 'QTY_MID', 'QTY_LARGE'],
    budgets: ['BAND_STANDARD'],
    rationale: 'A field-oriented visibility and crew-identification direction that can support team recognition and jobsite coordination without being treated as certified PPE.',
    decoration: ['Heat transfer', 'Screen print', 'Patch application where compatible'],
    creative: 'Keep marks away from reflective or regulated areas until the exact garment and decoration specification are validated.',
    evidence: 'FICTIONAL_CONCEPT + CATEGORY_LEVEL_INFERENCE',
    cautions: ['Not an ANSI, OSHA, PPE, or regulatory-compliance claim', 'No protection rating', 'No garment-class claim', 'No price, stock, or lead-time claim', 'Decoration requires validation'],
  },
  {
    id: 'SWAGR-CAT-009',
    name: 'Event Badge / Lanyard System Concept',
    category: 'Events — badge and lanyard',
    audiences: ['conference attendees', 'event staff', 'volunteers', 'recruiting audiences'],
    useCases: ['event', 'conference', 'recruiting', 'program'],
    quantities: ['QTY_MID', 'QTY_LARGE'],
    budgets: ['BAND_GIVEAWAY', 'BAND_STANDARD'],
    rationale: 'A campaign-support direction for attendee identity, event coordination, recruiting, and conference programs where the branding system needs to travel with the participant.',
    decoration: ['Dye-sublimated strap', 'Screen print', 'Full-color badge insert'],
    creative: 'Treat the strap and badge face as separate brand surfaces. Exact hardware, credential dimensions, and print areas require later validation.',
    evidence: 'FICTIONAL_CONCEPT + CATEGORY_LEVEL_INFERENCE',
    cautions: ['No access-control or security claim', 'No credential-system integration claim', 'No hardware or badge-size claim', 'No price, stock, or lead-time claim', 'Decoration requires validation'],
  },
];

export const SWAGR_GOVERNED_CONCEPTS = [...SWAGR_FIXTURES, ...SWAGR_COVERAGE_FIXTURES];
