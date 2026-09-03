const ACTOR = 'fixture_test_user';

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();

export function getRequirementGaps(req) {
  const gaps = [];
  if (!req.audience?.trim()) gaps.push('Audience is unknown');
  if (!req.useCase?.trim()) gaps.push('Use case is unknown');
  if (req.quantity === 'QTY_UNSTATED') gaps.push('Quantity band is unknown — quantity feasibility is not evaluated');
  if (req.budget === 'UNSTATED') gaps.push('Budget band is unknown — commercial fit needs later validation');
  if (!req.inHandsDate) gaps.push('In-hands date is unknown — delivery feasibility cannot be stated');
  if (!req.location?.trim()) gaps.push('Delivery location is unknown');
  return gaps;
}

export function requirementsAreReady(req) {
  return getRequirementGaps(req).length === 0;
}

export function isFixtureExcluded(fixture, exclusionText = '') {
  const searchable = normalize(`${fixture.name} ${fixture.category}`);
  const phrases = exclusionText
    .split(/[,;\n]/)
    .map((part) => normalize(part).replace(/^(no|avoid|exclude|without)\s+/, '').trim())
    .filter((part) => part.length >= 3);

  return phrases.some((phrase) => searchable.includes(phrase));
}

export function scoreFixture(fixture, req) {
  let score = 0;
  const audience = normalize(req.audience);
  const useCase = normalize(req.useCase);

  if (audience && fixture.audiences.some((x) => audience.includes(normalize(x)) || normalize(x).includes(audience))) score += 4;
  if (useCase && fixture.useCases.some((x) => useCase.includes(normalize(x)) || normalize(x).includes(useCase))) score += 4;
  if (req.quantity !== 'QTY_UNSTATED' && fixture.quantities.includes(req.quantity)) score += 3;
  if (req.budget !== 'UNSTATED' && fixture.budgets.includes(req.budget)) score += 3;

  const style = normalize(req.style);
  if (style.includes('premium') && fixture.budgets.includes('BAND_PREMIUM')) score += 1;
  if ((style.includes('giveaway') || style.includes('broad distribution')) && fixture.budgets.includes('BAND_GIVEAWAY')) score += 1;

  if (fixture.id === 'SWAGR-CAT-001') score += 1;
  return score;
}

export function buildRecommendations(fixtures, req, excludedIds = []) {
  return fixtures
    .filter((fixture) => !excludedIds.includes(fixture.id))
    .filter((fixture) => !isFixtureExcluded(fixture, req.exclusions))
    .map((fixture) => ({ fixture, score: scoreFixture(fixture, req) }))
    .sort((a, b) => b.score - a.score || a.fixture.id.localeCompare(b.fixture.id))
    .slice(0, 5)
    .map(({ fixture }) => fixture.id);
}

export function buildFitRationale(fixture, req) {
  const signals = [];
  const audience = normalize(req.audience);
  const useCase = normalize(req.useCase);
  const audienceMatch = audience && fixture.audiences.some((x) => audience.includes(normalize(x)) || normalize(x).includes(audience));
  const useMatch = useCase && fixture.useCases.some((x) => useCase.includes(normalize(x)) || normalize(x).includes(useCase));

  if (audienceMatch) signals.push(`Audience signal matched: ${req.audience}.`);
  else if (req.audience?.trim()) signals.push(`Audience fit is not directly proven for “${req.audience}”; treat this as a category-level option.`);

  if (useMatch) signals.push(`Use-case signal matched: ${req.useCase}.`);
  else if (req.useCase?.trim()) signals.push(`Use-case fit is not directly proven for “${req.useCase}”; human review is still needed.`);

  if (req.quantity === 'QTY_UNSTATED') signals.push('Quantity is unstated, so quantity feasibility is not evaluated.');
  else if (fixture.quantities.includes(req.quantity)) signals.push('The selected quantity planning band matches this fixture concept.');
  else signals.push('The selected quantity planning band does not match this fixture concept; feasibility requires validation.');

  if (req.budget === 'UNSTATED') signals.push('Budget is unstated, so commercial fit remains unknown.');
  else if (fixture.budgets.includes(req.budget)) signals.push('The selected budget planning band matches this fixture concept.');
  else signals.push('The selected budget planning band does not match this fixture concept; commercial fit requires validation.');

  if (req.style?.trim()) signals.push(`Style preference noted: “${req.style.trim()}”; creative fit is not treated as verified.`);

  return `${fixture.rationale} ${signals.join(' ')}`;
}

export function nextProposalDirection(fixtures, proposalIds, selectedIds, req) {
  const eligible = buildRecommendations(fixtures, req);
  const alternate = eligible.find((id) => !proposalIds.includes(id))
    || fixtures.find((fixture) => !proposalIds.includes(fixture.id) && !isFixtureExcluded(fixture, req.exclusions))?.id;

  if (!alternate || proposalIds.length === 0) return [...proposalIds];

  const next = [...proposalIds];
  let replaceIndex = -1;
  for (let index = next.length - 1; index >= 0; index -= 1) {
    if (!selectedIds.includes(next[index])) {
      replaceIndex = index;
      break;
    }
  }
  if (replaceIndex < 0) replaceIndex = next.length - 1;
  next[replaceIndex] = alternate;
  return [...new Set(next)].slice(0, 5);
}

export function statusForRequirements(req, recommendationCount = 0) {
  if (!requirementsAreReady(req)) return 'REQUIREMENTS_INCOMPLETE';
  return recommendationCount > 0 ? 'RECOMMENDATIONS_READY' : 'REQUIREMENTS_READY';
}

export function makeAuditEvent({ action, reason, priorState, newState, objectId = 'DISCOVERY_SESSION' }) {
  return {
    actor: ACTOR,
    eventTime: new Date().toISOString(),
    objectId,
    action,
    priorState,
    newState,
    reason,
  };
}
