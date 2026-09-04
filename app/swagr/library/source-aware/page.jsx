'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, Filter, Search, ShieldCheck, TriangleAlert } from 'lucide-react';
import ConceptVisual from '../../concept-visual';
import { SWAGR_GOVERNED_CONCEPTS } from '../../coverage/catalog';
import { SOURCE_DISCOVERY_MODES, buildSourceAwareDiscovery } from '../source-aware-discovery';

const C = {
  bg: '#120D1A', panel: '#1B1530', panel2: '#211938', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', red: '#FB7185', muted: '#AAA0B8', line: '#352A46',
};
const inputStyle = { borderColor: C.line, background: '#0F0A17', color: C.cream, outlineColor: C.purple };
const CATEGORIES = [
  ['all', 'All categories'], ['apparel', 'Apparel'], ['headwear', 'Headwear'], ['drinkware', 'Drinkware'],
  ['bags', 'Bags'], ['writing', 'Writing'], ['tech', 'Tech'], ['safety', 'Safety'], ['events', 'Events'],
];

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

function Stat({ label, value, tone = 'neutral' }) {
  const color = tone === 'good' ? C.green : tone === 'warn' ? C.gold : tone === 'purple' ? C.purpleLt : C.cream;
  return <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: C.panel2 }}><div className="text-2xl font-black" style={{ color }}>{value}</div><div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>{label}</div></div>;
}

function SourcePanel({ record }) {
  const projection = record.projection;
  return <div className="rounded-2xl border p-3.5" style={{ borderColor: record.eligible ? `${C.green}44` : `${C.gold}55`, background: record.eligible ? `${C.green}08` : `${C.gold}08` }}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">{record.eligible ? <CheckCircle2 className="h-4 w-4" style={{ color: C.green }} /> : <TriangleAlert className="h-4 w-4" style={{ color: C.gold }} />}<span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: record.eligible ? C.green : C.gold }}>{record.sourceStatus}</span></div>
      <span className="text-[10px] font-black" style={{ color: C.muted }}>{record.sourceScore}% source gate</span>
    </div>
    {projection ? <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] leading-4">
      <div><span style={{ color: C.muted }}>Record</span><div className="break-words font-bold" style={{ color: C.cream }}>{projection.providerRecordId}</div></div>
      <div><span style={{ color: C.muted }}>Freshness</span><div className="font-bold" style={{ color: C.cream }}>{record.freshnessHours == null ? 'UNKNOWN' : `${record.freshnessHours.toFixed(1)}h`}</div></div>
      <div><span style={{ color: C.muted }}>Usage rights</span><div className="break-words font-bold" style={{ color: C.cream }}>{projection.usageRightsState}</div></div>
      <div><span style={{ color: C.muted }}>Field confidence</span><div className="font-bold" style={{ color: C.cream }}>{record.confidence.verified} verified · {record.confidence.normalized} normalized · {record.confidence.unknown} unknown</div></div>
    </div> : <div className="mt-3"><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Why withheld</div><div className="mt-2 flex flex-wrap gap-1.5">{record.blockers.slice(0, 4).map((blocker) => <Pill key={blocker} tone="warn">{blocker}</Pill>)}</div></div>}
  </div>;
}

export default function SwagrSourceAwareDiscovery() {
  const [mode, setMode] = useState('MIXED_CONTROLLED_READINESS');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const discovery = useMemo(() => buildSourceAwareDiscovery(SWAGR_GOVERNED_CONCEPTS, { mode, query, category, eligibleOnly }), [mode, query, category, eligibleOnly]);
  const modeMeta = SOURCE_DISCOVERY_MODES.find((item) => item.id === mode) || SOURCE_DISCOVERY_MODES[0];

  return <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
    <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(58% 42% at 92% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(42% 32% at 0% 24%, rgba(245,200,66,.08), transparent 75%)' }} />
    <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.96)' }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-start gap-3"><Link href="/swagr/library" aria-label="Back to governed concept library" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link><div><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Source-Aware Discovery</Pill></div><p className="mt-1 max-w-3xl text-xs leading-5" style={{ color: C.muted }}>Browse governed product directions with source freshness, usage rights, confidence, and fail-closed eligibility visible before a direction can move into product-specific virtual validation.</p></div></div>
        <div className="flex flex-wrap gap-2"><Pill tone="good">Read only</Pill><Pill tone="warn">Synthetic source simulation</Pill></div>
      </div>
    </header>

    <div className="relative mx-auto max-w-7xl px-5 py-8">
      <section className="rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.purple}55`, background: 'linear-gradient(135deg, rgba(108,71,255,.14), rgba(27,21,48,.96))' }}>
        <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><Database className="mt-1 h-5 w-5" style={{ color: C.gold }} /><div><h1 className="text-2xl font-black">Discovery that shows what the source can actually support.</h1><p className="mt-2 max-w-3xl text-xs leading-5" style={{ color: C.muted }}>A visually attractive direction can still be withheld from source-qualified discovery when provider approval, freshness, exact identity, usage rights, license scope, or schema completeness fails. No fallback guesses are promoted.</p></div></div><Pill tone="purple">{discovery.authority}</Pill></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="governed directions" value={discovery.summary.total} tone="purple" /><Stat label="source eligible" value={discovery.summary.eligible} tone="good" /><Stat label="source blocked" value={discovery.summary.blocked} tone="warn" /><Stat label="unknown source fields" value={discovery.summary.unknownFields} /></div>
      </section>

      <section className="mt-5 rounded-3xl border p-5" style={{ borderColor: C.line, background: C.panel }}>
        <div className="flex items-center gap-2"><Filter className="h-4 w-4" style={{ color: C.purpleLt }} /><h2 className="text-sm font-black">Discovery controls</h2></div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr_1fr_1fr]">
          <label className="text-xs font-bold" style={{ color: C.muted }}>Search direction / audience / use case<div className="relative mt-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: C.muted }} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-xs" style={inputStyle} placeholder="Search governed concepts" /></div></label>
          <label className="text-xs font-bold" style={{ color: C.muted }}>Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-xs font-bold" style={{ color: C.muted }}>Source condition<select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{SOURCE_DISCOVERY_MODES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex cursor-pointer items-center gap-2 text-xs font-bold" style={{ color: C.cream }}><input type="checkbox" checked={eligibleOnly} onChange={(event) => setEligibleOnly(event.target.checked)} className="h-4 w-4" />Show only source-qualified directions</label><div className="text-[10px] leading-4" style={{ color: C.muted }}>{modeMeta.description} · showing {discovery.summary.matching} direction{discovery.summary.matching === 1 ? '' : 's'}</div></div>
      </section>

      {discovery.records.length ? <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{discovery.records.map((record) => <article key={record.concept.id} className="flex flex-col rounded-3xl border p-4" style={{ borderColor: record.eligible ? `${C.green}38` : C.line, background: C.panel }}>
        <ConceptVisual concept={record.concept} compact conceptLabel={record.eligible ? 'Source-qualified planning direction' : 'Source-blocked planning direction'} />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-2"><div><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.purpleLt }}>{record.concept.id}</div><h2 className="mt-1 text-base font-black" style={{ color: C.cream }}>{record.concept.name}</h2><div className="mt-1 text-[11px]" style={{ color: C.muted }}>{record.concept.category}</div></div><Pill tone={record.eligible ? 'good' : 'warn'}>{record.eligible ? 'Source qualified' : 'Withheld'}</Pill></div>
        <p className="mt-3 text-xs leading-5" style={{ color: C.muted }}>{record.concept.rationale}</p>
        <div className="mt-4"><SourcePanel record={record} /></div>
        {record.warnings.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{record.warnings.map((warning) => <Pill key={warning}>{warning}</Pill>)}</div>}
        <div className="mt-auto pt-4">{record.eligible ? <div className="flex flex-wrap gap-2"><Link href={`/swagr/virtual/product-readiness?concept=${encodeURIComponent(record.concept.id)}&scenario=${encodeURIComponent(record.scenarioId)}`} className="inline-flex rounded-xl px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ background: C.purple, color: '#fff', '--tw-ring-color': C.purpleLt }}>Validate product + imprint →</Link><Link href={`/swagr/virtual?concept=${encodeURIComponent(record.concept.id)}&source=source-aware`} className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Concept virtual →</Link></div> : <button type="button" disabled className="inline-flex cursor-not-allowed rounded-xl border px-3.5 py-2.5 text-xs font-black opacity-70" style={{ borderColor: `${C.gold}55`, color: C.gold }}>Source gate must clear first</button>}</div>
      </article>)}</section> : <section className="mt-5 rounded-3xl border p-8 text-center" style={{ borderColor: C.line, background: C.panel }}><div className="text-lg font-black">No governed directions match these filters.</div><p className="mt-2 text-xs" style={{ color: C.muted }}>Clear search/category filters or include blocked source states. SWAGR will not invent a direction to fill an empty result.</p></section>}

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border p-5" style={{ borderColor: `${C.green}44`, background: `${C.green}07` }}><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5" style={{ color: C.green }} /><div><div className="text-sm font-black" style={{ color: C.green }}>What source-qualified means here</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>Only that the controlled read-only simulation passed provider approval, transport, exact-record, revision, freshness, usage-rights, license-scope, and product-identity gates. Price, inventory, MOQ, lead time, delivery, supplier approval, and production authority are still unverified and absent.</p></div></div></div>
        <div className="rounded-3xl border p-5" style={{ borderColor: `${C.gold}44`, background: `${C.gold}07` }}><div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 h-5 w-5" style={{ color: C.gold }} /><div><div className="text-sm font-black" style={{ color: C.gold }}>Simulation boundary</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>These are synthetic provider-envelope conditions used to validate SWAGR behavior. No real provider is being represented as approved, licensed, current, in stock, or commercially available.</p></div></div></div>
      </section>
    </div>
  </main>;
}
