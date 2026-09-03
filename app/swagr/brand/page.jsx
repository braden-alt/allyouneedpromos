'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ImagePlus, Palette, RotateCcw, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import {
  DEFAULT_BRAND_PROFILE,
  VISUAL_DIRECTIONS,
  clearBrandProfile,
  loadBrandProfile,
  saveBrandProfile,
} from '../brand-profile';

const C = {
  bg: '#120D1A', panel: '#1B1530', panel2: '#211938', purple: '#6C47FF', purpleLt: '#B6A6FF',
  gold: '#F5C842', cream: '#F1EAD8', green: '#34D399', muted: '#AAA0B8', line: '#352A46',
};

function Pill({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { color: C.cream, borderColor: C.line, background: '#191225' },
    good: { color: C.green, borderColor: `${C.green}55`, background: `${C.green}12` },
    warn: { color: C.gold, borderColor: `${C.gold}55`, background: `${C.gold}12` },
    purple: { color: C.purpleLt, borderColor: `${C.purple}66`, background: `${C.purple}16` },
  };
  return <span className="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]" style={styles[tone]}>{children}</span>;
}

function Field({ label, value, onChange, placeholder, note }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold" style={{ color: C.cream }}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2" style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }} />
      {note && <span className="mt-1 block text-[10px] leading-4" style={{ color: C.muted }}>{note}</span>}
    </label>
  );
}

function Notes({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold" style={{ color: C.cream }}>{label}</span>
      <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2" style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }} />
    </label>
  );
}

export default function SwagrBrandKit() {
  const [profile, setProfile] = useState(DEFAULT_BRAND_PROFILE);
  const [message, setMessage] = useState('Nothing is saved outside this browser session.');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const existing = loadBrandProfile();
    if (existing) {
      setProfile(existing);
      setMessage('Existing session-local Brand Kit restored.');
    }
    setLoaded(true);
  }, []);

  const update = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Use an image file. Nothing was saved or uploaded.');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setMessage('Keep the session-local logo under 1.5 MB so the Brand Kit stays reliable. Nothing was uploaded.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update('logoDataUrl', String(reader.result || ''));
      setMessage(`${file.name} is previewed in browser memory only. Save the Brand Kit to reuse it during this session.`);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    const saved = saveBrandProfile(profile);
    setProfile(saved);
    setMessage(`Brand Kit saved locally at ${new Date(saved.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
  };

  const reset = () => {
    clearBrandProfile();
    setProfile(DEFAULT_BRAND_PROFILE);
    setMessage('Brand Kit reset. The session-local saved profile and logo were cleared.');
  };

  if (!loaded) return <main className="min-h-screen p-8" style={{ background: C.bg, color: C.cream }}>Loading local Brand Kit…</main>;

  return (
    <main className="min-h-screen" style={{ background: C.bg, color: '#fff' }}>
      <div className="pointer-events-none fixed inset-0" aria-hidden="true" style={{ background: 'radial-gradient(62% 44% at 88% 0%, rgba(108,71,255,.25), transparent 72%), radial-gradient(42% 28% at 2% 18%, rgba(245,200,66,.09), transparent 76%)' }} />
      <header className="relative border-b" style={{ borderColor: C.line, background: 'rgba(18,13,26,.96)' }}>
        <div className="mx-auto max-w-7xl px-5 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/swagr" aria-label="Back to SWAGR" className="flex h-10 w-10 items-center justify-center rounded-2xl border focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><ArrowLeft className="h-4 w-4" /></Link>
              <div><div className="flex flex-wrap items-center gap-2"><span className="text-xl font-black">SWAGR AI</span><Pill tone="purple">Brand Kit</Pill><Pill tone="good">Session-local</Pill></div><p className="mt-1 text-xs" style={{ color: C.muted }}>Set the reusable brand direction once, then carry it into discovery, concept virtuals, and proposal review.</p></div>
            </div>
            <div className="flex flex-wrap gap-2"><Pill tone="warn">No server identity</Pill><Pill tone="warn">No asset transmission</Pill></div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-5 py-8">
        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="space-y-5">
            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Palette className="h-5 w-5" style={{ color: C.gold }} /><h1 className="text-xl font-black">Reusable brand profile</h1></div>
              <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>This profile is a browser-session convenience layer. It is not an approved brand-governance system, customer identity record, production artwork store, or external upload.</p>
              <div className="mt-5 grid gap-4">
                <Field label="Brand name" value={profile.brandName} onChange={(value) => update('brandName', value)} placeholder="Acme Industrial" />
                <Field label="Tagline / short line" value={profile.tagline} onChange={(value) => update('tagline', value)} placeholder="Optional customer-facing line" />
                <Field label="Audience note" value={profile.audienceNote} onChange={(value) => update('audienceNote', value)} placeholder="Field teams, recruiting candidates, clients…" />
                <label className="block"><span className="mb-1.5 block text-xs font-bold" style={{ color: C.cream }}>Visual direction</span><select value={profile.visualDirection} onChange={(event) => update('visualDirection', event.target.value)} className="w-full rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2" style={{ background: '#0F0A17', borderColor: C.line, color: '#fff', '--tw-ring-color': C.purple }}>{VISUAL_DIRECTIONS.map((item) => <option key={item}>{item}</option>)}</select></label>
                <div className="grid grid-cols-2 gap-3">
                  <label><span className="mb-1.5 block text-xs font-bold" style={{ color: C.cream }}>Primary color</span><div className="flex items-center gap-2 rounded-xl border p-2" style={{ borderColor: C.line, background: '#0F0A17' }}><input type="color" value={profile.primaryColor} onChange={(event) => update('primaryColor', event.target.value.toUpperCase())} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent" /><input aria-label="Primary color hex" value={profile.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none" style={{ color: C.cream }} /></div></label>
                  <label><span className="mb-1.5 block text-xs font-bold" style={{ color: C.cream }}>Accent color</span><div className="flex items-center gap-2 rounded-xl border p-2" style={{ borderColor: C.line, background: '#0F0A17' }}><input type="color" value={profile.secondaryColor} onChange={(event) => update('secondaryColor', event.target.value.toUpperCase())} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent" /><input aria-label="Accent color hex" value={profile.secondaryColor} onChange={(event) => update('secondaryColor', event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none" style={{ color: C.cream }} /></div></label>
                </div>
                <Notes label="Lean into" value={profile.doNotes} onChange={(value) => update('doNotes', value)} placeholder="Clean typography, premium useful items, subtle logo placement…" />
                <Notes label="Avoid" value={profile.avoidNotes} onChange={(value) => update('avoidNotes', value)} placeholder="Huge logos, novelty-only items, bright neon colors…" />
              </div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}>
              <div className="flex items-center gap-2"><ImagePlus className="h-5 w-5" style={{ color: C.purpleLt }} /><h2 className="text-sm font-black">Local logo reference</h2></div>
              <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed p-4 text-center focus-within:ring-2" style={{ borderColor: C.purple, background: `${C.purple}0C`, '--tw-ring-color': C.purple }}><span className="block text-xs font-bold" style={{ color: C.purpleLt }}>{profile.logoDataUrl ? 'Change local logo image' : 'Add local logo image'}</span><span className="mt-1 block text-[10px]" style={{ color: C.muted }}>Image only · max 1.5 MB · sessionStorage only after Save</span><input className="sr-only" type="file" accept="image/*" onChange={handleLogo} /></label>
              {profile.logoDataUrl && <button type="button" onClick={() => update('logoDataUrl', '')} className="mt-3 text-[11px] font-semibold underline underline-offset-4" style={{ color: C.muted }}>Remove local logo from this draft</button>}
            </section>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button type="button" onClick={save} className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-2" style={{ background: C.green, color: '#071710', '--tw-ring-color': C.green }}><Check className="h-4 w-4" /> Save local Brand Kit</button>
              <button type="button" onClick={reset} className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2" style={{ borderColor: C.line, color: C.cream, '--tw-ring-color': C.purple }}><RotateCcw className="h-4 w-4" /> Reset local kit</button>
            </div>
            <p aria-live="polite" className="rounded-xl border px-3 py-2.5 text-[11px] leading-5" style={{ borderColor: C.line, background: '#0F0A17', color: C.muted }}>{message}</p>
          </div>

          <div className="space-y-5">
            <section className="overflow-hidden rounded-3xl border" style={{ borderColor: `${profile.primaryColor}88`, background: `linear-gradient(135deg, ${profile.primaryColor}28, rgba(27,21,48,.96) 58%, ${profile.secondaryColor}12)` }}>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex flex-wrap gap-2"><Pill tone="purple">Live local preview</Pill><Pill tone="warn">Not production artwork</Pill></div><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{profile.brandName || 'Sample Brand'}</h2><p className="mt-2 text-base" style={{ color: C.cream }}>{profile.tagline || 'Your reusable SWAGR visual direction starts here.'}</p><p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: C.muted }}>{profile.audienceNote || 'Add an audience note to make the campaign context reusable across the SWAGR customer journey.'}</p></div><div className="flex h-28 w-40 items-center justify-center overflow-hidden rounded-3xl border p-3" style={{ borderColor: C.line, background: '#0F0A17' }}>{profile.logoDataUrl ? <img src={profile.logoDataUrl} alt="Local brand reference" className="max-h-full max-w-full object-contain" /> : <Sparkles className="h-10 w-10" style={{ color: profile.secondaryColor }} />}</div></div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: 'rgba(15,10,23,.7)' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Visual direction</div><div className="mt-2 text-sm font-black">{profile.visualDirection}</div></div><div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: 'rgba(15,10,23,.7)' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Primary</div><div className="mt-2 flex items-center gap-2 text-sm font-black"><span className="h-4 w-4 rounded-full border" style={{ background: profile.primaryColor, borderColor: '#ffffff44' }} />{profile.primaryColor}</div></div><div className="rounded-2xl border p-4" style={{ borderColor: C.line, background: 'rgba(15,10,23,.7)' }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>Accent</div><div className="mt-2 flex items-center gap-2 text-sm font-black"><span className="h-4 w-4 rounded-full border" style={{ background: profile.secondaryColor, borderColor: '#ffffff44' }} />{profile.secondaryColor}</div></div></div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.green }}>Lean into</div><p className="mt-3 min-h-16 text-sm leading-6" style={{ color: C.cream }}>{profile.doNotes || 'Add reusable creative preferences so discovery and concept work do not start from zero.'}</p></div>
              <div className="rounded-3xl border p-5" style={{ background: C.panel, borderColor: C.line }}><div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: C.gold }}>Avoid</div><p className="mt-3 min-h-16 text-sm leading-6" style={{ color: C.cream }}>{profile.avoidNotes || 'Record the treatments, categories, or visual habits the customer does not want.'}</p></div>
            </section>

            <section className="rounded-3xl border p-5 sm:p-6" style={{ background: C.panel2, borderColor: C.line }}>
              <div className="flex items-center gap-2"><Wand2 className="h-5 w-5" style={{ color: C.gold }} /><h2 className="text-lg font-black">Carry this direction through SWAGR</h2></div>
              <p className="mt-2 text-xs leading-5" style={{ color: C.muted }}>Save first. Each destination reads the same session-local Brand Kit; no server identity or cross-program data copy is created.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><Link href="/swagr" className="rounded-2xl border p-4 focus:outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', '--tw-ring-color': C.purple }}><div className="text-sm font-black">Discovery experience →</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Carry brand name, logo reference, and visual direction into the primary brief and shortlist.</p></Link><Link href="/swagr/virtual" className="rounded-2xl border p-4 focus:outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', '--tw-ring-color': C.purple }}><div className="text-sm font-black">Concept Virtual Studio →</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Reuse the local brand reference on controlled synthetic placement recipes.</p></Link><Link href="/swagr/proposal" className="rounded-2xl border p-4 focus:outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', '--tw-ring-color': C.purple }}><div className="text-sm font-black">Proposal review →</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Carry the saved local identity into customer selection and change-review context.</p></Link><Link href="/swagr/library" className="rounded-2xl border p-4 focus:outline-none focus:ring-2" style={{ borderColor: C.line, background: '#0F0A17', '--tw-ring-color': C.purple }}><div className="text-sm font-black">Concept library →</div><p className="mt-1 text-[11px] leading-5" style={{ color: C.muted }}>Keep product discovery separate while the active campaign brief remains session-local.</p></Link></div>
            </section>

            <section className="rounded-3xl border p-5" style={{ background: `${C.green}08`, borderColor: `${C.green}44` }}><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.green }} /><div><div className="text-sm font-black" style={{ color: C.green }}>Controlled by design</div><p className="mt-1 text-xs leading-5" style={{ color: C.muted }}>The Brand Kit can make the experience more consistent; it cannot create a customer account, verify trademark rights, approve artwork, certify colors, send files, or authorize production.</p></div></div></section>
          </div>
        </section>
        <footer className="mt-8 border-t py-6 text-center text-[11px] leading-5" style={{ borderColor: C.line, color: C.muted }}>SWAGR AI · BRAND-001 session-local Brand Kit candidate · No server persistence · No external upload · No production authority</footer>
      </div>
    </main>
  );
}
