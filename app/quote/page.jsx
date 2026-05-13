'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator, Plus, Trash2, Download, Copy, Mail, FileText,
  Truck, Package, MapPin, AlertTriangle, AlertCircle, CheckCircle2,
  Zap, Clock, User, Building2, Hash, Calendar, ChevronDown, ChevronUp,
  Sparkles, TrendingUp, Info, Flame, ArrowDown, RefreshCw, Globe, DollarSign
} from 'lucide-react';

// ============================================================================
// FONTS + GLOBAL STYLES
// ============================================================================
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Fraunces:wght@500;600;700;900&display=swap');
    
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    
    .font-display { font-family: 'Fraunces', Georgia, serif; font-feature-settings: 'ss01' on; }
    .font-body { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
    .font-mono { font-family: 'IBM Plex Mono', monospace; }
    
    .terminal-grid {
      background-image: 
        linear-gradient(rgba(108, 71, 255, 0.4) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108, 71, 255, 0.4) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    
    .glow-purple { box-shadow: 0 0 24px rgba(108, 71, 255, 0.4); }
    .glow-gold { box-shadow: 0 0 16px rgba(245, 200, 66, 0.3); }
    
    textarea, input, select { font-family: 'IBM Plex Mono', monospace; }
    input[type='number'] { -moz-appearance: textfield; }
    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0f; }
    ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }
    
    @keyframes slide-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .slide-in { animation: slide-in 0.3s ease-out; }
    
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
  `}</style>
);

// ============================================================================
// BRAND CONFIG
// ============================================================================
const BRANDS = {
  Swagr: { 
    color: '#6C47FF', accent: '#F5C842', bg: '#F0EDE6', ink: '#1C1C1C',
    name: 'Swagr',
    sig: { line1: 'Braden Forge | Swagr', line2: 'sales@swagrshop.com', line3: 'swagrshop.com' },
    headerNote: 'All-inclusive pricing · No surprise fees',
  },
  ForgedGear: { 
    color: '#FF7A1A', accent: '#3D3D3D', bg: '#E8E5E0', ink: '#1A1A1A',
    name: 'ForgedGear',
    sig: { line1: 'Braden Forge | ForgedGear', line2: 'sales@swagrshop.com', line3: 'forgedgear.net' },
    headerNote: 'Crew gear · Built for the job',
  },
  ForgeEvents: { 
    color: '#F5C842', accent: '#6C47FF', bg: '#FFFBF0', ink: '#1C1C1C',
    name: 'ForgeEvents',
    sig: { line1: 'Braden Forge | ForgeEvents', line2: 'sales@swagrshop.com', line3: 'forgeevent.co' },
    headerNote: 'Event-ready · Deadline-aware',
  },
  Calibr: { 
    color: '#00D9B2', accent: '#1C1C1C', bg: '#F5F5F2', ink: '#1C1C1C',
    name: 'Calibr',
    sig: { line1: 'Braden Forge | Calibr', line2: 'sales@swagrshop.com', line3: 'getcalibr.co' },
    headerNote: 'Precision branded merchandise',
  },
  AYNP: { 
    color: '#1C1C1C', accent: '#C9A227', bg: '#FFFFFF', ink: '#1C1C1C',
    name: 'All You Need Promos',
    sig: { line1: 'Braden Forge', line2: 'All You Need Promos · ASI #117382', line3: 'allyouneedpromos.net' },
    headerNote: 'Promotional products since 1979',
  },
};

// ============================================================================
// FREIGHT LOOKUP — UPS Ground zones from Dallas/Garland, TX (75040)
// Approximate based on UPS published zone charts. Real production should use 
// the official UPS zone API.
// ============================================================================
const getZoneFromZip = (zipString) => {
  if (!zipString || zipString.length < 3) return null;
  const prefix = parseInt(zipString.substring(0, 3), 10);
  if (isNaN(prefix)) return null;
  
  // Origin: 750 (Garland TX). Mapping by destination 3-digit prefix.
  // Zones approximated from UPS Ground published rates.
  
  // Zone 2 — TX, parts of LA, OK, AR
  if ((prefix >= 750 && prefix <= 799) ||  // TX
      (prefix >= 700 && prefix <= 714) ||  // LA southern
      (prefix >= 730 && prefix <= 749)) {  // OK southern
    return 2;
  }
  
  // Zone 3 — OK, AR, LA, southern MO, NM east
  if ((prefix >= 716 && prefix <= 729) ||  // AR
      (prefix >= 715 && prefix <= 715) ||  // LA
      (prefix >= 880 && prefix <= 884) ||  // NM east
      (prefix >= 631 && prefix <= 658) ||  // MO west/central
      (prefix >= 660 && prefix <= 679)) {  // KS
    return 3;
  }
  
  // Zone 4 — KS, MO east, NM, CO east, MS, AL, GA west, IL south
  if ((prefix >= 386 && prefix <= 397) ||  // MS
      (prefix >= 350 && prefix <= 369) ||  // AL
      (prefix >= 600 && prefix <= 629) ||  // IL
      (prefix >= 800 && prefix <= 816) ||  // CO
      (prefix >= 870 && prefix <= 879) ||  // NM central
      (prefix >= 885 && prefix <= 885)) {
    return 4;
  }
  
  // Zone 5 — IA, IL, IN, KY, TN, GA, FL panhandle, WI south
  if ((prefix >= 460 && prefix <= 479) ||  // IN
      (prefix >= 400 && prefix <= 427) ||  // KY
      (prefix >= 370 && prefix <= 385) ||  // TN
      (prefix >= 300 && prefix <= 319) ||  // GA
      (prefix >= 320 && prefix <= 339) ||  // FL
      (prefix >= 500 && prefix <= 528) ||  // IA
      (prefix >= 530 && prefix <= 545) ||  // WI south
      (prefix >= 480 && prefix <= 499) ||  // MI
      (prefix >= 680 && prefix <= 693)) {  // NE east
    return 5;
  }
  
  // Zone 6 — OH, WV, VA, NC, SC, FL, AZ, UT, NE west, SD
  if ((prefix >= 430 && prefix <= 459) ||  // OH
      (prefix >= 247 && prefix <= 268) ||  // WV
      (prefix >= 220 && prefix <= 246) ||  // VA
      (prefix >= 270 && prefix <= 289) ||  // NC
      (prefix >= 290 && prefix <= 299) ||  // SC
      (prefix >= 850 && prefix <= 865) ||  // AZ
      (prefix >= 840 && prefix <= 847) ||  // UT
      (prefix >= 690 && prefix <= 693) ||  // NE
      (prefix >= 570 && prefix <= 577)) {  // SD
    return 6;
  }
  
  // Zone 7 — NJ, NY, PA, MD, DE, CT, RI, MA south, ND, WY, MT, NV, ID, CA inland
  if ((prefix >= 100 && prefix <= 199) ||  // NY/NJ
      (prefix >= 5 && prefix <= 98) ||  // NJ/CT/MA/NY
      (prefix >= 150 && prefix <= 196) ||  // PA
      (prefix >= 200 && prefix <= 219) ||  // MD/DC
      (prefix >= 60 && prefix <= 69) ||  // CT
      (prefix >= 28 && prefix <= 29) ||  // RI
      (prefix >= 580 && prefix <= 588) ||  // ND
      (prefix >= 820 && prefix <= 831) ||  // WY
      (prefix >= 590 && prefix <= 599) ||  // MT
      (prefix >= 895 && prefix <= 898) ||  // NV
      (prefix >= 832 && prefix <= 838) ||  // ID
      (prefix >= 935 && prefix <= 961)) {  // CA central/north
    return 7;
  }
  
  // Zone 8 — WA, OR, CA (south coast), ME, VT, NH, MA north, AK, HI
  if ((prefix >= 900 && prefix <= 934) ||  // CA south
      (prefix >= 970 && prefix <= 979) ||  // OR
      (prefix >= 980 && prefix <= 994) ||  // WA
      (prefix >= 30 && prefix <= 38) ||  // NH
      (prefix >= 50 && prefix <= 59) ||  // VT
      (prefix >= 40 && prefix <= 49) ||  // ME
      (prefix >= 10 && prefix <= 27) ||  // MA
      (prefix >= 995 && prefix <= 999)) {  // AK/HI
    return 8;
  }
  
  // Default to zone 5 if no match (middle ground)
  return 5;
};

// Approximate UPS Ground commercial rate based on weight + zone.
// Real rates vary by dimensional weight, fuel surcharge, residential, etc.
// These are baseline estimates — multiply by 1.5 per AYNP formula.
const estimateCarrierRate = (weightLbs, zone) => {
  if (!zone || weightLbs <= 0) return 0;
  
  // Base (1 lb) + per-pound additional, indexed by zone
  const base = { 2: 11, 3: 12, 4: 14, 5: 16, 6: 18, 7: 21, 8: 25 };
  const perLb = { 2: 0.42, 3: 0.52, 4: 0.62, 5: 0.74, 6: 0.86, 7: 1.2, 8: 1.18 };
  
  const b = base[zone] || 18;
  const p = perLb[zone] || 0.8;
  
  return Math.round((b + Math.max(0, weightLbs - 1) * p) * 100) / 100;
};

// ============================================================================
// WEIGHT DEFAULTS (lbs per unit, units per case)
// ============================================================================
const WEIGHT_DEFAULTS = {
  'T-shirt': { perUnit: 0.4, perCase: 72 },
  'Polo': { perUnit: 0.5, perCase: 48 },
  'Hoodie': { perUnit: 1.4, perCase: 24 },
  'Tumbler 20oz': { perUnit: 1.0, perCase: 24 },
  'Water bottle': { perUnit: 0.8, perCase: 24 },
  'Mug 11oz': { perUnit: 1.2, perCase: 36 },
  'Snapback/cap': { perUnit: 0.3, perCase: 48 },
  'Beanie': { perUnit: 0.15, perCase: 144 },
  'Tote bag': { perUnit: 0.4, perCase: 60 },
  'Backpack': { perUnit: 1.8, perCase: 12 },
  'Pen': { perUnit: 0.5, perCase: 500 },
  'Koozie': { perUnit: 0.5, perCase: 250 },
  'Hi-vis vest': { perUnit: 0.7, perCase: 36 },
  'Hard hat': { perUnit: 1.4, perCase: 12 },
  'Custom': { perUnit: 0.5, perCase: 48 },
};

// ============================================================================
// QUOTE CALCULATIONS
// ============================================================================
const calculateLineItem = (item, modifiers, destinationZip) => {
  const qty = parseInt(item.quantity, 10) || 0;
  const productCost = parseFloat(item.productCost) || 0;
  const setupFee = parseFloat(item.setupFee) || 0;
  const decorationCost = parseFloat(item.decorationCost) || 0;
  const weightPerUnit = parseFloat(item.weightPerUnit) || 0.5;
  const unitsPerCase = parseInt(item.unitsPerCase, 10) || 48;
  
  if (qty === 0) {
    return { perUnit: 0, lineTotal: 0, breakdown: null };
  }
  
  // Product
  const productTotal = productCost * qty;
  
  // Rush (25% on setup + decoration only)
  const rushMult = modifiers.isRush ? 1.25 : 1.0;
  const setupTotal = setupFee * rushMult;
  const decorationTotal = decorationCost * qty * rushMult;
  
  // Freight
  const cases = Math.ceil(qty / unitsPerCase);
  const totalWeight = Math.max(1, cases * unitsPerCase * weightPerUnit);
  const zone = destinationZip ? getZoneFromZip(destinationZip) : null;
  const carrierRate = zone ? estimateCarrierRate(totalWeight, zone) : 0;
  const freightTotal = carrierRate * 1.5; // AYNP markup
  
  // PSP handling
  const pspHandling = modifiers.isPSP ? 50 : 0;
  
  // Drop-ship handling ($5/additional address)
  const dropShipHandling = Math.max(0, (modifiers.dropShipCount || 1) - 1) * 5;
  
  // Subtotal and per-unit
  const lineTotal = productTotal + setupTotal + decorationTotal + freightTotal + pspHandling + dropShipHandling;
  const perUnit = Math.round((lineTotal / qty) * 100) / 100;
  
  return {
    perUnit,
    lineTotal: Math.round(lineTotal * 100) / 100,
    breakdown: {
      productTotal: Math.round(productTotal * 100) / 100,
      setupTotal: Math.round(setupTotal * 100) / 100,
      decorationTotal: Math.round(decorationTotal * 100) / 100,
      freightTotal: Math.round(freightTotal * 100) / 100,
      pspHandling,
      dropShipHandling,
      cases,
      totalWeight: Math.round(totalWeight * 10) / 10,
      zone,
      carrierRate: Math.round(carrierRate * 100) / 100,
      rushApplied: modifiers.isRush,
    },
  };
};

// Suggest quantity bumps that unlock better per-unit pricing
const suggestQuantityBumps = (item, modifiers, destinationZip) => {
  const currentQty = parseInt(item.quantity, 10) || 0;
  if (currentQty === 0) return [];
  
  // Standard break points
  const breaks = [48, 72, 100, 144, 250, 288, 500, 1000];
  const suggestions = [];
  
  const baseCalc = calculateLineItem(item, modifiers, destinationZip);
  if (!baseCalc.perUnit) return [];
  
  for (const breakQty of breaks) {
    if (breakQty <= currentQty) continue;
    if (breakQty > currentQty * 2.5) break; // don't suggest huge jumps
    
    const bumpedItem = { ...item, quantity: breakQty };
    const bumpedCalc = calculateLineItem(bumpedItem, modifiers, destinationZip);
    
    const savings = baseCalc.perUnit - bumpedCalc.perUnit;
    const savingsPct = (savings / baseCalc.perUnit) * 100;
    
    // Only surface if it's a meaningful saving (>5%)
    if (savingsPct >= 5) {
      suggestions.push({
        qty: breakQty,
        perUnit: bumpedCalc.perUnit,
        savingsPerUnit: Math.round(savings * 100) / 100,
        savingsPct: Math.round(savingsPct),
        totalSavings: Math.round(savings * breakQty * 100) / 100,
      });
      if (suggestions.length >= 2) break;
    }
  }
  
  return suggestions;
};

// ============================================================================
// ESCALATION DETECTION
// ============================================================================
const detectEscalations = (quote, totals) => {
  const flags = [];
  
  if (totals.subtotal >= 25000) {
    flags.push({ level: 'high', msg: `Order value $${totals.subtotal.toLocaleString()} crosses $25K — Swagr Elite territory. Braden should review before sending.` });
  }
  
  const namedAccounts = ['IES Holdings', 'Echelon', 'Reveel'];
  const customerCompany = (quote.customer.company || '').toLowerCase();
  const matchedAccount = namedAccounts.find(a => customerCompany.includes(a.toLowerCase()));
  if (matchedAccount) {
    flags.push({ level: 'high', msg: `Customer matches named priority account (${matchedAccount}). Braden review required.` });
  }
  
  if (quote.modifiers.isRush) {
    flags.push({ level: 'med', msg: 'Rush order — 25% applied to setup + decoration. Confirm timeline with supplier before committing.' });
  }
  
  if (quote.modifiers.dropShipCount > 1) {
    flags.push({ level: 'med', msg: `Drop-shipping to ${quote.modifiers.dropShipCount} addresses. Per-address $5 handling added. Confirm each address before PO.` });
  }
  
  // International ZIP detection (non-US format)
  if (quote.customer.destinationZip && !/^\d{5}/.test(quote.customer.destinationZip)) {
    flags.push({ level: 'high', msg: 'Destination ZIP does not look like a US ZIP. International freight is not covered by the standard formula — escalate.' });
  }
  
  return flags;
};

// ============================================================================
// SWAGR REWARD TIER DETECTION (orders ≥$500 unlock free gift)
// ============================================================================
const getSwagrRewardTier = (subtotal) => {
  if (subtotal >= 100000) return { tier: 'Anchor', perk: 'Anchor tier benefits — dedicated account team' };
  if (subtotal >= 50000) return { tier: 'Enterprise', perk: 'Enterprise tier benefits' };
  if (subtotal >= 25000) return { tier: 'Pro', perk: 'Swagr Pro tier benefits' };
  if (subtotal >= 10000) return { tier: '$10K Reward', perk: 'Top reward tier — premium free gift included' };
  if (subtotal >= 5000) return { tier: '$5K Reward', perk: 'Premium free gift included' };
  if (subtotal >= 2500) return { tier: '$2.5K Reward', perk: 'Free gift included' };
  if (subtotal >= 1000) return { tier: '$1K Reward', perk: 'Free gift included' };
  if (subtotal >= 500) return { tier: '$500 Reward', perk: 'Free gift included' };
  return null;
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Header = ({ brand, onBrandChange, lineItemCount }) => (
  <div className="border-b border-purple-900/40 bg-black/60 backdrop-blur sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-purple"
             style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #4A2DC4 100%)' }}>
          <Calculator className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-xl font-bold text-white tracking-tight leading-none">
            Quote Engine
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mt-1">
            HMH Holdings · All-Inclusive Pricing
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {lineItemCount > 0 && (
          <div className="font-mono text-xs flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider">Line items</span>
            <span className="text-white font-semibold">{lineItemCount}</span>
          </div>
        )}
        <select
          value={brand}
          onChange={e => onBrandChange(e.target.value)}
          className="bg-black/60 border border-purple-900/40 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-purple-500/60 cursor-pointer font-mono uppercase tracking-wider"
        >
          {Object.keys(BRANDS).map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

const CustomerForm = ({ customer, onChange }) => {
  const zone = customer.destinationZip ? getZoneFromZip(customer.destinationZip) : null;
  
  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
          Customer · prepared for
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">First name</label>
            <input
              value={customer.firstName}
              onChange={e => onChange({ ...customer, firstName: e.target.value })}
              placeholder="Jane"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Last name</label>
            <input
              value={customer.lastName}
              onChange={e => onChange({ ...customer, lastName: e.target.value })}
              placeholder="Doe"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
        </div>
        
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Company</label>
          <input
            value={customer.company}
            onChange={e => onChange({ ...customer, company: e.target.value })}
            placeholder="Acme Construction"
            className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
          />
        </div>
        
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Email</label>
          <input
            value={customer.email}
            onChange={e => onChange({ ...customer, email: e.target.value })}
            placeholder="jane@acme.com"
            className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Destination ZIP
            </label>
            <input
              value={customer.destinationZip}
              onChange={e => onChange({ ...customer, destinationZip: e.target.value })}
              placeholder="90210"
              maxLength={5}
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">UPS zone</label>
            <div className="bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs h-[34px] flex items-center">
              {zone ? (
                <span className="text-purple-300 font-mono">Zone {zone}</span>
              ) : (
                <span className="text-zinc-600 font-mono">—</span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block flex items-center gap-1">
            <Calendar className="w-3 h-3" /> In-hand date (estimated)
          </label>
          <input
            type="date"
            value={customer.inHandDate}
            onChange={e => onChange({ ...customer, inHandDate: e.target.value })}
            className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40"
          />
        </div>
      </div>
    </div>
  );
};

const ModifiersPanel = ({ modifiers, onChange }) => (
  <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
    <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
        Order modifiers
      </div>
    </div>
    <div className="p-4 space-y-3">
      <label className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-all ${
        modifiers.isRush ? 'bg-amber-950/30 border border-amber-700/40' : 'bg-black/40 border border-zinc-800/60'
      }`}>
        <input
          type="checkbox"
          checked={modifiers.isRush}
          onChange={e => onChange({ ...modifiers, isRush: e.target.checked })}
          className="w-4 h-4 accent-amber-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-white font-medium">Rush order</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-500">+25% on setup + decoration · production under 5 business days</div>
        </div>
      </label>
      
      <label className={`flex items-center gap-3 cursor-pointer p-2 rounded transition-all ${
        modifiers.isPSP ? 'bg-blue-950/30 border border-blue-700/40' : 'bg-black/40 border border-zinc-800/60'
      }`}>
        <input
          type="checkbox"
          checked={modifiers.isPSP}
          onChange={e => onChange({ ...modifiers, isPSP: e.target.checked })}
          className="w-4 h-4 accent-blue-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Package className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-white font-medium">PSP (customer supplies product)</span>
          </div>
          <div className="font-mono text-[10px] text-zinc-500">+$50 receiving/handling · set product cost to $0</div>
        </div>
      </label>
      
      <div className="bg-black/40 border border-zinc-800/60 rounded p-2">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs text-white font-medium">Drop-ship addresses</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={modifiers.dropShipCount}
            onChange={e => onChange({ ...modifiers, dropShipCount: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="w-20 bg-black/60 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-purple-500/40"
          />
          <span className="font-mono text-[10px] text-zinc-500">
            {modifiers.dropShipCount === 1 
              ? 'single ship-to address' 
              : `+$${(modifiers.dropShipCount - 1) * 5} handling for ${modifiers.dropShipCount} addresses`}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const LineItemEditor = ({ item, onUpdate, onDelete, modifiers, destinationZip, idx }) => {
  const [showCostInputs, setShowCostInputs] = useState(true);
  const calc = useMemo(() => calculateLineItem(item, modifiers, destinationZip), [item, modifiers, destinationZip]);
  const suggestions = useMemo(() => suggestQuantityBumps(item, modifiers, destinationZip), [item, modifiers, destinationZip]);

  const updateField = (field, value) => {
    const updated = { ...item, [field]: value };
    
    // Auto-populate weight defaults when product type changes
    if (field === 'productType' && WEIGHT_DEFAULTS[value]) {
      updated.weightPerUnit = WEIGHT_DEFAULTS[value].perUnit;
      updated.unitsPerCase = WEIGHT_DEFAULTS[value].perCase;
    }
    
    onUpdate(updated);
  };

  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 flex items-center gap-2">
          <Hash className="w-3 h-3" /> Line item {idx + 1}
          {item.productName && <span className="text-zinc-500 normal-case">· {item.productName}</span>}
        </div>
        <button onClick={onDelete} className="text-zinc-500 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Product line */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-6">
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Product name</label>
            <input
              value={item.productName}
              onChange={e => updateField('productName', e.target.value)}
              placeholder="Port Authority K500 Polo"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div className="col-span-3">
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Type</label>
            <select
              value={item.productType}
              onChange={e => updateField('productType', e.target.value)}
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-2 py-2 text-xs text-white outline-none focus:border-purple-500/40 cursor-pointer"
            >
              {Object.keys(WEIGHT_DEFAULTS).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-3">
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Color</label>
            <input
              value={item.color}
              onChange={e => updateField('color', e.target.value)}
              placeholder="Navy"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
        </div>
        
        {/* Qty + Decoration */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3">
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Quantity</label>
            <input
              type="number"
              value={item.quantity}
              onChange={e => updateField('quantity', e.target.value)}
              placeholder="100"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div className="col-span-5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Decoration</label>
            <select
              value={item.decorationMethod}
              onChange={e => updateField('decorationMethod', e.target.value)}
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40 cursor-pointer"
            >
              <option value="">Method...</option>
              <option value="Embroidery">Embroidery</option>
              <option value="Screen print">Screen print</option>
              <option value="DTF / Heat transfer">DTF / Heat transfer</option>
              <option value="Sublimation">Sublimation</option>
              <option value="Laser engraving">Laser engraving</option>
              <option value="Pad print">Pad print</option>
              <option value="UV print">UV print</option>
            </select>
          </div>
          <div className="col-span-4">
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Placement</label>
            <input
              value={item.placement}
              onChange={e => updateField('placement', e.target.value)}
              placeholder="Left chest, 3 in"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
        </div>
        
        {/* Cost inputs toggle */}
        <button
          onClick={() => setShowCostInputs(!showCostInputs)}
          className="w-full flex items-center justify-between px-3 py-2 bg-black/40 border border-zinc-800/60 rounded text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-wider"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" /> Internal costs · for calculation
          </span>
          {showCostInputs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        
        {showCostInputs && (
          <div className="space-y-2 bg-amber-950/10 border border-amber-900/30 rounded p-3 slide-in">
            <div className="font-mono text-[9px] uppercase tracking-wider text-amber-400/80 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3 h-3" /> Internal only · never shown to customer
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">
                  {modifiers.isPSP ? 'Product cost (PSP=$0)' : 'Product cost/unit'}
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="0.1"
                    value={item.productCost}
                    onChange={e => updateField('productCost', e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-black/40 border border-zinc-800/60 rounded pl-5 pr-2 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Setup fee</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="0.1"
                    value={item.setupFee}
                    onChange={e => updateField('setupFee', e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-black/40 border border-zinc-800/60 rounded pl-5 pr-2 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Decoration/unit</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                  <input
                    type="number"
                    step="0.1"
                    value={item.decorationCost}
                    onChange={e => updateField('decorationCost', e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-black/40 border border-zinc-800/60 rounded pl-5 pr-2 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Weight/unit (lb)</label>
                <input
                  type="number"
                  step="0.5"
                  value={item.weightPerUnit}
                  onChange={e => updateField('weightPerUnit', e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800/60 rounded px-2 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Units per case</label>
                <input
                  type="number"
                  value={item.unitsPerCase}
                  onChange={e => updateField('unitsPerCase', e.target.value)}
                  className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">SKU (optional)</label>
                <input
                  value={item.sku}
                  onChange={e => updateField('sku', e.target.value)}
                  placeholder="K500-NVY"
                  className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Calculation breakdown */}
        {calc.perUnit > 0 && calc.breakdown && (
          <div className="bg-black/40 border border-purple-700/30 rounded p-3 space-y-2 slide-in">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Per-unit (customer-facing)</div>
                <div className="font-display text-3xl font-bold text-white mt-1">
                  ${calc.perUnit.toFixed(2)}
                  <span className="font-mono text-xs text-zinc-500 ml-2">all-inclusive</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Line total</div>
                <div className="font-display text-xl font-semibold text-purple-300 mt-1">
                  ${calc.lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            
            <details className="border-t border-zinc-800/60 pt-2">
              <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2">
                <ChevronDown className="w-3 h-3" /> Internal breakdown
              </summary>
              <div className="mt-2 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between text-zinc-400"><span>Product</span><span>${calc.breakdown.productTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-400"><span>Setup{calc.breakdown.rushApplied && ' (1.25× rush)'}</span><span>${calc.breakdown.setupTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-400"><span>Decoration{calc.breakdown.rushApplied && ' (1.25× rush)'}</span><span>${calc.breakdown.decorationTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-400">
                  <span>Freight (Zone {calc.breakdown.zone || '—'} · {calc.breakdown.totalWeight} lb · {calc.breakdown.cases} case{calc.breakdown.cases !== 1 && 's'}) × 1.5</span>
                  <span>${calc.breakdown.freightTotal.toFixed(2)}</span>
                </div>
                {calc.breakdown.pspHandling > 0 && (
                  <div className="flex justify-between text-zinc-400"><span>PSP handling</span><span>${calc.breakdown.pspHandling.toFixed(2)}</span></div>
                )}
                {calc.breakdown.dropShipHandling > 0 && (
                  <div className="flex justify-between text-zinc-400"><span>Drop-ship handling</span><span>${calc.breakdown.dropShipHandling.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between text-zinc-300 pt-1 border-t border-zinc-800/60 font-semibold"><span>Subtotal</span><span>${calc.lineTotal.toFixed(2)}</span></div>
              </div>
            </details>
            
            {/* Quantity bump suggestions */}
            {suggestions.length > 0 && (
              <div className="border-t border-zinc-800/60 pt-2 space-y-1.5">
                <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Better per-unit available
                </div>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => updateField('quantity', String(s.qty))}
                    className="w-full text-left bg-amber-950/30 hover:bg-amber-950/50 border border-amber-700/30 rounded p-2 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs text-amber-200">
                        Bump to <span className="font-bold">{s.qty}</span> units → ${s.perUnit.toFixed(2)}/each
                      </div>
                      <div className="font-mono text-[10px] text-emerald-400">
                        save ${s.savingsPerUnit.toFixed(2)}/unit ({s.savingsPct}%)
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const QuoteSummary = ({ quote, totals, brand, flags, rewardTier }) => {
  const b = BRANDS[brand];
  
  return (
    <div className="bg-zinc-950/80 border-2 rounded-lg overflow-hidden sticky top-32" style={{ borderColor: `${b.color}60` }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ background: `${b.color}10`, borderColor: `${b.color}40` }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: b.color }}>
          <div className="w-1.5 h-1.5 rounded-full pulse-soft" style={{ background: b.color }} />
          {brand} · Quote summary
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Subtotal</div>
          <div className="font-display text-4xl font-bold text-white">
            ${totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="font-mono text-[10px] text-zinc-500 mt-1">+ tax · {totals.totalUnits} units across {quote.lineItems.length} line item{quote.lineItems.length !== 1 && 's'}</div>
        </div>
        
        {quote.lineItems.filter(li => parseInt(li.quantity, 10) > 0).map(li => {
          const c = calculateLineItem(li, quote.modifiers, quote.customer.destinationZip);
          return (
            <div key={li.id} className="bg-black/40 border border-zinc-800/60 rounded p-2.5 space-y-1">
              <div className="font-mono text-[11px] text-white truncate">
                {li.productName || 'Unnamed product'}
              </div>
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-zinc-500">{li.quantity} × ${c.perUnit.toFixed(2)}</span>
                <span className="text-zinc-300">${c.lineTotal.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
        
        {/* Reward tier (Swagr only) */}
        {brand === 'Swagr' && rewardTier && (
          <div className="bg-amber-500/10 border border-amber-500/40 rounded p-2.5 glow-gold">
            <div className="font-mono text-[10px] uppercase tracking-wider text-amber-300 flex items-center gap-1 mb-1">
              <Sparkles className="w-3 h-3" /> {rewardTier.tier}
            </div>
            <div className="text-xs text-amber-100">{rewardTier.perk}</div>
          </div>
        )}
        
        {/* Escalation flags */}
        {flags.length > 0 && (
          <div className="space-y-2 border-t border-zinc-800/60 pt-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Review before sending
            </div>
            {flags.map((f, i) => (
              <div
                key={i}
                className={`rounded p-2.5 border ${
                  f.level === 'high' ? 'bg-red-950/30 border-red-700/40' : 'bg-amber-950/30 border-amber-700/40'
                }`}
              >
                <div className={`font-mono text-[10px] uppercase tracking-wider mb-1 ${
                  f.level === 'high' ? 'text-red-300' : 'text-amber-300'
                }`}>
                  {f.level === 'high' ? 'High priority' : 'Heads up'}
                </div>
                <div className={`text-xs ${f.level === 'high' ? 'text-red-100' : 'text-amber-100'}`}>{f.msg}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

const buildEmailBody = (quote, totals, brand, rewardTier) => {
  const b = BRANDS[brand];
  const customer = quote.customer;
  const firstName = customer.firstName || 'there';
  
  const lineItemDescriptions = quote.lineItems.filter(li => parseInt(li.quantity, 10) > 0).map(li => {
    const c = calculateLineItem(li, quote.modifiers, customer.destinationZip);
    const decoration = li.decorationMethod ? li.decorationMethod.toLowerCase() : 'decoration';
    const placement = li.placement || 'standard placement';
    return `${li.quantity} ${li.productName || 'units'} ${li.color ? `(${li.color}) ` : ''}with ${decoration} on ${placement} — $${c.perUnit.toFixed(2)} each, all-inclusive`;
  });
  
  const inHandLine = customer.inHandDate 
    ? `\nEstimated in-hand: ${new Date(customer.inHandDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\nProduction: ~5-10 business days from art approval`
    : '\nProduction: ~5-10 business days from art approval';
  
  let bodyOpener = '';
  let bodyClose = '';
  
  switch (brand) {
    case 'Swagr':
      bodyOpener = `Hey ${firstName},\n\nHere's pricing on that:\n`;
      bodyClose = `Pricing is all-inclusive — setup, decoration, and freight to ${customer.destinationZip || 'your address'} are baked in. Tax adds at checkout.\n\n${rewardTier ? `Heads up: this hits the ${rewardTier.tier} — ${rewardTier.perk.toLowerCase()}.\n\n` : ''}Reply "go" and I'll get this locked in. Happy to send a mockup first if you want to see it.`;
      break;
    case 'ForgedGear':
      bodyOpener = `${firstName} —\n\nQuote on the gear:\n`;
      bodyClose = `All-inclusive — setup, decoration, freight to ${customer.destinationZip || 'site'} all baked in. Tax adds at checkout.\n\nReady to lock it in or want to see a mockup first?`;
      break;
    case 'ForgeEvents':
      bodyOpener = `Hey ${firstName},\n\nHere's pricing for the event:\n`;
      bodyClose = `Pricing is all-inclusive — setup, decoration, and freight to ${customer.destinationZip || 'venue'} included. Tax adds at checkout.\n${customer.inHandDate ? `\nWe're in good shape on timeline for your ${new Date(customer.inHandDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} date.\n` : ''}\nReady to lock it in?`;
      break;
    default:
      bodyOpener = `Hi ${firstName},\n\nThanks for reaching out. Here's pricing:\n`;
      bodyClose = `Pricing is all-inclusive — setup, decoration, and freight to ${customer.destinationZip || 'your address'} are included. Tax is the only thing added at checkout.\n\nHappy to send a mockup before you commit. Let me know how you'd like to move forward.`;
  }
  
  return `${bodyOpener}
${lineItemDescriptions.map(d => `· ${d}`).join('\n')}

Total: $${totals.subtotal.toFixed(2)} + tax
${inHandLine}

${bodyClose}

Thanks,
${b.sig.line1}
${b.sig.line2}
${b.sig.line3}`;
};

const generatePDF = ({ quote, totals, brand, rewardTier }) => {
  const b = BRANDS[brand];
  const customer = quote.customer;
  const quoteNumber = `Q-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 900 + 100)}`;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked. Allow pop-ups for this tool to export PDFs.');
    return;
  }
  
  const lineItemsHTML = quote.lineItems.filter(li => parseInt(li.quantity, 10) > 0).map(li => {
    const c = calculateLineItem(li, quote.modifiers, customer.destinationZip);
    return `
      <tr>
        <td class="cell-main">
          <div class="product-name">${li.productName || 'Custom product'}</div>
          <div class="product-meta">
            ${li.color ? `${li.color} · ` : ''}
            ${li.decorationMethod || 'Custom decoration'}
            ${li.placement ? ` · ${li.placement}` : ''}
          </div>
        </td>
        <td class="cell-num">${li.quantity}</td>
        <td class="cell-num">$${c.perUnit.toFixed(2)}</td>
        <td class="cell-num cell-total">$${c.lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${quoteNumber} — ${customer.company || customer.firstName} ${customer.lastName} — ${b.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Fraunces:wght@500;600;700;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    background: ${b.bg};
    color: ${b.ink};
  }
  
  .page {
    width: 8.5in;
    min-height: 11in;
    padding: 0.6in;
    margin: 0 auto;
    background: ${b.bg};
  }
  
  .header {
    border-bottom: 3px solid ${b.color};
    padding-bottom: 20px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  .brand-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 32px;
    color: ${b.color};
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 6px;
  }
  
  .brand-tagline {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${b.ink};
    opacity: 0.6;
  }
  
  .header-right {
    text-align: right;
  }
  
  .quote-number {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${b.color};
    margin-bottom: 4px;
  }
  
  .quote-date {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 14px;
    font-weight: 500;
  }
  
  .quote-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 28px;
  }
  
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    background: rgba(255,255,255,0.6);
    border: 1px solid rgba(0,0,0,0.8);
    border-radius: 6px;
    padding: 20px 24px;
    margin-bottom: 32px;
  }
  
  .meta-block .label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${b.color};
    margin-bottom: 4px;
  }
  
  .meta-block .value {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
  }
  
  .meta-block .sub {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 11px;
    color: ${b.ink};
    opacity: 0.7;
    margin-top: 2px;
  }
  
  .section-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${b.color};
    margin-bottom: 14px;
  }
  
  table.line-items {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  }
  
  table.line-items thead th {
    background: ${b.color};
    color: ${b.bg};
    padding: 12px 16px;
    text-align: left;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 500;
  }
  
  table.line-items thead th.cell-num {
    text-align: right;
  }
  
  table.line-items tbody td {
    padding: 16px;
    border-bottom: 1px solid rgba(0,0,0,0.6);
  }
  
  table.line-items tbody tr:last-child td {
    border-bottom: none;
  }
  
  .product-name {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .product-meta {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${b.ink};
    opacity: 0.6;
  }
  
  .cell-num {
    text-align: right;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 500;
    vertical-align: top;
    white-space: nowrap;
  }
  
  .cell-total {
    color: ${b.color};
    font-weight: 600;
  }
  
  .totals {
    margin-left: auto;
    width: 60%;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    margin-bottom: 32px;
  }
  
  .totals .row {
    display: flex;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(0,0,0,0.6);
  }
  
  .totals .row:last-child { border-bottom: none; }
  
  .totals .row.subtotal {
    background: ${b.color};
    color: ${b.bg};
    font-family: 'Fraunces', Georgia, serif;
    font-size: 22px;
    font-weight: 700;
  }
  
  .totals .row .label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    align-self: center;
  }
  
  .totals .row .value {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 500;
    align-self: center;
  }
  
  .totals .row.subtotal .label,
  .totals .row.subtotal .value {
    font-family: 'Fraunces', Georgia, serif;
    text-transform: none;
    letter-spacing: 0;
    font-size: 22px;
  }
  
  .all-inclusive-callout {
    background: ${b.color};
    color: ${b.bg};
    padding: 18px 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .all-inclusive-callout .icon {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
  }
  
  .all-inclusive-callout .text {
    flex: 1;
  }
  
  .all-inclusive-callout .text .head {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  .all-inclusive-callout .text .sub {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 12px;
    opacity: 0.85;
  }
  
  .reward-tier {
    background: ${b.accent};
    color: ${b.ink};
    padding: 14px 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  
  .reward-tier .badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    background: ${b.ink};
    color: ${b.accent};
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 600;
  }
  
  .reward-tier .text {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 14px;
    font-weight: 500;
  }
  
  .terms {
    border-top: 1px solid rgba(0,0,0,0.1);
    padding-top: 20px;
    margin-bottom: 32px;
  }
  
  .terms-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .terms-block .label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${b.color};
    margin-bottom: 4px;
  }
  
  .terms-block .value {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 12px;
    line-height: 1.5;
  }
  
  .approval-section {
    background: white;
    border: 2px dashed ${b.color}40;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .approval-section .head {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${b.color};
    margin-bottom: 16px;
  }
  
  .approval-section .fields {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 32px;
  }
  
  .approval-section .field-line {
    border-bottom: 1px solid ${b.ink};
    min-height: 36px;
    margin-bottom: 4px;
  }
  
  .approval-section .field-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${b.ink};
    opacity: 0.6;
  }
  
  .footer {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 2px solid ${b.color};
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  
  .footer .signature {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 12px;
    line-height: 1.5;
  }
  
  .footer .signature .name {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  .footer .right {
    text-align: right;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${b.ink};
    opacity: 0.6;
    line-height: 1.6;
  }
  
  @media print {
    @page { margin: 0; size: letter; }
    body { background: ${b.bg}; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<div class="no-print" style="position:fixed;top:16px;right:16px;z-index:1000;background:#1C1C1C;color:white;padding:12px 18px;border-radius:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;border:none;box-shadow:0 4px 16px rgba(0,0,0,0.2);" onclick="window.print()">
  ⌘P · Save as PDF
</div>

<div class="page">
  <div class="header">
    <div>
      <div class="brand-mark">${b.name}</div>
      <div class="brand-tagline">${b.headerNote}</div>
    </div>
    <div class="header-right">
      <div class="quote-number">${quoteNumber}</div>
      <div class="quote-date">${today}</div>
    </div>
  </div>
  
  <div class="quote-title">Quote</div>
  
  <div class="meta-grid">
    <div class="meta-block">
      <div class="label">Prepared for</div>
      <div class="value">${customer.firstName} ${customer.lastName}</div>
      <div class="sub">${customer.company || ''}</div>
      <div class="sub">${customer.email || ''}</div>
    </div>
    <div class="meta-block">
      <div class="label">Ship to</div>
      <div class="value">ZIP ${customer.destinationZip || '—'}</div>
      <div class="sub">${quote.modifiers.dropShipCount > 1 ? `${quote.modifiers.dropShipCount} addresses` : 'Single address'}</div>
    </div>
    <div class="meta-block">
      <div class="label">${customer.inHandDate ? 'In-hand by' : 'Production'}</div>
      <div class="value">${customer.inHandDate ? new Date(customer.inHandDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '5-10 biz days'}</div>
      <div class="sub">from art approval${quote.modifiers.isRush ? ' · RUSH' : ''}</div>
    </div>
  </div>
  
  <div class="section-label">Line items</div>
  
  <table class="line-items">
    <thead>
      <tr>
        <th>Product</th>
        <th class="cell-num">Qty</th>
        <th class="cell-num">Per unit</th>
        <th class="cell-num">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHTML}
    </tbody>
  </table>
  
  <div class="totals">
    <div class="row">
      <div class="label">Subtotal (all-inclusive)</div>
      <div class="value">$${totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="row">
      <div class="label">Sales tax</div>
      <div class="value">+ tax at checkout</div>
    </div>
    <div class="row subtotal">
      <div class="label">Total due</div>
      <div class="value">$${totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} + tax</div>
    </div>
  </div>
  
  <div class="all-inclusive-callout">
    <div class="icon">✓</div>
    <div class="text">
      <div class="head">All-inclusive pricing</div>
      <div class="sub">Setup, decoration, and freight to ZIP ${customer.destinationZip || 'your address'} are baked in. No surprise fees at checkout.</div>
    </div>
  </div>
  
  ${brand === 'Swagr' && rewardTier ? `
  <div class="reward-tier">
    <div class="badge">${rewardTier.tier}</div>
    <div class="text">${rewardTier.perk}</div>
  </div>
  ` : ''}
  
  <div class="terms">
    <div class="terms-grid">
      <div class="terms-block">
        <div class="label">Quote valid</div>
        <div class="value">30 days · through ${validUntil}</div>
      </div>
      <div class="terms-block">
        <div class="label">Production timeline</div>
        <div class="value">5-10 business days from art approval${quote.modifiers.isRush ? ' (rush: under 5 biz days)' : ''}</div>
      </div>
      <div class="terms-block">
        <div class="label">Payment terms</div>
        <div class="value">50% deposit on approval · balance before shipping</div>
      </div>
    </div>
  </div>
  
  <div class="approval-section">
    <div class="head">Approval to proceed</div>
    <div class="fields">
      <div>
        <div class="field-line"></div>
        <div class="field-label">Signed by</div>
      </div>
      <div>
        <div class="field-line"></div>
        <div class="field-label">Date</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <div class="signature">
      <div class="name">${b.sig.line1}</div>
      <div>${b.sig.line2}</div>
      <div>${b.sig.line3}</div>
    </div>
    <div class="right">
      Quote ${quoteNumber}<br>
      ${b.name}
    </div>
  </div>
</div>

</body>
</html>
`;
  
  win.document.write(html);
  win.document.close();
};

// ============================================================================
// ROOT
// ============================================================================
export default function App() {
  const [brand, setBrand] = useState('Swagr');
  const [customer, setCustomer] = useState({
    firstName: '', lastName: '', company: '', email: '', destinationZip: '', inHandDate: '',
  });
  const [modifiers, setModifiers] = useState({
    isRush: false, isPSP: false, dropShipCount: 1,
  });
  const [lineItems, setLineItems] = useState([
    {
      id: `li-${Date.now()}`,
      productName: '', productType: 'T-shirt', color: '', sku: '',
      quantity: '', decorationMethod: '', placement: '',
      productCost: '', setupFee: '', decorationCost: '',
      weightPerUnit: WEIGHT_DEFAULTS['T-shirt'].perUnit,
      unitsPerCase: WEIGHT_DEFAULTS['T-shirt'].perCase,
    }
  ]);
  const [copied, setCopied] = useState(false);

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalUnits = 0;
    lineItems.forEach(li => {
      const c = calculateLineItem(li, modifiers, customer.destinationZip);
      subtotal += c.lineTotal;
      totalUnits += parseInt(li.quantity, 10) || 0;
    });
    return { 
      subtotal: Math.round(subtotal * 100) / 100, 
      totalUnits,
    };
  }, [lineItems, modifiers, customer.destinationZip]);

  const quote = { customer, modifiers, lineItems };
  
  const flags = useMemo(() => detectEscalations(quote, totals), [quote, totals]);
  const rewardTier = useMemo(() => brand === 'Swagr' ? getSwagrRewardTier(totals.subtotal) : null, [brand, totals.subtotal]);
  
  const addLineItem = () => {
    setLineItems([...lineItems, {
      id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productName: '', productType: 'T-shirt', color: '', sku: '',
      quantity: '', decorationMethod: '', placement: '',
      productCost: '', setupFee: '', decorationCost: '',
      weightPerUnit: WEIGHT_DEFAULTS['T-shirt'].perUnit,
      unitsPerCase: WEIGHT_DEFAULTS['T-shirt'].perCase,
    }]);
  };
  
  const updateLineItem = (id, updated) => {
    setLineItems(lineItems.map(li => li.id === id ? updated : li));
  };
  
  const deleteLineItem = (id) => {
    if (lineItems.length === 1) return; // Always keep at least one
    setLineItems(lineItems.filter(li => li.id !== id));
  };
  
  const handleCopyEmail = async () => {
    const body = buildEmailBody(quote, totals, brand, rewardTier);
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePDF = () => generatePDF({ quote, totals, brand, rewardTier });
  
  const hasValidLineItems = lineItems.some(li => parseInt(li.quantity, 10) > 0 && parseFloat(li.productCost) >= 0);
  const canExport = hasValidLineItems && customer.firstName && totals.subtotal > 0;

  return (
    <div className="min-h-screen bg-black text-white font-body terminal-grid">
      <FontStyles />
      <Header brand={brand} onBrandChange={setBrand} lineItemCount={lineItems.length} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {totals.subtotal === 0 && (
          <div className="text-center py-8 mb-4">
            <h2 className="font-display text-4xl font-bold text-white mb-3 tracking-tight">
              Build a quote. All-inclusive in seconds.
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Enter customer info, line items, and costs. The engine applies the AYNP formula (product + setup + decoration + freight × 1.5 ÷ qty), surfaces quantity-break opportunities, and flags any escalations before you send.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT — inputs */}
          <div className="col-span-8 space-y-4">
            <CustomerForm customer={customer} onChange={setCustomer} />
            <ModifiersPanel modifiers={modifiers} onChange={setModifiers} />
            
            <div className="space-y-3">
              {lineItems.map((li, idx) => (
                <LineItemEditor
                  key={li.id}
                  item={li}
                  idx={idx}
                  onUpdate={(updated) => updateLineItem(li.id, updated)}
                  onDelete={() => deleteLineItem(li.id)}
                  modifiers={modifiers}
                  destinationZip={customer.destinationZip}
                />
              ))}
            </div>
            
            <button
              onClick={addLineItem}
              className="w-full px-4 py-3.5 bg-zinc-950/40 hover:bg-zinc-900/60 border-2 border-dashed border-purple-900/40 hover:border-purple-700/60 rounded-lg text-zinc-400 hover:text-purple-300 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add line item
            </button>
          </div>
          
          {/* RIGHT — summary + export */}
          <div className="col-span-4 space-y-4">
            <QuoteSummary 
              quote={quote} 
              totals={totals} 
              brand={brand} 
              flags={flags}
              rewardTier={rewardTier}
            />
            
            {canExport && (
              <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg p-4 space-y-2 sticky top-[480px]">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-2">
                  Export
                </div>
                <button
                  onClick={handleCopyEmail}
                  className={`w-full px-4 py-2.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    copied 
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40' 
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800'
                  }`}
                >
                  {copied ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Email copied to clipboard</>
                  ) : (
                    <><Mail className="w-3.5 h-3.5" /> Copy as email</>
                  )}
                </button>
                <button
                  onClick={handlePDF}
                  className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2 glow-purple"
                >
                  <FileText className="w-3.5 h-3.5" /> Generate PDF quote
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
