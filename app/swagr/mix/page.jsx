'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Compass,
  Link2,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { loadActiveCampaign } from '../campaign-store';
import { SWAGR_IDEA_CATALOG } from '../ideas/catalog';
import { SWAGR_PROMO_FACTS } from '../promo-facts/catalog';
import {
  getPromoFactMixFocus,
  researchFocusMatchesItem,
  SWAGR_PROMO_MIX_FOCUS_META,
} from '../promo-facts/mix-focus';
import {
  buildCampaignMix,
  evaluateCampaignMix,
  getMixProfile,
  inferMixProfileId,
  MIX_PROFILES,
  MIX_TRUTH_NOTE,
} from './engine';
import { saveMixDiscoveryFocus } from './discovery-focus';

const IDEA_PIN_KEY = 'swagr.ideaPins.v1';
const MIX_STATE_KEY = 'swagr.mixPlanner.v1';
const DEFAULT_TARGET = 4;

const C = {
  bg: '#0D0913',
  panel: '#171022',
  panel2: '#211938',
  line: '#352A46',
  purple: '#6C47FF',
  purpleLt: '#B6A6FF',
  gold: '#F5C842',
  cream: '#F1EAD8',
  green: '#34D399',
  red: '#FB7185',
  muted: '#AAA0B8',
};

function loadPins() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(IDEA_PIN_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((id) => SWAGR_IDEA_CATALOG.some((item) => item.id === id)).slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

function loadSavedMix(campaignId) {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(MIX_STATE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    if ((parsed.campaignId || '') !== (campaignId || '')) return null;
    const selectedIds = Array.isArray(parsed.selectedIds)
      ? parsed.selectedIds.filter((id) => SWAGR_IDEA_CATALOG.some((item) => item.id === id)).slice(0, 5)
      : [];
    return {
      selectedIds,
      profileId: MIX_PROFILES.some((profile) => profile.id === parsed.profileId) ? parsed.profileId : 'auto',
      targetCount: Math.min(5, Math.max(2, Number(parsed.targetCount) || DEFAULT_TARGET)),
    };
  } catch {
    return null;
  }
}

function saveMixState({ campaignId, selectedIds, profileId, targetCount }) {
  try {
    sessionStorage.setItem(MIX_STATE_KEY, JSON.stringify({
      schemaVersion: 1,
      persistence: 'SESSION_LOCAL_ONLY',
      campaignId: campaignId || '',
      selectedIds: selectedIds.slice(0, 5),
      profileId,
      targetCount,
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    // Restricted browser contexts can disable sessionStorage.
  }
}

function Pill({ children, tone = 'muted' }) {
  const toneMap = {
    muted: { color: C.muted, borderColor: C.line, background: '#120C1B' },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}10` },
    gold: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}10` },
    warn: { color: C.red, borderColor: `${C.red}55`, background: `${C.red}0D` },
  };
  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em]"
      style={toneMap[tone] || toneMap.muted}
    >
      {children}
    </span>
  );
}

function Metric({ label, value, note, tone = 'purple' }) {
  const color = tone === 'good' ? C.green : tone === 'gold' ? C.gold : C.purpleLt;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#110B19' }}>
      <div className="text-[9px] font-black uppercase tracking-[0.13em]" style={{ color: C.muted }}>{label}</div>
      <div className="mt-1 text-2xl font-black" style={{ color }}>{value}</div>
      <div className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>{note}</div>
    </div>
  );
}

function DirectionCard({ item, onRemove, researchFocus }) {
  return (
    <article
      data-testid="swagr-mix-direction"
      className="flex h-full flex-col rounded-3xl border p-5"
      style={{ borderColor: item.pinnedSource ? `${C.green}55` : C.line, background: C.panel }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl"
            style={{ borderColor: C.line, background: C.panel2 }}
          >
            {item.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <Pill tone="purple">Slot {item.slot}</Pill>
              <Pill>{item.category}</Pill>
              {item.pinnedSource && <Pill tone="good">Pinned source</Pill>}
              {researchFocusMatchesItem(researchFocus, item) && <Pill tone="gold">Research lens fit</Pill>}
            </div>
            <h3 className="mt-2 text-lg font-black leading-tight text-white">{item.name}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name} from campaign mix`}
          className="rounded-xl border p-2.5 outline-none focus:ring-2"
          style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.purple }}
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 rounded-2xl border p-3.5" style={{ borderColor: C.line, background: '#100A18' }}>
        <div className="text-[9px] font-black uppercase tracking-[0.13em]" style={{ color: C.muted }}>Job in the campaign</div>
        <div className="mt-1 text-sm font-black" style={{ color: C.cream }}>{item.mixRole}</div>
        <p className="mt-2 text-[11px] leading-5" style={{ color: C.muted }}>
          {item.matchedSignals?.length
            ? `Campaign fit signals: ${item.matchedSignals.slice(0, 4).join(', ')}.`
            : 'Adds category and role variety; campaign-specific fit still needs human review.'}
        </p>
      </div>

      <div className="mt-3 rounded-2xl border p-3.5" style={{ borderColor: item.libraryCoverage.state === 'MAPPED' ? `${C.green}44` : `${C.gold}44`, background: item.libraryCoverage.state === 'MAPPED' ? `${C.green}08` : `${C.gold}08` }}>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: item.libraryCoverage.state === 'MAPPED' ? C.green : C.gold }}>
          <Link2 className="h-3.5 w-3.5" />
          {item.libraryCoverage.state === 'MAPPED' ? `Governed lane: ${item.libraryCoverage.lane}` : 'Governed coverage gap'}
        </div>
        <p className="mt-2 text-[10px] leading-5" style={{ color: C.muted }}>{item.libraryCoverage.note}</p>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap gap-2">
          <Pill>Price unverified</Pill>
          <Pill>Inventory unknown</Pill>
          <Pill tone="gold">Proof required</Pill>
        </div>
      </div>
    </article>
  );
}

export default function SwagrCampaignMixPlanner() {
  const [campaign, setCampaign] = useState(null);
  const [pins, setPins] = useState([]);
  const [profileId, setProfileId] = useState('auto');
  const [targetCount, setTargetCount] = useState(DEFAULT_TARGET);
  const [selectedIds, setSelectedIds] = useState([]);
  const [researchFactId, setResearchFactId] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const activeCampaign = loadActiveCampaign();
    const activePins = loadPins();
    const campaignId = activeCampaign?.id || '';
    const saved = loadSavedMix(campaignId);
    const initialProfile = saved?.profileId || 'auto';
    const initialTarget = saved?.targetCount || DEFAULT_TARGET;
    const initialBrief = activeCampaign?.brief || {};
    const suggested = buildCampaignMix(SWAGR_IDEA_CATALOG, initialBrief, activePins, initialProfile, initialTarget);

    setCampaign(activeCampaign);
    setPins(activePins);
    setProfileId(initialProfile);
    setTargetCount(initialTarget);
    setSelectedIds(saved?.selectedIds?.length ? saved.selectedIds : suggested.selected.map((item) => item.id));
    setResearchFactId(new URLSearchParams(window.location.search).get('researchFact') || '');
    setHydrated(true);
  }, []);

  const brief = campaign?.brief || {};
  const researchFact = useMemo(
    () => SWAGR_PROMO_FACTS.find((fact) => fact.id === researchFactId) || null,
    [researchFactId]
  );
  const researchFocus = useMemo(() => getPromoFactMixFocus(researchFact), [researchFact]);
  const resolvedProfile = useMemo(() => getMixProfile(profileId, brief), [profileId, campaign]);
  const suggested = useMemo(
    () => buildCampaignMix(SWAGR_IDEA_CATALOG, brief, pins, profileId, targetCount),
    [campaign, pins, profileId, targetCount]
  );
  const evaluation = useMemo(
    () => evaluateCampaignMix(SWAGR_IDEA_CATALOG, selectedIds, brief, pins, profileId, targetCount),
    [campaign, selectedIds, pins, profileId, targetCount]
  );

  useEffect(() => {
    if (!hydrated) return;
    saveMixState({
      campaignId: campaign?.id || '',
      selectedIds,
      profileId,
      targetCount,
    });
  }, [hydrated, campaign, selectedIds, profileId, targetCount]);

  const rebalance = () => {
    setSelectedIds(suggested.selected.map((item) => item.id));
  };

  const removeDirection = (id) => {
    setSelectedIds((current) => current.filter((value) => value !== id));
  };

  const addAlternate = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current;
      if (current.length < targetCount) return [...current, id];
      const replacementIndex = [...current].reverse().findIndex((value) => !pins.includes(value));
      if (replacementIndex === -1) return [...current.slice(0, -1), id];
      const actualIndex = current.length - 1 - replacementIndex;
      return current.map((value, index) => index === actualIndex ? id : value);
    });
  };

  const updateTarget = (next) => {
    const clamped = Math.min(5, Math.max(2, next));
    setTargetCount(clamped);
    setSelectedIds((current) => current.slice(0, clamped));
  };

  const resetSessionMix = () => {
    const inferred = inferMixProfileId(brief);
    setProfileId('auto');
    setTargetCount(DEFAULT_TARGET);
    const next = buildCampaignMix(SWAGR_IDEA_CATALOG, brief, pins, inferred, DEFAULT_TARGET);
    setSelectedIds(next.selected.map((item) => item.id));
  };

  const handoffToDiscovery = () => {
    saveMixDiscoveryFocus({
      campaignId: campaign?.id || '',
      selected: evaluation.selected,
      profileId,
      targetCount,
    });
  };

  const mappedCount = evaluation.metrics.mappedCoverage;
  const selectedCount = evaluation.selected.length;
  const uncovered = evaluation.coverageGaps;
  const researchMatchCount = researchFocus
    ? evaluation.selected.filter((item) => researchFocusMatchesItem(researchFocus, item)).length
    : 0;

  return (
    <main
      className="min-h-screen"
      style={{
        background: `radial-gradient(circle at 14% 0%, ${C.purple}26, transparent 34%), radial-gradient(circle at 92% 16%, ${C.gold}10, transparent 25%), ${C.bg}`,
        color: C.cream,
      }}
    >
      <header className="border-b px-5 py-5" style={{ borderColor: C.line, background: 'rgba(13,9,19,.94)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border" style={{ borderColor: `${C.purple}66`, background: `${C.purple}16`, color: C.purpleLt }}>
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">SWAGR AI</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Campaign Mix / Kit Planner</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/swagr/ideas" className="rounded-xl border px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>← Promo intelligence</Link>
            <Link href="/swagr/kit" onClick={handoffToDiscovery} className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purple }}>
              Visual kit <Boxes className="h-3.5 w-3.5" />
            </Link>
            <Link href="/swagr/library" onClick={handoffToDiscovery} className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}>
              Governed discovery <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <section
          data-testid="swagr-mix-hero"
          className="overflow-hidden rounded-[32px] border p-6 sm:p-8"
          style={{ borderColor: `${C.purple}55`, background: 'linear-gradient(135deg, rgba(108,71,255,.17), rgba(23,16,34,.96) 58%, rgba(245,200,66,.06))' }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="purple">Safe local planner</Pill>
                <Pill tone={pins.length ? 'good' : 'muted'}>{pins.length} inspiration pin{pins.length === 1 ? '' : 's'}</Pill>
                <Pill>No live price / stock</Pill>
              </div>
              <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                Build a campaign mix that has a job for every item.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7" style={{ color: C.muted }}>
                SWAGR AI starts with your active campaign and any pinned promo directions, then builds a deterministic mix around role variety, campaign relevance, and current governed-library coverage. The result is a planning composition — not a quote, cart, order, or production pack.
              </p>
            </div>

            <aside className="rounded-3xl border p-5" style={{ borderColor: C.line, background: '#100A18' }}>
              <div className="flex items-center gap-2 text-xs font-black" style={{ color: campaign ? C.green : C.gold }}>
                <Compass className="h-4 w-4" />
                {campaign ? 'Active campaign context' : 'Generic planning mode'}
              </div>
              <div className="mt-3 text-xl font-black text-white">{campaign?.title || 'No active campaign'}</div>
              <div className="mt-3 grid gap-2 text-[11px] leading-5" style={{ color: C.muted }}>
                <div><span className="font-black" style={{ color: C.cream }}>Audience:</span> {brief.audience || 'Open'}</div>
                <div><span className="font-black" style={{ color: C.cream }}>Moment:</span> {brief.useCase || 'Open'}</div>
                <div><span className="font-black" style={{ color: C.cream }}>Style:</span> {brief.style || 'Open'}</div>
                <div><span className="font-black" style={{ color: C.cream }}>Avoid:</span> {brief.exclusions || 'None captured'}</div>
              </div>
              <Link href="/swagr/campaign" className="mt-4 inline-flex items-center gap-2 text-xs font-black outline-none focus:underline" style={{ color: C.purpleLt }}>
                {campaign ? 'Refine campaign' : 'Create campaign'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </aside>
          </div>
        </section>

        {researchFocus && (
          <section
            className="mt-6 rounded-[28px] border p-5 sm:p-6"
            style={{ borderColor: `${C.green}44`, background: 'linear-gradient(135deg, rgba(52,211,153,.08), rgba(23,16,34,.98) 55%, rgba(108,71,255,.08))' }}
            aria-label="Research-to-mix planning bridge"
          >
            <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone="good">Research-to-mix bridge</Pill>
                  <Pill tone="purple">Transient lens</Pill>
                  <Pill>Source-labeled</Pill>
                </div>
                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                  Explore {researchFocus.emphasis} without changing the mix.
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>
                  {researchFocus.rationale}
                </p>
                {researchFocus.categories.length ? (
                  <div className="mt-4">
                    <div className="text-[9px] font-black uppercase tracking-[0.13em]" style={{ color: C.muted }}>Planning lanes to inspect</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {researchFocus.categories.map((categoryName) => (
                        <Pill key={categoryName} tone="gold">{categoryName}</Pill>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] leading-5" style={{ color: C.muted }}>
                      {researchMatchCount} of {selectedCount || 0} current direction{selectedCount === 1 ? '' : 's'} intersect this research lens. Matching is informational only; nothing was added, removed, or reprioritized.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border p-3.5" style={{ borderColor: C.line, background: '#100A18' }}>
                    <div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.gold }}>Context-only research lens</div>
                    <p className="mt-1 text-[10px] leading-5" style={{ color: C.muted }}>This signal does not safely justify favoring a product category, so SWAGR keeps the existing mix untouched.</p>
                  </div>
                )}
              </div>

              <aside className="rounded-3xl border p-5" style={{ borderColor: C.line, background: '#100A18' }}>
                <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.green }}>Source carried forward</div>
                <div className="mt-2 text-2xl font-black text-white">{researchFocus.signal}</div>
                <p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>{researchFocus.headline}</p>
                <div className="mt-3 text-[10px] leading-5" style={{ color: C.muted }}>
                  {researchFocus.source.publisher} · {researchFocus.source.published}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={researchFocus.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: `${C.purple}66`, color: C.purpleLt, '--tw-ring-color': C.purple }}>
                    Open source <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                  <Link href="/swagr/mix" className="rounded-xl border px-3 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.purple }}>Clear lens</Link>
                </div>
                <p className="mt-4 text-[9px] leading-4" style={{ color: C.muted }}>
                  {SWAGR_PROMO_MIX_FOCUS_META.truthBoundary}
                </p>
              </aside>
            </div>
          </section>
        )}

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: C.line, background: C.panel }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Mix strategy</div>
                <h2 className="mt-1 text-2xl font-black text-white">Choose how the campaign should behave.</h2>
              </div>
              <button type="button" onClick={resetSessionMix} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.purple }}>
                <RefreshCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                aria-pressed={profileId === 'auto'}
                onClick={() => setProfileId('auto')}
                className="rounded-2xl border p-4 text-left outline-none focus:ring-2"
                style={{ borderColor: profileId === 'auto' ? C.green : C.line, background: profileId === 'auto' ? `${C.green}0B` : '#100A18', '--tw-ring-color': C.green }}
              >
                <div className="text-xs font-black" style={{ color: profileId === 'auto' ? C.green : C.cream }}>Auto from campaign</div>
                <div className="mt-1 text-[10px] leading-5" style={{ color: C.muted }}>Currently resolves to {resolvedProfile.label}.</div>
              </button>
              {MIX_PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  aria-pressed={profileId === profile.id}
                  onClick={() => setProfileId(profile.id)}
                  className="rounded-2xl border p-4 text-left outline-none focus:ring-2"
                  style={{ borderColor: profileId === profile.id ? C.purple : C.line, background: profileId === profile.id ? `${C.purple}12` : '#100A18', '--tw-ring-color': C.purple }}
                >
                  <div className="text-xs font-black" style={{ color: profileId === profile.id ? C.purpleLt : C.cream }}>{profile.label}</div>
                  <div className="mt-1 text-[10px] leading-5" style={{ color: C.muted }}>{profile.description}</div>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: C.line, background: '#100A18' }}>
              <div>
                <div className="text-xs font-black text-white">Target mix size</div>
                <p className="mt-1 text-[10px] leading-5" style={{ color: C.muted }}>Keep it tight. Two to five planning directions is enough to expose balance and gaps without becoming a fake catalog cart.</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => updateTarget(targetCount - 1)} disabled={targetCount <= 2} aria-label="Decrease target mix size" className="rounded-xl border p-2.5 disabled:opacity-40" style={{ borderColor: C.line, color: C.cream }}>
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-[54px] text-center text-2xl font-black text-white">{targetCount}</div>
                <button type="button" onClick={() => updateTarget(targetCount + 1)} disabled={targetCount >= 5} aria-label="Increase target mix size" className="rounded-xl border p-2.5 disabled:opacity-40" style={{ borderColor: C.line, color: C.cream }}>
                  <Plus className="h-4 w-4" />
                </button>
                <button type="button" onClick={rebalance} className="ml-1 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}>
                  <Sparkles className="h-3.5 w-3.5" /> Rebalance
                </button>
              </div>
            </div>
          </div>

          <aside className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: `${C.gold}44`, background: C.panel }}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.gold }}>Mix health</div>
                <h2 className="mt-1 text-2xl font-black text-white">{evaluation.score}/100 balance</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ borderColor: `${evaluation.score >= 70 ? C.green : C.gold}55`, color: evaluation.score >= 70 ? C.green : C.gold, background: `${evaluation.score >= 70 ? C.green : C.gold}0D` }}>
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: '#0F0A17' }}>
              <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${evaluation.score}%`, background: evaluation.score >= 70 ? C.green : C.gold }} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Metric label="Categories" value={evaluation.metrics.categoryVariety} note="Different product families." />
              <Metric label="Jobs" value={evaluation.metrics.roleVariety} note="Different campaign roles." />
              <Metric label="Governed lanes" value={`${mappedCount}/${selectedCount || 0}`} note="Current library coverage." tone="good" />
              <Metric label="Pinned used" value={evaluation.metrics.pinnedUsed} note={`Of ${pins.length} current pins.`} tone="gold" />
            </div>

            <div className="mt-5">
              <div className="text-[10px] font-black uppercase tracking-[0.13em]" style={{ color: C.muted }}>Current strategy</div>
              <div className="mt-2 text-sm font-black text-white">{evaluation.profile.label}</div>
              <p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>{evaluation.profile.description}</p>
            </div>
          </aside>
        </section>

        <section className="mt-8" aria-label="Current SWAGR campaign mix">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Current campaign mix</div>
              <h2 className="mt-1 text-2xl font-black text-white">{selectedCount} planning direction{selectedCount === 1 ? '' : 's'}</h2>
            </div>
            <div className="text-right text-[10px] leading-5" style={{ color: C.muted }}>Session-local and reversible.<br />Nothing here places an order or creates commercial truth.</div>
          </div>

          {evaluation.selected.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {evaluation.selected.map((item) => (
                <DirectionCard key={item.id} item={item} onRemove={removeDirection} researchFocus={researchFocus} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border p-8 text-center" style={{ borderColor: C.line, background: C.panel }}>
              <Boxes className="mx-auto h-8 w-8" style={{ color: C.muted }} />
              <div className="mt-3 text-lg font-black text-white">Your mix is empty.</div>
              <button type="button" onClick={rebalance} className="mt-3 rounded-xl px-4 py-2.5 text-xs font-black" style={{ background: C.gold, color: '#17101F' }}>Build the suggested mix</button>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: C.line, background: C.panel }}>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" style={{ color: C.purpleLt }} />
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Smart alternates</div>
                <h2 className="mt-1 text-xl font-black text-white">Swap without restarting the campaign.</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {suggested.alternates.slice(0, 6).map((item) => {
                const full = selectedCount >= targetCount;
                return (
                  <article key={item.id} className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#100A18' }}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{item.emoji}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-white">{item.name}</div>
                        <div className="mt-1 text-[10px] leading-5" style={{ color: C.muted }}>{item.mixRole} · {item.category}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill tone={item.libraryCoverage.state === 'MAPPED' ? 'good' : 'gold'}>{item.libraryCoverage.state === 'MAPPED' ? `Mapped: ${item.libraryCoverage.lane}` : 'Coverage gap'}</Pill>
                      {item.matchedSignals?.slice(0, 2).map((signal) => <Pill key={signal} tone="purple">{signal}</Pill>)}
                    </div>
                    <button type="button" onClick={() => addAlternate(item.id)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purple }}>
                      <Plus className="h-3.5 w-3.5" /> {full ? 'Swap into mix' : 'Add to mix'}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="rounded-[28px] border p-5 sm:p-6" style={{ borderColor: evaluation.warnings.length ? `${C.gold}44` : `${C.green}44`, background: C.panel }}>
            <div className="flex items-center gap-3">
              {evaluation.warnings.length ? <AlertTriangle className="h-5 w-5" style={{ color: C.gold }} /> : <CheckCircle2 className="h-5 w-5" style={{ color: C.green }} />}
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: evaluation.warnings.length ? C.gold : C.green }}>Planning checks</div>
                <h2 className="mt-1 text-xl font-black text-white">{evaluation.warnings.length ? `${evaluation.warnings.length} thing${evaluation.warnings.length === 1 ? '' : 's'} to review` : 'Mix is balanced for planning'}</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {(evaluation.warnings.length ? evaluation.warnings : ['Category variety, campaign roles, and current governed-library coverage are in a healthy planning range.']).map((warning) => (
                <div key={warning} className="rounded-2xl border p-3.5 text-[11px] leading-5" style={{ borderColor: C.line, background: '#100A18', color: C.muted }}>
                  {warning}
                </div>
              ))}
            </div>

            {suggested.blockedPins.length > 0 && (
              <div className="mt-4 rounded-2xl border p-3.5" style={{ borderColor: `${C.red}44`, background: `${C.red}08` }}>
                <div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.red }}>Pinned directions excluded by campaign rules</div>
                <p className="mt-2 text-[10px] leading-5" style={{ color: C.muted }}>A pinned direction matched the campaign’s explicit avoid/exclusion terms, so SWAGR did not force it into the suggested mix.</p>
              </div>
            )}
          </aside>
        </section>

        <section data-testid="swagr-mix-handoff" className="mt-8 rounded-[32px] border p-5 sm:p-7" style={{ borderColor: `${C.green}44`, background: 'linear-gradient(135deg, rgba(52,211,153,.08), rgba(23,16,34,.96))' }}>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill tone="good">{mappedCount}/{selectedCount || 0} mapped to current governed lanes</Pill>
                <Pill tone={uncovered.length ? 'gold' : 'good'}>{uncovered.length} coverage gap{uncovered.length === 1 ? '' : 's'}</Pill>
              </div>
              <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">Move the mix into governed product discovery — without pretending the planning ideas are live SKUs.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7" style={{ color: C.muted }}>
                The current governed synthetic library now has category-level follow-up lanes for every supported mix category, including Tech, Safety, and Events. This handoff carries only campaign intent and category roles — never live SKU identity, price, inventory, decoration approval, or production truth.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/swagr/library" onClick={handoffToDiscovery} className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}>
                  Open focused discovery <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/swagr/virtual" className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purple }}>
                  Open concept studio <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <aside className="rounded-3xl border p-5" style={{ borderColor: C.line, background: '#100A18' }}>
              <div className="flex items-center gap-2 text-xs font-black" style={{ color: C.green }}>
                <ShieldCheck className="h-4 w-4" /> Truth boundary
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  'No supplier or customer API calls.',
                  'No price, stock, MOQ, lead-time, or delivery claim.',
                  'No quote, cart, payment, order, email, or external send.',
                  'No production proof or artwork approval authority.',
                  'Session-local planning state only.',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2 text-[10px] leading-5" style={{ color: C.muted }}>
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.green }} /> {line}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-5" style={{ color: C.muted }}>{MIX_TRUTH_NOTE}</p>
            </aside>
          </div>
        </section>

        <footer className="py-8 text-center text-[10px] leading-5" style={{ color: C.muted }}>
          SWAGR-MIX-002 · selected mix → governed discovery focus · session-local and reversible · no external writes
        </footer>
      </div>
    </main>
  );
}
