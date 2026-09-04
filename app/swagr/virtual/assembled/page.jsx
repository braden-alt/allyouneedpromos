'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Database, Image, Layers3, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import ConceptVisual from '../../concept-visual';
import { loadActiveCampaign } from '../../campaign-store';
import { SWAGR_GOVERNED_CONCEPTS } from '../../coverage/catalog';
import { SWAGR_PROMO_FACTS } from '../../promo-facts/catalog';
import { getPromoFactMixFocus, researchFocusMatchesItem, SWAGR_PROMO_MIX_FOCUS_META } from '../../promo-facts/mix-focus';
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
  const [researchFactId, setResearchFactId] = useState('');
  const [comparisonSnapshots, setComparisonSnapshots] = useState([]);
  const [preferredSnapshotId, setPreferredSnapshotId] = useState('');
  const [preferredRationale, setPreferredRationale] = useState('');
  const [reviewChecklist, setReviewChecklist] = useState({});
  const [revisionFocusSnapshotId, setRevisionFocusSnapshotId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedConceptId = params.get('concept') || '';
    const requestedConcept = SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === requestedConceptId) || null;
    const requestedResearchFactId = params.get('researchFact') || '';
    const requestedResearchFact = SWAGR_PROMO_FACTS.find((fact) => fact.id === requestedResearchFactId) || null;
    if (requestedResearchFact) setResearchFactId(requestedResearchFact.id);

    const campaign = loadActiveCampaign();
    const activeConceptId = campaign?.decisionContext?.activeConceptId || '';
    const carriedConcept = SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === activeConceptId) || null;
    if (requestedConcept) setConceptId(requestedConcept.id);
    else if (carriedConcept) setConceptId(carriedConcept.id);
    if (campaign) setJourneyContext({
      campaignTitle: campaign.title || 'Active campaign',
      brandName: campaign.brand?.brandName || '',
      activeConceptId,
      carriedConceptName: carriedConcept?.name || '',
    });
  }, []);

  const concept = useMemo(() => SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === conceptId) || SWAGR_GOVERNED_CONCEPTS[0], [conceptId]);
  const researchFact = useMemo(() => SWAGR_PROMO_FACTS.find((fact) => fact.id === researchFactId) || null, [researchFactId]);
  const researchFocus = useMemo(() => getPromoFactMixFocus(researchFact), [researchFact]);
  const researchMatchesConcept = useMemo(() => researchFocusMatchesItem(researchFocus, concept), [researchFocus, concept]);
  const template = useMemo(() => controlledTemplateForConcept(concept), [concept]);
  const providerEnvelope = useMemo(() => buildSyntheticProviderEnvelope(concept, providerScenario), [concept, providerScenario]);
  const providerResult = useMemo(() => projectReadOnlyProviderRecord(concept, providerEnvelope), [concept, providerEnvelope]);
  const previewSpec = useMemo(() => buildControlledPreviewSpec(concept, providerResult.projection, template, productSpecScenario), [concept, providerResult.projection, template, productSpecScenario]);
  const productBinding = useMemo(() => evaluateProductSpecBinding(providerResult, previewSpec), [providerResult, previewSpec]);
  const mediaEnvelope = useMemo(() => buildSyntheticMediaEnvelope(concept, providerResult.projection, mediaScenario), [concept, providerResult.projection, mediaScenario]);
  const mediaResult = useMemo(() => createControlledMediaPacket(concept, providerResult.projection, mediaEnvelope), [concept, providerResult.projection, mediaEnvelope]);
  const assembly = useMemo(() => evaluateControlledVirtualAssembly({ concept, productBinding, mediaResult, markText }), [concept, productBinding, mediaResult, markText]);
  const preferredSnapshot = useMemo(() => comparisonSnapshots.find((item) => item.id === preferredSnapshotId) || null, [comparisonSnapshots, preferredSnapshotId]);
  const reviewItems = useMemo(() => {
    if (!preferredSnapshot) return [];
    const items = [
      { id: 'brand-fit', label: 'Brand fit', detail: 'Human check that the direction feels appropriate for the active brand and intended impression.' },
      { id: 'audience-fit', label: 'Audience / use-case fit', detail: 'Human check that the direction makes sense for the intended recipient, moment, and use case.' },
      { id: 'composition', label: 'Preview legibility / composition', detail: 'Human check of the local preview mark, placement, scale, balance, and basic readability.' },
      { id: 'identity-facts', label: 'Controlled identity facts reviewed', detail: 'Confirm the displayed provider record, source revision, media record, controlled blank, and declared imprint facts were consciously reviewed.' },
    ];
    if (preferredSnapshot.researchContext) items.push({ id: 'research-context', label: 'Source-aware research context', detail: 'Human check that the carried research context is relevant background and is not being mistaken for product, supplier, or outcome truth.' });
    return items;
  }, [preferredSnapshot]);
  const reviewSummary = useMemo(() => {
    if (!preferredSnapshot || reviewItems.length === 0) return { status: 'REVIEW_NOT_COMPLETE', reviewed: 0, aligned: 0, revision: 0 };
    const states = reviewItems.map((item) => reviewChecklist[item.id]?.status || 'NOT_REVIEWED');
    const reviewed = states.filter((status) => status !== 'NOT_REVIEWED').length;
    const aligned = states.filter((status) => status === 'LOOKS_ALIGNED').length;
    const revision = states.filter((status) => status === 'NEEDS_REVISION').length;
    if (revision > 0) return { status: 'NEEDS_REVISION', reviewed, aligned, revision };
    if (aligned === reviewItems.length) return { status: 'READY_FOR_NEXT_HUMAN_DISCUSSION', reviewed, aligned, revision };
    return { status: 'REVIEW_NOT_COMPLETE', reviewed, aligned, revision };
  }, [preferredSnapshot, reviewChecklist, reviewItems]);
  const revisionFocusItems = useMemo(() => {
    if (!preferredSnapshot || revisionFocusSnapshotId !== preferredSnapshot.id) return [];
    return reviewItems
      .filter((item) => reviewChecklist[item.id]?.status === 'NEEDS_REVISION')
      .map((item) => ({ ...item, note: reviewChecklist[item.id]?.note?.trim() || '' }));
  }, [preferredSnapshot, revisionFocusSnapshotId, reviewItems, reviewChecklist]);
  const revisionDeltas = useMemo(() => {
    if (!preferredSnapshot || revisionFocusSnapshotId !== preferredSnapshot.id) return [];
    const labelFor = (items, id) => items.find((item) => item.id === id)?.label || id || 'UNKNOWN';
    const rows = [
      { id: 'concept', label: 'Governed concept', before: preferredSnapshot.conceptName, after: concept?.name || conceptId },
      { id: 'mark', label: 'Preview mark', before: preferredSnapshot.markText || 'EMPTY', after: markText.trim() || 'EMPTY' },
      { id: 'composition', label: 'UI placement / scale', before: `${preferredSnapshot.placement} · ${Math.round(preferredSnapshot.markScale * 100)}%`, after: `${placement} · ${Math.round(markScale * 100)}%` },
      { id: 'provider', label: 'Provider condition', before: labelFor(PROVIDER_PROJECTION_SCENARIOS, preferredSnapshot.providerScenario), after: labelFor(PROVIDER_PROJECTION_SCENARIOS, providerScenario) },
      { id: 'product', label: 'Product / imprint condition', before: labelFor(CONTROLLED_PRODUCT_SPEC_SCENARIOS, preferredSnapshot.productSpecScenario), after: labelFor(CONTROLLED_PRODUCT_SPEC_SCENARIOS, productSpecScenario) },
      { id: 'media', label: 'Media condition', before: labelFor(MEDIA_READINESS_SCENARIOS, preferredSnapshot.mediaScenario), after: labelFor(MEDIA_READINESS_SCENARIOS, mediaScenario) },
      { id: 'research', label: 'Research-context label', before: preferredSnapshot.researchContext?.emphasis || 'No research context', after: researchFocus?.emphasis || 'No research context' },
    ];
    return rows.filter((item) => item.before !== item.after);
  }, [preferredSnapshot, revisionFocusSnapshotId, concept, conceptId, markText, placement, markScale, providerScenario, productSpecScenario, mediaScenario, researchFocus]);

  useEffect(() => {
    if (preferredSnapshotId && !comparisonSnapshots.some((item) => item.id === preferredSnapshotId)) {
      setPreferredSnapshotId('');
      setPreferredRationale('');
      setReviewChecklist({});
      setRevisionFocusSnapshotId('');
    }
  }, [comparisonSnapshots, preferredSnapshotId]);

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

  const saveComparisonSnapshot = () => {
    if (!assemblyReady || !packet) return;
    const snapshotKey = [concept.id, markText.trim(), placement, markScale, providerScenario, productSpecScenario, mediaScenario].join('|');
    const snapshot = {
      id: `${Date.now()}-${concept.id}`,
      key: snapshotKey,
      conceptId: concept.id,
      conceptName: concept.name,
      markText: markText.trim(),
      placement,
      markScale,
      providerScenario,
      productSpecScenario,
      mediaScenario,
      providerRecordId: packet.providerRecordId,
      providerSourceRevision: packet.providerSourceRevision,
      mediaRecordId: packet.mediaRecordId,
      controlledBlankRef: packet.controlledBlankRef,
      imprintDeclaration: packet.imprintDeclaration,
      researchContext: researchFocus ? { factId: researchFact?.id || '', emphasis: researchFocus.emphasis, headline: researchFocus.headline } : null,
    };
    setComparisonSnapshots((current) => {
      const existing = current.find((item) => item.key === snapshotKey && item.id !== preferredSnapshotId);
      const savedSnapshot = existing ? { ...snapshot, id: existing.id } : snapshot;
      const withoutDuplicate = current.filter((item) => item.id !== savedSnapshot.id);
      const next = [...withoutDuplicate, savedSnapshot];
      if (next.length <= 3) return next;
      const removableIndex = next.findIndex((item) => item.id !== preferredSnapshotId && item.id !== savedSnapshot.id);
      if (removableIndex >= 0) next.splice(removableIndex, 1);
      return next.slice(-3);
    });
  };

  const restoreComparisonSnapshot = (snapshot) => {
    setConceptId(snapshot.conceptId);
    setProviderScenario(snapshot.providerScenario);
    setProductSpecScenario(snapshot.productSpecScenario);
    setMediaScenario(snapshot.mediaScenario);
    setMarkText(snapshot.markText);
    setPlacement(snapshot.placement);
    setMarkScale(snapshot.markScale);
  };

  const markPreferredSnapshot = (snapshotId) => {
    setPreferredSnapshotId(snapshotId);
    setPreferredRationale('');
    setReviewChecklist({});
    setRevisionFocusSnapshotId('');
  };

  const clearPreferredSnapshot = () => {
    setPreferredSnapshotId('');
    setPreferredRationale('');
    setReviewChecklist({});
    setRevisionFocusSnapshotId('');
  };

  const updateReviewItem = (itemId, patch) => {
    setReviewChecklist((current) => ({
      ...current,
      [itemId]: { status: 'NOT_REVIEWED', note: '', ...(current[itemId] || {}), ...patch },
    }));
  };

  const beginRevisionFocus = () => {
    if (!preferredSnapshot || reviewSummary.revision === 0) return;
    restoreComparisonSnapshot(preferredSnapshot);
    setRevisionFocusSnapshotId(preferredSnapshot.id);
  };

  const clearRevisionFocus = () => setRevisionFocusSnapshotId('');

  const removeComparisonSnapshot = (snapshotId) => {
    setComparisonSnapshots((current) => current.filter((item) => item.id !== snapshotId));
    if (snapshotId === preferredSnapshotId) clearPreferredSnapshot();
  };

  const clearComparisonTray = () => {
    setComparisonSnapshots([]);
    clearPreferredSnapshot();
  };

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
      {researchFact && researchFocus && <section data-testid="swagr-virtual-research-context" className="mb-6 rounded-3xl border p-5" style={{ borderColor: `${C.gold}66`, background: 'linear-gradient(135deg, rgba(245,200,66,.09), rgba(27,21,48,.96))' }} aria-label="Source-labeled research context">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2"><Pill tone="warn">Research context carried in</Pill><Pill tone="purple">Source-labeled · read only</Pill></div>
            <h2 className="mt-3 text-lg font-black" style={{ color: C.cream }}>Why this direction surfaced</h2>
            <p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>{researchFocus.rationale}</p>
            <div className="mt-3 rounded-2xl border p-3" style={{ borderColor: C.line, background: C.panel2 }}><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black" style={{ color: C.gold }}>{researchFocus.signal}</span><Pill tone="warn">{researchFocus.emphasis}</Pill></div><p className="mt-2 text-xs leading-5" style={{ color: C.cream }}>{researchFocus.headline}</p><p className="mt-2 text-[10px]" style={{ color: C.muted }}>{researchFocus.source.publisher} · {researchFocus.source.published}</p></div>
            <p className="mt-3 text-[10px] leading-5" style={{ color: researchMatchesConcept ? C.green : C.muted }}>{researchMatchesConcept ? 'This governed synthetic concept intersects the reviewed research lens that guided discovery. The research explains relevance only; it does not change any controlled assembly gate.' : researchFocus.categories.length ? 'The currently selected controlled concept does not intersect the original research category lens. The research remains visible as context only and does not influence assembly.' : 'This reviewed signal is category-neutral context. It is carried forward for explanation only and does not influence assembly.'}</p>
            <p className="mt-2 text-[9px] leading-4" style={{ color: C.muted }}>{SWAGR_PROMO_MIX_FOCUS_META.truthBoundary}</p>
          </div>
          <div className="flex flex-wrap gap-2"><a href={researchFocus.source.url} target="_blank" rel="noreferrer" className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{ borderColor: `${C.gold}66`, color: C.gold }}>Reviewed source</a><Link href={`/swagr/library?researchFact=${encodeURIComponent(researchFact.id)}`} className="inline-flex rounded-xl border px-3.5 py-2.5 text-xs font-black" style={{ borderColor: C.line, color: C.cream }}>Back to research-guided discovery</Link></div>
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
            <div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" onClick={saveComparisonSnapshot} disabled={!assemblyReady} className="rounded-xl border px-4 py-2.5 text-xs font-black disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus:ring-2" style={{ borderColor: assemblyReady ? C.green : C.line, color: assemblyReady ? C.green : C.muted, '--tw-ring-color': C.green }}>{assemblyReady ? `Save to compare · ${comparisonSnapshots.length}/3` : 'Compare unlocks when assembly is ready'}</button>{comparisonSnapshots.length > 0 && <span className="text-[10px]" style={{ color: C.muted }}>Saved previews live only on this page and clear on refresh.</span>}</div>
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
      {revisionFocusItems.length > 0 && preferredSnapshot && <section data-testid="swagr-revision-focus-loop" className="mt-6 rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.red}66`, background: 'linear-gradient(135deg, rgba(251,113,133,.09), rgba(27,21,48,.98))' }} aria-label="Preferred direction revision focus">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="bad">Revision focus</Pill><Pill>Page-session only</Pill><Pill tone="purple">Original preferred preserved</Pill></div><h2 className="mt-3 text-xl font-black">Revise the flagged human-review lenses intentionally.</h2><p className="mt-1 max-w-4xl text-xs leading-5" style={{ color: C.muted }}>SWAGR restored the preferred snapshot into the local controls above. Change only what you intend to change, then use the existing assembly-ready gate before saving a revised controlled candidate. Nothing here edits the original preferred snapshot, campaign decision, supplier facts, proof state, commerce state, or production authority.</p></div><button type="button" onClick={clearRevisionFocus} className="rounded-xl border px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.red }}>Close revision focus</button></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">{revisionFocusItems.map((item) => <article key={item.id} className="rounded-2xl border p-4" style={{ borderColor: `${C.red}44`, background: `${C.red}06` }}><div className="flex flex-wrap items-start justify-between gap-2"><div><div className="text-xs font-black" style={{ color: C.cream }}>{item.label}</div><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>{item.detail}</p></div><Pill tone="bad">Needs revision</Pill></div>{item.note && <div className="mt-3 rounded-xl border p-3 text-[10px] leading-4" style={{ borderColor: C.line, color: C.cream }}><span className="font-black" style={{ color: C.muted }}>Reviewer note: </span>{item.note}</div>}</article>)}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-[10px] leading-4"><div className="rounded-xl border p-3" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Working concept</span><div className="mt-1 font-black" style={{ color: C.cream }}>{concept.name}</div></div><div className="rounded-xl border p-3" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Working mark</span><div className="mt-1 break-words font-black" style={{ color: C.cream }}>{markText || 'EMPTY'}</div></div><div className="rounded-xl border p-3" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Working composition</span><div className="mt-1 font-black" style={{ color: C.cream }}>{placement} Â· {Math.round(markScale * 100)}%</div></div><div className="rounded-xl border p-3" style={{ borderColor: assemblyReady ? `${C.green}55` : `${C.gold}55` }}><span style={{ color: C.muted }}>Current candidate gate</span><div className="mt-1 font-black" style={{ color: assemblyReady ? C.green : C.gold }}>{assembly.status}</div></div></div>
        <section data-testid="swagr-revision-delta-review" className="mt-4 rounded-3xl border p-4" style={{ borderColor: assemblyReady ? `${C.green}55` : `${C.gold}55`, background: assemblyReady ? `${C.green}06` : `${C.gold}06` }} aria-label="Revision delta review">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="purple">Delta only</Pill><Pill>Page-session only</Pill><Pill tone={assemblyReady ? 'good' : 'warn'}>{assemblyReady ? 'Revised candidate ready' : 'Assembly gate not ready'}</Pill></div><h3 className="mt-2 text-sm font-black">Revision delta review</h3><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>SWAGR shows only what changed from the preserved preferred snapshot. A delta is not a claim that the revision is better, approved, or production-ready.</p></div><div className="rounded-2xl border px-3 py-2 text-right" style={{ borderColor: C.line }}><div className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Local deltas</div><div className="mt-1 text-sm font-black" style={{ color: C.cream }}>{revisionDeltas.length}</div></div></div>
          {revisionDeltas.length > 0 ? <div className="mt-4 grid gap-3 md:grid-cols-2">{revisionDeltas.map((delta) => <article key={delta.id} className="rounded-2xl border p-3" style={{ borderColor: C.line, background: C.panel2 }}><div className="text-[10px] font-black" style={{ color: C.cream }}>{delta.label}</div><div className="mt-2 grid gap-2 text-[9px] leading-4"><div><span style={{ color: C.muted }}>Preferred:</span><div className="mt-0.5 break-words font-black" style={{ color: C.cream }}>{delta.before}</div></div><div><span style={{ color: C.muted }}>Working revision:</span><div className="mt-0.5 break-words font-black" style={{ color: C.purpleLt }}>{delta.after}</div></div></div></article>)}</div> : <div className="mt-4 rounded-2xl border p-3 text-[10px] leading-4" style={{ borderColor: C.line, color: C.muted }}>No local deltas yet. The working copy currently matches the preserved preferred snapshot across the governed comparison fields.</div>}
          <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={saveComparisonSnapshot} disabled={!assemblyReady} className="rounded-xl border px-4 py-2.5 text-[10px] font-black disabled:cursor-not-allowed disabled:opacity-45 focus:outline-none focus:ring-2" style={{ borderColor: assemblyReady ? C.green : C.line, color: assemblyReady ? C.green : C.muted, '--tw-ring-color': C.green }}>{assemblyReady ? 'Save revised candidate to compare' : 'Revised candidate must pass assembly gate'}</button><span className="text-[9px] leading-4" style={{ color: C.muted }}>Saving creates another controlled local comparison snapshot. It does not replace the preferred direction or alter the human-review checklist.</span></div>
        </section>
        <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => restoreComparisonSnapshot(preferredSnapshot)} className="rounded-xl border px-4 py-2.5 text-[10px] font-black focus:outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purpleLt }}>Reset working copy to preferred</button><span className="text-[9px] leading-4" style={{ color: C.muted }}>Saving a revised candidate uses the normal Save to compare control above. The preferred original is protected from automatic tray eviction while revision work is active.</span></div>
      </section>}
      {comparisonSnapshots.length > 0 && <section data-testid="swagr-virtual-compare-tray" className="mt-6 rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.purple}55`, background: 'linear-gradient(135deg, rgba(108,71,255,.09), rgba(27,21,48,.98))' }} aria-label="Controlled virtual compare tray">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="purple">Controlled compare tray</Pill><Pill>Page-session only</Pill><Pill tone="good">{comparisonSnapshots.length}/3 saved</Pill></div><h2 className="mt-3 text-xl font-black">Compare the directions you actually assembled.</h2><p className="mt-1 max-w-4xl text-xs leading-5" style={{ color: C.muted }}>Only previews that reached CONTROLLED_VIRTUAL_ASSEMBLY_READY can enter this tray. A saved card is a reversible local comparison snapshot—not a campaign decision, product approval, artwork/proof approval, quote, order, or production instruction.</p></div><button type="button" onClick={clearComparisonTray} className="rounded-xl border px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Clear tray</button></div>
        {preferredSnapshot && <div data-testid="swagr-preferred-review-state" className="mt-5 rounded-3xl border p-4" style={{ borderColor: `${C.green}66`, background: `${C.green}08` }}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="good">Preferred for review</Pill><Pill>Page-session only</Pill></div><h3 className="mt-2 text-base font-black">{preferredSnapshot.conceptName}</h3><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>This is a reversible review preference only. It does not change the active campaign decision or approve a product, artwork, proof, quote, order, payment, or production action.</p></div><button type="button" onClick={clearPreferredSnapshot} className="rounded-xl border px-3 py-2 text-[10px] font-black focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.green }}>Clear preference</button></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5 text-[10px] leading-4"><div className="rounded-xl border p-2" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Preview mark</span><div className="mt-1 break-words font-black" style={{ color: C.cream }}>{preferredSnapshot.markText}</div></div><div className="rounded-xl border p-2" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>UI composition</span><div className="mt-1 font-black" style={{ color: C.cream }}>{preferredSnapshot.placement} · {Math.round(preferredSnapshot.markScale * 100)}%</div></div><div className="rounded-xl border p-2" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Provider / revision</span><div className="mt-1 break-words font-black" style={{ color: C.cream }}>{preferredSnapshot.providerRecordId} · {preferredSnapshot.providerSourceRevision}</div></div><div className="rounded-xl border p-2" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Media / blank</span><div className="mt-1 break-words font-black" style={{ color: C.cream }}>{preferredSnapshot.mediaRecordId} · {preferredSnapshot.controlledBlankRef}</div></div><div className="rounded-xl border p-2" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Declared imprint</span><div className="mt-1 break-words font-black" style={{ color: C.cream }}>{preferredSnapshot.imprintDeclaration.placement} · {preferredSnapshot.imprintDeclaration.width} × {preferredSnapshot.imprintDeclaration.height} {preferredSnapshot.imprintDeclaration.unit}</div></div></div>
          <label className="mt-3 block text-[10px] font-black" style={{ color: C.cream }}>Optional review rationale<textarea value={preferredRationale} maxLength={180} onChange={(event) => setPreferredRationale(event.target.value)} rows={2} className="mt-2 w-full resize-none rounded-xl border px-3 py-2.5 text-xs font-medium" style={inputStyle} placeholder="Why is this direction preferred for the next human review?" /></label>
          <section data-testid="swagr-preferred-human-review-checklist" className="mt-4 rounded-3xl border p-4" style={{ borderColor: reviewSummary.status === 'READY_FOR_NEXT_HUMAN_DISCUSSION' ? `${C.green}66` : reviewSummary.status === 'NEEDS_REVISION' ? `${C.red}66` : `${C.gold}55`, background: C.panel }} aria-label="Preferred direction human review checklist">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="purple">Human review checklist</Pill><Pill>Page-session only</Pill><Pill tone={reviewSummary.status === 'READY_FOR_NEXT_HUMAN_DISCUSSION' ? 'good' : reviewSummary.status === 'NEEDS_REVISION' ? 'bad' : 'warn'}>{reviewSummary.status}</Pill></div><h4 className="mt-2 text-sm font-black">Review the preferred direction without turning review into approval.</h4><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>Each lens records only a local human review signal. The checklist never changes campaign state, supplier/product/media facts, proof status, quote/order/payment state, or production authority.</p></div><div className="rounded-2xl border px-3 py-2 text-right" style={{ borderColor: C.line }}><div className="text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: C.muted }}>Reviewed</div><div className="mt-1 text-sm font-black" style={{ color: C.cream }}>{reviewSummary.reviewed}/{reviewItems.length}</div></div></div>
            <div className="mt-4 space-y-3">{reviewItems.map((item) => { const review = reviewChecklist[item.id] || { status: 'NOT_REVIEWED', note: '' }; return <div key={item.id} className="rounded-2xl border p-3" style={{ borderColor: review.status === 'LOOKS_ALIGNED' ? `${C.green}44` : review.status === 'NEEDS_REVISION' ? `${C.red}44` : C.line, background: review.status === 'LOOKS_ALIGNED' ? `${C.green}06` : review.status === 'NEEDS_REVISION' ? `${C.red}06` : C.panel2 }}>
              <div className="flex flex-wrap items-start justify-between gap-3"><div className="max-w-2xl"><div className="text-xs font-black" style={{ color: C.cream }}>{item.label}</div><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>{item.detail}</p></div><Pill tone={review.status === 'LOOKS_ALIGNED' ? 'good' : review.status === 'NEEDS_REVISION' ? 'bad' : 'warn'}>{review.status}</Pill></div>
              <div className="mt-3 flex flex-wrap gap-2">{['NOT_REVIEWED', 'LOOKS_ALIGNED', 'NEEDS_REVISION'].map((status) => <button key={status} type="button" aria-pressed={review.status === status} onClick={() => updateReviewItem(item.id, { status })} className="rounded-xl border px-3 py-2 text-[9px] font-black focus:outline-none focus:ring-2" style={{ borderColor: review.status === status ? (status === 'LOOKS_ALIGNED' ? C.green : status === 'NEEDS_REVISION' ? C.red : C.gold) : C.line, color: review.status === status ? (status === 'LOOKS_ALIGNED' ? C.green : status === 'NEEDS_REVISION' ? C.red : C.gold) : C.muted, '--tw-ring-color': C.purple }}>{status.replaceAll('_', ' ')}</button>)}</div>
              <label className="mt-3 block text-[9px] font-black" style={{ color: C.muted }}>Optional local note<textarea value={review.note} maxLength={160} onChange={(event) => updateReviewItem(item.id, { note: event.target.value })} rows={2} className="mt-2 w-full resize-none rounded-xl border px-3 py-2 text-[10px] font-medium" style={inputStyle} placeholder="What did the reviewer notice?" /></label>
            </div>; })}</div>
            <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: reviewSummary.status === 'NEEDS_REVISION' ? `${C.red}55` : reviewSummary.status === 'READY_FOR_NEXT_HUMAN_DISCUSSION' ? `${C.green}55` : `${C.gold}55`, background: reviewSummary.status === 'NEEDS_REVISION' ? `${C.red}07` : reviewSummary.status === 'READY_FOR_NEXT_HUMAN_DISCUSSION' ? `${C.green}07` : `${C.gold}07` }}><div className="text-[10px] font-black" style={{ color: reviewSummary.status === 'NEEDS_REVISION' ? C.red : reviewSummary.status === 'READY_FOR_NEXT_HUMAN_DISCUSSION' ? C.green : C.gold }}>{reviewSummary.status}</div><p className="mt-1 text-[9px] leading-4" style={{ color: C.muted }}>{reviewSummary.status === 'NEEDS_REVISION' ? `${reviewSummary.revision} review lens${reviewSummary.revision === 1 ? '' : 'es'} need revision before the direction is useful for the next human discussion.` : reviewSummary.status === 'READY_FOR_NEXT_HUMAN_DISCUSSION' ? 'All applicable review lenses were marked LOOKS ALIGNED. This means only that the direction is ready for the next human discussion; it is not an approval.' : 'Complete the applicable human review lenses or flag a needed revision. Unreviewed items keep this state intentionally incomplete.'}</p></div>
          {reviewSummary.status === 'NEEDS_REVISION' && <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={beginRevisionFocus} className="rounded-xl border px-4 py-2.5 text-[10px] font-black focus:outline-none focus:ring-2" style={{ borderColor: C.red, color: C.red, '--tw-ring-color': C.red }}>Work revisions locally</button><span className="text-[9px] leading-4" style={{ color: C.muted }}>Restores the preferred snapshot into the local controls and opens only the lenses you flagged. The original preferred snapshot and review record stay preserved.</span></div>}
          </section>
        </div>}
        <div className="mt-5 grid gap-4 lg:grid-cols-3">{comparisonSnapshots.map((snapshot, index) => { const snapshotConcept = SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === snapshot.conceptId) || concept; const isPreferred = snapshot.id === preferredSnapshotId; return <article key={snapshot.id} className="rounded-3xl border p-4" style={{ borderColor: isPreferred ? `${C.green}77` : C.line, background: isPreferred ? `${C.green}08` : C.panel }}>
          <div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: isPreferred ? C.green : C.purpleLt }}>Direction {index + 1}</div><h3 className="mt-1 text-sm font-black">{snapshot.conceptName}</h3></div><div className="flex flex-wrap justify-end gap-1.5">{isPreferred && <Pill tone="good">Preferred for review</Pill>}<Pill tone="good">Ready snapshot</Pill></div></div>
          <div className="mt-3"><ConceptVisual concept={snapshotConcept} brandName={snapshot.markText || 'SWAGR'} placement={snapshot.placement} markScale={snapshot.markScale} conceptLabel="Saved controlled synthetic preview" /></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] leading-4"><div className="rounded-xl border p-2" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>Preview mark</span><div className="mt-1 break-words font-black" style={{ color: C.cream }}>{snapshot.markText}</div></div><div className="rounded-xl border p-2" style={{ borderColor: C.line }}><span style={{ color: C.muted }}>UI composition</span><div className="mt-1 font-black" style={{ color: C.cream }}>{snapshot.placement} · {Math.round(snapshot.markScale * 100)}%</div></div></div>
          <div className="mt-3 space-y-1.5 text-[10px] leading-4" style={{ color: C.muted }}><div>Provider: <b style={{ color: C.cream }}>{snapshot.providerRecordId}</b></div><div>Source revision: <b style={{ color: C.cream }}>{snapshot.providerSourceRevision}</b></div><div>Media: <b style={{ color: C.cream }}>{snapshot.mediaRecordId}</b></div><div>Controlled blank: <b style={{ color: C.cream }}>{snapshot.controlledBlankRef}</b></div><div>Declared imprint: <b style={{ color: C.cream }}>{snapshot.imprintDeclaration.placement} · {snapshot.imprintDeclaration.width} × {snapshot.imprintDeclaration.height} {snapshot.imprintDeclaration.unit}</b></div></div>
          {snapshot.researchContext && <div className="mt-3 rounded-2xl border p-3" style={{ borderColor: `${C.gold}44`, background: `${C.gold}07` }}><div className="flex flex-wrap items-center gap-2"><Pill tone="warn">Research context</Pill><span className="text-[10px] font-black" style={{ color: C.gold }}>{snapshot.researchContext.emphasis}</span></div><p className="mt-2 text-[10px] leading-4" style={{ color: C.muted }}>{snapshot.researchContext.headline}</p></div>}
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => restoreComparisonSnapshot(snapshot)} className="rounded-xl border px-3 py-2 text-[10px] font-black focus:outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purpleLt }}>Restore locally</button><button type="button" onClick={() => isPreferred ? clearPreferredSnapshot() : markPreferredSnapshot(snapshot.id)} className="rounded-xl border px-3 py-2 text-[10px] font-black focus:outline-none focus:ring-2" style={{ borderColor: isPreferred ? C.green : `${C.green}66`, color: C.green, '--tw-ring-color': C.green }}>{isPreferred ? 'Clear preferred' : 'Preferred for review'}</button><button type="button" onClick={() => removeComparisonSnapshot(snapshot.id)} className="rounded-xl border px-3 py-2 text-[10px] font-black focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.muted, '--tw-ring-color': C.purple }}>Remove</button></div>
        </article>; })}</div>
        <p className="mt-4 text-[9px] leading-4" style={{ color: C.muted }}>Comparison snapshots, review preference, rationale, and human review checklist exist only in React page state. Refreshing or leaving this page clears them. Restoring a snapshot only restores local preview controls; marking one preferred or reviewing its lenses records reversible human-review context and does not overwrite the active campaign decision or any upstream governed packet.</p>
      </section>}
    </div>
  </main>;
}
