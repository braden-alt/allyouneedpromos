'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, Database, Image, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { loadActiveCampaign } from './campaign-store';
import { SWAGR_GOVERNED_CONCEPTS } from './coverage/catalog';

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

function Step({ icon: Icon, label, detail, tone = 'purple' }) {
  const accent = tone === 'good' ? C.green : tone === 'warn' ? C.gold : C.purpleLt;
  return <div className="rounded-2xl border p-3.5" style={{ borderColor: `${accent}33`, background: C.panel2 }}>
    <div className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: `${accent}55`, background: `${accent}0D` }}><Icon className="h-4 w-4" style={{ color: accent }} /></span><div><div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: accent }}>{label}</div><div className="mt-0.5 text-[11px] leading-4" style={{ color: C.muted }}>{detail}</div></div></div>
  </div>;
}

export default function JourneyVirtualLaunchpad() {
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

  const activeConcept = useMemo(
    () => SWAGR_GOVERNED_CONCEPTS.find((item) => item.id === activeConceptId) || null,
    [activeConceptId],
  );

  if (pathname !== '/swagr') return null;

  return <section className="border-b px-4 py-5 sm:px-6 lg:px-8" style={{ borderColor: C.line, background: '#0D0814' }} aria-label="SWAGR controlled instant virtual entry">
    <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border" style={{ borderColor: `${C.purple}44`, background: C.panel }}>
      <div className="grid gap-0 xl:grid-cols-[1.2fr_.8fr]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2"><Pill tone="purple">Controlled instant virtual</Pill><Pill tone="good">Customer-usable now</Pill><Pill>Preview authority only</Pill></div>
          <div className="mt-4 flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border" style={{ borderColor: `${C.purple}66`, background: `${C.purple}12` }}><Sparkles className="h-5 w-5" style={{ color: C.purpleLt }} /></span><div><h2 className="text-2xl font-black tracking-tight text-white">Move from product direction to a governed visual in one path.</h2><p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: C.muted }}>The accepted provider, product/imprint, and controlled-media gates now meet in one synthetic assembly workspace. SWAGR only renders the virtual when those identities agree; otherwise it visibly withholds the preview instead of guessing.</p></div></div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Step icon={Database} label="1 · Source" detail="Exact simulated record, revision, freshness, rights, and identity gate." tone="good" />
            <Step icon={ShieldCheck} label="2 · Imprint" detail="Declared product + imprint packet must match the same governed concept." />
            <Step icon={Image} label="3 · Media" detail="Controlled blank, rights scope, binding, and preview geometry stay explicit." tone="warn" />
            <Step icon={Layers3} label="4 · Assemble" detail="Only then does the local synthetic instant virtual render." tone="purple" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/swagr/virtual/assembled" className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black text-white outline-none motion-safe:transition motion-safe:hover:-translate-y-0.5 focus:ring-2" style={{ background: C.purple, '--tw-ring-color': C.purpleLt }}>Open controlled instant virtual <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/swagr/library/source-aware" className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-black outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}>Start with source-aware discovery</Link>
          </div>
        </div>

        <aside className="border-t p-5 sm:p-7 xl:border-l xl:border-t-0" style={{ borderColor: C.line, background: 'linear-gradient(145deg, rgba(108,71,255,.12), rgba(33,25,56,.96))' }}>
          <div className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: C.purpleLt }}>Current journey context</div>
          <h3 className="mt-2 text-lg font-black" style={{ color: C.cream }}>{activeConcept ? activeConcept.name : 'No active concept selected yet'}</h3>
          <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>{activeConcept ? `Your active campaign is currently carrying ${activeConcept.id}. The assembly studio remains reversible and lets you choose the exact governed concept to review.` : 'You can still open the controlled assembly studio directly, or choose a source-qualified direction first so the rest of the journey has a clear product context.'}</p>
          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${C.gold}44`, background: `${C.gold}08` }}><div className="text-[9px] font-black uppercase tracking-[0.13em]" style={{ color: C.gold }}>Authority boundary</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>This route does not create live price, inventory, MOQ, lead time, supplier approval, production geometry, quote, order, payment, artwork approval, proof approval, or production authority.</p></div>
        </aside>
      </div>
    </div>
  </section>;
}
