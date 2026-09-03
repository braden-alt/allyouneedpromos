const STOP = new Set(['and','the','for','with','from','into','your','our','this','that','are','all','use','case','event','need','needs','item','items']);

function tokens(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP.has(token));
}

function expandBriefTokens(brief = {}) {
  const raw = [...tokens(brief.audience), ...tokens(brief.useCase), ...tokens(brief.style)];
  const expanded = new Set(raw);
  const text = raw.join(' ');
  const add = (...values) => values.forEach((value) => expanded.add(value));

  if (/recruit|career|hiring/.test(text)) add('welcome','event','everyday','gift');
  if (/field|crew|jobsite|trade|construction|industrial/.test(text)) add('trades','outdoor','daily','durable');
  if (/conference|tradeshow|expo|booth/.test(text)) add('tradeshow','event','budget','daily');
  if (/executive|client|vip|premium/.test(text)) add('premium','gift','executive');
  if (/employee|onboard|welcome/.test(text)) add('employee','welcome','gift','daily');
  if (/outdoor|summer|tailgate|golf/.test(text)) add('outdoor','event','lifestyle');
  if (/tech|developer|software/.test(text)) add('tech','office','travel');
  if (/winter|cold/.test(text)) add('winter','cold','weather');

  return [...expanded];
}

function excluded(item, brief = {}) {
  const exclusionTokens = tokens(brief.exclusions);
  if (!exclusionTokens.length) return false;
  const haystack = tokens([item.name, item.category, ...(item.tags || [])].join(' '));
  return exclusionTokens.some((token) => haystack.includes(token));
}export function rankIdeas(catalog, brief = {}) {
  const briefTokens = expandBriefTokens(brief);
  return catalog
    .map((item) => {
      const itemTokens = tokens([item.name, item.category, item.decorationDirection, ...(item.tags || [])].join(' '));
      const matched = briefTokens.filter((token) => itemTokens.includes(token));
      const tagMatches = briefTokens.filter((token) => (item.tags || []).some((tag) => tokens(tag).includes(token)));
      const score = matched.length * 3 + tagMatches.length * 2 + Math.max(0, 4 - item.sortOrder / 12);
      return {
        ...item,
        fitScore: Number(score.toFixed(1)),
        matchedSignals: [...new Set(matched)].slice(0, 5),
        excluded: excluded(item, brief),
      };
    })
    .filter((item) => !item.excluded)
    .sort((a, b) => b.fitScore - a.fitScore || a.sortOrder - b.sortOrder);
}
export function explainIdea(item, brief = {}) {
  const audience = String(brief.audience || '').trim();
  const useCase = String(brief.useCase || '').trim();
  const signals = item.matchedSignals || [];

  if (signals.length) {
    return `Matches ${signals.slice(0, 3).join(', ')} signals${useCase ? ` from the ${useCase} brief` : ''}${audience ? ` for ${audience}` : ''}.`;
  }

  if (useCase || audience) {
    return `Adds ${item.category.toLowerCase()} variety to the planning mix${useCase ? ` for ${useCase}` : ''}${audience ? ` with ${audience} in mind` : ''}; validate fit before quoting.`;
  }

  return `Useful ${item.category.toLowerCase()} planning direction from the recovered curated corpus; add campaign context to improve ranking.`;
}

export const IDEA_TRUTH_NOTE = 'Planning reference only. Live product, commercial, decoration, and production details still require validation.';
