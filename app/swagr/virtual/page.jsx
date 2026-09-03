'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ImagePlus,
  Layers3,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import ConceptVisual from '../concept-visual';
import { SWAGR_FIXTURES } from '../../swagr-lab/fixtures';
import { loadBrandProfile } from '../brand-profile';
import { loadActiveCampaignDecisionContext, saveActiveCampaignConceptId } from '../campaign-store';

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

const RECIPE_LIBRARY = {
  apparel: {
    label: 'Apparel concept recipe',
    placements: [
      ['primary', 'Center chest', 'Broad front-brand moment'],
      ['secondary', 'Left chest', 'Smaller identity placement'],
      ['alternate', 'Upper mark', 'Compact secondary treatment'],
    ],
    validation: ['Exact garment SKU and color', 'Decoration method compatibility', 'Actual imprint area and seams', 'Artwork cleanup and minimum-detail check'],
  },
  headwear: {
    label: 'Headwear concept recipe',
    placements: [
      ['primary', 'Front panel', 'Primary cap-brand direction'],
      ['secondary', 'Offset front', 'Smaller asymmetrical direction'],
      ['alternate', 'Side mark', 'Secondary identity treatment'],
    ],
    validation: ['Exact cap construction and panels', 'Embroidery/patch feasibility', 'Stitch/detail limits', 'Approved supplier imprint location'],
  },
  drinkware: {
    label: 'Drinkware concept recipe',
    placements: [
      ['primary', 'Center body', 'Primary front-facing mark'],
      ['secondary', 'Vertical mark', 'Tall logo/wordmark direction'],
      ['alternate', 'Lower body', 'Small restrained treatment'],
    ],
    validation: ['Exact vessel geometry', 'Decoration method and wrap limits', 'Printable area coordinates', 'Color/finish contrast'],
  },
  bags: {
    label: 'Bag concept recipe',
    placements: [
      ['primary', 'Center panel', 'Large primary brand moment'],
      ['secondary', 'Upper panel', 'Compact top-area direction'],
      ['alternate', 'Offset panel', 'Asymmetrical graphic direction'],
    ],
    validation: ['Exact bag panel construction', 'Pocket/seam interference', 'Decoration method compatibility', 'Actual safe imprint area'],
  },
  writing: {
    label: 'Writing concept recipe',
    placements: [
      ['primary', 'Barrel mark', 'Main simplified wordmark'],
      ['secondary', 'Upper barrel', 'Short compact mark'],
      ['alternate', 'Lower barrel', 'Alternate narrow treatment'],
    ],
    validation: ['Exact barrel geometry', 'Readable mark size', 'Pad/laser method compatibility', 'Supplier imprint coordinates'],
  },
  default: {
    label: 'General concept recipe',
    placements: [
      ['primary', 'Primary area', 'Main brand placement'],
      ['secondary', 'Offset area', 'Secondary placement direction'],
      ['alternate', 'Alternate area', 'Exploratory placement direction'],
    ],
    validation: ['Exact product identity', 'Decoration compatibility', 'Actual imprint area', 'Production artwork review'],
  },
};

function conceptType(category = '') {
  const value = category.toLowerCase();
  if (value.includes('outerwear') || value.includes('knit') || value.includes('apparel')) return 'apparel';
  if (value.includes('headwear')) return 'headwear';
  if (value.includes('drinkware')) return 'drinkware';
  if (value.includes('bag') || value.includes('tote')) return 'bags';
  if (value.includes('writing')) return 'writing';
  return 'default';
}

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={styles[tone]}>{children}</span>;
}

function ControlLabel({ children, note }) {
  return (
    <div className="mb-2">
      <div className="text-xs font-bold" style={{ color: C.cream }}>{children}</div>
      {note && <div className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>{note}</div>}
    </div>
  );
}

export default function SwagrVirtualStudio() {
  const [conceptId, setConceptId] = useState(SWAGR_FIXTURES[0]?.id || '');
  const [placement, setPlacement] = useState('primary');
  const [markScale, setMarkScale] = useState(1);
  const [brandName, setBrandName] = useState('Sample Brand');
  const [brandAsset, setBrandAsset] = useState('');
  const [fileMessage, setFileMessage] = useState('Optional: add a local image. It remains in this browser session only.');
  const [saved, setSaved] = useState([]);
  const [handoffMessage, setHandoffMessage] = useState('');
  const [eventLog, setEventLog] = useState(['Studio opened with synthetic SWAGR fixture data.']);

  useEffect(() => {
    const profile = loadBrandProfile();
    if (!profile) return;
    setBrandName(profile.brandName || 'Sample Brand');
    setBrandAsset(profile.logoDataUrl || '');
    setFileMessage('Saved session-local Brand Kit loaded. No network upload occurred.');
    setEventLog((items) => ['Session-local Brand Kit loaded into the concept canvas.', ...items].slice(0, 8));
  }, []);

  const concept = useMemo(() => SWAGR_FIXTURES.find((item) => item.id === conceptId) || SWAGR_FIXTURES[0], [conceptId]);
  const type = conceptType(concept?.category);
  const recipe = RECIPE_LIBRARY[type] || RECIPE_LIBRARY.default;
  const placementInfo = recipe.placements.find(([id]) => id === placement) || recipe.placements[0];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('concept');
    const decisionContext = loadActiveCampaignDecisionContext();

    if (!requestedId) {
      const restored = SWAGR_FIXTURES.find((item) => item.id === decisionContext.activeConceptId);
      if (!restored) return;
      setConceptId(restored.id);
      setPlacement('primary');
      setMarkScale(1);
      setHandoffMessage(`${restored.name} restored from the active campaign. It remains a synthetic planning direction.`);
      setEventLog((items) => [`${restored.name} restored from session-local campaign context.`, ...items].slice(0, 8));
      return;
    }

    const requested = SWAGR_FIXTURES.find((item) => item.id === requestedId);
    if (!requested) {
      setHandoffMessage('The requested concept was not found in the accepted synthetic library. The studio stayed on its default direction.');
      setEventLog((items) => ['Invalid concept handoff ignored; default synthetic direction retained.', ...items].slice(0, 8));
      return;
    }
    setConceptId(requested.id);
    saveActiveCampaignConceptId(requested.id);
    setPlacement('primary');
    setMarkScale(1);
    const fromLibrary = params.get('source') === 'library';
    setHandoffMessage(`${requested.name} loaded${fromLibrary ? ' from the curated concept library' : ''}. The selection is URL-local and remains a synthetic planning direction.`);
    setEventLog((items) => [`${requested.name} loaded from a reversible URL handoff; placement recipe reset.`, ...items].slice(0, 8));
  }, []);

  const record = (message) => setEventLog((items) => [message, ...items].slice(0, 8));

  const changeConcept = (nextId) => {
    setConceptId(nextId);
    saveActiveCampaignConceptId(nextId);
    setPlacement('primary');
    setMarkScale(1);
    const next = SWAGR_FIXTURES.find((item) => item.id === nextId);
    record(`Concept changed to ${next?.name || nextId}; placement recipe reset.`);
  };

  const handleBrandAsset = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFileMessage('Use an image file such as PNG, JPG, WEBP, or SVG. Nothing was uploaded.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileMessage('Keep the local preview image under 2 MB. Nothing was uploaded.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBrandAsset(String(reader.result || ''));
      setFileMessage(`${file.name} is applied locally. No SWAGR network upload was performed.`);
      record('Local brand image added to the concept canvas; browser-memory only.');
    };
    reader.readAsDataURL(file);
  };

  const saveDirection = () => {
    const snapshot = {
      id: `${concept.id}-${placement}-${Math.round(markScale * 100)}-${Date.now()}`,
      concept,
      placement,
      markScale,
      placementLabel: placementInfo[1],
      brandName,
      brandAsset,
    };
    setSaved((items) => [snapshot, ...items].slice(0, 4));
    record(`${concept.name} / ${placementInfo[1]} saved as a local concept direction.`);
  };

  const reset = () => {
    setPlacement('primary');
    setMarkScale(1);
    record('Placement and mark scale reset to the recipe default.');
  };

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(60% 42% at 88% 0%, rgba(108,71,255,.24), transparent 72%), radial-gradient(42% 28% at 2% 18%, rgba(245,200,66,.08), transparent 76%)' }} />

      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.95)' }}>
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/swagr" className="flex h-10 w-10 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" aria-label="Back to SWAGR experience" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link>
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black tracking-tight">SWAGR AI</span><Pill tone="purple">Instant Concept Virtual Studio</Pill></div>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>Turn a shortlist direction into a fast, local placement concept without pretending it is production artwork.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2"><Link href="/swagr/brand" className="rounded-xl border px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.purple, color: C.purpleLt, '--tw-ring-color': C.purple }}>Brand Kit</Link><Pill tone="warn">Synthetic catalog</Pill><Pill tone="good">Browser-local</Pill></div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="mb-6 rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.gold}55`, background: 'linear-gradient(135deg, rgba(245,200,66,.08), rgba(27,21,48,.9))' }}>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} />
            <div>
              <div className="text-sm font-black" style={{ color: C.gold }}>Concept virtual ≠ production proof</div>
              <p className="mt-1 max-w-4xl text-xs leading-5" style={{ color: C.muted }}>This studio intentionally uses SWAGR’s synthetic category fixtures and conceptual placement recipes. It does not claim a live SKU, actual imprint coordinates, decoration feasibility, stock, price, MOQ, lead time, or supplier approval.</p>
              {handoffMessage && <div className="mt-3 rounded-xl border px-3 py-2.5 text-[11px] leading-5" style={{ borderColor: `${C.purple}55`, background: `${C.purple}0D`, color: C.cream }}><strong style={{ color: C.purpleLt }}>Library handoff:</strong> {handoffMessage}</div>}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <aside className="h-fit space-y-5 xl:sticky xl:top-5">
            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5" style={{ color: C.gold }} /><h1 className="text-lg font-black">Build the direction</h1></div>

              <div className="mt-5">
                <ControlLabel note="Synthetic category direction only.">Product concept</ControlLabel>
                <select value={conceptId} onChange={(event) => changeConcept(event.target.value)} className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2" style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }}>
                  {SWAGR_FIXTURES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>

              <div className="mt-5">
                <ControlLabel note="These are conceptual placement intents, not supplier imprint locations.">Placement direction</ControlLabel>
                <div className="grid gap-2">
                  {recipe.placements.map(([id, label, description]) => (
                    <button key={id} type="button" onClick={() => { setPlacement(id); record(`Placement direction changed to ${label}.`); }} aria-pressed={placement === id} className="rounded-xl border p-3 text-left focus:outline-none focus:ring-2" style={{ borderColor: placement === id ? C.purple : C.line, background: placement === id ? `${C.purple}14` : '#0F0A17', '--tw-ring-color': C.purple }}>
                      <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold" style={{ color: placement === id ? C.purpleLt : C.cream }}>{label}</span>{placement === id && <Check className="h-3.5 w-3.5" style={{ color: C.green }} />}</div>
                      <div className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>{description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <ControlLabel note="Visual exploration only. Exact dimensions require the real product template.">Mark scale · {Math.round(markScale * 100)}%</ControlLabel>
                <input aria-label="Concept mark scale" type="range" min="65" max="135" step="5" value={Math.round(markScale * 100)} onChange={(event) => setMarkScale(Number(event.target.value) / 100)} className="w-full" />
                <div className="mt-1 flex justify-between text-[10px]" style={{ color: C.muted }}><span>Smaller</span><span>Larger</span></div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" onClick={saveDirection} className="rounded-xl px-3 py-3 text-xs font-black focus:outline-none focus:ring-2" style={{ background: C.gold, color: '#17101F', '--tw-ring-color': C.gold }}><Save className="mr-1 inline h-3.5 w-3.5" /> Save direction</button>
                <button type="button" onClick={reset} className="rounded-xl border px-3 py-3 text-xs font-semibold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Reset</button>
              </div>
              <p className="mt-2 text-[10px] leading-4" style={{ color: C.muted }}>Saved directions live only in this page session and disappear on refresh.</p>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><ImagePlus className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-sm font-black">Local brand mark</h2></div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-bold" style={{ color: C.cream }}>Brand label</span>
                <input value={brandName} onChange={(event) => setBrandName(event.target.value)} maxLength={40} className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2" style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }} />
              </label>
              <label className="mt-3 block cursor-pointer rounded-2xl border border-dashed p-4 text-center focus-within:ring-2" style={{ borderColor: C.purple, background: `${C.purple}0B`, '--tw-ring-color': C.purple }}>
                <span className="block text-xs font-bold" style={{ color: C.purpleLt }}>{brandAsset ? 'Change local image' : 'Add local image'}</span>
                <span className="mt-1 block text-[10px]" style={{ color: C.muted }}>Image only · max 2 MB · no network upload</span>
                <input className="sr-only" type="file" accept="image/*" onChange={handleBrandAsset} />
              </label>
              {brandAsset && <button type="button" onClick={() => { setBrandAsset(''); setFileMessage('Local image cleared. No external copy was created.'); record('Local brand image cleared.'); }} className="mt-3 text-[11px] font-semibold underline underline-offset-4" style={{ color: C.muted }}>Clear local image</button>}
              <p className="mt-3 text-[10px] leading-4" style={{ color: C.muted }}>{fileMessage}</p>
            </section>
          </aside>

          <div className="min-w-0 space-y-6">
            <section className="overflow-hidden rounded-3xl border" style={{ background: C.panel, borderColor: C.line }}>
              <div className="grid gap-0 lg:grid-cols-[1.25fr_.75fr]">
                <div className="p-4 sm:p-6">
                  <ConceptVisual concept={concept} brandAsset={brandAsset} brandName={brandName} placement={placement} markScale={markScale} conceptLabel="Instant concept virtual" />
                </div>
                <div className="border-t p-5 sm:p-6 lg:border-l lg:border-t-0" style={{ borderColor: C.line, background: C.panel2 }}>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.purpleLt }}>{recipe.label}</div>
                  <h2 className="mt-2 text-2xl font-black">{placementInfo[1]}</h2>
                  <p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>{placementInfo[2]}. Use this to discuss visual direction quickly, then bind the chosen idea to a real product template before any proof or production step.</p>

                  <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: C.gold }}>Decoration paths to validate</div>
                    <div className="mt-2 flex flex-wrap gap-2">{concept.decoration.map((item) => <Pill key={item} tone="neutral">{item}</Pill>)}</div>
                  </div>

                  <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${C.green}44`, background: `${C.green}07` }}>
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: C.green }} /><span className="text-xs font-black" style={{ color: C.green }}>Truth-state boundary intact</span></div>
                    <p className="mt-2 text-[11px] leading-5" style={{ color: C.muted }}>The visual changes position and scale only. It does not infer a product-specific imprint area or claim the selected decoration path will work.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><Layers3 className="h-5 w-5" style={{ color: C.gold }} /><h2 className="text-lg font-black">What this recipe carries forward</h2></div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Concept identity</div><div className="mt-1 text-sm font-bold text-white">{concept.name}</div><div className="mt-1 text-xs" style={{ color: C.muted }}>{concept.category}</div></div>
                  <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Planning recipe</div><div className="mt-1 text-sm font-bold text-white">{placementInfo[1]} · {Math.round(markScale * 100)}% visual scale</div><div className="mt-1 text-xs leading-5" style={{ color: C.muted }}>These are normalized concept settings, not physical imprint dimensions.</div></div>
                  <div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: '#0F0A17' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Creative guidance</div><p className="mt-1 text-xs leading-5" style={{ color: C.cream }}>{concept.creative}</p></div>
                </div>
              </div>

              <div className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
                <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" style={{ color: C.gold }} /><h2 className="text-lg font-black">Required before a real virtual</h2></div>
                <ul className="mt-4 space-y-2">{recipe.validation.map((item) => <li key={item} className="flex gap-2 text-sm leading-5" style={{ color: C.cream }}><span style={{ color: C.gold }}>•</span><span>{item}</span></li>)}</ul>
                <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: `${C.gold}44`, background: `${C.gold}07` }}><div className="text-xs font-bold" style={{ color: C.gold }}>Then move to the product-specific layer</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Bind the concept to an exact SKU/color/media asset, validated decoration method, supplier-approved imprint location, safe margin, logo variant, and final-proof workflow.</p></div>
              </div>
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: saved.length ? `${C.green}55` : C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.green }}>Local direction set</div><h2 className="mt-1 text-xl font-black">{saved.length ? `${saved.length} saved concept direction${saved.length === 1 ? '' : 's'}` : 'Save a few directions to compare visually'}</h2></div><Pill tone={saved.length ? 'good' : 'neutral'}>Max 4 · session only</Pill></div>
              {saved.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{saved.map((item) => <article key={item.id} className="rounded-2xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}><ConceptVisual concept={item.concept} compact brandAsset={item.brandAsset} brandName={item.brandName} placement={item.placement} markScale={item.markScale} conceptLabel="Saved direction" /><div className="mt-3 flex items-center justify-between gap-2"><div><div className="text-xs font-bold text-white">{item.concept.name}</div><div className="mt-1 text-[10px]" style={{ color: C.muted }}>{item.placementLabel} · {Math.round(item.markScale * 100)}%</div></div><button type="button" onClick={() => setSaved((items) => items.filter((savedItem) => savedItem.id !== item.id))} className="text-[10px] font-semibold underline underline-offset-4" style={{ color: C.muted }}>Remove</button></div></article>)}</div> : <p className="mt-3 text-sm leading-6" style={{ color: C.muted }}>Use different placement and scale directions to compare the visual idea before SWAGR asks a real catalog/data layer to resolve an exact product.</p>}
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel2, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Wand2 className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-lg font-black">Session evidence</h2><Pill tone="purple">Transient</Pill></div>
              <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>This lightweight log makes the interaction inspectable without creating persistence or sending data elsewhere.</p>
              <div className="mt-4 space-y-2">{eventLog.map((event, index) => <div key={`${event}-${index}`} className="rounded-xl border px-3 py-2 text-[11px] leading-5" style={{ borderColor: C.line, background: '#0F0A17', color: index === 0 ? C.cream : C.muted }}>{event}</div>)}</div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
