'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, ExternalLink, LockKeyhole, ShieldCheck, TriangleAlert } from 'lucide-react';
import { SWAGR_GOVERNED_CONCEPTS } from '../coverage/catalog';
import {
  PROVIDER_PROJECTION_LIMITS,
  PROVIDER_PROJECTION_SCENARIOS,
  buildSyntheticProviderEnvelope,
  projectReadOnlyProviderRecord,
} from './provider-projection';

const C = {
  bg: '#120D1A', panel: '#1B1530', panel2: '#211938', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', red: '#FB7185', muted: '#AAA0B8', line: '#352A46',
};

function Pill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    bad: { color: C.red, borderColor: `${C.red}55`, background: `${C.red}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]" style={tones[tone]}>{children}</span>;
}

function Gate({ label, value, pass }) {
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: pass ? `${C.green}45` : `${C.gold}55`, background: pass ? `${C.green}08` : `${C.gold}08` }}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: pass ? C.green : C.gold }}>
        {pass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}{label}
      </div>
      <div className="mt-1 break-words text-xs font-bold" style={{ color: C.cream }}>{value || 'UNKNOWN'}</div>
    </div>
  );
}

export default function SwagrProviderProjectionLab() {
  const [conceptId, setConceptId] = useState(SWAGR_GOVERNED_CONCEPTS[3]?.id || SWAGR_GOVERNED_CONCEPTS[0]?.id || '');
  const [scenarioId, setScenarioId] = useState('CONTROLLED_FRESH_SIMULATION');

  const concept = useMemo(
    () => SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === conceptId) || SWAGR_GOVERNED_CONCEPTS[0],
    [conceptId]
  );
  const scenario = PROVIDER_PROJECTION_SCENARIOS.find((item) => item.id === scenarioId) || PROVIDER_PROJECTION_SCENARIOS[0];
  const envelope = useMemo(() => buildSyntheticProviderEnvelope(concept, scenarioId), [concept, scenarioId]);
  const result = useMemo(() => projectReadOnlyProviderRecord(concept, envelope), [concept, envelope]);
  const eligible = result.evaluation.status === 'READ_ONLY_PROJECTION_ELIGIBLE';
  const freshness = result.evaluation.freshnessHours == null ? 'INVALID' : `${result.evaluation.freshnessHours.toFixed(1)} hours`;

  const gates = [
    ['Provider approval', envelope.providerApprovalState, envelope.providerApprovalState === PROVIDER_PROJECTION_LIMITS.requiredApprovalState],
    ['Transport', envelope.transportMode, envelope.transportMode === 'READ_ONLY'],
    ['Exact source record', envelope.providerRecordId, Boolean(envelope.providerRecordId)],
    ['Source revision', envelope.sourceRevision, Boolean(envelope.sourceRevision)],
    ['Freshness', freshness, result.evaluation.freshnessHours != null && result.evaluation.freshnessHours <= PROVIDER_PROJECTION_LIMITS.maxFreshnessHours],
    ['Usage rights', envelope.usageRightsState, envelope.usageRightsState === PROVIDER_PROJECTION_LIMITS.requiredUsageRightsState],
    ['License scope', envelope.licenseScope, Boolean(envelope.licenseScope && envelope.licenseScope !== 'NOT_EVALUATED')],
    ['Product identity', envelope.fields.productName, Boolean(envelope.fields.productName)],
  ];

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(56% 42% at 92% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(42% 32% at 0% 22%, rgba(245,200,66,.08), transparent 75%)' }} />
      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.96)' }}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-start gap-3">
            <Link href="/swagr/library" aria-label="Back to governed concept library" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link>
            <div>
              <div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Provider Projection Gate</Pill></div>
              <p className="mt-1 max-w-3xl text-xs leading-5" style={{ color: C.muted }}>Prove what an approved provider may contribute before any live catalog credential is connected. This page makes read-only source, freshness, license, and confidence gates visible.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2"><Pill tone="good">Read only</Pill><Pill tone="warn">Simulation only</Pill></div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.purple}55`, background: 'linear-gradient(135deg, rgba(108,71,255,.14), rgba(27,21,48,.96))' }}>
            <div className="flex items-center gap-3"><Database className="h-5 w-5" style={{ color: C.gold }} /><div><h1 className="text-2xl font-black">Read-only data readiness</h1><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>A real provider stays blocked unless every required contract gate is satisfied.</p></div></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold" style={{ color: C.muted }}>Concept direction
                <select value={conceptId} onChange={(event) => setConceptId(event.target.value)} className="mt-2 w-full rounded-2xl border px-3 py-3 text-sm font-bold outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', color: C.cream, '--tw-ring-color': C.purple }}>
                  {SWAGR_GOVERNED_CONCEPTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold" style={{ color: C.muted }}>Controlled scenario
                <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)} className="mt-2 w-full rounded-2xl border px-3 py-3 text-sm font-bold outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', color: C.cream, '--tw-ring-color': C.purple }}>
                  {PROVIDER_PROJECTION_SCENARIOS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}>
              <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Scenario behavior</div><div className="mt-1 text-sm font-black" style={{ color: C.cream }}>{scenario.label}</div></div><Pill tone={eligible ? 'good' : 'warn'}>{result.evaluation.status}</Pill></div>
              <p className="mt-3 text-xs leading-5" style={{ color: C.muted }}>{scenario.description}</p>
              <div className="mt-4 flex items-end gap-3"><div className="text-4xl font-black" style={{ color: eligible ? C.green : C.gold }}>{result.evaluation.score}%</div><div className="pb-1 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>contract completeness</div></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gates.map(([label, value, pass]) => <Gate key={label} label={label} value={value} pass={pass} />)}
            </div>
          </div>

          <div className="rounded-3xl border p-5 sm:p-6" style={{ borderColor: C.line, background: C.panel }}>
            <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5" style={{ color: eligible ? C.green : C.gold }} /><div><h2 className="text-lg font-black">What SWAGR is allowed to believe</h2><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>The projection is either explicitly eligible or absent. There is no silent fallback to guessed supplier truth.</p></div></div>
            {eligible && result.projection ? (
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border p-4" style={{ borderColor: `${C.green}44`, background: `${C.green}08` }}><div className="flex flex-wrap items-center justify-between gap-2"><Pill tone="good">Projection eligible</Pill><span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>No commerce authority</span></div><h3 className="mt-3 text-xl font-black">{result.projection.productName}</h3><p className="mt-1 text-xs" style={{ color: C.muted }}>{result.projection.category}</p></div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Gate label="Record ID" value={result.projection.providerRecordId} pass />
                  <Gate label="Revision" value={result.projection.sourceRevision} pass />
                  <Gate label="Price" value={result.projection.commercialState} pass={false} />
                  <Gate label="Inventory" value={result.projection.inventoryState} pass={false} />
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Next validation</div><ol className="mt-3 space-y-2 text-xs leading-5" style={{ color: C.cream }}>{result.projection.nextValidation.map((item, index) => <li key={item}><span className="mr-2 font-black" style={{ color: C.purpleLt }}>{index + 1}.</span>{item}</li>)}</ol></div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: `${C.gold}55`, background: `${C.gold}08` }}>
                <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4" style={{ color: C.gold }} /><div className="text-sm font-black" style={{ color: C.gold }}>Projection withheld</div></div>
                <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>SWAGR refuses to promote this simulated provider record because a required source-control gate failed.</p>
                <div className="mt-4 flex flex-wrap gap-2">{result.evaluation.blockers.map((blocker) => <Pill key={blocker} tone="warn">{blocker}</Pill>)}</div>
              </div>
            )}
            {result.evaluation.warnings.length > 0 && <div className="mt-4"><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Non-blocking field confidence</div><div className="mt-2 flex flex-wrap gap-2">{result.evaluation.warnings.map((warning) => <Pill key={warning}>{warning}</Pill>)}</div></div>}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border p-5" style={{ borderColor: C.line, background: C.panel2 }}><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Reusable capability</div><h2 className="mt-2 text-lg font-black">One provider contract, many discovery surfaces.</h2><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Any future approved provider must normalize into the same source identity, read-only transport, revision, freshness, usage-rights, license-scope, and per-field confidence model before SWAGR uses it.</p></div>
          <div className="rounded-3xl border p-5" style={{ borderColor: C.line, background: C.panel2 }}><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Deliberately excluded</div><h2 className="mt-2 text-lg font-black">No live commercial truth yet.</h2><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Price, cost, inventory, MOQ, lead time, delivery, supplier approval, order, payment, and production authority remain outside this slice and cannot be inferred from provider identity alone.</p></div>
          <div className="rounded-3xl border p-5" style={{ borderColor: `${C.purple}55`, background: 'rgba(108,71,255,.09)' }}><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.purpleLt }}>Next controlled handoff</div><h2 className="mt-2 text-lg font-black">Product identity → imprint validation.</h2><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Once an exact product reference is governed, the next safe slice can bind that product projection to a controlled imprint specification without granting production authority.</p><Link href={`/swagr/virtual/readiness?concept=${encodeURIComponent(concept?.id || '')}`} className="mt-4 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ background: C.purple, color: '#fff', '--tw-ring-color': C.purpleLt }}>Open imprint readiness <ExternalLink className="h-3.5 w-3.5" /></Link></div>
        </section>

        <div className="mt-5 rounded-3xl border p-5" style={{ borderColor: `${C.gold}44`, background: `${C.gold}07` }}>
          <div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} /><div><div className="text-sm font-black" style={{ color: C.gold }}>Simulation boundary</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>All records on this page are synthetic provider-envelope simulations used to validate SWAGR AI behavior. No SAGE, ASI, PromoStandards, supplier, customer, pricing, inventory, or production endpoint is called. “Approved” inside the fresh simulation is a simulated contract state, not a statement that any real provider has been owner-approved.</p></div></div>
        </div>
      </div>
    </main>
  );
}
