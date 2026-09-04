'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, Image, Ruler, ShieldCheck, TriangleAlert } from 'lucide-react';
import ConceptVisual from '../concept-visual';
import { SWAGR_GOVERNED_CONCEPTS } from '../coverage/catalog';
import { PROVIDER_PROJECTION_SCENARIOS, buildSyntheticProviderEnvelope, projectReadOnlyProviderRecord } from '../data/provider-projection';
import { MEDIA_READINESS_SCENARIOS, buildSyntheticMediaEnvelope, createControlledMediaPacket } from './media-readiness';

const C = { bg:'#120D1A', panel:'#1B1530', panel2:'#211938', purple:'#6C47FF', purpleLt:'#B6A6FF', gold:'#F5C842', cream:'#F1EAD8', green:'#34D399', red:'#FB7185', muted:'#AAA0B8', line:'#352A46' };
const inputStyle = { borderColor:C.line, background:'#0F0A17', color:C.cream, outlineColor:C.purple };

function Pill({children,tone='neutral'}) {
  const tones={neutral:{color:C.cream,borderColor:C.line,background:'#191225'},good:{color:C.green,borderColor:`${C.green}55`,background:`${C.green}12`},warn:{color:C.gold,borderColor:`${C.gold}55`,background:`${C.gold}12`},bad:{color:C.red,borderColor:`${C.red}55`,background:`${C.red}12`},purple:{color:C.purpleLt,borderColor:`${C.purple}66`,background:`${C.purple}16`}};
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]" style={tones[tone]}>{children}</span>;
}

function Gate({label,pass,value}) { return <div className="rounded-2xl border p-3" style={{borderColor:pass?`${C.green}44`:`${C.gold}55`,background:pass?`${C.green}08`:`${C.gold}08`}}><div className="flex items-center gap-2">{pass?<CheckCircle2 className="h-4 w-4" style={{color:C.green}}/>:<TriangleAlert className="h-4 w-4" style={{color:C.gold}}/>}<span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{color:pass?C.green:C.gold}}>{label}</span></div><div className="mt-1 break-words text-xs font-bold" style={{color:C.cream}}>{value||'UNKNOWN'}</div></div>; }

export default function SwagrMediaReadiness() {
  const [conceptId,setConceptId]=useState(SWAGR_GOVERNED_CONCEPTS[3]?.id||SWAGR_GOVERNED_CONCEPTS[0]?.id||'');
  const [providerScenario,setProviderScenario]=useState('CONTROLLED_FRESH_SIMULATION');
  const [mediaScenario,setMediaScenario]=useState('CONTROLLED_SYNTHETIC_BLANK');
  const concept=useMemo(()=>SWAGR_GOVERNED_CONCEPTS.find((item)=>item.id===conceptId)||SWAGR_GOVERNED_CONCEPTS[0],[conceptId]);
  const providerEnvelope=useMemo(()=>buildSyntheticProviderEnvelope(concept,providerScenario),[concept,providerScenario]);
  const providerResult=useMemo(()=>projectReadOnlyProviderRecord(concept,providerEnvelope),[concept,providerEnvelope]);
  const mediaEnvelope=useMemo(()=>buildSyntheticMediaEnvelope(concept,providerResult.projection,mediaScenario),[concept,providerResult.projection,mediaScenario]);
  const mediaResult=useMemo(()=>createControlledMediaPacket(concept,providerResult.projection,mediaEnvelope),[concept,providerResult.projection,mediaEnvelope]);
  const providerEligible=providerResult.evaluation.status==='READ_ONLY_PROJECTION_ELIGIBLE';
  const mediaEligible=mediaResult.evaluation.status==='MEDIA_READY_FOR_CONTROLLED_PREVIEW_ASSEMBLY';
  const packet=mediaResult.packet;
  const mediaScenarioMeta=MEDIA_READINESS_SCENARIOS.find((item)=>item.id===mediaScenario)||MEDIA_READINESS_SCENARIOS[0];

  const gates=[
    ['Provider projection',providerEligible,providerResult.evaluation.status],
    ['Product binding',Boolean(providerEligible&&mediaEnvelope.productRecordId===providerResult.projection?.providerRecordId),mediaEnvelope.productRecordId],
    ['Media rights',mediaEnvelope.usageRightsState==='AUTHORIZED_FOR_THIS_USE',mediaEnvelope.usageRightsState],
    ['License scope',Boolean(mediaEnvelope.licenseScope&&mediaEnvelope.licenseScope!=='NOT_EVALUATED'),mediaEnvelope.licenseScope],
    ['Controlled blank',Boolean(mediaEnvelope.blankRef),mediaEnvelope.blankRef],
    ['Preview geometry',Boolean(Number(mediaEnvelope.geometry?.canvasWidth)>0&&Number(mediaEnvelope.geometry?.canvasHeight)>0),`${mediaEnvelope.geometry?.canvasWidth||'?'} × ${mediaEnvelope.geometry?.canvasHeight||'?'} ${mediaEnvelope.geometry?.coordinateUnit||''}`],
  ];

  return <main className="min-h-screen" style={{background:C.bg,color:'#fff'}}>
    <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{background:'radial-gradient(58% 42% at 92% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(42% 32% at 0% 24%, rgba(245,200,66,.08), transparent 75%)'}}/>
    <header className="relative border-b" style={{borderColor:C.line,background:'rgba(18,13,26,.96)'}}><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5"><div className="flex items-start gap-3"><Link href="/swagr" aria-label="Back to SWAGR journey" className="flex h-10 w-10 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{borderColor:C.line,color:C.cream,'--tw-ring-color':C.purple}}><ArrowLeft className="h-4 w-4"/></Link><div><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Media / Geometry Gate</Pill></div><p className="mt-1 max-w-3xl text-xs leading-5" style={{color:C.muted}}>Prove that a product-bound visual asset and its coordinate space are controlled before an instant virtual assembler can use them—even for a synthetic preview.</p></div></div><div className="flex flex-wrap gap-2"><Pill tone="good">Read only</Pill><Pill tone="warn">Synthetic media only</Pill><Pill>Non-production</Pill></div></div></header>

    <div className="relative mx-auto max-w-7xl px-5 py-8">
      <section className="mb-6 rounded-3xl border p-5" style={{borderColor:`${C.gold}55`,background:'linear-gradient(135deg, rgba(245,200,66,.08), rgba(27,21,48,.94))'}}><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5" style={{color:C.gold}}/><div><div className="text-sm font-black" style={{color:C.gold}}>Synthetic preview geometry ≠ supplier imprint geometry.</div><p className="mt-1 text-xs leading-5" style={{color:C.muted}}>This gate intentionally separates SWAGR’s controlled preview coordinate system from exact supplier photography and production imprint coordinates. Passing this gate only allows controlled synthetic preview assembly.</p></div></div></section>

      <section className="grid gap-6 xl:grid-cols-[330px_1fr_380px]">
        <aside className="space-y-5">
          <section className="rounded-3xl border p-5" style={{background:C.panel,borderColor:C.line}}><div className="flex items-center gap-2"><Database className="h-4 w-4" style={{color:C.purpleLt}}/><h2 className="text-sm font-black">Source controls</h2></div><label className="mt-4 block text-xs font-bold" style={{color:C.cream}}>Governed concept<select value={conceptId} onChange={(e)=>setConceptId(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{SWAGR_GOVERNED_CONCEPTS.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="mt-4 block text-xs font-bold" style={{color:C.cream}}>Provider condition<select value={providerScenario} onChange={(e)=>setProviderScenario(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{PROVIDER_PROJECTION_SCENARIOS.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="mt-4 block text-xs font-bold" style={{color:C.cream}}>Media condition<select value={mediaScenario} onChange={(e)=>setMediaScenario(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>{MEDIA_READINESS_SCENARIOS.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div className="mt-4 rounded-2xl border p-3" style={{borderColor:C.line,background:C.panel2}}><div className="text-xs font-black" style={{color:C.cream}}>{mediaScenarioMeta.label}</div><p className="mt-1 text-[10px] leading-4" style={{color:C.muted}}>{mediaScenarioMeta.description}</p></div></section>
          <section className="rounded-3xl border p-5" style={{background:C.panel,borderColor:C.line}}><div className="flex flex-wrap gap-2"><Pill tone={providerEligible?'good':'warn'}>{providerResult.evaluation.status}</Pill><Pill>{providerResult.evaluation.score}% provider gate</Pill></div><p className="mt-3 text-xs leading-5" style={{color:C.muted}}>{providerEligible?'Exact synthetic provider identity is eligible for this controlled planning path.':'Media readiness cannot pass without an eligible provider projection.'}</p>{providerResult.evaluation.blockers.length>0&&<div className="mt-3 flex flex-wrap gap-1.5">{providerResult.evaluation.blockers.slice(0,4).map((item)=><Pill key={item} tone="warn">{item}</Pill>)}</div>}</section>
        </aside>

        <section className="space-y-5">
          <section className="rounded-3xl border p-5 sm:p-6" style={{background:C.panel,borderColor:C.line}}><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-black uppercase tracking-[0.14em]" style={{color:C.purpleLt}}>Controlled visual source</div><h1 className="mt-1 text-xl font-black">{concept.name}</h1></div><Pill tone={mediaEligible?'good':'warn'}>{mediaResult.evaluation.score}% media gate</Pill></div><div className="mt-5"><ConceptVisual concept={concept} conceptLabel={mediaEligible?'Controlled synthetic blank':'Preview asset withheld'} /></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{gates.map(([label,pass,value])=><Gate key={label} label={label} pass={pass} value={value}/>)}</div><div className="mt-4 rounded-2xl border p-4" style={{borderColor:C.line,background:C.panel2}}><div className="flex items-center gap-2"><Ruler className="h-4 w-4" style={{color:C.gold}}/><div className="text-xs font-black">Geometry authority</div></div><div className="mt-2 text-xs font-bold" style={{color:C.cream}}>{mediaEnvelope.geometry?.authority||'UNKNOWN'}</div><p className="mt-1 text-[10px] leading-4" style={{color:C.muted}}>Supplier imprint geometry: {mediaEnvelope.geometry?.supplierImprintGeometryState||'UNKNOWN'}. These preview pixels are UI composition coordinates only.</p></div></section>
          <section className="rounded-3xl border p-5" style={{borderColor:mediaEligible?`${C.green}44`:`${C.gold}44`,background:mediaEligible?`${C.green}07`:`${C.gold}07`}}><div className="flex items-start gap-3">{mediaEligible?<CheckCircle2 className="mt-0.5 h-5 w-5" style={{color:C.green}}/>:<TriangleAlert className="mt-0.5 h-5 w-5" style={{color:C.gold}}/>}<div><div className="text-sm font-black" style={{color:mediaEligible?C.green:C.gold}}>{mediaResult.evaluation.status}</div><p className="mt-1 text-xs leading-5" style={{color:C.muted}}>{mediaEligible?'The synthetic blank may move into a controlled preview assembler. Exact supplier photography and production coordinates remain absent.':'The media asset is withheld from preview assembly until every required identity, rights, freshness, and geometry gate passes.'}</p></div></div>{mediaResult.evaluation.blockers.length>0&&<div className="mt-4 flex flex-wrap gap-1.5">{mediaResult.evaluation.blockers.map((item)=><Pill key={item} tone="warn">{item}</Pill>)}</div>}</section>
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border p-5" style={{background:C.panel,borderColor:C.line}}><div className="flex items-center gap-2"><Image className="h-4 w-4" style={{color:C.purpleLt}}/><h2 className="text-sm font-black">Controlled media packet</h2></div>{packet?<div className="mt-4 space-y-3"><div className="flex flex-wrap gap-2"><Pill tone="good">{packet.state}</Pill><Pill>{packet.assetKind}</Pill></div><div className="space-y-2 text-xs leading-5"><div><span style={{color:C.muted}}>Product record:</span> <b>{packet.providerRecordId}</b></div><div><span style={{color:C.muted}}>Media record:</span> <b>{packet.mediaRecordId}</b></div><div><span style={{color:C.muted}}>Blank ref:</span> <b>{packet.blankRef}</b></div><div><span style={{color:C.muted}}>Media revision:</span> <b>{packet.mediaRevision}</b></div><div><span style={{color:C.muted}}>Rights:</span> <b>{packet.usageRightsState}</b></div></div><div className="rounded-2xl border p-3 text-[10px] leading-4" style={{borderColor:`${C.gold}44`,color:C.muted}}>{packet.nextAction}</div></div>:<p className="mt-3 text-xs leading-5" style={{color:C.muted}}>No packet is emitted until the provider projection and media envelope both pass. SWAGR will not silently reuse an unverified, stale, mismatched, or rights-unknown asset.</p>}</section>
          <section className="rounded-3xl border p-5" style={{background:C.panel2,borderColor:C.line}}><div className="text-[10px] font-black uppercase tracking-[0.12em]" style={{color:C.muted}}>Deliberately not projected</div><div className="mt-3 space-y-2 text-xs leading-5" style={{color:C.cream}}><div>• Exact supplier product photography</div><div>• Exact supplier imprint coordinates</div><div>• Production-safe curvature / seam geometry</div><div>• Decoration-method tolerances</div><div>• Price, inventory, MOQ, lead time</div><div>• Proof or production approval</div></div></section>
          <div className="flex flex-wrap gap-2"><Link href="/swagr/library/source-aware" className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{borderColor:C.line,color:C.cream}}>Source-aware discovery →</Link><Link href={`/swagr/virtual/product-readiness?concept=${encodeURIComponent(concept.id)}&scenario=${encodeURIComponent(providerScenario)}`} className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{borderColor:C.purple,color:C.purpleLt}}>Product + imprint gate →</Link></div>
        </aside>
      </section>
    </div>
  </main>;
}
