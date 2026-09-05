'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bookmark, Boxes, Check, Search, ShieldCheck, Sparkles, Target, X } from 'lucide-react';
import ConceptVisual from '../concept-visual';
import { SWAGR_GOVERNED_CONCEPTS } from '../coverage/catalog';
import { buildFitRationale, isFixtureExcluded, scoreFixture } from '../../swagr-lab/engine';
import { buildProviderView, DATA_SCENARIOS, providerStateIsDegraded } from '../data-adapter';
import { loadActiveCampaignDecisionContext, saveActiveCampaignConceptId, saveActiveCampaignPinnedConceptIds } from '../campaign-store';
import { clearMixDiscoveryFocus, loadMixDiscoveryFocus, scoreRecordForMixFocus, summarizeMixFocus } from '../mix/discovery-focus';
import { SWAGR_PROMO_FACTS } from '../promo-facts/catalog';
import {
  getPromoFactMixFocus,
  researchFocusMatchesItem,
  SWAGR_PROMO_MIX_FOCUS_META,
} from '../promo-facts/mix-focus';

const C = {
  bg: '#120D1A', panel: '#1B1530', panel2: '#211938', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', muted: '#AAA0B8', line: '#352A46',
};

const ACTIVE_BRIEF_KEY = 'swagr.activeBrief.v1';

const CAMPAIGNS = [
  ['all', 'All moments'], ['event', 'Events'], ['employee', 'Employee'], ['gifting', 'Gifting'],
  ['field', 'Field'], ['team', 'Team'], ['kit', 'Kits'], ['giveaway', 'Giveaway'], ['recruiting', 'Recruiting'],
];

const QTY_LABELS = {
  QTY_LOW: 'Lower quantity',
  QTY_MID: 'Mid quantity',
  QTY_HIGH: 'Higher quantity',
  QTY_UNSTATED: 'Quantity open',
};

const BUDGET_LABELS = {
  BAND_GIVEAWAY: 'Giveaway band',
  BAND_STANDARD: 'Standard band',
  BAND_PREMIUM: 'Premium band',
  UNSTATED: 'Budget open',
};

const LIBRARY_META = {
  'SWAGR-CAT-001': { family: 'Identity wearables', substituteGroup: 'WEARABLE_IDENTITY', style: ['broad reach', 'graphic', 'team identity'] },
  'SWAGR-CAT-002': { family: 'Premium wearables', substituteGroup: 'WEARABLE_PREMIUM', style: ['premium', 'restrained', 'repeat use'] },
  'SWAGR-CAT-003': { family: 'Identity wearables', substituteGroup: 'WEARABLE_IDENTITY', style: ['everyday', 'compact mark', 'field friendly'] },
  'SWAGR-CAT-004': { family: 'Everyday use', substituteGroup: 'DAILY_USE', style: ['daily use', 'clean', 'giftable'] },
  'SWAGR-CAT-005': { family: 'Event utility', substituteGroup: 'EVENT_UTILITY', style: ['large imprint', 'kit ready', 'carry'] },
  'SWAGR-CAT-006': { family: 'Broad distribution', substituteGroup: 'BROAD_DISTRIBUTION', style: ['high volume', 'simple mark', 'low friction'] },
  'SWAGR-CAT-007': { family: 'Mobile utility', substituteGroup: 'TECH_UTILITY', style: ['tech', 'travel', 'giftable', 'repeat use'] },
  'SWAGR-CAT-008': { family: 'Field visibility', substituteGroup: 'FIELD_VISIBILITY', style: ['field', 'crew', 'identification', 'safety-aware'] },
  'SWAGR-CAT-009': { family: 'Event identity', substituteGroup: 'EVENT_IDENTITY', style: ['event', 'credential', 'high volume', 'campaign support'] },
};

function categoryKey(category = '') {
  const value = category.toLowerCase();
  if (value.includes('apparel')) return 'Apparel';
  if (value.includes('headwear')) return 'Headwear';
  if (value.includes('drinkware')) return 'Drinkware';
  if (value.includes('bag')) return 'Bags';
  if (value.includes('writing')) return 'Writing';
  if (value.includes('tech') || value.includes('charging') || value.includes('power bank')) return 'Tech';
  if (value.includes('safety') || value.includes('high-visibility')) return 'Safety';
  if (value.includes('event') || value.includes('lanyard') || value.includes('badge')) return 'Events';
  return 'Other';
}

const RECORDS = SWAGR_GOVERNED_CONCEPTS.map((fixture) => ({
  ...fixture,
  ...LIBRARY_META[fixture.id],
  categoryKey: categoryKey(fixture.category),
  governance: {
    source: 'SYNTHETIC_FIXTURE',
    price: 'PLANNING_ONLY',
    inventory: 'UNKNOWN',
    virtual: 'CONCEPT_RECIPE_READY',
    production: 'VALIDATION_REQUIRED',
  },
}));

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={styles[tone]}>{children}</span>;
}

function Governance({ record }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
      <div className="rounded-xl border p-2.5" style={{ borderColor: C.line, background: '#0F0A17' }}><div style={{ color: C.muted }}>Source</div><div className="mt-1 font-bold" style={{ color: C.purpleLt }}>{record.governance.source}</div></div>
      <div className="rounded-xl border p-2.5" style={{ borderColor: C.line, background: '#0F0A17' }}><div style={{ color: C.muted }}>Commercial</div><div className="mt-1 font-bold" style={{ color: C.gold }}>{record.governance.price}</div></div>
      <div className="rounded-xl border p-2.5" style={{ borderColor: C.line, background: '#0F0A17' }}><div style={{ color: C.muted }}>Virtual</div><div className="mt-1 font-bold" style={{ color: C.green }}>RECIPE READY</div></div>
      <div className="rounded-xl border p-2.5" style={{ borderColor: C.line, background: '#0F0A17' }}><div style={{ color: C.muted }}>Production</div><div className="mt-1 font-bold" style={{ color: C.gold }}>VALIDATE</div></div>
    </div>
  );
}

function ProviderState({ state }) {
  const degraded = providerStateIsDegraded(state);
  return (
    <div data-testid="provider-state" className="mt-4 rounded-2xl border p-3" style={{ borderColor: degraded ? `${C.gold}66` : `${C.green}44`, background: degraded ? `${C.gold}08` : `${C.green}08` }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Provider contract</div>
        <Pill tone={degraded ? 'warn' : 'good'}>{state.providerMode}</Pill>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
        <div><div style={{ color: C.muted }}>Candidate</div><div className="mt-1 font-bold" style={{ color: C.purpleLt }}>{state.provider}</div></div>
        <div><div style={{ color: C.muted }}>Freshness</div><div className="mt-1 font-bold" style={{ color: degraded ? C.gold : C.green }}>{state.freshnessState}</div></div>
        <div><div style={{ color: C.muted }}>Inventory</div><div className="mt-1 font-bold" style={{ color: C.gold }}>{state.inventoryState}</div></div>
        <div><div style={{ color: C.muted }}>Usage rights</div><div className="mt-1 font-bold" style={{ color: C.gold }}>{state.usageRightsState}</div></div>
      </div>
      {state.errorState && <p className="mt-2 text-[10px] leading-4" style={{ color: C.gold }}>Failure state: {state.errorState}. SWAGR keeps live commercial facts unverified instead of inventing a fallback.</p>}
    </div>
  );
}

function fitState(score) {
  if (score >= 10) return { label: 'Strong brief fit', tone: 'good' };
  if (score >= 6) return { label: 'Useful brief fit', tone: 'purple' };
  return { label: 'Explore with review', tone: 'warn' };
}

export default function SwagrCuratedLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [campaign, setCampaign] = useState('all');
  const [pinned, setPinned] = useState([]);
  const [activeBrief, setActiveBrief] = useState(null);
  const [mixFocus, setMixFocus] = useState(null);
  const [researchFactId, setResearchFactId] = useState('');
  const [decisionContextLoaded, setDecisionContextLoaded] = useState(false);
  const [dataScenario, setDataScenario] = useState('SYNTHETIC_CURRENT');
  const [compareFocusId, setCompareFocusId] = useState('');
  const categories = ['All', ...new Set(RECORDS.map((record) => record.categoryKey))];
  const normalizedRecords = useMemo(() => buildProviderView(RECORDS, dataScenario), [dataScenario]);
  const activeDataScenario = DATA_SCENARIOS.find((scenario) => scenario.id === dataScenario) || DATA_SCENARIOS[0];
  const researchFact = useMemo(() => SWAGR_PROMO_FACTS.find((fact) => fact.id === researchFactId) || null, [researchFactId]);
  const researchFocus = useMemo(() => getPromoFactMixFocus(researchFact), [researchFact]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ACTIVE_BRIEF_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') setActiveBrief(parsed);
      setMixFocus(loadMixDiscoveryFocus({ campaignId: parsed?.campaignId || '' }));
      setResearchFactId(new URLSearchParams(window.location.search).get('researchFact') || '');
      const decisionContext = loadActiveCampaignDecisionContext();
      const validPinned = (decisionContext.pinnedConceptIds || [])
        .filter((id) => RECORDS.some((record) => record.id === id))
        .slice(0, 4);
      setPinned(validPinned);
    } catch {
      setActiveBrief(null);
      setMixFocus(null);
      setResearchFactId('');
      setPinned([]);
    } finally {
      setDecisionContextLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!decisionContextLoaded) return;
    saveActiveCampaignPinnedConceptIds(pinned);
  }, [decisionContextLoaded, pinned]);

  const focusedRecords = useMemo(() => {
    const eligible = activeBrief
      ? normalizedRecords.filter((record) => !isFixtureExcluded(record, activeBrief.exclusions || ''))
      : normalizedRecords;

    return eligible
      .map((record) => {
        const mixMatch = scoreRecordForMixFocus(record, mixFocus);
        const researchMatch = researchFocusMatchesItem(researchFocus, record);
        return {
          ...record,
          briefScore: activeBrief ? scoreFixture(record, activeBrief) : null,
          briefRationale: activeBrief ? buildFitRationale(record, activeBrief) : record.rationale,
          mixFocusScore: mixMatch.score,
          mixFocusMatches: mixMatch.matches,
          researchFocusMatch: researchMatch,
          researchFocusScore: researchMatch ? 6 : 0,
        };
      })
      .sort((a, b) => {
        const aScore = (activeBrief ? a.briefScore : 0) + (mixFocus ? a.mixFocusScore : 0) + (researchFocus ? a.researchFocusScore : 0);
        const bScore = (activeBrief ? b.briefScore : 0) + (mixFocus ? b.mixFocusScore : 0) + (researchFocus ? b.researchFocusScore : 0);
        return bScore - aScore || a.id.localeCompare(b.id);
      });
  }, [activeBrief, normalizedRecords, mixFocus, researchFocus]);

  const filtered = useMemo(() => focusedRecords.filter((record) => {
    const haystack = [record.name, record.category, record.family, ...(record.audiences || []), ...(record.useCases || []), ...(record.decoration || []), ...(record.style || [])].join(' ').toLowerCase();
    const queryMatch = !query.trim() || haystack.includes(query.trim().toLowerCase());
    const categoryMatch = category === 'All' || record.categoryKey === category;
    const campaignMatch = campaign === 'all' || [...(record.useCases || []), ...(record.audiences || [])].join(' ').toLowerCase().includes(campaign);
    return queryMatch && categoryMatch && campaignMatch;
  }), [focusedRecords, query, category, campaign]);

  const pinnedRecords = pinned.map((id) => focusedRecords.find((record) => record.id === id) || normalizedRecords.find((record) => record.id === id)).filter(Boolean);
  const togglePin = (id) => {
    if (pinned.includes(id) && compareFocusId === id) setCompareFocusId('');
    setPinned((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 4 ? [...items, id] : items);
  };
  const movePinned = (id, direction) => setPinned((items) => {
    const currentIndex = items.indexOf(id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
    const nextItems = [...items];
    [nextItems[currentIndex], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[currentIndex]];
    return nextItems;
  });

  const clearBriefFocus = () => {
    try { sessionStorage.removeItem(ACTIVE_BRIEF_KEY); } catch { /* local storage unavailable */ }
    setActiveBrief(null);
  };

  const clearMixFocus = () => {
    clearMixDiscoveryFocus();
    setMixFocus(null);
  };

  const mixSummary = summarizeMixFocus(mixFocus);
  const researchMatchCount = researchFocus ? focusedRecords.filter((record) => record.researchFocusMatch).length : 0;

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(60% 42% at 88% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(42% 28% at 2% 18%, rgba(245,200,66,.08), transparent 76%)' }} />
      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.96)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <Link href="/swagr" aria-label="Back to SWAGR" className="flex h-10 w-10 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link>
            <div><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Curated Concept Library</Pill></div><p className="mt-1 text-xs" style={{ color: C.muted }}>Discover governed product directions before live catalog, pricing, or inventory data enters the system.</p></div>
          </div>
          <div className="flex gap-2"><Pill tone="warn">Synthetic assortment</Pill><Pill tone="good">Phase 2</Pill></div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        {activeBrief ? (
          <section className="rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.purple}66`, background: 'linear-gradient(135deg, rgba(108,71,255,.16), rgba(27,21,48,.94))' }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex max-w-4xl items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} />
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-black">Your active brief is focusing the library.</h1><Pill tone="good">Local session only</Pill></div>
                  <p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>SWAGR carried the synthetic planning signals from the main experience into this library and ranked eligible concept directions. This is relevance guidance, not live product, price, stock, delivery, or production verification.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeBrief.audience && <Pill tone="neutral">For: {activeBrief.audience}</Pill>}
                    {activeBrief.useCase && <Pill tone="neutral">Moment: {activeBrief.useCase}</Pill>}
                    {activeBrief.quantity && <Pill tone="purple">{QTY_LABELS[activeBrief.quantity] || activeBrief.quantity}</Pill>}
                    {activeBrief.budget && <Pill tone="purple">{BUDGET_LABELS[activeBrief.budget] || activeBrief.budget}</Pill>}
                    {activeBrief.style && <Pill tone="neutral">Style: {activeBrief.style}</Pill>}
                    {!activeBrief.inHandsDate && <Pill tone="warn">Date still open</Pill>}
                  </div>
                </div>
              </div>
              <button type="button" onClick={clearBriefFocus} className="rounded-xl border px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Clear brief focus</button>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.gold}55`, background: 'linear-gradient(135deg, rgba(245,200,66,.08), rgba(27,21,48,.92))' }}>
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} /><div><h1 className="text-xl font-black">Browse for fit, not fake certainty.</h1><p className="mt-1 max-w-4xl text-xs leading-5" style={{ color: C.muted }}>These are governed planning records from SWAGR&apos;s accepted synthetic fixture corpus. Start on the main SWAGR experience first and this library can focus itself around that active brief. Nothing here claims live SKU identity, stock, price, MOQ, lead time, supplier approval, or production readiness.</p></div></div>
          </section>
        )}

        {mixFocus && (
          <section data-testid="swagr-mix-focus" className="mt-5 rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.green}66`, background: 'linear-gradient(135deg, rgba(52,211,153,.10), rgba(27,21,48,.94))' }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">Campaign mix focus is active.</h2><Pill tone="good">{mixFocus.selected.length} mix slots</Pill><Pill tone="warn">Category-level only</Pill></div>
                <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>SWAGR carried the selected session-local campaign mix into governed discovery and is prioritizing category lanes that can follow up those planning roles. This does not map a planning idea to a live SKU or verify price, stock, imprint, delivery, or production feasibility.</p>
                <div className="mt-4 flex flex-wrap gap-2">{mixSummary.categories.map((item) => <Pill key={item} tone="good">{item}</Pill>)}{mixSummary.roles.map((item) => <Pill key={item} tone="neutral">{item}</Pill>)}</div>
              </div>
              <div className="flex flex-wrap gap-2"><Link href={researchFact ? `/swagr/mix?researchFact=${encodeURIComponent(researchFact.id)}` : "/swagr/mix"} className="rounded-xl border px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.green, color: C.green, '--tw-ring-color': C.green }}>Back to campaign mix</Link><button type="button" onClick={clearMixFocus} className="rounded-xl border px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Clear mix focus</button></div>
            </div>
          </section>
        )}

        {researchFocus && (
          <section data-testid="swagr-research-focus" className="mt-5 rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.gold}66`, background: 'linear-gradient(135deg, rgba(245,200,66,.09), rgba(27,21,48,.95))' }}>
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-4xl"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">Research lens is guiding discovery.</h2><Pill tone="warn">{researchFocus.emphasis}</Pill><Pill tone="purple">Source-labeled</Pill></div><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>{researchFocus.rationale}</p>
            {researchFocus.categories.length ? <div className="mt-4"><div className="flex flex-wrap gap-2">{researchFocus.categories.map((item) => <Pill key={item} tone="warn">{item}</Pill>)}</div><p className="mt-3 text-[10px] leading-5" style={{ color: C.muted }}>{researchMatchCount} governed synthetic directions intersect this lens. Matches receive only a small planning boost; all other eligible directions remain available.</p></div> : <p className="mt-3 text-[10px] leading-5" style={{ color: C.gold }}>Context-only: this signal does not safely justify favoring a category, so research does not reorder the assortment.</p>}
            </div><div className="min-w-[240px] rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-2xl font-black">{researchFocus.signal}</div><p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>{researchFocus.headline}</p><p className="mt-2 text-[10px]" style={{ color: C.muted }}>{researchFocus.source.publisher} · {researchFocus.source.published}</p><div className="mt-3 flex gap-2"><a href={researchFocus.source.url} target="_blank" rel="noreferrer" className="rounded-xl border px-3 py-2 text-xs font-bold" style={{ borderColor: `${C.gold}66`, color: C.gold }}>Source</a><Link href="/swagr/library" className="rounded-xl border px-3 py-2 text-xs font-bold" style={{ borderColor: C.line, color: C.cream }}>Clear lens</Link></div><p className="mt-3 text-[9px] leading-4" style={{ color: C.muted }}>{SWAGR_PROMO_MIX_FOCUS_META.truthBoundary}</p></div></div>
          </section>
        )}

        <section data-testid="swagr-data-contract" className="mt-5 rounded-3xl border p-5 sm:p-6" style={{ borderColor: providerStateIsDegraded(normalizedRecords[0]?.providerState) ? `${C.gold}66` : `${C.green}44`, background: C.panel }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black">Data confidence contract</h2><Pill tone="purple">SAGE Connect candidate</Pill><Pill tone={activeDataScenario.id === 'SYNTHETIC_CURRENT' ? 'good' : 'warn'}>{activeDataScenario.label}</Pill></div>
              <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>This is a provider-agnostic synthetic adapter preview. It demonstrates how SWAGR will surface source, freshness, inventory, rights, and failure states before any real SAGE credential or licensed catalog data is authorized.</p>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Synthetic provider-state simulation">
              {DATA_SCENARIOS.map((scenario) => <button type="button" key={scenario.id} aria-pressed={dataScenario === scenario.id} onClick={() => setDataScenario(scenario.id)} className="rounded-xl border px-3 py-2 text-[11px] font-bold focus:outline-none focus:ring-2" style={{ borderColor: dataScenario === scenario.id ? C.purple : C.line, color: dataScenario === scenario.id ? C.purpleLt : C.muted, background: dataScenario === scenario.id ? `${C.purple}12` : '#0F0A17', '--tw-ring-color': C.purple }}>{scenario.label}</button>)}
            </div>
          </div>
          {dataScenario === 'UNAVAILABLE_SIMULATION' && <div data-testid="provider-unavailable-banner" className="mt-4 rounded-2xl border p-4 text-xs leading-5" style={{ borderColor: `${C.gold}66`, background: `${C.gold}08`, color: C.cream }}><strong style={{ color: C.gold }}>Provider unavailable simulation.</strong> The governed concept library stays usable, but SWAGR does not promote price, inventory, media rights, or production readiness to verified status and does not silently call another live provider.</div>}
        </section>


        <section data-testid="swagr-pinned-compare-board" className="mt-6 rounded-3xl border p-5 sm:p-6" style={{ borderColor: pinnedRecords.length ? `${C.purple}66` : C.line, background: 'linear-gradient(145deg, rgba(108,71,255,.12), rgba(27,21,48,.96))' }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2"><Bookmark className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-xl font-black">Pinned direction compare board</h2><Pill tone={pinnedRecords.length ? 'purple' : 'neutral'}>{pinnedRecords.length}/4</Pill><Pill tone="warn">Planning guidance</Pill></div>
              <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Compare the governed role each direction could play before SWAGR resolves real supplier items. Reorder, focus, or remove directions here without creating a product, quote, proof, approval, or production decision.</p>
            </div>
            <div className="rounded-2xl border px-4 py-3 text-[10px] leading-5" style={{ borderColor: `${C.gold}44`, background: '#0F0A17', color: C.muted }}><strong style={{ color: C.gold }}>Live commercial truth stays unresolved.</strong><br />SKU, price, stock, MOQ, lead time, exact media, imprint feasibility, supplier approval, and production readiness still require governed provider validation.</div>
          </div>
          {pinnedRecords.length ? (
            <div className="mt-5 overflow-x-auto pb-2">
              <div className="grid min-w-max gap-3" style={{ gridTemplateColumns: `repeat(${pinnedRecords.length}, minmax(250px, 1fr))` }}>
                {pinnedRecords.map((record, index) => {
                  const providerDegraded = providerStateIsDegraded(record.providerState);
                  const isFocused = compareFocusId === record.id;
                  const mixMatched = Boolean(mixFocus && record.mixFocusScore > 0);
                  const researchMatched = Boolean(researchFocus && record.researchFocusMatch);
                  return <article key={record.id} data-testid={`compare-${record.id}`} className="rounded-2xl border p-4" style={{ borderColor: isFocused ? C.gold : `${C.purple}55`, background: isFocused ? `${C.gold}08` : '#0F0A17', boxShadow: isFocused ? `0 0 0 1px ${C.gold}33` : 'none' }}>
                    <div className="flex items-start justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Direction {index + 1}</div><h3 className="mt-1 text-base font-black">{record.name}</h3><p className="mt-1 text-[10px]" style={{ color: C.muted }}>{record.categoryKey} · {record.family}</p></div>{isFocused && <Pill tone="warn">Focused</Pill>}</div>
                    <div className="mt-4 rounded-xl border p-3" style={{ borderColor: C.line, background: C.panel }}><div className="text-[9px] font-bold uppercase tracking-[0.13em]" style={{ color: C.muted }}>Planning rationale</div><p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>{record.briefRationale}</p></div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px]">
                      <div className="rounded-xl border p-2" style={{ borderColor: C.line, background: C.panel }}><div style={{ color: C.muted }}>Brief fit</div><div className="mt-1 font-black" style={{ color: activeBrief ? C.purpleLt : C.muted }}>{activeBrief ? record.briefScore : 'OPEN'}</div></div>
                      <div className="rounded-xl border p-2" style={{ borderColor: mixMatched ? `${C.green}55` : C.line, background: C.panel }}><div style={{ color: C.muted }}>Mix fit</div><div className="mt-1 font-black" style={{ color: mixMatched ? C.green : C.muted }}>{mixMatched ? `${record.mixFocusMatches.length} MATCH` : 'OPEN'}</div></div>
                      <div className="rounded-xl border p-2" style={{ borderColor: researchMatched ? `${C.gold}55` : C.line, background: C.panel }}><div style={{ color: C.muted }}>Research fit</div><div className="mt-1 font-black" style={{ color: researchMatched ? C.gold : C.muted }}>{researchMatched ? 'MATCH' : researchFocus ? 'NO MATCH' : 'OPEN'}</div></div>
                    </div>
                    <div className="mt-3 space-y-2 text-[10px]">
                      <div className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.line, background: C.panel }}><span style={{ color: C.muted }}>Source</span><strong style={{ color: C.purpleLt }}>{record.governance.source}</strong></div>
                      <div className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2" style={{ borderColor: providerDegraded ? `${C.gold}55` : `${C.green}44`, background: C.panel }}><span style={{ color: C.muted }}>Provider confidence</span><strong style={{ color: providerDegraded ? C.gold : C.green }}>{providerDegraded ? 'DEGRADED / UNVERIFIED' : record.providerState.freshnessState}</strong></div>
                      <div className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.line, background: C.panel }}><span style={{ color: C.muted }}>Virtual readiness</span><strong style={{ color: C.green }}>RECIPE READY</strong></div>
                      <div className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2" style={{ borderColor: `${C.gold}44`, background: C.panel }}><span style={{ color: C.muted }}>Production</span><strong style={{ color: C.gold }}>{record.governance.production}</strong></div>
                      <div className="rounded-xl border px-3 py-2" style={{ borderColor: C.line, background: C.panel }}><div className="flex items-center justify-between gap-2"><span style={{ color: C.muted }}>Substitute family</span><strong style={{ color: C.cream }}>{record.substituteGroup}</strong></div><p className="mt-1 leading-4" style={{ color: C.muted }}>Relationship only; no real substitute equivalence is claimed.</p></div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setCompareFocusId(isFocused ? '' : record.id)} aria-pressed={isFocused} className="rounded-xl border px-3 py-2 text-[10px] font-bold focus:outline-none focus:ring-2" style={{ borderColor: isFocused ? C.gold : C.line, color: isFocused ? C.gold : C.cream, '--tw-ring-color': C.gold }}>{isFocused ? 'Clear focus' : 'Focus'}</button>
                      <button type="button" onClick={() => togglePin(record.id)} className="rounded-xl border px-3 py-2 text-[10px] font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.purple }}>Remove</button>
                      <button type="button" disabled={index === 0} onClick={() => movePinned(record.id, -1)} className="rounded-xl border px-3 py-2 text-[10px] font-bold disabled:opacity-30 focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Move earlier</button>
                      <button type="button" disabled={index === pinnedRecords.length - 1} onClick={() => movePinned(record.id, 1)} className="rounded-xl border px-3 py-2 text-[10px] font-bold disabled:opacity-30 focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Move later</button>
                    </div>
                  </article>;
                })}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed p-6 text-center" style={{ borderColor: C.line, background: '#0F0A17' }}><Bookmark className="mx-auto h-5 w-5" style={{ color: C.muted }} /><h3 className="mt-3 text-sm font-black">Pin 2–4 governed directions to compare.</h3><p className="mx-auto mt-2 max-w-xl text-xs leading-5" style={{ color: C.muted }}>The board will compare planning role, fit signals, provider confidence, virtual readiness, validation status, and substitute relationships without inventing live commercial facts.</p></div>
          )}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="rounded-3xl border p-4 sm:p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4" style={{ color: C.muted }} /><span className="sr-only">Search concept library</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search audience, use case, category, decoration..." className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none focus:ring-2" style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }} /></label>
                <button type="button" onClick={() => { setQuery(''); setCategory('All'); setCampaign('all'); }} className="rounded-xl border px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Clear filters</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className="rounded-full border px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:ring-2" style={{ borderColor: category === item ? C.purple : C.line, background: category === item ? `${C.purple}18` : '#0F0A17', color: category === item ? C.purpleLt : C.muted, '--tw-ring-color': C.purple }}>{item}</button>)}</div>
              <div className="mt-3 flex flex-wrap gap-2">{CAMPAIGNS.map(([value, label]) => <button type="button" key={value} aria-pressed={campaign === value} onClick={() => setCampaign(value)} className="rounded-full border px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2" style={{ borderColor: campaign === value ? `${C.gold}88` : C.line, background: campaign === value ? `${C.gold}10` : '#0F0A17', color: campaign === value ? C.gold : C.muted, '--tw-ring-color': C.gold }}>{label}</button>)}</div>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.purpleLt }}>{activeBrief || mixFocus || researchFocus ? 'Focused governed assortment' : 'Governed assortment'}</div><h2 className="mt-1 text-2xl font-black">{filtered.length} planning direction{filtered.length === 1 ? '' : 's'}</h2></div><p className="text-xs" style={{ color: C.muted }}>{mixFocus ? 'Mix-matched lanes appear first; brief relevance, research context, and exclusions still apply.' : researchFocus?.categories.length ? 'Research-matched governed lanes receive a small planning boost; all other eligible directions remain available.' : activeBrief ? 'Highest planning-fit directions appear first; explicit brief exclusions are suppressed.' : 'Pin up to 4 to compare the role each direction could play.'}</p></div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {filtered.map((record, index) => {
                const isPinned = pinned.includes(record.id);
                const atCap = pinned.length >= 4 && !isPinned;
                const fit = activeBrief ? fitState(record.briefScore) : null;
                const mixMatched = Boolean(mixFocus && record.mixFocusScore > 0);
                const researchMatched = Boolean(researchFocus && record.researchFocusMatch);
                return <article key={record.id} className="overflow-hidden rounded-3xl border" style={{ background: C.panel, borderColor: isPinned ? C.purple : mixMatched ? `${C.green}77` : researchMatched ? `${C.gold}77` : index === 0 && activeBrief ? `${C.gold}77` : C.line }}>
                  <div className="p-3 pb-0"><ConceptVisual concept={record} compact conceptLabel={mixMatched ? `Mix-focused direction ${index + 1}` : activeBrief ? `Brief-ranked direction ${index + 1}` : 'Library direction'} /></div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.purpleLt }}>{record.family}</p><h3 className="mt-1 text-lg font-black">{record.name}</h3><p className="mt-1 text-xs" style={{ color: C.muted }}>{record.category}</p></div><button type="button" disabled={atCap} onClick={() => togglePin(record.id)} aria-pressed={isPinned} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus:ring-2" style={{ borderColor: isPinned ? C.purple : C.line, color: isPinned ? C.purpleLt : C.muted, background: isPinned ? `${C.purple}16` : '#0F0A17', '--tw-ring-color': C.purple }} aria-label={isPinned ? `Unpin ${record.name}` : `Pin ${record.name}`}><Bookmark className="h-4 w-4" fill={isPinned ? 'currentColor' : 'none'} /></button></div>
                    {activeBrief && <div className="mt-4 flex flex-wrap items-center gap-2"><Pill tone={fit.tone}>{fit.label}</Pill><span className="text-[10px] font-bold" style={{ color: C.muted }}>planning score {record.briefScore}</span>{index === 0 && <Pill tone="warn">Top current direction</Pill>}</div>}
                    {mixMatched && <div className="mt-4 flex flex-wrap items-center gap-2"><Pill tone="good">Campaign mix match</Pill><span className="text-[10px] font-bold" style={{ color: C.muted }}>{record.mixFocusMatches.map((item) => `Slot ${item.slot}: ${item.mixRole}`).join(' · ')}</span></div>}
                    {researchMatched && <div className="mt-3 rounded-2xl border p-3" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}><div className="flex flex-wrap items-center gap-2"><Pill tone="warn">Research lens fit</Pill><span className="text-[10px] font-bold" style={{ color: C.muted }}>{researchFocus.emphasis}</span></div><p className="mt-2 text-[10px] leading-5" style={{ color: C.cream }}>This governed synthetic category intersects the reviewed research lens. It is a planning cue only; exact product fit and every commercial or production fact still require separate governed validation.</p></div>}
                    <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: activeBrief ? `${C.purple}44` : C.line, background: '#0F0A17' }}>
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: activeBrief ? C.gold : C.muted }}>{activeBrief ? 'Why this fits the active brief' : 'Planning rationale'}</div>
                      <p className="mt-2 text-sm leading-6" style={{ color: C.cream }}>{record.briefRationale}</p>
                    </div>
                    {mixMatched && <div className="mt-3 rounded-2xl border p-3" style={{ borderColor: `${C.green}44`, background: `${C.green}08` }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.green }}>Why this supports the selected mix</div><p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>This governed synthetic lane matches {record.mixFocusMatches.map((item) => `${item.category} / ${item.mixRole}`).join(', ')}. Product-level equivalence is not assumed; exact item, commercial facts, decoration, and schedule still require governed validation.</p></div>}
                    <div className="mt-4 flex flex-wrap gap-2">{record.style.map((tag) => <Pill key={tag} tone="neutral">{tag}</Pill>)}</div>
                    <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: C.muted }}>Substitute family</div><div className="mt-1 text-xs font-bold" style={{ color: C.cream }}>{record.substituteGroup}</div><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>Relationship only. A real substitute still requires equivalent product, price, availability, decoration, and schedule validation.</p></div>
                    <div className="mt-4"><Governance record={record} /></div>
                    <ProviderState state={record.providerState} />
                    <div className="mt-4 flex flex-wrap gap-2"><Link href={researchFact ? `/swagr/virtual/assembled?concept=${encodeURIComponent(record.id)}&source=research-guided-discovery&researchFact=${encodeURIComponent(researchFact.id)}` : `/swagr/virtual?concept=${encodeURIComponent(record.id)}&source=library`} onClick={() => saveActiveCampaignConceptId(record.id)} className="rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}>{researchFact ? 'Open controlled virtual' : 'Open this concept'}</Link><span className="rounded-xl border px-3 py-2.5 text-[10px]" style={{ borderColor: C.line, color: C.muted }}>Inventory: UNKNOWN</span></div>
                  </div>
                </article>;
              })}
            </div>
            {!filtered.length && <div className="mt-5 rounded-3xl border p-8 text-center" style={{ background: C.panel, borderColor: C.line }}><Search className="mx-auto h-6 w-6" style={{ color: C.muted }} /><h3 className="mt-3 font-black">No synthetic directions match those filters.</h3><p className="mt-1 text-sm" style={{ color: C.muted }}>{activeBrief ? 'The active brief exclusions and current filters removed every direction. Clear a filter or return to SWAGR to revise the brief.' : 'Clear or broaden the filters. No live catalog fallback is being used.'}</p></div>}
          </div>

          <aside className="h-fit space-y-5 lg:sticky lg:top-5">
            <section className="rounded-3xl border p-5" style={{ background: C.panel2, borderColor: pinned.length ? `${C.purple}66` : C.line }}>
              <div className="flex flex-wrap items-center gap-2"><Bookmark className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="font-black">Pinned directions</h2><Pill tone={pinned.length ? 'purple' : 'neutral'}>{pinned.length}/4</Pill>{activeBrief?.campaignId && <Pill tone="good">Saved to campaign</Pill>}</div>
              {pinnedRecords.length ? <div className="mt-4 space-y-2">{pinnedRecords.map((record) => <div key={record.id} className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="min-w-0"><div className="truncate text-xs font-bold">{record.name}</div><div className="mt-1 text-[10px]" style={{ color: C.muted }}>{record.family}</div></div><button type="button" onClick={() => togglePin(record.id)} aria-label={`Remove ${record.name} from pinned directions`} className="shrink-0 rounded-lg p-1.5 focus:outline-none focus:ring-2" style={{ color: C.muted, '--tw-ring-color': C.purple }}><X className="h-3.5 w-3.5" /></button></div>)}</div> : <p className="mt-3 text-xs leading-5" style={{ color: C.muted }}>Pin a few concepts to compare roles before SWAGR resolves real items.</p>}
            </section>

            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Boxes className="h-5 w-5" style={{ color: C.gold }} /><h2 className="font-black">What is reusable now</h2></div>
              <div className="mt-4 space-y-2 text-xs leading-5" style={{ color: C.cream }}>{['Campaign and audience tags', 'Category and family normalization', 'Brief-to-library relevance ranking', 'Concept virtual recipe readiness', 'Substitute relationship groups', 'Visible evidence / confidence states'].map((item) => <div key={item} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.green }} /><span>{item}</span></div>)}</div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: `${C.gold}44` }}>
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5" style={{ color: C.gold }} /><h2 className="font-black">What real data must resolve</h2></div>
              <div className="mt-4 space-y-2 text-xs leading-5" style={{ color: C.muted }}>{['Exact supplier item, SKU, color and media', 'Current sell price, cost inputs, MOQ and setup', 'Inventory, lead time and delivery feasibility', 'Product-specific imprint area and decoration limits', 'Supplier approval and final production proof'].map((item) => <div key={item} className="flex gap-2"><span style={{ color: C.gold }}>•</span><span>{item}</span></div>)}</div>
              <p className="mt-4 rounded-xl border p-3 text-[10px] leading-4" style={{ borderColor: C.line, background: '#0F0A17', color: C.muted }}>Brief ranking is local planning intelligence only. The future data backbone must populate commercial facts with freshness, source authority, and failure states instead of silently converting planning concepts into commercial truth.</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
