'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardList,
  History,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import ConceptVisual from './concept-visual';
import { SWAGR_FIXTURES, QTY_OPTIONS, BUDGET_OPTIONS } from '../swagr-lab/fixtures';
import {
  buildFitRationale,
  buildRecommendations,
  getRequirementGaps,
  isFixtureExcluded,
  makeAuditEvent,
  nextProposalDirection,
  scoreFixture,
  statusForRequirements,
} from '../swagr-lab/engine';
import { loadBrandProfile } from './brand-profile';

const C = {
  bg: '#120D1A',
  panel: '#1B1530',
  panel2: '#211938',
  purple: '#6C47FF',
  purpleLt: '#B6A6FF',
  gold: '#F5C842',
  cream: '#F1EAD8',
  green: '#34D399',
  muted: '#AAA0B8',
  line: '#352A46',
};

const initialRequirements = {
  audience: 'event attendees',
  useCase: 'recruiting event',
  quantity: 'QTY_MID',
  budget: 'BAND_STANDARD',
  inHandsDate: '',
  location: 'Dallas, TX',
  style: 'Useful, modern, easy to distribute',
  exclusions: '',
};

const presets = [
  {
    label: 'Recruiting event',
    patch: { audience: 'event attendees', useCase: 'recruiting event', style: 'Useful, modern, easy to distribute' },
  },
  {
    label: 'Employee onboarding',
    patch: { audience: 'employees', useCase: 'employee onboarding', style: 'Useful, polished, repeat-use' },
  },
  {
    label: 'Client gifting',
    patch: { audience: 'clients', useCase: 'client gifting', style: 'Premium, restrained, high perceived value' },
  },
  {
    label: 'Conference traffic',
    patch: { audience: 'conference attendees', useCase: 'conference giveaway', style: 'Easy to carry, useful, broad distribution' },
  },
];

const commercialGaps = [
  'Live item, SKU, inventory, and supplier source are not connected.',
  'Price, MOQ, setup, freight, and availability are not verified.',
  'Lead time and delivery feasibility require source and human validation.',
  'Decoration method, imprint area, and artwork quality require validation.',
  'Every visual shown here is concept direction only — never a production proof.',
];

function StatusPill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={styles[tone]}>
      {children}
    </span>
  );
}

function TextField({ label, value, onChange, placeholder, note, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold" style={{ color: C.cream }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2"
        style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }}
      />
      {note && <span className="mt-1 block text-[11px] leading-4" style={{ color: C.muted }}>{note}</span>}
    </label>
  );
}

function SelectField({ label, value, onChange, options, note }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold" style={{ color: C.cream }}>{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-xl border px-3 py-3 pr-10 text-sm outline-none focus:ring-2"
          style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }}
        >
          {options.map(([valueOption, labelOption]) => <option key={valueOption} value={valueOption}>{labelOption}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4" style={{ color: C.muted }} />
      </span>
      {note && <span className="mt-1 block text-[11px] leading-4" style={{ color: C.muted }}>{note}</span>}
    </label>
  );
}

function fitLabel(score) {
  if (score >= 9) return { label: 'Strong planning match', tone: 'good' };
  if (score >= 5) return { label: 'Possible planning match', tone: 'purple' };
  return { label: 'Exploratory direction', tone: 'warn' };
}

function ProgressRail({ missingCount, recommendationCount, selectedCount, status }) {
  const steps = [
    { label: 'Brief', done: missingCount === 0, active: missingCount > 0 },
    { label: 'Ideas', done: missingCount === 0 && recommendationCount > 0, active: missingCount === 0 && recommendationCount === 0 },
    { label: 'Shortlist', done: missingCount === 0 && recommendationCount > 0 && selectedCount > 0, active: missingCount === 0 && recommendationCount > 0 && selectedCount === 0 },
    { label: 'Review', done: status === 'DRAFT_HANDOFF_READY', active: missingCount === 0 && selectedCount > 0 && status !== 'DRAFT_HANDOFF_READY' },
  ];

  return (
    <nav aria-label="SWAGR progress" className="grid grid-cols-4 gap-2">
      {steps.map((step, index) => (
        <div key={step.label} className="min-w-0">
          <div className="mb-2 h-1.5 overflow-hidden rounded-full" style={{ background: C.line }}>
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: step.done || step.active ? '100%' : '0%', background: step.done ? C.green : step.active ? C.gold : C.line }} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black" style={{ background: step.done ? `${C.green}22` : step.active ? `${C.gold}18` : '#0F0A17', color: step.done ? C.green : step.active ? C.gold : C.muted, border: `1px solid ${step.done ? `${C.green}55` : step.active ? `${C.gold}55` : C.line}` }}>
              {step.done ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span className="truncate text-[10px] font-semibold sm:text-xs" style={{ color: step.done || step.active ? C.cream : C.muted }}>{step.label}</span>
          </div>
        </div>
      ))}
    </nav>
  );
}

function ConceptCard({ concept, requirements, brandAsset, brandName, selected, compared, onSelect, onCompare, onReplace, replacementAvailable }) {
  const fit = fitLabel(scoreFixture(concept, requirements));
  return (
    <article className="overflow-hidden rounded-3xl border motion-safe:transition motion-safe:hover:-translate-y-0.5" style={{ background: C.panel, borderColor: selected ? C.purple : C.line }}>
      <div className="p-3 pb-0">
        <ConceptVisual concept={concept} brandAsset={brandAsset} brandName={brandName} />
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.purpleLt }}>{concept.category}</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white">{concept.name}</h3>
          </div>
          <StatusPill tone={selected ? 'good' : fit.tone}>{selected ? 'Shortlisted' : fit.label}</StatusPill>
        </div>

        <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.gold }}>Why SWAGR surfaced it</div>
          <p className="mt-2 text-sm leading-6" style={{ color: C.cream }}>{buildFitRationale(concept, requirements)}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Creative direction</div>
            <p className="mt-1 text-xs leading-5 text-zinc-300">{concept.creative}</p>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Decoration paths to validate</div>
            <p className="mt-1 text-xs leading-5 text-zinc-300">{concept.decoration.join(' · ')}</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}>
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.gold }} />
          <p className="text-[11px] leading-5" style={{ color: C.muted }}><strong style={{ color: C.gold }}>Source check required.</strong> No live price, stock, MOQ, delivery, or production-art claim is being made.</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className="rounded-xl px-3.5 py-2.5 text-xs font-black motion-safe:transition motion-safe:hover:-translate-y-0.5 focus:outline-none focus:ring-2"
            style={{ background: selected ? C.green : C.gold, color: '#17101F', '--tw-ring-color': selected ? C.green : C.gold }}
          >
            {selected ? <><Check className="mr-1 inline h-3.5 w-3.5" /> In shortlist</> : 'Add to shortlist'}
          </button>
          <button
            type="button"
            onClick={onCompare}
            aria-pressed={compared}
            className="rounded-xl border px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2"
            style={{ borderColor: compared ? C.purple : C.line, color: compared ? C.purpleLt : C.cream, background: compared ? `${C.purple}12` : 'transparent', '--tw-ring-color': C.purple }}
          >
            <Scale className="mr-1 inline h-3.5 w-3.5" /> {compared ? 'Comparing' : 'Compare'}
          </button>
          <button
            type="button"
            onClick={onReplace}
            disabled={!replacementAvailable}
            className="rounded-xl border px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}
          >
            <RefreshCcw className="mr-1 inline h-3.5 w-3.5" /> Swap idea
          </button>
        </div>
      </div>
    </article>
  );
}

export default function SwagrCustomerExperience() {
  const initialProposalIds = buildRecommendations(SWAGR_FIXTURES, initialRequirements);
  const [requirements, setRequirements] = useState(initialRequirements);
  const [proposalIds, setProposalIds] = useState(initialProposalIds);
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [version, setVersion] = useState(1);
  const [versions, setVersions] = useState([]);
  const [status, setStatus] = useState(statusForRequirements(initialRequirements, initialProposalIds.length));
  const [brandName, setBrandName] = useState('Sample Brand');
  const [brandAsset, setBrandAsset] = useState('');
  const [brandMessage, setBrandMessage] = useState('Optional: add a local logo image to preview concept placement. It never leaves this browser.');
  useEffect(() => {
    const profile = loadBrandProfile();
    if (!profile) return;
    setBrandName(profile.brandName || 'Sample Brand');
    setBrandAsset(profile.logoDataUrl || '');
    if (profile.visualDirection) {
      setRequirements((current) => ({ ...current, style: profile.visualDirection }));
    }
    setBrandMessage('Saved session-local Brand Kit loaded. Edit the reusable profile from Brand Kit.');
  }, []);

  const [audit, setAudit] = useState([
    makeAuditEvent({
      action: 'CX_SESSION_CREATED',
      reason: 'Synthetic SWAGR customer-experience session started.',
      priorState: 'NEW',
      newState: statusForRequirements(initialRequirements, initialProposalIds.length),
    }),
  ]);

  const missing = useMemo(() => getRequirementGaps(requirements), [requirements]);
  const concepts = useMemo(() => proposalIds.map((id) => SWAGR_FIXTURES.find((item) => item.id === id)).filter(Boolean), [proposalIds]);
  const compareConcepts = compareIds.map((id) => SWAGR_FIXTURES.find((item) => item.id === id)).filter(Boolean);
  const selectedConcepts = selectedIds.map((id) => SWAGR_FIXTURES.find((item) => item.id === id)).filter(Boolean);
  const replacement = SWAGR_FIXTURES.find((fixture) => !proposalIds.includes(fixture.id) && !isFixtureExcluded(fixture, requirements.exclusions));

  const record = ({ action, reason, priorState, newState, objectId }) => {
    const event = makeAuditEvent({ action, reason, priorState, newState, objectId });
    setAudit((items) => [event, ...items].slice(0, 40));
  };

  const updateRequirement = (key, value) => {
    const next = { ...requirements, [key]: value };
    const nextStatus = statusForRequirements(next, 0);
    const priorState = status;
    setRequirements(next);
    setStatus(nextStatus);
    record({ action: 'REQUIREMENT_UPDATED', reason: `${key} updated in customer experience.`, priorState, newState: nextStatus, objectId: `REQUIREMENT:${key}` });
  };

  const applyPreset = (preset) => {
    const next = { ...requirements, ...preset.patch };
    const nextStatus = statusForRequirements(next, 0);
    const priorState = status;
    setRequirements(next);
    setStatus(nextStatus);
    record({ action: 'SCENARIO_PRESET_APPLIED', reason: `${preset.label} planning preset applied.`, priorState, newState: nextStatus, objectId: 'DISCOVERY_SESSION' });
  };

  const rebuild = () => {
    const nextIds = buildRecommendations(SWAGR_FIXTURES, requirements);
    const nextStatus = statusForRequirements(requirements, nextIds.length);
    const priorState = status;
    setProposalIds(nextIds);
    setSelectedIds([]);
    setCompareIds([]);
    setStatus(nextStatus);
    record({ action: 'RECOMMENDATIONS_REBUILT', reason: `${nextIds.length} concept directions rebuilt from the current brief with exclusions enforced.`, priorState, newState: nextStatus, objectId: `PROPOSAL:v${version}` });
  };

  const toggleSelect = (id) => {
    const wasSelected = selectedIds.includes(id);
    setSelectedIds((ids) => wasSelected ? ids.filter((item) => item !== id) : [...ids, id]);
    if (status === 'DRAFT_HANDOFF_READY') setStatus('CUSTOMER_REVIEW');
    record({ action: 'SELECTION_CHANGED', reason: `${id} ${wasSelected ? 'removed from' : 'added to'} shortlist.`, priorState: wasSelected ? 'SHORTLISTED' : 'NOT_SHORTLISTED', newState: wasSelected ? 'NOT_SHORTLISTED' : 'SHORTLISTED', objectId: id });
  };

  const toggleCompare = (id) => {
    const wasCompared = compareIds.includes(id);
    let next;
    if (wasCompared) next = compareIds.filter((item) => item !== id);
    else if (compareIds.length >= 3) next = [...compareIds.slice(1), id];
    else next = [...compareIds, id];
    setCompareIds(next);
    record({ action: 'COMPARE_CHANGED', reason: `${id} compare state changed; comparison remains capped at three concepts.`, priorState: wasCompared ? 'IN_COMPARE' : 'NOT_IN_COMPARE', newState: wasCompared ? 'NOT_IN_COMPARE' : 'IN_COMPARE', objectId: id });
  };

  const replaceConcept = (oldId) => {
    const alternate = SWAGR_FIXTURES.find((fixture) => !proposalIds.includes(fixture.id) && !isFixtureExcluded(fixture, requirements.exclusions));
    if (!alternate) return;
    setProposalIds((ids) => ids.map((id) => id === oldId ? alternate.id : id));
    setSelectedIds((ids) => ids.filter((id) => id !== oldId));
    setCompareIds((ids) => ids.filter((id) => id !== oldId));
    record({ action: 'CONCEPT_REPLACED', reason: `${oldId} replaced with ${alternate.id}.`, priorState: oldId, newState: alternate.id, objectId: `PROPOSAL:v${version}` });
  };

  const requestDifferentDirection = () => {
    const snapshot = { version, proposalIds: [...proposalIds], selectedIds: [...selectedIds], requirements: { ...requirements }, status: 'CHANGE_REQUESTED' };
    const nextIds = nextProposalDirection(SWAGR_FIXTURES, proposalIds, selectedIds, requirements);
    const nextVersion = version + 1;
    const priorState = status;
    setVersions((items) => [snapshot, ...items]);
    setProposalIds(nextIds);
    setSelectedIds([]);
    setCompareIds([]);
    const nextStatus = statusForRequirements(requirements, nextIds.length);
    setVersion(nextVersion);
    setStatus(nextStatus);
    record({ action: 'NEW_PROPOSAL_VERSION', reason: `Proposal v${version} preserved and v${nextVersion} created.`, priorState, newState: nextStatus, objectId: `PROPOSAL:v${nextVersion}` });
  };

  const markDraftReady = () => {
    if (selectedIds.length === 0 || missing.length > 0) return;
    const priorState = status;
    setStatus('DRAFT_HANDOFF_READY');
    record({ action: 'DRAFT_HANDOFF_READY', reason: 'Customer shortlist packaged for human review only. No external submission or production action occurred.', priorState, newState: 'DRAFT_HANDOFF_READY', objectId: `PROPOSAL:v${version}` });
  };

  const handleBrandAsset = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setBrandMessage('Use an image file such as PNG, JPG, WEBP, or SVG.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setBrandMessage('Keep the local preview file under 2 MB. Nothing was uploaded.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBrandAsset(String(reader.result || ''));
      setBrandMessage(`${file.name} is shown locally in concept previews. It was not uploaded or sent anywhere.`);
      record({ action: 'LOCAL_BRAND_PREVIEW_ADDED', reason: 'A local browser-only image was applied to concept previews; no network upload occurred.', priorState: 'NO_BRAND_PREVIEW', newState: 'LOCAL_BRAND_PREVIEW', objectId: 'BRAND_PREVIEW' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(65% 45% at 92% 0%, rgba(108,71,255,.24), transparent 70%), radial-gradient(38% 30% at 0% 13%, rgba(245,200,66,.08), transparent 72%)' }} />

      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.94)' }}>
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${C.purple}22`, border: `1px solid ${C.purple}55` }}><Sparkles className="h-5 w-5" style={{ color: C.gold }} /></div>
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black tracking-tight">SWAGR AI</span><StatusPill tone="purple">Experience preview</StatusPill></div>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>From a messy promo request to a reasoned shortlist — without pretending unverified facts are live.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2"><StatusPill tone="warn">Synthetic catalog</StatusPill><StatusPill tone={status === 'DRAFT_HANDOFF_READY' ? 'good' : 'neutral'}>{status}</StatusPill></div>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2" aria-label="SWAGR workspace">
            <Link href="/swagr/library" className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}>Explore concept library <ArrowRight className="h-3.5 w-3.5" /></Link>
            <Link href="/swagr/virtual" className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, background: `${C.purple}10`, '--tw-ring-color': C.purple }}><Wand2 className="h-3.5 w-3.5" /> Open concept studio</Link>
          </nav>
          <div className="mt-5"><ProgressRail missingCount={missing.length} recommendationCount={proposalIds.length} selectedCount={selectedIds.length} status={status} /></div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="grid gap-6 xl:grid-cols-[390px_1fr]">
          <aside className="h-fit space-y-5 xl:sticky xl:top-5">
            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-start gap-3"><ClipboardList className="mt-0.5 h-5 w-5" style={{ color: C.gold }} /><div><h1 className="text-xl font-black">Start with the moment</h1><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>Give SWAGR the practical constraints. This preview uses only local synthetic data.</p></div></div>

              <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick scenario presets">
                {presets.map((preset) => (
                  <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-full border px-3 py-2 text-[11px] font-semibold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, background: '#0F0A17', '--tw-ring-color': C.purple }}>{preset.label}</button>
                ))}
              </div>

              <div className="mt-5 grid gap-4">
                <TextField label="Who is it for?" value={requirements.audience} onChange={(value) => updateRequirement('audience', value)} placeholder="Employees, attendees, clients…" />
                <TextField label="What is happening?" value={requirements.useCase} onChange={(value) => updateRequirement('useCase', value)} placeholder="Recruiting event, onboarding, gifting…" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <SelectField label="Quantity planning band" value={requirements.quantity} onChange={(value) => updateRequirement('quantity', value)} options={QTY_OPTIONS} note="Planning signal only — never an MOQ claim." />
                  <SelectField label="Budget planning band" value={requirements.budget} onChange={(value) => updateRequirement('budget', value)} options={BUDGET_OPTIONS} note="No product price is inferred from this band." />
                </div>
                <TextField label="Needed by" type="date" value={requirements.inHandsDate} onChange={(value) => updateRequirement('inHandsDate', value)} note="Planning input only — not a delivery promise." />
                <TextField label="Delivery area" value={requirements.location} onChange={(value) => updateRequirement('location', value)} placeholder="City / region" />
                <TextField label="Style / feel" value={requirements.style} onChange={(value) => updateRequirement('style', value)} placeholder="Premium, practical, simple…" />
                <TextField label="Avoid" value={requirements.exclusions} onChange={(value) => updateRequirement('exclusions', value)} placeholder="No drinkware, no apparel…" note="Comma-separated category/name exclusions are enforced in this fixture set." />
              </div>

              <button type="button" onClick={rebuild} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black motion-safe:transition motion-safe:hover:-translate-y-0.5 focus:outline-none focus:ring-2" style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}>Refresh my ideas <ArrowRight className="h-4 w-4" /></button>

              <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: missing.length ? `${C.gold}55` : `${C.green}44`, background: missing.length ? `${C.gold}08` : `${C.green}08` }}>
                <div className="flex items-start gap-2">{missing.length ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.gold }} /> : <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.green }} />}<div><div className="text-xs font-bold" style={{ color: missing.length ? C.gold : C.green }}>{missing.length ? `${missing.length} planning detail${missing.length === 1 ? '' : 's'} still open` : 'Brief is complete enough to rank ideas'}</div>{missing.length > 0 && <ul className="mt-1 space-y-1 text-[11px] leading-4" style={{ color: C.muted }}>{missing.map((gap) => <li key={gap}>• {gap}</li>)}</ul>}</div></div>
              </div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Wand2 className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-sm font-black">Local brand preview</h2></div>
              <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Drop a logo into the browser to see rough placement on the concept shapes. This is not artwork processing and never becomes a proof.</p>
              <div className="mt-4 grid gap-3">
                <TextField label="Brand label" value={brandName} onChange={setBrandName} placeholder="Sample Brand" />
                <label className="block cursor-pointer rounded-2xl border border-dashed p-4 text-center focus-within:ring-2" style={{ borderColor: C.purple, background: `${C.purple}0B`, '--tw-ring-color': C.purple }}>
                  <span className="block text-xs font-bold" style={{ color: C.purpleLt }}>{brandAsset ? 'Change local logo image' : 'Add local logo image'}</span>
                  <span className="mt-1 block text-[10px]" style={{ color: C.muted }}>Image only · max 2 MB · browser memory only</span>
                  <input className="sr-only" type="file" accept="image/*" onChange={handleBrandAsset} />
                </label>
                {brandAsset && <button type="button" onClick={() => { setBrandAsset(''); setBrandMessage('Local logo preview cleared. No file was stored externally.'); }} className="text-left text-[11px] font-semibold underline underline-offset-4" style={{ color: C.muted }}>Clear local logo preview</button>}
                <p className="text-[10px] leading-4" style={{ color: C.muted }}>{brandMessage}</p>
                <Link href="/swagr/brand" className="inline-flex text-[11px] font-bold underline underline-offset-4 focus:outline-none focus:ring-2" style={{ color: C.purpleLt, '--tw-ring-color': C.purple }}>Open reusable Brand Kit →</Link>
              </div>
            </section>
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-3xl border" style={{ background: 'linear-gradient(135deg, rgba(108,71,255,.18), rgba(27,21,48,.88) 48%, rgba(245,200,66,.05))', borderColor: C.line }}>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="max-w-3xl">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: C.gold }}>Proposal v{version} · five-direction target</div>
                    <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">A shortlist built around the job, not a wall of products.</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: C.muted }}>SWAGR ranks a controlled set of category concepts against your audience, moment, quantity band, budget band, and exclusions. Commercial facts stay visibly unverified until a real source is authorized.</p>
                  </div>
                  <button type="button" onClick={requestDifferentDirection} className="rounded-xl border px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, background: '#0F0A17', '--tw-ring-color': C.purple }}><RefreshCcw className="mr-1.5 inline h-3.5 w-3.5" /> Different direction</button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: 'rgba(15,10,23,.68)' }}><div className="text-2xl font-black">{proposalIds.length}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>eligible concept directions</div></div>
                  <div className="rounded-2xl border p-4" style={{ borderColor: selectedIds.length ? `${C.green}55` : C.line, background: selectedIds.length ? `${C.green}08` : 'rgba(15,10,23,.68)' }}><div className="text-2xl font-black" style={{ color: selectedIds.length ? C.green : '#fff' }}>{selectedIds.length}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>in your shortlist</div></div>
                  <div className="rounded-2xl border p-4" style={{ borderColor: compareIds.length ? `${C.purple}66` : C.line, background: compareIds.length ? `${C.purple}0D` : 'rgba(15,10,23,.68)' }}><div className="text-2xl font-black" style={{ color: compareIds.length ? C.purpleLt : '#fff' }}>{compareIds.length}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>in compare view · max 3</div></div>
                </div>
              </div>
            </section>

            {requirements.exclusions && proposalIds.length < 5 && <section className="rounded-2xl border p-4" style={{ background: C.panel, borderColor: `${C.gold}55` }}><div className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.gold }} /><p className="text-xs leading-5" style={{ color: C.muted }}>Your exclusions leave {proposalIds.length} eligible synthetic concepts. SWAGR will not reinsert an excluded category just to hit five.</p></div></section>}

            <section className="grid gap-5 lg:grid-cols-2" aria-label="Recommended promotional product directions">
              {concepts.map((concept) => (
                <ConceptCard
                  key={`${version}-${concept.id}`}
                  concept={concept}
                  requirements={requirements}
                  brandAsset={brandAsset}
                  brandName={brandName}
                  selected={selectedIds.includes(concept.id)}
                  compared={compareIds.includes(concept.id)}
                  onSelect={() => toggleSelect(concept.id)}
                  onCompare={() => toggleCompare(concept.id)}
                  onReplace={() => replaceConcept(concept.id)}
                  replacementAvailable={Boolean(replacement)}
                />
              ))}
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: selectedIds.length ? `${C.green}55` : C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.green }}>Your shortlist</div><h2 className="mt-1 text-xl font-black">{selectedIds.length ? `${selectedIds.length} direction${selectedIds.length === 1 ? '' : 's'} worth taking forward` : 'Choose the ideas worth taking forward'}</h2></div>
                <StatusPill tone={selectedIds.length ? 'good' : 'neutral'}>{selectedIds.length ? 'Customer choice captured' : 'No choice yet'}</StatusPill>
              </div>
              {selectedConcepts.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{selectedConcepts.map((concept) => <div key={concept.id} className="rounded-2xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><ConceptVisual concept={concept} compact brandAsset={brandAsset} brandName={brandName} /><div className="mt-3 text-xs font-bold text-white">{concept.name}</div></div>)}</div>
              ) : (
                <p className="mt-3 text-sm leading-6" style={{ color: C.muted }}>Shortlisting is reversible. It does not create a quote, reserve inventory, approve artwork, or place an order.</p>
              )}
            </section>

            {compareConcepts.length > 0 && (
              <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel2, borderColor: C.purple }}>
                <div className="flex items-center gap-2"><Scale className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-xl font-black">Compare planning tradeoffs</h2><StatusPill tone="purple">Max 3</StatusPill></div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead style={{ color: C.muted }}><tr className="border-b" style={{ borderColor: C.line }}><th className="p-3">Direction</th><th className="p-3">Quantity bands</th><th className="p-3">Budget bands</th><th className="p-3">Truth state</th></tr></thead>
                    <tbody>{compareConcepts.map((concept) => <tr key={concept.id} className="border-b" style={{ borderColor: C.line }}><td className="p-3 font-semibold text-white">{concept.name}</td><td className="p-3" style={{ color: C.cream }}>{concept.quantities.join(', ')}</td><td className="p-3" style={{ color: C.cream }}>{concept.budgets.join(', ')}</td><td className="p-3" style={{ color: C.gold }}>Source validation required</td></tr>)}</tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px] leading-5" style={{ color: C.muted }}>This view does not declare a winner. It shows planning fit and keeps commercial uncertainty explicit.</p>
              </section>
            )}

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><Wand2 className="h-5 w-5" style={{ color: C.gold }} /><h2 className="text-lg font-black">Concept-virtual direction</h2></div>
                <p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>The local mark placement and creative notes help shape a sales concept. A real virtual, artwork cleanup, decoration check, and production proof remain separate controlled steps.</p>
                <div className="mt-4 space-y-3">{(selectedConcepts.length ? selectedConcepts : concepts.slice(0, 2)).map((concept) => <div key={concept.id} className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-white">{concept.name}</span><StatusPill tone="warn">CONCEPT ONLY</StatusPill></div><p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>{concept.creative}</p></div>)}</div>
              </div>

              <div className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" style={{ color: C.green }} /><h2 className="text-lg font-black">What SWAGR still needs to verify</h2></div>
                <ul className="mt-4 space-y-2 text-sm" style={{ color: C.cream }}>{[...missing, ...commercialGaps].map((gap) => <li key={gap} className="flex gap-2"><span style={{ color: C.gold }}>•</span><span>{gap}</span></li>)}</ul>
              </div>
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: selectedIds.length ? `linear-gradient(135deg, ${C.green}0D, ${C.panel})` : C.panel, borderColor: status === 'DRAFT_HANDOFF_READY' ? C.green : C.line }}>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-3xl"><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.gold }}>Controlled stopping point</div><h2 className="mt-1 text-2xl font-black">Turn the shortlist into a draft review packet.</h2><p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>SWAGR can package the brief, shortlist, concept notes, brand-preview direction, and unresolved validation gaps for a human reviewer. This preview does not send email, create a quote, place an order, charge payment, or approve production.</p></div>
                <button type="button" onClick={markDraftReady} disabled={selectedIds.length === 0 || missing.length > 0} className="rounded-xl px-4 py-3 text-sm font-black motion-safe:transition motion-safe:hover:-translate-y-0.5 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}>Mark draft ready <ArrowRight className="ml-1 inline h-4 w-4" /></button>
              </div>
              {selectedIds.length === 0 && <p className="mt-3 text-xs" style={{ color: C.muted }}>Add at least one direction to your shortlist before preparing the draft.</p>}
              {selectedIds.length > 0 && missing.length > 0 && <p className="mt-3 text-xs" style={{ color: C.gold }}>Complete the required planning details before the draft can be marked ready.</p>}
              {status === 'DRAFT_HANDOFF_READY' && <div className="mt-4 flex gap-2 rounded-2xl border p-4" style={{ borderColor: `${C.green}66`, background: `${C.green}0C` }}><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.green }} /><div><div className="text-sm font-bold" style={{ color: C.green }}>Draft review packet is ready locally</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>The experience stops here by design. Human/source validation and any downstream action remain separately controlled.</p></div></div>}
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><History className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-lg font-black">Proposal versions</h2></div>
                <div className="mt-4 space-y-2"><div className="rounded-xl border p-3" style={{ borderColor: C.purple, background: `${C.purple}0D` }}><div className="text-xs font-bold">Current — v{version}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>{proposalIds.length} concept directions · {selectedIds.length} shortlisted</div></div>{versions.length === 0 && <p className="text-xs leading-5" style={{ color: C.muted }}>No earlier version yet. “Different direction” preserves the current proposal before creating the next one.</p>}{versions.map((item) => <div key={item.version} className="rounded-xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-xs font-bold">Preserved — v{item.version}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>{item.proposalIds.length} directions · {item.selectedIds.length} shortlisted</div></div>)}</div>
              </div>

              <details className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
                <summary className="cursor-pointer list-none text-lg font-black focus:outline-none focus:ring-2" style={{ '--tw-ring-color': C.purple }}><ClipboardList className="mr-2 inline h-5 w-5" style={{ color: C.purpleLt }} />Local decision record</summary>
                <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Transient browser-only evidence for this synthetic experience. No identity, persistence, or external logging is enabled.</p>
                <div className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">{audit.map((event, index) => <div key={`${event.eventTime}-${index}`} className="rounded-xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="flex flex-wrap justify-between gap-2"><span className="text-[10px] font-bold" style={{ color: C.purpleLt }}>{event.action}</span><span className="text-[10px]" style={{ color: C.muted }}>{new Date(event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><div className="mt-1 text-[10px]" style={{ color: C.gold }}>{event.priorState} → {event.newState}</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.cream }}>{event.reason}</p></div>)}</div>
              </details>
            </section>
          </div>
        </section>

        <footer className="mt-8 border-t py-6 text-center text-[11px] leading-5" style={{ borderColor: C.line, color: C.muted }}>SWAGR AI · CX-001 isolated experience candidate · Synthetic catalog only · Local brand preview only · No live commercial claims · No production authority</footer>
      </div>
    </main>
  );
}
