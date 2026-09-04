'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, Image, Layers3, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import ConceptVisual from '../../concept-visual';
import { loadActiveCampaign } from '../../campaign-store';
import { SWAGR_GOVERNED_CONCEPTS } from '../../coverage/catalog';
import { PROVIDER_PROJECTION_SCENARIOS, buildSyntheticProviderEnvelope, projectReadOnlyProviderRecord } from '../../data/provider-projection';
import { MEDIA_READINESS_SCENARIOS, buildSyntheticMediaEnvelope, createControlledMediaPacket } from '../../media/media-readiness';
import { controlledTemplateForConcept } from '../imprint-readiness';
import { evaluateProductSpecBinding } from '../product-spec-binding';
import {
  CONTROLLED_PRODUCT_SPEC_SCENARIOS,
  buildControlledPreviewSpec,
  evaluateControlledVirtualAssembly,
} from '../controlled-assembly';

const C = {
  bg: '#120D1A', panel: '#1B1530', panel2: '#211938', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', red: '#FB7185', muted: '#AAA0B8', line: '#352A46',
};
const inputStyle = { borderColor: C.line, background: '#0F0A17', color: C.cream, outlineColor: C.purple };

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

function Gate({ label, pass, value }) {
  return <div className="rounded-2xl border p-3" style={{ borderColor: pass ? `${C.green}44` : `${C.gold}55`, background: pass ? `${C.green}08` : `${C.gold}08` }}>
    <div className="flex items-center gap-2">{pass ? <CheckCircle2 className="h-4 w-4" style={{ color: C.green }} /> : <TriangleAlert className="h-4 w-4" style={{ color: C.gold }} />}<span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: pass ? C.green : C.gold }}>{label}</span></div>
    <div className="mt-1 break-words text-xs font-bold" style={{ color: C.cream }}>{value || 'UNKNOWN'}</div>
  </div>;
}

function StatusCard({ icon: Icon, label, status, score, ready }) {
  return <div className="rounded-2xl border p-3.5" style={{ borderColor: ready ? `${C.green}44` : `${C.gold}44`, background: ready ? `${C.green}07` : `${C.gold}07` }}>
    <div className="flex items-start gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ready ? C.green : C.gold }} /><div className="min-w-0"><div className="text-[9px] font-black uppercase tracking-[0.13em]" style={{ color: C.muted }}>{label}</div><div className="mt-1 break-words text-xs font-black" style={{ color: ready ? C.green : C.gold }}>{status}</div><div className="mt-1 text-[10px]" style={{ color: C.muted }}>{score}% gate</div></div></div>
  </div>;
}

export default function SwagrControlledInstantVirtual() {
  const [conceptId, setConceptId] = useState(SWAGR_GOVERNED_CONCEPTS[3]?.id || SWAGR_GOVERNED_CONCEPTS[0]?.id || '');
  const [providerScenario, setProviderScenario] = useState('CONTROLLED_FRESH_SIMULATION');
  const [productSpecScenario, setProductSpecScenario] = useState('CONTROLLED_COMPLETE_DECLARATION');
  const [mediaScenario, setMediaScenario] = useState('CONTROLLED_SYNTHETIC_BLANK');
  const [markText, setMarkText] = useState('SWAGR');
  const [markScale, setMarkScale] = useState(1);
  const [placement, setPlacement] = useState('primary');
  const [journeyContext, setJourneyContext] = useState(null);

  useEffect(() => {
    const campaign = loadActiveCampaign();
    if (!campaign) return;
    const activeConceptId = campaign.decisionContext?.activeConceptId || '';
    const carriedConcept = SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === activeConceptId) || null;
    if (carriedConcept) setConceptId(carriedConcept.id);
    setJourneyContext({
      campaignTitle: campaign.title || 'Active campaign',
      brandName: campaign.brand?.brandName || '',
      activeConceptId,
      carriedConceptName: carriedConcept?.name || '',
    });
  }, []);

  const concept = useMemo(() => SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === conceptId) || SWAGR_GOVERNED_CONCEPTS[0], [conceptId]);
  const template = useMemo(() => controlledTemplateForConcept(concept), [concept]);
  const providerEnvelope = useMemo(() => buildSyntheticProviderEnvelope(concept, providerScenario), [concept, providerScenario]);
  const providerResult = useMemo(() => projectReadOnlyProviderRecord(concept, providerEnvelope), [concept, providerEnvelope]);
  const previewSpec = useMemo(() => buildControlledPreviewSpec(concept, providerResult.projection, template, productSpecScenario), [concept, providerResult.projection, template, productSpecScenario]);
  const productBinding = useMemo(() => evaluateProductSpecBinding(providerResult, previewSpec), [providerResult, previewSpec]);
  const mediaEnvelope = useMemo(() => buildSyntheticMediaEnvelope(concept, providerResult.projection, mediaScenario), [concept, providerResult.projection, mediaScenario]);
  const mediaResult = useMemo(() => createControlledMediaPacket(concept, providerResult.projection, mediaEnvelope), [concept, providerResult.projection, mediaEnvelope]);
  const assembly = useMemo(() => evaluateControlledVirtualAssembly({ concept, productBinding, mediaResult, markText }), [concept, productBinding, mediaResult, markText]);

  if (!concept) return null;
  const providerReady = providerResult.evaluation.status === 'READ_ONLY_PROJECTION_ELIGIBLE';
  const productReady = productBinding.status === 'PRODUCT_SPEC_READY_FOR_HUMAN_VALIDATION';
  const mediaReady = mediaResult.evaluation.status === 'MEDIA_READY_FOR_CONTROLLED_PREVIEW_ASSEMBLY';
  const assemblyReady = assembly.status === 'CONTROLLED_VIRTUAL_ASSEMBLY_READY';
  const packet = assembly.packet;
  const mediaPacket = mediaResult.packet;
  const specMeta = CONTROLLED_PRODUCT_SPEC_SCENARIOS.find((item) => item.id === productSpecScenario) || CONTROLLED_PRODUCT_SPEC_SCENARIOS[0];

  const identityGates = [
    ['Provider record', Boolean(packet?.providerRecordId), packet?.providerRecordId || providerResult.projection?.providerRecordId || 'WITHHELD'],
    ['Source revision', Boolean(packet?.providerSourceRevision), packet?.providerSourceRevision || providerResult.projection?.sourceRevision || 'WITHHELD'],
    ['Media record', Boolean(packet?.mediaRecordId), packet?.mediaRecordId || mediaPacket?.mediaRecordId || 'WITHHELD'],
    ['Controlled blank', Boolean(packet?.controlledBlankRef), packet?.controlledBlankRef || mediaPacket?.blankRef || 'WITHHELD'],
    ['Preview geometry', packet?.previewGeometry?.authority === 'SYNTHETIC_PREVIEW_COORDINATES_ONLY', packet?.previewGeometry?.authority || mediaPacket?.previewGeometry?.authority || 'WITHHELD'],
    ['Mark source', assemblyReady, assemblyReady ? 'USER_ENTERED_PREVIEW_TEXT' : 'WITHHELD'],
  ];

  return <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
    <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(58% 42% at 92% 0%, rgba(108,71,255,.25), transparent 72%), radial-gradient(42% 32% at 0% 24%, rgba(45,212,191,.08), transparent 75%)' }} />
    <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.96)' }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-start gap-3"><Link href="/swagr" aria-label="Return to SWAGR campaign journey" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link><div><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Controlled Instant Virtual</Pill></div><p className="mt-1 max-w-3xl text-xs leading-5" style={{ color: C.muted }}>Assemble exact simulated product identity, declared imprint state, controlled preview media, and a local text mark into one identity-bound synthetic virtual—only when every upstream gate agrees.</p></div></div>
        <div className="flex flex-wrap gap-2"><Pill tone="good">Local render</Pill><Pill tone="warn">Synthetic preview only</Pill><Pill>Non-production</Pill></div>
      </div>
    </header>

    <div className="relative mx-auto max-w-7xl px-5 py-8">
      {journeyContext && <section className="mb-6 rounded-3xl border p-5" style={{ borderColor: `${C.purple}55`, background: 'linear-gradient(135deg, rgba(108,71,255,.12), rgba(27,21,48,.96))' }} aria-label="Active campaign journey context">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2"><Pill tone="purple">Journey context carried in</Pill><Pill>Session-local · read only</Pill></div>
            <h2 className="mt-3 text-lg font-black" style={{ color: C.cream }}>{journeyContext.campaignTitle}</h2>
            <p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>{journeyContext.carriedConceptName ? `SWAGR opened this workspace on ${journeyContext.carriedConceptName}, the active governed concept from your campaign journey. You can explore another concept here without changing the campaign decision.` : 'Your active campaign is preserved, but it does not currently point to a governed concept that this controlled workspace can carry in. The default preview concept remains local to this page.'}</p>
          </div>
          <Link href="/swagr" className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purpleLt }}><ArrowLeft className="h-4 w-4" /> Return to campaign journey</Link>
        </div>
      </section>}
      <section className="mb-6 rounded-3xl border p-5" style={{ borderColor: `${C.gold}55`, background: 'linear-gradient(135deg, rgba(245,200,66,.08), rgba(27,21,48,.94))' }}>
        <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} /><div><div className="text-sm font-black" style={{ color: C.gold }}>This is the first governed assembly path—not a production proof generator.</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>The composition may render only after product identity, product/imprint declaration, media rights/binding, and preview geometry gates all pass. Exact supplier photography, exact production imprint coordinates, commercial facts, artwork approval, proof approval, ordering, and production authority remain deliberately absent.</p></div></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[330px_1fr_390px]">
        <aside className="space-y-5">
          <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
            <div className="flex items-center gap-2"><Database className="h-4 w-4" style={{ color: C.purpleLt }} /><h2 className="text-sm font-black">Assembly controls</h2></div>
            <label className="mt-4 block text-xs font-bold" style={{ color: C.cream }}>Governed concept<select value={conceptId} onChange={(event) => setConceptId(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{SWAGR_GOVERNED_CONCEPTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="mt-4 block text-xs font-bold" style={{ color: C.cream }}>Provider condition<select value={providerScenario} onChange={(event) => setProviderScenario(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{PROVIDER_PROJECTION_SCENARIOS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label className="mt-4 block text-xs font-bold" style={{ color: C.cream }}>Product / imprint condition<select value={productSpecScenario} onChange={(event) => setProductSpecScenario(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{CONTROLLED_PRODUCT_SPEC_SCENARIOS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label className="mt-4 block text-xs font-bold" style={{ color: C.cream }}>Media condition<select value={mediaScenario} onChange={(event) => setMediaScenario(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{MEDIA_READINESS_SCENARIOS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label className="mt-4 block text-xs font-bold" style={{ color: C.cream }}>Preview text mark<input value={markText} maxLength={24} onChange={(event) => setMarkText(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Enter preview mark" /></label>
            <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: C.line, background: C.panel2 }}><div className="text-xs font-black" style={{ color: C.cream }}>{specMeta.label}</div><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>{specMeta.description}</p></div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <StatusCard icon={Database} label="Provider" status={providerResult.evaluation.status} score={providerResult.evaluation.score} ready={providerReady} />
            <StatusCard icon={ShieldCheck} label="Product / imprint" status={productBinding.status} score={productBinding.score} ready={productReady} />
            <StatusCard icon={Image} label="Media" status={mediaResult.evaluation.status} score={mediaResult.evaluation.score} ready={mediaReady} />
            <StatusCard icon={Layers3} label="Assembly" status={assembly.status} score={assembly.score} ready={assemblyReady} />
          </section>
        </aside>

        <section className="space-y-5">
          <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: assemblyReady ? `${C.green}44` : C.line }}>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Identity-bound preview</div><h1 className="mt-1 text-xl font-black">{concept.name}</h1></div><Pill tone={assemblyReady ? 'good' : 'warn'}>{assemblyReady ? packet.state : 'Preview withheld'}</Pill></div>
            <div className="mt-5"><ConceptVisual concept={concept} brandName={assemblyReady ? markText || 'SWAGR' : 'PREVIEW HELD'} placement={placement} markScale={markScale} conceptLabel={assemblyReady ? 'Controlled synthetic instant virtual' : 'Controlled blank / assembly withheld'} /></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr]">
              <label className="text-xs font-bold" style={{ color: C.cream }}>UI preview placement<select value={placement} onChange={(event) => setPlacement(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="alternate">Alternate</option></select></label>
              <label className="text-xs font-bold" style={{ color: C.cream }}>UI mark scale <span style={{ color: C.muted }}>{Math.round(markScale * 100)}%</span><input aria-label="Preview mark scale" type="range" min="65" max="135" step="5" value={Math.round(markScale * 100)} onChange={(event) => setMarkScale(Number(event.target.value) / 100)} className="mt-3 w-full" /></label>
            </div>
            <p className="mt-4 text-[10px] leading-4" style={{ color: C.muted }}>Placement and scale controls alter only the accepted category-level browser composition layer. They do not change the upstream declared imprint packet or create supplier production coordinates.</p>
          </section>

          <section className="rounded-3xl border p-5" style={{ borderColor: assemblyReady ? `${C.green}44` : `${C.gold}44`, background: assemblyReady ? `${C.green}07` : `${C.gold}07` }}>
            <div className="flex items-start gap-3">{assemblyReady ? <CheckCircle2 className="mt-0.5 h-5 w-5" style={{ color: C.green }} /> : <TriangleAlert className="mt-0.5 h-5 w-5" style={{ color: C.gold }} />}<div><div className="text-sm font-black" style={{ color: assemblyReady ? C.green : C.gold }}>{assembly.status}</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>{assemblyReady ? 'The exact controlled provider, product/imprint packet, and media packet agree, so SWAGR may render this local synthetic customer preview.' : 'SWAGR withholds the assembled virtual when any upstream identity, spec, media, geometry, or mark gate fails.'}</p></div></div>
            {assembly.blockers.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{assembly.blockers.map((item) => <Pill key={item} tone="warn">{item}</Pill>)}</div>}
          </section>

          <section className="grid gap-3 sm:grid-cols-2">{identityGates.map(([label, pass, value]) => <Gate key={label} label={label} pass={pass} value={value} />)}</section>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" style={{ color: C.purpleLt }} /><h2 className="text-sm font-black">Controlled virtual packet</h2></div>
            {packet ? <div className="mt-4 space-y-3"><div className="flex flex-wrap gap-2"><Pill tone="good">{packet.state}</Pill><Pill>{packet.renderPolicy.mode}</Pill></div><div className="space-y-2 text-xs leading-5"><div><span style={{ color: C.muted }}>Product:</span> <b>{packet.productName}</b></div><div><span style={{ color: C.muted }}>Provider record:</span> <b>{packet.providerRecordId}</b></div><div><span style={{ color: C.muted }}>Media record:</span> <b>{packet.mediaRecordId}</b></div><div><span style={{ color: C.muted }}>Blank:</span> <b>{packet.controlledBlankRef}</b></div><div><span style={{ color: C.muted }}>Declared placement:</span> <b>{packet.imprintDeclaration.placement}</b></div><div><span style={{ color: C.muted }}>Declared area:</span> <b>{packet.imprintDeclaration.width} × {packet.imprintDeclaration.height} {packet.imprintDeclaration.unit}</b></div><div><span style={{ color: C.muted }}>Mark:</span> <b>{packet.mark.text}</b></div></div><div className="rounded-2xl border p-3 text-[10px] leading-4" style={{ borderColor: `${C.gold}44`, color: C.muted }}>{packet.nextAction}</div></div> : <p className="mt-3 text-xs leading-5" style={{ color: C.muted }}>No assembled packet is emitted until the exact product/spec packet and controlled media packet both pass and agree on identity and revision.</p>}
          </section>

          <section className="rounded-3xl border p-5" style={{ background: C.panel2, borderColor: C.line }}>
            <div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Still deliberately absent</div>
            <div className="mt-3 space-y-2 text-xs leading-5" style={{ color: C.cream }}><div>• Exact supplier photography</div><div>• Exact production imprint coordinates</div><div>• Decoration-method production tolerances</div><div>• Real price, cost, inventory, MOQ, lead time</div><div>• Customer proof approval</div><div>• Quote, order, payment, or production authority</div></div>
          </section>

          <section className="rounded-3xl border p-5" style={{ borderColor: `${C.purple}44`, background: `${C.purple}08` }}><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: C.purpleLt }}>Reusable capability</div><h2 className="mt-2 text-lg font-black">Three governed packets, one fail-closed renderer.</h2><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>The assembler does not need to know which future provider supplied the product. It only trusts normalized upstream packet contracts, exact identity/revision matches, controlled media authority, and preview-only geometry.</p></section>

          <div className="flex flex-wrap gap-2"><Link href="/swagr" className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{ borderColor: C.purple, color: C.purpleLt }}>← Campaign journey</Link><Link href="/swagr/media" className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{ borderColor: C.line, color: C.cream }}>Media gate →</Link><Link href={`/swagr/virtual/product-readiness?concept=${encodeURIComponent(concept.id)}&scenario=${encodeURIComponent(providerScenario)}`} className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{ borderColor: C.purple, color: C.purpleLt }}>Product + imprint gate →</Link><Link href="/swagr/library/source-aware" className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{ borderColor: C.line, color: C.cream }}>Discovery →</Link></div>
        </aside>
      </section>
    </div>
  </main>;
}
