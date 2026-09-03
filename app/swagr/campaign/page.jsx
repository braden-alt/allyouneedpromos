'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  History,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';
import { getRequirementGaps } from '../../swagr-lab/engine';
import { loadBrandProfile } from '../brand-profile';
import {
  activateCampaign,
  loadActiveBrief,
  loadActiveCampaignId,
  loadCampaigns,
  makeCampaignId,
  makeVersionSnapshot,
  normalizeCampaign,
  saveCampaigns,
} from '../campaign-store';

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

const EMPTY_BRIEF = {
  audience: '',
  useCase: '',
  quantity: 'QTY_UNSTATED',
  budget: 'UNSTATED',
  inHandsDate: '',
  location: '',
  style: '',
  exclusions: '',
};

const EMPTY_BRAND = {
  brandName: 'Sample Brand',
  tagline: '',
  primaryColor: '#6C47FF',
  secondaryColor: '#F5C842',
  visualDirection: 'Clean + modern',
  audienceNote: '',
};

function newDraft(brief = EMPTY_BRIEF, brand = EMPTY_BRAND) {
  return normalizeCampaign({
    id: '',
    title: brief.useCase ? `${brief.useCase} campaign` : 'New SWAGR campaign',
    objective: '',
    notes: '',
    status: 'ACTIVE',
    version: 1,
    brief,
    brand,
    versions: [],
  });
}

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return (
    <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={styles[tone]}>
      {children}
    </span>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', note }) {
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
      {note && <span className="mt-1 block text-[10px] leading-4" style={{ color: C.muted }}>{note}</span>}
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, note }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold" style={{ color: C.cream }}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2"
        style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }}
      />
      {note && <span className="mt-1 block text-[10px] leading-4" style={{ color: C.muted }}>{note}</span>}
    </label>
  );
}

function BriefChip({ label, value, tone = 'neutral' }) {
  if (!value) return null;
  return <Pill tone={tone}>{label}: {value}</Pill>;
}

export default function SwagrCampaignWorkspace() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [draft, setDraft] = useState(() => newDraft());
  const [message, setMessage] = useState('Campaigns stay in this browser session only. Nothing is sent or published.');

  useEffect(() => {
    const stored = loadCampaigns();
    const storedActiveId = loadActiveCampaignId();
    const activeBrief = loadActiveBrief() || EMPTY_BRIEF;
    const brandProfile = loadBrandProfile() || EMPTY_BRAND;
    const activeCampaign = stored.find((item) => item.id === storedActiveId);

    setCampaigns(stored);
    setActiveId(storedActiveId);
    setDraft(activeCampaign || newDraft(activeBrief, brandProfile));
  }, []);

  const gaps = useMemo(() => getRequirementGaps(draft.brief || EMPTY_BRIEF), [draft.brief]);
  const savedCampaign = draft.id ? campaigns.find((item) => item.id === draft.id) : null;
  const versionCount = savedCampaign ? 1 + savedCampaign.versions.length : 0;
  const decisionContext = draft.decisionContext || {};
  const pinnedCount = decisionContext.pinnedConceptIds?.length || 0;
  const proposalContext = decisionContext.proposalReview || null;

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const updateBrief = (key, value) => setDraft((current) => ({
    ...current,
    brief: { ...current.brief, [key]: value },
  }));

  const persistDraft = ({ makeActive = false } = {}) => {
    const now = new Date().toISOString();
    const existing = draft.id ? campaigns.find((item) => item.id === draft.id) : null;
    let candidate;

    if (existing) {
      candidate = normalizeCampaign({
        ...draft,
        version: existing.version + 1,
        createdAt: existing.createdAt,
        updatedAt: now,
        versions: [makeVersionSnapshot(existing), ...existing.versions].slice(0, 8),
      });
    } else {
      candidate = normalizeCampaign({
        ...draft,
        id: makeCampaignId(),
        version: 1,
        createdAt: now,
        updatedAt: now,
        versions: [],
      });
    }

    const next = [candidate, ...campaigns.filter((item) => item.id !== candidate.id)].slice(0, 8);
    const saved = saveCampaigns(next);
    setCampaigns(saved);
    setDraft(candidate);

    if (makeActive) {
      activateCampaign(candidate);
      setActiveId(candidate.id);
      setMessage(`Campaign v${candidate.version} is active. Its planning brief will focus the next SWAGR workspace.`);
    } else {
      setMessage(`Campaign v${candidate.version} saved locally with the prior version preserved.`);
    }

    return candidate;
  };

  const continueTo = (route) => {
    persistDraft({ makeActive: true });
    router.push(route);
  };

  const startNew = () => {
    const currentBrief = loadActiveBrief() || EMPTY_BRIEF;
    const brandProfile = loadBrandProfile() || EMPTY_BRAND;
    setDraft(newDraft(currentBrief, brandProfile));
    setMessage('New campaign draft started from the current local brief and Brand Kit. Nothing was overwritten.');
  };

  const refreshInputs = () => {
    const currentBrief = loadActiveBrief();
    const brandProfile = loadBrandProfile();
    setDraft((current) => ({
      ...current,
      brief: currentBrief || current.brief,
      brand: brandProfile || current.brand,
    }));
    setMessage('Current local brief and Brand Kit were re-read. Save a version when the campaign looks right.');
  };

  const openCampaign = (campaign) => {
    setDraft(campaign);
    setMessage(`Opened ${campaign.title} v${campaign.version}. Editing it will create a new preserved version.`);
  };

  const restoreVersion = (snapshot) => {
    setDraft((current) => ({
      ...current,
      title: snapshot.title,
      objective: snapshot.objective,
      notes: snapshot.notes,
      brief: snapshot.brief,
      brand: snapshot.brand,
    }));
    setMessage(`Version ${snapshot.version} was loaded into the editor as a reversible draft. Save to create a new version; the history remains intact.`);
  };

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(58% 42% at 92% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(42% 30% at 0% 20%, rgba(245,200,66,.08), transparent 76%)' }} />

      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.96)' }}>
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/swagr" aria-label="Back to SWAGR" className="flex h-10 w-10 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link>
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Campaign Workspace</Pill></div>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>Save the brief, brand direction, decisions, and next creative move as one resumable local campaign.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2"><Pill tone="warn">Session local</Pill>{activeId && <Pill tone="good">Active campaign set</Pill>}</div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.purple}66`, background: 'linear-gradient(135deg, rgba(108,71,255,.16), rgba(27,21,48,.94))' }}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2"><Target className="h-5 w-5" style={{ color: C.gold }} /><span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.gold }}>Reusable campaign context</span></div>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Pick up where the idea left off.</h1>
              <p className="mt-3 text-sm leading-6" style={{ color: C.muted }}>A campaign holds the planning brief and Brand Kit snapshot that already exist in SWAGR, plus your objective and notes. Saving never sends, orders, quotes, publishes, or turns concept artwork into production artwork.</p>
            </div>
            <button type="button" onClick={startNew} className="rounded-xl border px-4 py-3 text-xs font-black focus:outline-none focus:ring-2" style={{ borderColor: C.gold, color: C.gold, background: `${C.gold}08`, '--tw-ring-color': C.gold }}>New campaign</button>
          </div>
          <div className="mt-5 rounded-2xl border p-3 text-xs leading-5" style={{ borderColor: C.line, background: '#0F0A17', color: C.cream }}><Sparkles className="mr-2 inline h-4 w-4" style={{ color: C.purpleLt }} />{message}</div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="h-fit space-y-5 xl:sticky xl:top-5">
            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: C.purpleLt }}>Saved campaigns</div><h2 className="mt-1 text-lg font-black">{campaigns.length} in this session</h2></div><Pill tone="neutral">max 8</Pill></div>
              <div className="mt-4 space-y-2">
                {campaigns.length === 0 && <p className="rounded-xl border p-3 text-xs leading-5" style={{ borderColor: C.line, color: C.muted, background: '#0F0A17' }}>No saved campaign yet. The editor is seeded from the current local brief and Brand Kit when available.</p>}
                {campaigns.map((campaign) => (
                  <button key={campaign.id} type="button" onClick={() => openCampaign(campaign)} className="w-full rounded-xl border p-3 text-left focus:outline-none focus:ring-2" style={{ borderColor: draft.id === campaign.id ? C.purple : C.line, background: draft.id === campaign.id ? `${C.purple}12` : '#0F0A17', '--tw-ring-color': C.purple }}>
                    <div className="flex items-start justify-between gap-2"><span className="text-xs font-black text-white">{campaign.title}</span>{activeId === campaign.id && <Check className="h-4 w-4 shrink-0" style={{ color: C.green }} />}</div>
                    <div className="mt-1 text-[10px]" style={{ color: C.muted }}>v{campaign.version} · {campaign.brief?.useCase || 'moment open'} · {campaign.brand?.brandName || 'brand open'}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" style={{ color: C.green }} /><h2 className="text-sm font-black">Truth boundary</h2></div>
              <ul className="mt-3 space-y-2 text-[11px] leading-5" style={{ color: C.muted }}>
                <li>• Browser-session persistence only.</li>
                <li>• No live SKU, price, inventory, MOQ, lead-time, supplier, or production claim.</li>
                <li>• Brand snapshot excludes the local logo file; the Brand Kit remains its source.</li>
                <li>• Continuing to another workspace activates planning context only.</li>
              </ul>
            </section>
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.gold }}>Campaign identity</div><h2 className="mt-1 text-2xl font-black">{draft.id ? `Editing v${draft.version}` : 'New local campaign'}</h2></div>
                <button type="button" onClick={refreshInputs} className="rounded-xl border px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><RefreshCcw className="mr-1 inline h-3.5 w-3.5" /> Refresh brief + brand</button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Campaign name" value={draft.title} onChange={(value) => updateDraft('title', value)} placeholder="Fall recruiting push" />
                <Field label="Brand" value={draft.brand?.brandName || ''} onChange={(value) => setDraft((current) => ({ ...current, brand: { ...current.brand, brandName: value } }))} placeholder="Sample Brand" note="A campaign snapshot only; edit the reusable source in Brand Kit." />
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <TextArea label="Campaign objective" value={draft.objective} onChange={(value) => updateDraft('objective', value)} placeholder="What should this merch accomplish?" />
                <TextArea label="Working notes" value={draft.notes} onChange={(value) => updateDraft('notes', value)} placeholder="Preferences, context, decisions to remember…" note="Local planning notes only. Do not place confidential live customer data here." />
              </div>
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: gaps.length ? `${C.gold}55` : `${C.green}55` }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.purpleLt }}>Planning brief snapshot</div><h2 className="mt-1 text-xl font-black">{gaps.length ? `${gaps.length} required planning detail${gaps.length === 1 ? '' : 's'} open` : 'Brief is ready for controlled discovery'}</h2></div>
                <Pill tone={gaps.length ? 'warn' : 'good'}>{gaps.length ? 'Needs detail' : 'Planning ready'}</Pill>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Who is it for?" value={draft.brief?.audience || ''} onChange={(value) => updateBrief('audience', value)} placeholder="Employees, attendees, clients…" />
                <Field label="What is happening?" value={draft.brief?.useCase || ''} onChange={(value) => updateBrief('useCase', value)} placeholder="Recruiting event, onboarding, gifting…" />
                <Field label="Quantity planning band" value={draft.brief?.quantity || ''} onChange={(value) => updateBrief('quantity', value)} placeholder="QTY_MID" note="Planning signal only; never an MOQ claim." />
                <Field label="Budget planning band" value={draft.brief?.budget || ''} onChange={(value) => updateBrief('budget', value)} placeholder="BAND_STANDARD" note="Planning signal only; never a price claim." />
                <Field label="Needed by" type="date" value={draft.brief?.inHandsDate || ''} onChange={(value) => updateBrief('inHandsDate', value)} note="Planning input only; not a delivery promise." />
                <Field label="Delivery area" value={draft.brief?.location || ''} onChange={(value) => updateBrief('location', value)} placeholder="City / region" />
                <Field label="Style / feel" value={draft.brief?.style || ''} onChange={(value) => updateBrief('style', value)} placeholder="Premium, practical, modern…" />
                <Field label="Avoid" value={draft.brief?.exclusions || ''} onChange={(value) => updateBrief('exclusions', value)} placeholder="No drinkware, no apparel…" />
              </div>

              {gaps.length > 0 && <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: `${C.gold}55`, background: `${C.gold}08` }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.gold }}>Still open</div><ul className="mt-2 space-y-1 text-[11px]" style={{ color: C.muted }}>{gaps.map((gap) => <li key={gap}>• {gap}</li>)}</ul></div>}
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.gold }}>Brand direction snapshot</div><h2 className="mt-1 text-xl font-black">{draft.brand?.brandName || 'Sample Brand'}</h2></div><Link href="/swagr/brand" className="text-xs font-bold underline underline-offset-4 focus:outline-none focus:ring-2" style={{ color: C.purpleLt, '--tw-ring-color': C.purple }}>Edit reusable Brand Kit →</Link></div>
              <div className="mt-4 flex flex-wrap gap-2">
                <BriefChip label="Direction" value={draft.brand?.visualDirection} tone="purple" />
                <BriefChip label="Primary" value={draft.brand?.primaryColor} />
                <BriefChip label="Accent" value={draft.brand?.secondaryColor} />
                <BriefChip label="Tagline" value={draft.brand?.tagline} />
              </div>
              <p className="mt-3 text-[11px] leading-5" style={{ color: C.muted }}>Campaigns keep a lightweight text/color snapshot so old versions remain understandable. Logo image data is intentionally not duplicated into campaign records.</p>
            </section>

            <section data-testid="campaign-decision-context" className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: pinnedCount || decisionContext.activeConceptId || proposalContext ? `${C.purple}66` : C.line }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.purpleLt }}>Campaign decision context</div>
                  <h2 className="mt-1 text-xl font-black">Discovery and review can resume with this campaign.</h2>
                </div>
                <Pill tone={pinnedCount || decisionContext.activeConceptId || proposalContext ? 'good' : 'neutral'}>{pinnedCount || decisionContext.activeConceptId || proposalContext ? 'Context saved' : 'No decisions yet'}</Pill>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Pinned directions</div>
                  <div className="mt-2 text-2xl font-black">{pinnedCount}</div>
                  <p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>Up to four governed synthetic directions retained for this campaign.</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Concept studio</div>
                  <div className="mt-2 truncate text-sm font-black" style={{ color: decisionContext.activeConceptId ? C.purpleLt : C.cream }}>{decisionContext.activeConceptId || 'No concept selected'}</div>
                  <p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>The last governed concept direction can reopen without becoming production artwork.</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Proposal review</div>
                  <div className="mt-2 text-sm font-black" style={{ color: proposalContext ? C.green : C.cream }}>{proposalContext ? `Proposal v${proposalContext.version} · ${proposalContext.status.replaceAll('_', ' ')}` : 'No review saved'}</div>
                  <p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>Keep/change decisions and bounded review history stay with this campaign.</p>
                </div>
              </div>
              <p className="mt-4 rounded-xl border p-3 text-[11px] leading-5" style={{ borderColor: C.line, background: `${C.purple}08`, color: C.muted }}>Activating another saved campaign swaps the local discovery, concept, and review context. Returning here restores this campaign&apos;s context. Everything remains browser-session local; no server record, external share, live catalog claim, order, or production authority is created.</p>
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: 'linear-gradient(135deg, rgba(52,211,153,.08), rgba(27,21,48,.95))', borderColor: `${C.green}55` }}>
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-3xl"><div className="flex items-center gap-2"><ClipboardList className="h-5 w-5" style={{ color: C.green }} /><span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.green }}>Save + continue</span></div><h2 className="mt-2 text-2xl font-black">Make this the active SWAGR campaign.</h2><p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>Saving creates a preserved version. Continuing also writes this campaign&apos;s planning brief into the existing active-brief contract so discovery can rank around it without adding a backend or live data.</p></div>
                <button type="button" onClick={() => persistDraft()} className="rounded-xl border px-4 py-3 text-xs font-black focus:outline-none focus:ring-2" style={{ borderColor: C.green, color: C.green, background: `${C.green}08`, '--tw-ring-color': C.green }}>{draft.id ? 'Save new version' : 'Save campaign'}</button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <button type="button" onClick={() => continueTo('/swagr/library')} className="rounded-2xl border p-4 text-left focus:outline-none focus:ring-2" style={{ borderColor: C.gold, background: `${C.gold}08`, '--tw-ring-color': C.gold }}><Target className="h-5 w-5" style={{ color: C.gold }} /><div className="mt-3 text-sm font-black">Discover products</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Activate campaign and rank the governed concept library around this brief.</p><span className="mt-3 inline-flex items-center text-[11px] font-bold" style={{ color: C.gold }}>Open library <ArrowRight className="ml-1 h-3.5 w-3.5" /></span></button>
                <button type="button" onClick={() => continueTo('/swagr/virtual')} className="rounded-2xl border p-4 text-left focus:outline-none focus:ring-2" style={{ borderColor: C.purple, background: `${C.purple}0D`, '--tw-ring-color': C.purple }}><Wand2 className="h-5 w-5" style={{ color: C.purpleLt }} /><div className="mt-3 text-sm font-black">Build concept virtuals</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Carry the active campaign into the existing local concept studio.</p><span className="mt-3 inline-flex items-center text-[11px] font-bold" style={{ color: C.purpleLt }}>Open studio <ArrowRight className="ml-1 h-3.5 w-3.5" /></span></button>
                <button type="button" onClick={() => continueTo('/swagr/proposal')} className="rounded-2xl border p-4 text-left focus:outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', '--tw-ring-color': C.green }}><Check className="h-5 w-5" style={{ color: C.green }} /><div className="mt-3 text-sm font-black">Review proposal</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Activate the planning context, then continue to the existing local review experience.</p><span className="mt-3 inline-flex items-center text-[11px] font-bold" style={{ color: C.green }}>Open review <ArrowRight className="ml-1 h-3.5 w-3.5" /></span></button>
              </div>
            </section>

            {savedCampaign && savedCampaign.versions.length > 0 && (
              <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><History className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-lg font-black">Preserved versions</h2></div><Pill tone="neutral">{versionCount} total</Pill></div>
                <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Opening an older version never overwrites the current record. It becomes an editable draft that can be saved forward as a new version.</p>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {savedCampaign.versions.map((snapshot) => (
                    <button key={`${snapshot.version}-${snapshot.savedAt}`} type="button" onClick={() => restoreVersion(snapshot)} className="rounded-xl border p-3 text-left focus:outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', '--tw-ring-color': C.purple }}>
                      <div className="flex items-center justify-between gap-2"><span className="text-xs font-black">Version {snapshot.version}</span><span className="text-[10px]" style={{ color: C.muted }}>{snapshot.savedAt ? new Date(snapshot.savedAt).toLocaleDateString() : 'saved locally'}</span></div>
                      <div className="mt-1 text-[10px]" style={{ color: C.muted }}>{snapshot.brief?.useCase || 'Moment open'} · {snapshot.brand?.brandName || 'Brand open'}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>

        <footer className="mt-8 border-t py-6 text-center text-[11px] leading-5" style={{ borderColor: C.line, color: C.muted }}>SWAGR AI · CAMPAIGN-002 isolated continuation · Session-local only · Synthetic/planning truth states · No external sharing · No transaction or production authority</footer>
      </div>
    </main>
  );
}
