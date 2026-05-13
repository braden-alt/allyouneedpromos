'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  Upload, Sparkles, CheckCircle2, XCircle, Edit3, Download,
  ArrowRight, RefreshCw, AlertCircle, Trash2, ChevronRight,
  Building2, User, Mail, Globe, Loader2, FileText, Zap
} from 'lucide-react';

// ============================================================================
// FONT INJECTION
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
        linear-gradient(rgba(108, 71, 255, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108, 71, 255, 0.04) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    
    .scanline {
      position: relative;
      overflow: hidden;
    }
    .scanline::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, transparent 0%, rgba(108, 71, 255, 0.03) 50%, transparent 100%);
      pointer-events: none;
      animation: scan 8s linear infinite;
    }
    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    
    .glow { box-shadow: 0 0 24px rgba(108, 71, 255, 0.4); }
    
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
    
    textarea, input { font-family: 'IBM Plex Mono', monospace; }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0f; }
    ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }
  `}</style>
);

// ============================================================================
// BRAND CONFIG
// ============================================================================
const BRANDS = {
  Swagr: { color: '#6C47FF', label: 'Swagr', desc: 'SMB / startup swag' },
  ForgedGear: { color: '#FF7A1A', label: 'ForgedGear', desc: 'Trades / industrial' },
  ForgeEvents: { color: '#F5C842', label: 'ForgeEvents', desc: 'Events / hospitality' },
  Calibr: { color: '#00D9B2', label: 'Calibr', desc: 'Precision / performance' },
  AYNP: { color: '#E6E1D4', label: 'AYNP', desc: 'Distributor / large corp' },
  'HM Vertex': { color: '#A0A0C0', label: 'HM Vertex', desc: 'Procurement consulting' },
  ForgeNova: { color: '#6FA8DC', label: 'ForgeNova', desc: 'Freight consulting' },
};

// ============================================================================
// PROMPT BUILDER
// ============================================================================
const buildPrompt = (lead) => `You are Braden Forge's outbound email engine for HMH Holdings (parent of Swagr, ForgedGear, ForgeEvents, Calibr, AYNP, HM Vertex Group, ForgeNova).

For the lead below: (1) pick the right HMH brand, (2) write a complete 4-email cold sequence.

# Brand selection logic
- B2B SaaS, startup, SMB tech, 20-500 employees → Swagr
- Construction, trades, electrical, MEP, industrial, contractors → ForgedGear
- Events, conferences, weddings, hospitality, planners → ForgeEvents
- Enterprise CFO/VP Procurement/large company indirect spend → HM Vertex
- Logistics, freight-heavy, shipping over $100K/yr → ForgeNova
- ASI distributor or established large corporate buyer → AYNP
- Manufacturing, tech hardware, precision industries → Calibr
- Unclear / no strong signal → Swagr (broadest)

# Brand voices (compressed)
- **Swagr**: fast, modern, humor-forward, casual. Says "swag" not "promotional products". Contractions. One light joke max.
- **ForgedGear**: industrial, no-fluff, trades respect. No corporate language. References job sites, durability, crew gear.
- **ForgeEvents**: energetic, deadline-aware. Leads with the event date.
- **Calibr**: precise, measured, performance-focused.
- **HM Vertex**: executive peer-to-peer, data-led. "We typically find 18-22% recoverable spend in 30 days."
- **ForgeNova**: freight specialist, technical. References carrier rates, accessorials.
- **AYNP**: industry-veteran professional, warm.

# Universal voice rules (ALL brands)
- No "hope this finds you well" / "circling back" / "checking in" / "just wanted to"
- No "premium quality" / "best-in-class" / "elevate your brand"
- Contractions everywhere
- Specific opener referencing their actual company (use the website, industry, or title signals)
- One differentiator, not three
- Small ask (10-min call, sample quote, single yes/no question)
- Email signature: "Braden Forge | [Brand]"
- For ALL brands except AYNP: signature email is sales@swagrshop.com

# The 4-email sequence
- Email 1 (Day 0, Intro): 60-90 words. Specific opener → bridge → offer → small ask.
- Email 2 (Day 4, Value): 60-90 words. NOT "checking in." Add new info or angle. Soft ask.
- Email 3 (Day 8, Case study): 70-100 words. "A company like yours did X, got Y result." Make it plausible — if no real case study, use "Most contractors at your scale" framing.
- Email 4 (Day 14, Breakup): 50-70 words. Graceful exit. Door open. Highest reply rate of the sequence.

# Subject line rules
- 30-50 chars
- Never "RE:", never "Following up", never ALL CAPS, never emoji for B2B
- Each subject must work standalone (recipients see only that)

# Differentiators by brand (use ONE per email)
- Swagr / ForgedGear / Calibr / AYNP / ForgeEvents: all-inclusive pricing (setup, decoration, freight baked in)
- HM Vertex: 30-day spend audit, no-risk pricing, recover 15-25%
- ForgeNova: freight invoice review, accessorial leak detection

# LEAD DATA
Name: ${lead.firstName} ${lead.lastName}
Title: ${lead.title || 'Unknown'}
Company: ${lead.company}
Email: ${lead.email}
Website: ${lead.website || 'Unknown'}
Industry: ${lead.industry || 'Unknown'}
Company size: ${lead.employees || 'Unknown'}
Location: ${lead.location || 'Unknown'}

# OUTPUT
Return ONLY valid JSON, no preamble, no markdown fences. Schema:

{
  "brand": "Swagr|ForgedGear|ForgeEvents|Calibr|AYNP|HM Vertex|ForgeNova",
  "rationale": "1 short sentence why this brand fits this lead",
  "personalization_hook": "the specific detail the sequence anchors on",
  "emails": [
    {"day": 0, "subject": "...", "body": "..."},
    {"day": 4, "subject": "...", "body": "..."},
    {"day": 8, "subject": "...", "body": "..."},
    {"day": 14, "subject": "...", "body": "..."}
  ]
}`;

// ============================================================================
// API CALLER
// ============================================================================
const generateSequence = async (lead) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: buildPrompt(lead) }],
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`API error ${response.status}: ${txt.slice(0, 200)}`);
  }

  const data = await response.json();
  const textBlocks = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Strip any markdown fences just in case
  const cleaned = textBlocks.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
};

// ============================================================================
// CSV PARSING — flexible column matching for Apollo exports
// ============================================================================
const normalizeColumn = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const findCol = (row, patterns) => {
  const keys = Object.keys(row);
  for (const pattern of patterns) {
    const match = keys.find(k => normalizeColumn(k).includes(pattern));
    if (match && row[match]) return row[match];
  }
  return '';
};

const parseLeadRow = (row) => ({
  firstName: findCol(row, ['firstname']),
  lastName: findCol(row, ['lastname']),
  title: findCol(row, ['title', 'jobtitle']),
  company: findCol(row, ['company', 'companyname', 'account']),
  email: findCol(row, ['email']),
  website: findCol(row, ['website', 'companywebsite', 'domain', 'url']),
  industry: findCol(row, ['industry']),
  employees: findCol(row, ['employees', 'companysize', 'headcount']),
  location: findCol(row, ['companycity', 'city', 'companylocation', 'location']),
  linkedin: findCol(row, ['linkedin', 'personlinkedin']),
});

// ============================================================================
// COMPONENTS
// ============================================================================

const Header = ({ step, totalLeads, approvedCount }) => (
  <div className="border-b border-purple-900/40 bg-black/60 backdrop-blur sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center glow" style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #4A2DC4 100%)' }}>
          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-xl font-bold text-white tracking-tight leading-none">
            Outbound Engine
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mt-1">
            HMH Holdings · Internal
          </div>
        </div>
      </div>
      
      {totalLeads > 0 && (
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider">Leads</span>
            <span className="text-white font-semibold">{totalLeads}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider">Approved</span>
            <span className="text-emerald-400 font-semibold">{approvedCount}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

const Stepper = ({ currentStep }) => {
  const steps = [
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'generate', label: 'Generate', icon: Sparkles },
    { id: 'review', label: 'Review', icon: Edit3 },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <div className="border-b border-purple-900/30 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2">
        {steps.map((s, i) => {
          const active = currentStep === s.id;
          const done = steps.findIndex(x => x.id === currentStep) > i;
          const Icon = s.icon;
          return (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider transition-all ${
                active ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40' :
                done ? 'text-emerald-400/80' : 'text-zinc-600'
              }`}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-zinc-700" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const ImportStep = ({ onParsed }) => {
  const [csvText, setCsvText] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const handleParse = () => {
    setError('');
    if (!csvText.trim()) {
      setError('Paste your CSV first');
      return;
    }
    
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.errors[0].code !== 'TooFewFields') {
          setError(`Parse error: ${results.errors[0].message}`);
          return;
        }
        
        const leads = results.data
          .map(parseLeadRow)
          .filter(l => l.email && (l.firstName || l.lastName) && l.company);
        
        if (leads.length === 0) {
          setError('No valid leads found. Need at least: email + name + company columns.');
          return;
        }
        
        setPreview({ leads, totalRows: results.data.length });
      },
      error: (err) => setError(`Parse error: ${err.message}`),
    });
  };

  const handleConfirm = () => {
    if (preview) onParsed(preview.leads);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="font-display text-4xl font-bold text-white mb-3 tracking-tight">
          Drop your Apollo export
        </h2>
        <p className="text-zinc-400 leading-relaxed max-w-2xl">
          Paste the CSV from Apollo. The engine picks the right HMH brand per lead and writes a 4-email sequence for each — Day 0, Day 4, Day 8, Day 14.
        </p>
      </div>

      <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-purple-900/30 bg-black/40 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
            Apollo CSV · paste below
          </div>
          {csvText && (
            <div className="font-mono text-[10px] text-zinc-500">
              {csvText.split('\n').length - 1} lines
            </div>
          )}
        </div>
        <textarea
          value={csvText}
          onChange={e => setCsvText(e.target.value)}
          placeholder={`First Name,Last Name,Title,Company,Email,Website,Industry,# Employees,...\nJane,Doe,VP Operations,Acme Construction,jane@acme.com,acme.com,Construction,250,...`}
          className="w-full h-64 bg-transparent text-white placeholder-zinc-700 text-xs p-4 outline-none resize-none"
        />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 px-4 py-3 bg-red-950/40 border border-red-800/40 rounded-md text-sm text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {preview && (
        <div className="mt-6 bg-emerald-950/20 border border-emerald-700/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-mono text-sm text-emerald-300">
              Parsed {preview.leads.length} valid leads
              {preview.totalRows !== preview.leads.length && (
                <span className="text-emerald-500/60 ml-2">
                  ({preview.totalRows - preview.leads.length} skipped — missing email/name/company)
                </span>
              )}
            </span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {preview.leads.slice(0, 5).map((l, i) => (
              <div key={i} className="font-mono text-xs text-zinc-400 flex items-center gap-3">
                <span className="text-zinc-600">→</span>
                <span className="text-white">{l.firstName} {l.lastName}</span>
                <span className="text-zinc-600">·</span>
                <span>{l.title || '—'}</span>
                <span className="text-zinc-600">@</span>
                <span className="text-purple-300">{l.company}</span>
              </div>
            ))}
            {preview.leads.length > 5 && (
              <div className="font-mono text-xs text-zinc-600 pt-2">
                ...{preview.leads.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-3">
        {!preview ? (
          <button
            onClick={handleParse}
            disabled={!csvText.trim()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-sm uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
          >
            Parse CSV <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <button
              onClick={() => { setPreview(null); setCsvText(''); }}
              className="px-5 py-3 text-zinc-400 hover:text-white font-mono text-sm uppercase tracking-wider rounded-md transition-all"
            >
              Start over
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm uppercase tracking-wider rounded-md transition-all flex items-center gap-2 glow"
            >
              Generate {preview.leads.length} sequence{preview.leads.length !== 1 ? 's' : ''} <Sparkles className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const GenerateStep = ({ leads, onComplete }) => {
  const [results, setResults] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let collected = [];
    
    (async () => {
      for (let i = 0; i < leads.length; i++) {
        if (cancelled) return;
        setCurrentIdx(i);
        try {
          const result = await generateSequence(leads[i]);
          collected.push({ lead: leads[i], result, status: 'pending', id: `${i}-${Date.now()}` });
          setResults([...collected]);
        } catch (err) {
          collected.push({ 
            lead: leads[i], 
            result: null, 
            error: err.message, 
            status: 'error',
            id: `${i}-${Date.now()}`
          });
          setResults([...collected]);
        }
      }
      if (!cancelled) {
        setDone(true);
        setTimeout(() => onComplete(collected), 800);
      }
    })();
    
    return () => { cancelled = true; };
  }, [leads, onComplete]);

  const successCount = results.filter(r => r.status !== 'error').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const progress = Math.round((results.length / leads.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 glow" 
             style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #4A2DC4 100%)' }}>
          {done ? (
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2} />
          ) : (
            <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={2} />
          )}
        </div>
        <h2 className="font-display text-4xl font-bold text-white mb-3 tracking-tight">
          {done ? 'Generation complete' : 'Writing your sequences'}
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          {done 
            ? 'Loading review queue...' 
            : `Processing ${currentIdx + 1} of ${leads.length}. Each lead gets a brand-matched 4-email sequence.`}
        </p>
      </div>

      <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-3 font-mono text-xs uppercase tracking-wider">
          <span className="text-zinc-500">Progress</span>
          <span className="text-purple-300">{results.length} / {leads.length} · {progress}%</span>
        </div>
        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6C47FF 0%, #F5C842 100%)'
            }}
          />
        </div>
        {(successCount > 0 || errorCount > 0) && (
          <div className="flex items-center gap-6 mt-4 font-mono text-xs">
            {successCount > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">{successCount} drafted</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300">{errorCount} failed</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.slice().reverse().map((r, i) => {
          const brand = r.result?.brand;
          const brandColor = brand ? BRANDS[brand]?.color : '#3a3a4a';
          return (
            <div key={r.id} className="bg-zinc-950/50 border border-zinc-800/60 rounded-md px-4 py-3 flex items-center gap-3 font-mono text-xs">
              <div className="w-1 h-8 rounded-full" style={{ background: brandColor }} />
              <div className="flex-1 min-w-0">
                <div className="text-white truncate">{r.lead.firstName} {r.lead.lastName} <span className="text-zinc-500">·</span> <span className="text-zinc-400">{r.lead.company}</span></div>
                {r.status === 'error' ? (
                  <div className="text-red-400 text-[10px] mt-0.5 truncate">{r.error}</div>
                ) : (
                  <div className="text-zinc-500 text-[10px] mt-0.5">
                    <span style={{ color: brandColor }}>{brand}</span> · {r.result?.rationale}
                  </div>
                )}
              </div>
              {r.status !== 'error' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              {r.status === 'error' && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReviewStep = ({ items, onUpdate, onContinue }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [editingEmail, setEditingEmail] = useState(null);

  const validItems = items.filter(i => i.result);
  const active = validItems[activeIdx];

  if (!active) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="font-display text-2xl text-white mb-2">Nothing to review</h3>
        <p className="text-zinc-500">All sequences failed to generate. Check your API access and try again.</p>
      </div>
    );
  }

  const updateStatus = (id, status) => {
    onUpdate(id, { status });
    // auto-advance
    if (activeIdx < validItems.length - 1) {
      setTimeout(() => setActiveIdx(activeIdx + 1), 200);
    }
  };

  const updateEmail = (id, dayIdx, field, value) => {
    const item = items.find(x => x.id === id);
    const newEmails = [...item.result.emails];
    newEmails[dayIdx] = { ...newEmails[dayIdx], [field]: value };
    onUpdate(id, { result: { ...item.result, emails: newEmails } });
  };

  const brand = active.result.brand;
  const brandColor = BRANDS[brand]?.color || '#6C47FF';
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const rejectedCount = items.filter(i => i.status === 'rejected').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Queue sidebar */}
        <div className="col-span-3">
          <div className="bg-zinc-950/60 border border-purple-900/30 rounded-lg overflow-hidden sticky top-32">
            <div className="px-4 py-3 border-b border-purple-900/30 bg-black/40">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-2">
                Queue
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-emerald-400">{approvedCount} ✓</span>
                <span className="text-red-400">{rejectedCount} ✕</span>
                <span className="text-zinc-500">{validItems.length - approvedCount - rejectedCount} pending</span>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {validItems.map((item, idx) => {
                const itemBrand = BRANDS[item.result.brand];
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIdx(idx)}
                    className={`w-full text-left px-3 py-2.5 border-b border-zinc-900/60 flex items-center gap-2 transition-all ${
                      isActive ? 'bg-purple-900/20' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: itemBrand?.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-white truncate">
                        {item.lead.firstName} {item.lead.lastName}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500 truncate">
                        {item.lead.company}
                      </div>
                    </div>
                    {item.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    {item.status === 'rejected' && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-purple-900/30 bg-black/40">
              <button
                onClick={onContinue}
                disabled={approvedCount === 0}
                className="w-full px-3 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2"
              >
                Export {approvedCount} <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main panel */}
        <div className="col-span-9 space-y-5">
          {/* Lead card */}
          <div className="bg-zinc-950/60 border rounded-lg overflow-hidden" style={{ borderColor: `${brandColor}40` }}>
            <div className="px-5 py-3 border-b flex items-center justify-between" 
                 style={{ background: `${brandColor}10`, borderColor: `${brandColor}40` }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: brandColor }} />
                <span className="font-mono text-xs uppercase tracking-wider" style={{ color: brandColor }}>
                  Sending under {brand}
                </span>
              </div>
              <div className="font-mono text-[10px] text-zinc-500">
                {activeIdx + 1} of {validItems.length}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-sm font-semibold" 
                     style={{ background: `${brandColor}20`, color: brandColor }}>
                  {active.lead.firstName[0]}{active.lead.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-2xl font-semibold text-white">
                    {active.lead.firstName} {active.lead.lastName}
                  </div>
                  <div className="text-zinc-400 text-sm">{active.lead.title}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 font-mono text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />{active.lead.company}</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{active.lead.email}</span>
                    {active.lead.website && <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" />{active.lead.website}</span>}
                  </div>
                </div>
              </div>
              <div className="bg-black/40 rounded-md p-3 border border-zinc-800/60">
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Why {brand}</div>
                <div className="text-sm text-zinc-300">{active.result.rationale}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mt-3 mb-1">Personalization hook</div>
                <div className="text-sm text-zinc-300 italic">"{active.result.personalization_hook}"</div>
              </div>
            </div>
          </div>

          {/* Email sequence */}
          <div className="space-y-3">
            {active.result.emails.map((email, dayIdx) => {
              const dayLabels = ['Intro · Day 0', 'Value · Day 4', 'Case study · Day 8', 'Breakup · Day 14'];
              const isEditing = editingEmail === `${active.id}-${dayIdx}`;
              return (
                <div key={dayIdx} className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg overflow-hidden">
                  <div className="px-5 py-2.5 border-b border-zinc-800/60 bg-black/40 flex items-center justify-between">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: brandColor }}>
                      {dayLabels[dayIdx]}
                    </div>
                    <button
                      onClick={() => setEditingEmail(isEditing ? null : `${active.id}-${dayIdx}`)}
                      className="text-zinc-500 hover:text-purple-300 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Subject</div>
                    {isEditing ? (
                      <input
                        value={email.subject}
                        onChange={e => updateEmail(active.id, dayIdx, 'subject', e.target.value)}
                        className="w-full bg-black/40 border border-purple-700/40 rounded px-3 py-1.5 text-white text-sm mb-3 font-body outline-none focus:border-purple-500"
                      />
                    ) : (
                      <div className="text-white font-medium mb-3">{email.subject}</div>
                    )}
                    <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Body</div>
                    {isEditing ? (
                      <textarea
                        value={email.body}
                        onChange={e => updateEmail(active.id, dayIdx, 'body', e.target.value)}
                        rows={8}
                        className="w-full bg-black/40 border border-purple-700/40 rounded px-3 py-2 text-zinc-200 text-sm font-body outline-none focus:border-purple-500 resize-none leading-relaxed"
                      />
                    ) : (
                      <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-body">
                        {email.body}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="sticky bottom-4 bg-black/90 backdrop-blur border border-purple-900/40 rounded-lg p-4 flex items-center justify-between glow">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                disabled={activeIdx === 0}
                className="px-3 py-2 text-zinc-400 hover:text-white disabled:text-zinc-700 font-mono text-xs uppercase tracking-wider rounded"
              >
                ← Prev
              </button>
              <button
                onClick={() => setActiveIdx(Math.min(validItems.length - 1, activeIdx + 1))}
                disabled={activeIdx === validItems.length - 1}
                className="px-3 py-2 text-zinc-400 hover:text-white disabled:text-zinc-700 font-mono text-xs uppercase tracking-wider rounded"
              >
                Next →
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateStatus(active.id, 'rejected')}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 ${
                  active.status === 'rejected' 
                    ? 'bg-red-600/30 text-red-300 border border-red-500/40' 
                    : 'text-zinc-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
              <button
                onClick={() => updateStatus(active.id, 'approved')}
                className={`px-5 py-2 font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 ${
                  active.status === 'approved' 
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExportStep = ({ items, onRestart }) => {
  const approved = items.filter(i => i.status === 'approved');
  
  const buildCSV = () => {
    const rows = [];
    approved.forEach(item => {
      item.result.emails.forEach((email, dayIdx) => {
        rows.push({
          email: item.lead.email,
          first_name: item.lead.firstName,
          last_name: item.lead.lastName,
          company: item.lead.company,
          title: item.lead.title,
          brand: item.result.brand,
          sequence_step: dayIdx + 1,
          day: email.day,
          subject: email.subject,
          body: email.body,
        });
      });
    });
    return Papa.unparse(rows);
  };

  const downloadCSV = () => {
    const csv = buildCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `aynp-sequences-${date}.csv`;
    link.click();
  };

  const brandCounts = approved.reduce((acc, item) => {
    acc[item.result.brand] = (acc[item.result.brand] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 glow" 
             style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #F5C842 100%)' }}>
          <Download className="w-12 h-12 text-white" strokeWidth={2} />
        </div>
        <h2 className="font-display text-5xl font-bold text-white mb-3 tracking-tight">
          Ready to ship
        </h2>
        <p className="text-zinc-400 text-lg">
          {approved.length} sequence{approved.length !== 1 ? 's' : ''} · {approved.length * 4} emails total
        </p>
      </div>

      <div className="bg-zinc-950/60 border border-purple-900/40 rounded-lg p-6 mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-4">
          Brand distribution
        </div>
        <div className="space-y-2">
          {Object.entries(brandCounts).map(([brand, count]) => {
            const b = BRANDS[brand];
            const pct = (count / approved.length) * 100;
            return (
              <div key={brand} className="flex items-center gap-3">
                <div className="font-mono text-xs w-32" style={{ color: b?.color }}>
                  {brand}
                </div>
                <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${pct}%`, background: b?.color }} />
                </div>
                <div className="font-mono text-xs text-zinc-400 w-12 text-right">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-950/60 border border-purple-900/40 rounded-lg p-6 mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-3">
          Instantly upload guide
        </div>
        <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
          <li>Download the CSV below</li>
          <li>Open Instantly → New Campaign → Upload Leads</li>
          <li>Map columns: <span className="font-mono text-purple-300">email, first_name, last_name, company</span></li>
          <li>Create 4 sequence steps with delays Day 0 / Day 4 / Day 8 / Day 14</li>
          <li>For each step, paste <span className="font-mono text-purple-300">subject</span> and <span className="font-mono text-purple-300">body</span> from the matching <span className="font-mono text-purple-300">sequence_step</span> rows</li>
          <li>Send manually or schedule — your call</li>
        </ol>
      </div>

      <div className="flex items-center gap-3 justify-center">
        <button
          onClick={downloadCSV}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm uppercase tracking-wider rounded-md transition-all flex items-center gap-3 glow"
        >
          <Download className="w-5 h-5" />
          Download CSV
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-4 text-zinc-400 hover:text-white font-mono text-sm uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          New batch
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// ROOT
// ============================================================================
export default function App() {
  const [step, setStep] = useState('import');
  const [leads, setLeads] = useState([]);
  const [items, setItems] = useState([]);

  const handleParsed = (parsedLeads) => {
    setLeads(parsedLeads);
    setStep('generate');
  };

  const handleGenerationComplete = (results) => {
    setItems(results);
    setStep('review');
  };

  const handleUpdate = (id, patch) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...patch } : item
    ));
  };

  const handleContinue = () => setStep('export');

  const handleRestart = () => {
    setStep('import');
    setLeads([]);
    setItems([]);
  };

  const approvedCount = useMemo(() => items.filter(i => i.status === 'approved').length, [items]);

  return (
    <div className="min-h-screen bg-black text-white font-body terminal-grid">
      <FontStyles />
      <div className="min-h-screen scanline">
        <Header step={step} totalLeads={leads.length} approvedCount={approvedCount} />
        <Stepper currentStep={step} />
        
        {step === 'import' && <ImportStep onParsed={handleParsed} />}
        {step === 'generate' && <GenerateStep leads={leads} onComplete={handleGenerationComplete} />}
        {step === 'review' && <ReviewStep items={items} onUpdate={handleUpdate} onContinue={handleContinue} />}
        {step === 'export' && <ExportStep items={items} onRestart={handleRestart} />}
      </div>
    </div>
  );
}
