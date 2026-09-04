'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, Database, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { loadActiveCampaign } from './campaign-store';

const C = {
  panel: '#171022', panel2: '#211938', line: '#352A46', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', muted: '#AAA0B8',
};

function Pill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { color: C.cream, borderColor: C.line, background: '#110B19' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}0D` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}0D` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}12` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em]" style={tones[tone]}>{children}</span>;
}

function CapabilityCard({ icon: Icon, eyebrow, title, detail, href, cta, tone = 'purple', disabled = false }) {
  const accent = tone === 'good' ? C.green : tone === 'warn' ? C.gold : C.purpleLt;
  const body = <>
    <div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl border" style={{ borderColor: `${accent}55`, background: `${accent}0D` }}><Icon className="h-5 w-5" style={{ color: accent }} /></span><Pill tone={disabled ? 'warn' : tone}>{disabled ? 'Needs source-qualified concept' : 'Available now'}</Pill></div>
    <div className="mt-4 text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: accent }}>{eyebrow}</div>
    <h3 className="mt-1 text-lg font-black" style={{ color: C.cream }}>{title}</h3>
    <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>{detail}</p>
    <div className="mt-4 inline-flex items-center gap-2 text-xs font-black" style={{ color: disabled ? C.muted : accent }}>{cta}<ArrowRight className="h-3.5 w-3.5" /></div>
  </>;

  if (disabled) return <div className="rounded-3xl border p-5 opacity-80" style={{ borderColor: C.line, background: C.panel2 }}>{body}</div>;
  return <Link href={href} className="rounded-3xl border p-5 outline-none motion-safe:transition motion-safe:hover:-translate-y-0.5 focus:ring-2" style={{ borderColor: `${accent}44`, background: C.panel2, '--tw-ring-color': accent }}>{body}</Link>;
}

export default function JourneyCapabilityLaunchpad() {
  const pathname = usePathname();
  const [activeConceptId, setActiveConceptId] = useState('');

  useEffect(() => {
    if (pathname !== '/swagr') {
      setActiveConceptId('');
      return undefined;
    }
    const refresh = () => {
      const campaign = loadActiveCampaign();
      setActiveConceptId(campaign?.decisionContext?.activeConceptId || '');
    };
    refresh();
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [pathname]);

  if (pathname !== '/swagr') return null;

  const productReadinessHref = activeConceptId
    ? `/swagr/virtual/product-readiness?concept=${encodeURIComponent(activeConceptId)}&scenario=CONTROLLED_FRESH_SIMULATION`
    : '/swagr/library/source-aware';

  return <section className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: C.line, background: '#100A18' }} aria-label="SWAGR governed capability launchpad">
    <div className="mx-auto max-w-7xl rounded-[28px] border p-5 sm:p-6" style={{ borderColor: `${C.green}33`, background: C.panel }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2"><Pill tone="good">New governed capabilities</Pill><Pill>Read only · planning only</Pill></div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white">See the source before you trust the product direction.</h2>
          <p className="mt-2 text-sm leading-6" style={{ color: C.muted }}>The customer journey now exposes source-aware discovery and exact product/imprint validation directly. SWAGR can show what is eligible, what is blocked, and why—without inventing price, stock, supplier approval, or production truth.</p>
        </div>
        <Link href="/swagr/data" className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><Database className="h-4 w-4" />Provider gate lab</Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <CapabilityCard icon={SearchCheck} eyebrow="Source-aware discovery" title="Browse only what the source can support" detail="Search and filter governed directions while freshness, license, exact source identity, confidence, and fail-closed blockers stay visible on every card." href="/swagr/library/source-aware" cta="Open source-aware discovery" tone="good" />
        <CapabilityCard icon={ShieldCheck} eyebrow="Product-specific virtual readiness" title={activeConceptId ? 'Validate the active concept against an exact source' : 'Choose a source-qualified concept first'} detail={activeConceptId ? 'Bind exact provider identity and source revision to the controlled imprint declaration, then expose every remaining validation gap before any production-proof step.' : 'The product + imprint validation path becomes meaningful after a governed concept is selected. Source-aware discovery is the safe next move.'} href={productReadinessHref} cta={activeConceptId ? 'Open product + imprint validation' : 'Choose source-qualified direction'} tone={activeConceptId ? 'purple' : 'warn'} />
        <div className="rounded-3xl border p-5" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl border" style={{ borderColor: `${C.gold}55`, background: `${C.gold}0D` }}><Sparkles className="h-5 w-5" style={{ color: C.gold }} /></span><Pill tone="warn">Boundary</Pill></div><div className="mt-4 text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.gold }}>Still deliberately excluded</div><h3 className="mt-1 text-lg font-black" style={{ color: C.cream }}>Commercial and production authority</h3><p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>No live price, inventory, MOQ, lead time, delivery promise, supplier approval, quote, order, payment, artwork approval, proof approval, or production authority is created by these paths.</p></div>
      </div>
    </div>
  </section>;
}
