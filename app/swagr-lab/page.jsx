'use client';

import { useMemo, useState } from 'react';
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
import { SWAGR_FIXTURES, QTY_OPTIONS, BUDGET_OPTIONS, truthLabel } from './fixtures';

const C = {
  bg: '#140F1E',
  panel: '#1B1530',
  panel2: '#211938',
  purple: '#6C47FF',
  purpleLt: '#9B7DFF',
  gold: '#F5C842',
  cream: '#E8DFC8',
  green: '#34D399',
  muted: '#AAA0B8',
  line: '#342747',
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

const fieldState = (value) => (value ? 'STATED' : 'UNKNOWN');

function scoreFixture(fixture, req) {
  let score = 0;
  const audience = req.audience.toLowerCase();
  const useCase = req.useCase.toLowerCase();
  if (fixture.audiences.some((x) => audience.includes(x) || x.includes(audience))) score += 4;
  if (fixture.useCases.some((x) => useCase.includes(x) || x.includes(useCase))) score += 4;
  if (req.quantity !== 'QTY_UNSTATED' && fixture.quantities.includes(req.quantity)) score += 3;
  if (req.budget !== 'UNSTATED' && fixture.budgets.includes(req.budget)) score += 3;
  if (fixture.id === 'SWAGR-CAT-001') score += 1;
  return score;
}

function buildRecommendations(req, excludedIds = []) {
  const ranked = SWAGR_FIXTURES
    .filter((f) => !excludedIds.includes(f.id))
    .map((fixture) => ({ fixture, score: scoreFixture(fixture, req) }))
    .sort((a, b) => b.score - a.score || a.fixture.id.localeCompare(b.fixture.id));
  return ranked.slice(0, 5).map(({ fixture }) => fixture.id);
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

function SelectField({ label, value, onChange, options, note }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold" style={{ color: C.cream }}>{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border px-3 py-3 pr-10 text-sm outline-none focus:ring-2"
          style={{ background: '#100B18', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }}
        >
          {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4" style={{ color: C.muted }} />
      </span>
      {note && <span className="mt-1 block text-[11px]" style={{ color: C.muted }}>{note}</span>}
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, note, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold" style={{ color: C.cream }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2"
        style={{ background: '#100B18', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }}
      />
      {note && <span className="mt-1 block text-[11px]" style={{ color: C.muted }}>{note}</span>}
    </label>
  );
}

function ConceptCard({ concept, selected, compared, onSelect, onCompare, onReplace, replacementAvailable }) {
  return (
    <article
      className="rounded-2xl border p-5 transition"
      style={{
        background: selected ? 'linear-gradient(180deg, rgba(108,71,255,.14), rgba(27,21,48,.8))' : C.panel,
        borderColor: selected ? C.purple : C.line,
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <StatusPill tone="purple">{concept.id}</StatusPill>
            <StatusPill tone="warn">Fixture only</StatusPill>
          </div>
          <h3 className="text-lg font-black tracking-tight text-white">{concept.name}</h3>
          <p className="mt-1 text-xs" style={{ color: C.purpleLt }}>{concept.category}</p>
        </div>
        {selected && <StatusPill tone="good"><Check className="mr-1 h-3 w-3" /> Selected</StatusPill>}
      </div>

      <div className="mt-4 rounded-xl border p-3" style={{ background: '#100B18', borderColor: C.line }}>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.gold }}>Why this fits</div>
        <p className="text-sm leading-6" style={{ color: C.cream }}>{concept.rationale}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>Concept virtual direction</div>
          <p className="mt-1 text-xs leading-5 text-zinc-300">{concept.creative}</p>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>Possible decoration</div>
          <p className="mt-1 text-xs leading-5 text-zinc-300">{concept.decoration.join(' · ')}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border px-3 py-2.5" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}>
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.gold }} />
          <div>
            <div className="text-xs font-semibold" style={{ color: C.gold }}>{truthLabel}</div>
            <div className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>
              {concept.cautions.join(' · ')}. Concept visuals are not proofs and cannot authorize production.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="rounded-lg px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
          style={{ background: selected ? C.green : C.gold, color: '#17101F', '--tw-ring-color': C.gold }}
        >
          {selected ? 'Selected' : 'Select concept'}
        </button>
        <button
          type="button"
          onClick={onCompare}
          className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/5 focus:outline-none focus:ring-2"
          style={{ borderColor: compared ? C.purple : C.line, color: compared ? C.purpleLt : C.cream, '--tw-ring-color': C.purple }}
        >
          <Scale className="mr-1 inline h-3.5 w-3.5" /> {compared ? 'In compare' : 'Compare'}
        </button>
        <button
          type="button"
          onClick={onReplace}
          disabled={!replacementAvailable}
          className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2"
          style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}
        >
          <RefreshCcw className="mr-1 inline h-3.5 w-3.5" /> Replace
        </button>
      </div>
    </article>
  );
}

export default function SwagrFixtureProposalLab() {
  const [requirements, setRequirements] = useState(initialRequirements);
  const [proposalIds, setProposalIds] = useState(() => buildRecommendations(initialRequirements));
  const [version, setVersion] = useState(1);
  const [versions, setVersions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [audit, setAudit] = useState([
    { time: nowLabel(), action: 'SESSION_CREATED', reason: 'Fixture-mode discovery session started.' },
  ]);
  const [status, setStatus] = useState('RECOMMENDATIONS_READY');

  const recommendationConcepts = useMemo(
    () => proposalIds.map((id) => SWAGR_FIXTURES.find((f) => f.id === id)).filter(Boolean),
    [proposalIds]
  );

  const missing = useMemo(() => {
    const gaps = [];
    if (!requirements.audience) gaps.push('Audience is unknown');
    if (!requirements.useCase) gaps.push('Use case is unknown');
    if (requirements.quantity === 'QTY_UNSTATED') gaps.push('Quantity band is unknown — quantity feasibility is not evaluated');
    if (requirements.budget === 'UNSTATED') gaps.push('Budget band is unknown — commercial fit needs later validation');
    if (!requirements.inHandsDate) gaps.push('In-hands date is unknown — delivery feasibility cannot be stated');
    if (!requirements.location) gaps.push('Delivery location is unknown');
    return gaps;
  }, [requirements]);

  const allCommercialGaps = [
    'Live product/SKU source not connected',
    'Price and inventory not acquired',
    'MOQ and production capacity not verified',
    'Lead time and delivery require human/source validation',
    'Concept visuals are not production proofs',
  ];

  const replacement = SWAGR_FIXTURES.find((f) => !proposalIds.includes(f.id));

  const record = (action, reason) => {
    setAudit((items) => [{ time: nowLabel(), action, reason }, ...items].slice(0, 20));
  };

  const updateRequirement = (key, value) => {
    setRequirements((r) => ({ ...r, [key]: value }));
    record('REQUIREMENT_UPDATED', `${key} updated by fixture test user.`);
    setStatus('REQUIREMENTS_READY');
  };

  const regenerate = () => {
    const next = buildRecommendations(requirements);
    setProposalIds(next);
    setSelectedIds([]);
    setCompareIds([]);
    setStatus('RECOMMENDATIONS_READY');
    record('RECOMMENDATIONS_REBUILT', 'Five fixture concepts re-ranked from current stated requirements.');
  };

  const toggleSelect = (id) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    record('SELECTION_CHANGED', `${id} selection toggled.`);
  };

  const toggleCompare = (id) => {
    setCompareIds((ids) => {
      if (ids.includes(id)) return ids.filter((x) => x !== id);
      if (ids.length >= 3) return [...ids.slice(1), id];
      return [...ids, id];
    });
    record('COMPARE_CHANGED', `${id} compare state changed; compare is capped at three concepts.`);
  };

  const replaceConcept = (oldId) => {
    const alternate = SWAGR_FIXTURES.find((f) => !proposalIds.includes(f.id));
    if (!alternate) return;
    setProposalIds((ids) => ids.map((id) => id === oldId ? alternate.id : id));
    setSelectedIds((ids) => ids.filter((id) => id !== oldId));
    setCompareIds((ids) => ids.filter((id) => id !== oldId));
    record('CONCEPT_REPLACED', `${oldId} replaced with ${alternate.id}; prior concept remains visible in audit history.`);
  };

  const requestChange = () => {
    const snapshot = {
      version,
      proposalIds: [...proposalIds],
      selectedIds: [...selectedIds],
      requirements: { ...requirements },
      status: 'CHANGE_REQUESTED',
    };
    setVersions((items) => [snapshot, ...items]);
    const excluded = selectedIds.length ? selectedIds : proposalIds.slice(0, 1);
    setProposalIds(buildRecommendations(requirements, excluded));
    setSelectedIds([]);
    setCompareIds([]);
    setVersion((v) => v + 1);
    setStatus('CUSTOMER_REVIEW');
    record('NEW_PROPOSAL_VERSION', `Proposal v${version} preserved; v${version + 1} created after a change request.`);
  };

  const markHandoffReady = () => {
    setStatus('DRAFT_HANDOFF_READY');
    record('DRAFT_HANDOFF_READY', 'Draft prepared for human review. No quote, order, email, API call, or production action occurred.');
  };

  const compareConcepts = compareIds.map((id) => SWAGR_FIXTURES.find((f) => f.id === id)).filter(Boolean);

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{ background: 'radial-gradient(70% 50% at 90% 0%, rgba(108,71,255,.22), transparent 70%), radial-gradient(45% 35% at 0% 12%, rgba(245,200,66,.08), transparent 70%)' }}
      />

      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(20,15,30,.92)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: C.gold }} />
              <span className="text-xl font-black tracking-tight">SWAGR AI</span>
              <StatusPill tone="purple">BUILD-001</StatusPill>
            </div>
            <p className="mt-1 text-xs" style={{ color: C.muted }}>Fixture-backed discovery + five-product proposal lab</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="warn">Synthetic only</StatusPill>
            <StatusPill tone={status === 'DRAFT_HANDOFF_READY' ? 'good' : 'neutral'}>{status}</StatusPill>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="grid gap-6 xl:grid-cols-[390px_1fr]">
          <aside className="h-fit rounded-2xl border p-5 xl:sticky xl:top-5" style={{ background: C.panel, borderColor: C.line }}>
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5" style={{ color: C.gold }} />
              <div>
                <h1 className="text-lg font-black">Tell SWAGR what you are trying to do</h1>
                <p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>Only ask for information that changes the recommendation. Nothing here is sent externally.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <TextField label="Audience" value={requirements.audience} onChange={(v) => updateRequirement('audience', v)} placeholder="Employees, attendees, clients…" />
              <TextField label="Business moment / use" value={requirements.useCase} onChange={(v) => updateRequirement('useCase', v)} placeholder="Recruiting event, onboarding, giveaway…" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <SelectField label="Quantity planning band" value={requirements.quantity} onChange={(v) => updateRequirement('quantity', v)} options={QTY_OPTIONS} note="Planning band only — not an MOQ or feasibility claim." />
                <SelectField label="Budget planning band" value={requirements.budget} onChange={(v) => updateRequirement('budget', v)} options={BUDGET_OPTIONS} note="No currency or product price is inferred." />
              </div>
              <TextField label="Needed by" type="date" value={requirements.inHandsDate} onChange={(v) => updateRequirement('inHandsDate', v)} note="Planning input only. This is not a delivery promise." />
              <TextField label="Delivery location" value={requirements.location} onChange={(v) => updateRequirement('location', v)} placeholder="City / region" />
              <TextField label="Style / preference" value={requirements.style} onChange={(v) => updateRequirement('style', v)} placeholder="Premium, sustainable-looking, simple…" />
              <TextField label="Avoid / exclude" value={requirements.exclusions} onChange={(v) => updateRequirement('exclusions', v)} placeholder="No drinkware, no apparel…" />
            </div>

            <button
              type="button"
              onClick={regenerate}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
              style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}
            >
              Build my five concepts <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-5 border-t pt-4" style={{ borderColor: C.line }}>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>Requirement truth state</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ['Audience', fieldState(requirements.audience)],
                  ['Use', fieldState(requirements.useCase)],
                  ['Quantity', requirements.quantity === 'QTY_UNSTATED' ? 'UNKNOWN' : 'STATED'],
                  ['Budget', requirements.budget === 'UNSTATED' ? 'UNKNOWN' : 'STATED'],
                  ['Date', fieldState(requirements.inHandsDate)],
                  ['Location', fieldState(requirements.location)],
                ].map(([label, state]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border px-2.5 py-2" style={{ borderColor: C.line, background: '#100B18' }}>
                    <span style={{ color: C.muted }}>{label}</span>
                    <span style={{ color: state === 'STATED' ? C.green : C.gold }}>{state}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="rounded-2xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.gold }}>Proposal v{version}</div>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">Five reasoned concepts — not a catalog dump</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>These are synthetic category concepts selected from the governed SWAGR fixture corpus. Product-level availability, price, MOQ, lead time and decoration must be validated later by authorized sources and humans.</p>
                </div>
                <button
                  type="button"
                  onClick={requestChange}
                  className="rounded-xl border px-4 py-2.5 text-xs font-bold transition hover:bg-white/5 focus:outline-none focus:ring-2"
                  style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}
                >
                  <RefreshCcw className="mr-1.5 inline h-3.5 w-3.5" /> Request a different direction
                </button>
              </div>

              {missing.length > 0 && (
                <div className="mt-4 rounded-xl border p-3" style={{ borderColor: `${C.gold}55`, background: `${C.gold}08` }}>
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.gold }} />
                    <div>
                      <div className="text-xs font-bold" style={{ color: C.gold }}>Incomplete requirements remain visible</div>
                      <ul className="mt-1 space-y-1 text-xs" style={{ color: C.muted }}>
                        {missing.map((gap) => <li key={gap}>• {gap}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="grid gap-4 lg:grid-cols-2" aria-label="Five SWAGR recommendation concepts">
              {recommendationConcepts.map((concept) => (
                <ConceptCard
                  key={`${version}-${concept.id}`}
                  concept={concept}
                  selected={selectedIds.includes(concept.id)}
                  compared={compareIds.includes(concept.id)}
                  onSelect={() => toggleSelect(concept.id)}
                  onCompare={() => toggleCompare(concept.id)}
                  onReplace={() => replaceConcept(concept.id)}
                  replacementAvailable={Boolean(replacement)}
                />
              ))}
            </section>

            {compareConcepts.length > 0 && (
              <section className="rounded-2xl border p-5" style={{ background: C.panel2, borderColor: C.purple }}>
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5" style={{ color: C.purpleLt }} />
                  <h2 className="text-lg font-black">Compare tradeoffs</h2>
                  <StatusPill tone="purple">Max 3</StatusPill>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-xs">
                    <thead style={{ color: C.muted }}>
                      <tr className="border-b" style={{ borderColor: C.line }}>
                        <th className="p-3">Concept</th><th className="p-3">Quantity planning</th><th className="p-3">Budget planning</th><th className="p-3">Validation state</th>
                      </tr>
                    </thead>
                    <tbody>
                      {compareConcepts.map((concept) => (
                        <tr key={concept.id} className="border-b" style={{ borderColor: C.line }}>
                          <td className="p-3 font-semibold text-white">{concept.name}</td>
                          <td className="p-3" style={{ color: C.cream }}>{concept.quantities.join(', ')}</td>
                          <td className="p-3" style={{ color: C.cream }}>{concept.budgets.join(', ')}</td>
                          <td className="p-3" style={{ color: C.gold }}>Commercial validation required</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px]" style={{ color: C.muted }}>No concept is labeled a guaranteed winner. This comparison exposes fit and uncertainty, not unsupported product superiority.</p>
              </section>
            )}

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" style={{ color: C.gold }} />
                  <h2 className="text-lg font-black">Concept virtual recipe</h2>
                </div>
                <p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>Selected concepts can carry creative direction, but SWAGR does not claim to produce approved artwork in this fixture build.</p>
                <div className="mt-4 space-y-3">
                  {(selectedIds.length ? selectedIds : proposalIds.slice(0, 2)).map((id) => {
                    const c = SWAGR_FIXTURES.find((f) => f.id === id);
                    return (
                      <div key={id} className="rounded-xl border p-3" style={{ background: '#100B18', borderColor: C.line }}>
                        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold text-white">{c.name}</span><StatusPill tone="warn">CONCEPT ONLY</StatusPill></div>
                        <p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>{c.creative}</p>
                        <p className="mt-2 text-[11px]" style={{ color: C.muted }}>Production proof, imprint area, artwork quality, and decoration feasibility remain validation gaps.</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" style={{ color: C.green }} /><h2 className="text-lg font-black">Validation-gap summary</h2></div>
                <ul className="mt-4 space-y-2 text-sm" style={{ color: C.cream }}>
                  {[...missing, ...allCommercialGaps].map((gap) => <li key={gap} className="flex gap-2"><span style={{ color: C.gold }}>•</span><span>{gap}</span></li>)}
                </ul>
                <div className="mt-4 rounded-xl border p-3" style={{ borderColor: `${C.green}44`, background: `${C.green}08` }}>
                  <p className="text-xs leading-5" style={{ color: C.green }}>A draft can be prepared for human review with explicit gaps. It is never transformed into a quote, order, payment, or production approval here.</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border p-5" style={{ background: C.panel, borderColor: status === 'DRAFT_HANDOFF_READY' ? C.green : C.line }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.gold }}>Safe stopping point</div>
                  <h2 className="mt-1 text-xl font-black">Draft handoff for human review</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>Package the stated requirements, selected concepts, creative notes and validation gaps. No email is sent and no external system is contacted.</p>
                </div>
                <button
                  type="button"
                  onClick={markHandoffReady}
                  className="rounded-xl px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
                  style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}
                >
                  Mark DRAFT_HANDOFF_READY <ArrowRight className="ml-1 inline h-4 w-4" />
                </button>
              </div>
              {status === 'DRAFT_HANDOFF_READY' && (
                <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `${C.green}66`, background: `${C.green}0C` }}>
                  <div className="flex gap-2"><Check className="mt-0.5 h-4 w-4" style={{ color: C.green }} /><div><div className="text-sm font-bold" style={{ color: C.green }}>DRAFT_HANDOFF_READY</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>Fixture draft is ready for a human reviewer. No quote created. No submission. No order. No payment. No production approval. No external effect.</p></div></div>
                </div>
              )}
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><History className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-lg font-black">Proposal history</h2></div>
                <div className="mt-4 space-y-2">
                  <div className="rounded-xl border p-3" style={{ borderColor: C.purple, background: `${C.purple}0D` }}><div className="text-xs font-bold">Current — v{version}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>{proposalIds.join(' · ')}</div></div>
                  {versions.length === 0 && <p className="text-xs" style={{ color: C.muted }}>No prior versions yet. Use “Request a different direction” to prove version preservation.</p>}
                  {versions.map((v) => <div key={v.version} className="rounded-xl border p-3" style={{ borderColor: C.line, background: '#100B18' }}><div className="text-xs font-bold">Preserved — v{v.version}</div><div className="mt-1 text-[11px]" style={{ color: C.muted }}>{v.proposalIds.join(' · ')}</div></div>)}
                </div>
              </div>

              <div className="rounded-2xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><ClipboardList className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-lg font-black">Local audit trail</h2></div>
                <div className="mt-4 max-h-64 space-y-2 overflow-auto pr-1">
                  {audit.map((event, idx) => <div key={`${event.time}-${idx}`} className="rounded-xl border p-3" style={{ borderColor: C.line, background: '#100B18' }}><div className="flex justify-between gap-2"><span className="text-[10px] font-bold" style={{ color: C.purpleLt }}>{event.action}</span><span className="text-[10px]" style={{ color: C.muted }}>{event.time}</span></div><p className="mt-1 text-[11px] leading-5" style={{ color: C.cream }}>{event.reason}</p></div>)}
                </div>
                <p className="mt-3 text-[10px] leading-4" style={{ color: C.muted }}>This audit is transient browser state for the fixture lab. Identity, persistence, retention and live data remain gated.</p>
              </div>
            </section>
          </div>
        </section>

        <footer className="mt-8 border-t py-5 text-center text-[11px]" style={{ borderColor: C.line, color: C.muted }}>
          SWAGR AI BUILD-001 · Fixture mode · No live catalog · No commercial claims · No external effects · No production authority
        </footer>
      </div>
    </main>
  );
}
