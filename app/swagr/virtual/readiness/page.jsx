'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Database,
  Ruler,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import ConceptVisual from '../../concept-visual';
import { SWAGR_GOVERNED_CONCEPTS } from '../../coverage/catalog';
import {
  clearImprintSpec,
  controlledTemplateForConcept,
  evaluateImprintReadiness,
  loadImprintSpec,
  saveImprintSpec,
} from '../imprint-readiness';

const C = {  bg: '#120D1A',
  panel: '#1B1530',
  panel2: '#211938',
  purple: '#6C47FF',
  purpleLt: '#B6A6FF',
  gold: '#F5C842',
  cream: '#F1EAD8',
  green: '#34D399',
  red: '#FB7185',
  muted: '#AAA0B8',
  line: '#352A46',
};

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    bad: { color: C.red, borderColor: `${C.red}55`, background: `${C.red}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={styles[tone]}>{children}</span>;
}

function Field({ label, note, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold" style={{ color: C.cream }}>{label}</span>      {note && <span className="mt-1 block text-[10px] leading-4" style={{ color: C.muted }}>{note}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function StatusRow({ pass, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.line, background: '#171122' }}>
      {pass ? <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: C.green }} /> : <Circle className="h-4 w-4 shrink-0" style={{ color: C.muted }} />}
      <span className="text-[11px] font-semibold" style={{ color: pass ? C.cream : C.muted }}>{label}</span>
    </div>
  );
}

const inputStyle = {
  borderColor: C.line,
  background: '#151020',
  color: C.cream,
  outlineColor: C.purple,
};

export default function SwagrImprintReadiness() {
  const [conceptId, setConceptId] = useState(SWAGR_GOVERNED_CONCEPTS[0]?.id || '');
  const [spec, setSpec] = useState(null);
  const [message, setMessage] = useState('');

  const concept = useMemo(() => SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === conceptId) || SWAGR_GOVERNED_CONCEPTS[0], [conceptId]);
  const template = useMemo(() => controlledTemplateForConcept(concept), [concept]);
  const readiness = useMemo(() => evaluateImprintReadiness(spec || {}), [spec]);  const visualScale = useMemo(() => {
    const area = Number(spec?.imprintWidth);
    const art = Number(spec?.artworkWidth);
    if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(art) || art <= 0) return 1;
    return Math.min(1.35, Math.max(0.65, art / area));
  }, [spec?.imprintWidth, spec?.artworkWidth]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('concept');
    if (requested && SWAGR_GOVERNED_CONCEPTS.some((item) => item.id === requested)) setConceptId(requested);
  }, []);

  useEffect(() => {
    if (!concept) return;
    setSpec(loadImprintSpec(concept));
    setMessage('');
  }, [concept]);

  const update = (field, value) => setSpec((current) => ({ ...current, [field]: value }));

  const save = () => {
    const next = saveImprintSpec(concept, spec || {});
    setSpec(next);
    setMessage('Controlled declaration saved in this browser session only. Nothing was sent externally.');
  };

  const reset = () => {
    setSpec(clearImprintSpec(concept));
    setMessage('This concept’s session-local imprint declaration was cleared.');
  };

  if (!concept || !spec) return null;

  const fitTone = readiness.fit.status === 'WITHIN_DECLARED_AREA' ? 'good' : readiness.fit.status === 'EXCEEDS_DECLARED_AREA' ? 'bad' : 'warn';
  const readinessTone = readiness.status === 'DECLARED_SPEC_READY_FOR_HUMAN_VALIDATION' ? 'good' : readiness.status === 'SPEC_PARTIAL' ? 'warn' : 'neutral';

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(55% 38% at 92% 0%, rgba(108,71,255,.22), transparent 72%), radial-gradient(40% 28% at 0% 22%, rgba(245,200,66,.07), transparent 76%)' }} />      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.95)' }}>
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/swagr/virtual?concept=${encodeURIComponent(concept.id)}`} className="flex h-10 w-10 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" aria-label="Back to concept virtual studio" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black tracking-tight">SWAGR AI</span><Pill tone="purple">Imprint Readiness</Pill></div>
                <p className="mt-1 text-xs" style={{ color: C.muted }}>Turn an unknown concept placement into a governed, source-declared validation packet without inventing supplier truth.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2"><Pill tone="warn">Non-live spec</Pill><Pill tone="good">Session local</Pill></div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="mb-6 rounded-3xl border p-5 sm:p-6" style={{ borderColor: `${C.gold}55`, background: 'linear-gradient(135deg, rgba(245,200,66,.08), rgba(27,21,48,.9))' }}>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.gold }} />
            <div>
              <div className="text-sm font-black" style={{ color: C.gold }}>Declared imprint spec ≠ supplier approval or production proof</div>
              <p className="mt-1 max-w-5xl text-xs leading-5" style={{ color: C.muted }}>This workspace never promotes category assumptions into product truth. A user must bind an exact product reference and controlled source, declare the imprint area and decoration method, and acknowledge restrictions before SWAGR can label the packet ready for human validation.</p>
            </div>
          </div>
        </section>
        <section className="grid gap-6 xl:grid-cols-[300px_1fr_360px]">
          <aside className="space-y-5">
            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-sm font-black">Concept direction</h2></div>
              <label className="mt-4 block text-xs font-bold" style={{ color: C.cream }}>
                Governed concept
                <select value={conceptId} onChange={(event) => setConceptId(event.target.value)} className="mt-2 w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}>
                  {SWAGR_GOVERNED_CONCEPTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: C.line, background: C.panel2 }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>{concept.id}</div>
                <div className="mt-1 text-sm font-black" style={{ color: C.cream }}>{concept.name}</div>
                <div className="mt-1 text-[11px]" style={{ color: C.muted }}>{concept.category}</div>
              </div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Database className="h-4 w-4" style={{ color: C.gold }} /><h2 className="text-xs font-black">Controlled template</h2></div>
              <div className="mt-3 flex flex-wrap gap-2"><Pill tone="warn">{template.sourceState}</Pill><Pill>{template.templateId}</Pill></div>
              <p className="mt-3 text-xs font-bold" style={{ color: C.cream }}>{template.label}</p>
              <p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>This template defines what must be known. It does not supply product facts.</p>
              <div className="mt-4 space-y-2">
                {template.criticalChecks.map((item) => <div key={item} className="text-[10px] leading-4" style={{ color: C.muted }}>• {item}</div>)}
              </div>
            </section>
          </aside>
          <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel, borderColor: C.line }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><div className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Controlled declaration</div><h2 className="mt-1 text-lg font-black">Bind the concept to a real specification source</h2></div>
              <Pill tone={readinessTone}>{readiness.score}% complete</Pill>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Exact product reference" note="SKU, style number, or another exact product identifier from the controlled source.">
                <input value={spec.productRef} onChange={(event) => update('productRef', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Unknown until product is selected" />
              </Field>
              <Field label="Controlled source" note="Name the imprint sheet, supplier spec page, or approved internal source used for this declaration.">
                <input value={spec.sourceLabel} onChange={(event) => update('sourceLabel', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Source not declared" />
              </Field>
              <Field label="Source date / revision" note="Use the revision/date printed on the controlled source when available.">
                <input value={spec.sourceDate} onChange={(event) => update('sourceDate', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="e.g. rev/date" />
              </Field>
              <Field label="Named imprint placement" note={`Examples for this lane: ${template.placementExamples.join(', ')}.`}>
                <input value={spec.placement} onChange={(event) => update('placement', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Placement unknown" />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_110px]">
              <Field label="Imprint width"><input type="number" min="0" step="0.01" value={spec.imprintWidth} onChange={(event) => update('imprintWidth', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Unknown" /></Field>
              <Field label="Imprint height"><input type="number" min="0" step="0.01" value={spec.imprintHeight} onChange={(event) => update('imprintHeight', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Unknown" /></Field>
              <Field label="Unit">
                <select value={spec.unit} onChange={(event) => update('unit', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle}><option value="in">in</option><option value="mm">mm</option></select>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Decoration method" note={`Candidate methods for this lane: ${template.methodExamples.join(', ')}. Use only the method stated by the controlled source.`}>
                <input value={spec.decorationMethod} onChange={(event) => update('decorationMethod', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Method not declared" />
              </Field>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border p-4" style={{ borderColor: spec.restrictionsReviewed ? `${C.green}55` : C.line, background: spec.restrictionsReviewed ? `${C.green}0B` : C.panel2 }}>
              <input type="checkbox" checked={spec.restrictionsReviewed} onChange={(event) => update('restrictionsReviewed', event.target.checked)} className="mt-0.5 h-4 w-4" />
              <span><span className="block text-xs font-bold" style={{ color: C.cream }}>Restrictions reviewed against the controlled source</span><span className="mt-1 block text-[10px] leading-4" style={{ color: C.muted }}>This confirms review only. It does not grant supplier approval, regulatory approval, artwork approval, or production authority.</span></span>
            </label>

            <div className="mt-4">
              <Field label="Restriction / boundary notes" note="Capture seams, curvature, protected areas, minimum detail, or other source-specific limits.">
                <textarea value={spec.restrictionNotes} onChange={(event) => update('restrictionNotes', event.target.value)} rows={3} className="w-full resize-y rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="No restriction notes recorded" />
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}><Save className="h-4 w-4" />Save declaration</button>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><RotateCcw className="h-4 w-4" />Reset</button>
            </div>
            {message && <div className="mt-3 rounded-xl border px-3 py-2.5 text-[11px] leading-5" style={{ borderColor: `${C.green}44`, background: `${C.green}0B`, color: C.cream }} aria-live="polite">{message}</div>}
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Ruler className="h-4 w-4" style={{ color: C.purpleLt }} /><h2 className="text-xs font-black">Readiness gate</h2></div><Pill tone={readinessTone}>{readiness.status.replaceAll('_', ' ')}</Pill></div>
              <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: '#151020' }}><div className="h-full rounded-full transition-all" style={{ width: `${readiness.score}%`, background: readiness.score === 100 ? C.green : C.purple }} /></div>
              <div className="mt-4 space-y-2">{readiness.checks.map((check) => <StatusRow key={check.id} pass={check.pass} label={check.label} />)}</div>
              <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: C.line, background: C.panel2 }}>
                <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Next safe action</div>
                <p className="mt-1 text-[11px] leading-5" style={{ color: C.cream }}>{readiness.nextAction}</p>
              </div>
            </section>
            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4" style={{ color: C.gold }} /><h2 className="text-xs font-black">Artwork fit check</h2></div><Pill tone={fitTone}>{readiness.fit.label}</Pill></div>
              <p className="mt-2 text-[10px] leading-4" style={{ color: C.muted }}>Rectangle-only math against the dimensions you declared. It does not validate actual coordinates or decoration feasibility.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label={`Target width (${spec.unit})`}><input type="number" min="0" step="0.01" value={spec.artworkWidth} onChange={(event) => update('artworkWidth', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Unknown" /></Field>
                <Field label={`Target height (${spec.unit})`}><input type="number" min="0" step="0.01" value={spec.artworkHeight} onChange={(event) => update('artworkHeight', event.target.value)} className="w-full rounded-xl border px-3 py-2.5 text-xs" style={inputStyle} placeholder="Unknown" /></Field>
              </div>
              <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: fitTone === 'bad' ? `${C.red}55` : C.line, background: C.panel2 }}>
                <p className="text-[11px] leading-5" style={{ color: fitTone === 'bad' ? C.red : C.cream }}>{readiness.fit.detail}</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border" style={{ background: C.panel, borderColor: C.line }}>
              <div className="border-b px-5 py-4" style={{ borderColor: C.line }}><div className="text-xs font-black">Category silhouette preview</div><div className="mt-1 text-[10px]" style={{ color: C.muted }}>Visual scale responds to declared width ratio only. Position remains conceptual.</div></div>
              <div className="p-4"><ConceptVisual fixture={concept} selected placement="primary" markScale={visualScale} brandName="SWAGR" /></div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: `${C.red}0A`, borderColor: `${C.red}44` }}>
              <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.red }} /><div><div className="text-xs font-black" style={{ color: C.red }}>Production authority remains blocked</div><p className="mt-1 text-[10px] leading-4" style={{ color: C.muted }}>Even at 100% declaration completeness, SWAGR only reaches human validation. Exact blank art, supplier approval, production artwork, proof approval, pricing, inventory, MOQ, and ordering stay outside this gate.</p></div></div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
