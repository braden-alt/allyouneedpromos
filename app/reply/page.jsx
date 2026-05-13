'use client';

import React, { useState, useMemo } from 'react';
import {
  Inbox, MessageSquare, CheckCircle2, XCircle, Edit3, Download,
  ArrowRight, AlertCircle, AlertTriangle, Flame, Clock, Snowflake,
  ShieldAlert, Loader2, Plus, Trash2, Copy, ChevronRight, Sparkles,
  Mail, Building2, User, Send, FileText, Calendar, Target, ArrowDown
} from 'lucide-react';

// ============================================================================
// FONT INJECTION (matches Outbound Engine aesthetic)
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
    
    .glow-purple { box-shadow: 0 0 24px rgba(108, 71, 255, 0.4); }
    .glow-red { box-shadow: 0 0 24px rgba(239, 68, 68, 0.3); }
    .glow-emerald { box-shadow: 0 0 24px rgba(16, 185, 129, 0.3); }
    
    textarea, input { font-family: 'IBM Plex Mono', monospace; }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0f; }
    ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }
      50% { box-shadow: 0 0 24px rgba(239, 68, 68, 0.8); }
    }
    .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  `}</style>
);

// ============================================================================
// CONFIG
// ============================================================================
const BRANDS = {
  Swagr: { color: '#6C47FF', sig: 'Braden Forge | Swagr\nsales@swagrshop.com | swagrshop.com' },
  ForgedGear: { color: '#FF7A1A', sig: 'Braden Forge | ForgedGear\nsales@swagrshop.com | forgedgear.net' },
  ForgeEvents: { color: '#F5C842', sig: 'Braden Forge | ForgeEvents\nsales@swagrshop.com | forgeevent.co' },
  Calibr: { color: '#00D9B2', sig: 'Braden Forge | Calibr\nsales@swagrshop.com | getcalibr.co' },
  AYNP: { color: '#E6E1D4', sig: 'Braden Forge\nAll You Need Promos | ASI #117382\nallyouneedpromos.net' },
  'HM Vertex': { color: '#A0A0C0', sig: 'Braden Forge | HM Vertex Group' },
  ForgeNova: { color: '#6FA8DC', sig: 'Braden Forge | ForgeNova' },
};

const CLASSIFICATIONS = {
  hot_rfq: { 
    label: 'Hot · RFQ', icon: Flame, color: '#EF4444', 
    desc: 'Asking for a quote. Specs implied or explicit. Move fast.',
    priority: 'P0', action: 'Draft quote intro + flag to run aynp-quote skill'
  },
  interested: { 
    label: 'Interested', icon: Sparkles, color: '#10B981', 
    desc: 'Wants to learn more or schedule a call. Real engagement.',
    priority: 'P1', action: 'Draft helpful response + propose next step'
  },
  question: { 
    label: 'Question', icon: MessageSquare, color: '#6C47FF', 
    desc: 'Asking about pricing model, capabilities, timeline, etc.',
    priority: 'P1', action: 'Draft direct answer + light forward motion'
  },
  bad_timing: { 
    label: 'Bad timing', icon: Clock, color: '#F5C842', 
    desc: 'Interested but later. Nurture list.',
    priority: 'P2', action: 'Acknowledge + set re-engagement reminder'
  },
  existing_vendor: { 
    label: 'Has vendor', icon: ShieldAlert, color: '#A0A0C0', 
    desc: 'Already buying from someone else. Plant seed for spot-check.',
    priority: 'P2', action: 'Soft "keep in mind" reply, no push'
  },
  wrong_person: { 
    label: 'Wrong person', icon: User, color: '#6FA8DC', 
    desc: 'Forwarded or "not me, try X." Get the right contact.',
    priority: 'P2', action: 'Ask for right contact + send fresh intro'
  },
  not_interested: { 
    label: 'Not interested', icon: XCircle, color: '#71717A', 
    desc: 'Polite decline. Respect and exit.',
    priority: 'P3', action: 'No response. Mark suppressed.'
  },
  unsubscribe: { 
    label: 'Unsubscribe', icon: Snowflake, color: '#52525B', 
    desc: 'Explicit "stop emailing me." Suppress immediately.',
    priority: 'P3', action: 'No response. Suppress + ensure no future sends.'
  },
  escalate: { 
    label: 'Escalate', icon: AlertTriangle, color: '#DC2626', 
    desc: 'Named priority account, large opportunity, contract terms, legal language, or anything sensitive.',
    priority: 'P0', action: 'STOP. Flag to Braden. No auto-draft.'
  },
};

// ============================================================================
// PROMPT BUILDER
// ============================================================================
const buildPrompt = ({ replyText, originalContext, namedAccounts }) => `You are Braden Forge's reply handler for HMH Holdings (Swagr, ForgedGear, ForgeEvents, Calibr, AYNP, HM Vertex Group, ForgeNova).

A prospect replied to an outbound email. Your job: (1) classify the reply, (2) decide priority, (3) draft the right response — UNLESS it's an escalation case, in which case do NOT draft.

# Classifications (pick exactly ONE)
- **hot_rfq**: Asking for a quote, prices, or specs. Specific products or quantities mentioned. → P0
- **interested**: Open engagement, wants to learn more, asks to schedule a call. → P1
- **question**: Specific question about pricing, capabilities, timeline, decoration, samples. → P1
- **bad_timing**: Interested but says "not right now" / "Q4" / "after [event]". → P2
- **existing_vendor**: Already buying from someone else. → P2
- **wrong_person**: "Not me" / "try [other person]" / "forwarded to..." → P2
- **not_interested**: Polite decline, no future opening. → P3
- **unsubscribe**: Explicit stop/remove/opt-out language. → P3
- **escalate**: ANY of: named priority account match, contract/legal/lawyer language, net terms requested, order value over $25K implied, hostile/complaint tone, mentions of switching from a specific competitor by name. → P0 (DO NOT auto-draft)

# Escalation triggers (if ANY apply, classify as "escalate" and skip draft)
- Sender domain or company matches: ${namedAccounts.length ? namedAccounts.join(', ') : '(none configured)'}
- Mentions: "lawyer", "contract", "MSA", "terms", "net 30", "net 60", "purchase order required", "procurement process", "RFP"
- Hostile or complaint tone
- Order value implied to be over $25K
- Asks for international shipping
- Requests custom manufacturing (not catalog)

# Universal voice rules (when drafting)
- No "Hope this finds you well" / "Just circling back" / "Touching base"
- No "Unfortunately" / "I apologize" / "We strive to"
- No "premium" / "best-in-class" / "elevate your brand"
- Contractions everywhere
- Match the brand voice the original email was sent under
- Short. 60-120 words for most. Hot RFQs can go longer.
- Always end with a small, specific next step (not "let me know your thoughts")
- Sign with brand-appropriate signature

# Brand voice quick refs
- **Swagr**: casual, humor-forward, contractions. "Heck yeah" / "Real talk" sparingly OK.
- **ForgedGear**: industrial, no-fluff, trades respect.
- **ForgeEvents**: deadline-aware. Lead with the date.
- **HM Vertex**: executive peer. Data and outcomes.
- **ForgeNova**: freight specialist, technical.
- **AYNP**: professional, warm, industry veteran.

# Response patterns by classification

**hot_rfq**: Acknowledge the request, surface that you'll have specific pricing in the next message (since the quote skill runs separately), ask for any missing detail you need (qty / decoration / in-hand date / ship-to). Don't quote numbers — that's the quote engine's job.

**interested**: Match their energy. Propose a specific next step (15-min call with a time slot, or "send me X and I'll have Y back same day").

**question**: Answer the actual question directly. Keep it tight. End with a softball forward question.

**bad_timing**: Acknowledge graciously. Confirm you'll circle back at the stated time. No pushiness.

**existing_vendor**: One-paragraph reply. Plant seed for spot-check comparison. No pressure.

**wrong_person**: Thank them. Ask for right contact name + email. Offer to keep them looped in.

**not_interested / unsubscribe**: Do NOT draft a response. Set draft to empty string and add note to suppress.

**escalate**: Do NOT draft a response. Set draft to empty string. Set escalation_reason to a clear one-line summary of WHY this needs Braden's eyes.

# OUTPUT FORMAT
Return ONLY valid JSON. No preamble. No markdown fences. Schema:

{
  "classification": "hot_rfq|interested|question|bad_timing|existing_vendor|wrong_person|not_interested|unsubscribe|escalate",
  "priority": "P0|P1|P2|P3",
  "brand": "Swagr|ForgedGear|ForgeEvents|Calibr|AYNP|HM Vertex|ForgeNova",
  "summary": "1 sentence what the prospect said",
  "next_action": "1 line what to do next (e.g., 'Draft quote with aynp-quote', 'Add to Q4 nurture', 'Suppress')",
  "escalation_reason": "if classification is 'escalate', why — otherwise empty string",
  "draft_subject": "Re: [original subject] — or new subject if more appropriate. Empty string if not drafting.",
  "draft_body": "The full draft response in brand voice. Empty string if classification is escalate/not_interested/unsubscribe."
}

# CONTEXT
Original outbound brand: ${originalContext.brand || 'Unknown — infer from reply'}
Original outbound topic: ${originalContext.topic || 'Cold outreach — generic intro'}
Prospect name (if known): ${originalContext.prospectName || 'Unknown'}
Prospect company (if known): ${originalContext.prospectCompany || 'Unknown'}

# THE REPLY TO CLASSIFY
${replyText}`;

// ============================================================================
// API CALLER
// ============================================================================
const classifyReply = async (params) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: buildPrompt(params) }],
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`API ${response.status}: ${txt.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Header = ({ count }) => (
  <div className="border-b border-purple-900/40 bg-black/60 backdrop-blur sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-purple" 
             style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #4A2DC4 100%)' }}>
          <Inbox className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-xl font-bold text-white tracking-tight leading-none">
            Reply Handler
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mt-1">
            HMH Holdings · Internal
          </div>
        </div>
      </div>
      {count > 0 && (
        <div className="font-mono text-xs flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-wider">Replies</span>
          <span className="text-white font-semibold">{count}</span>
        </div>
      )}
    </div>
  </div>
);

const ReplyForm = ({ onAdd, namedAccounts, setNamedAccounts }) => {
  const [replyText, setReplyText] = useState('');
  const [originalSubject, setOriginalSubject] = useState('');
  const [originalBrand, setOriginalBrand] = useState('');
  const [prospectName, setProspectName] = useState('');
  const [prospectCompany, setProspectCompany] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [showAccounts, setShowAccounts] = useState(false);

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onAdd({
      replyText: replyText.trim(),
      originalSubject: originalSubject.trim(),
      originalBrand: originalBrand,
      prospectName: prospectName.trim(),
      prospectCompany: prospectCompany.trim(),
    });
    setReplyText('');
    setOriginalSubject('');
    setProspectName('');
    setProspectCompany('');
  };

  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
          New reply · paste below
        </div>
        <button
          onClick={() => setShowAccounts(!showAccounts)}
          className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-purple-300 flex items-center gap-1"
        >
          <Target className="w-3 h-3" />
          Priority accounts ({namedAccounts.length})
        </button>
      </div>

      {showAccounts && (
        <div className="px-4 py-3 bg-amber-950/10 border-b border-amber-900/30">
          <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80 mb-2">
            Named accounts that auto-escalate
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {namedAccounts.map((acc, i) => (
              <span key={i} className="px-2 py-0.5 bg-amber-900/30 border border-amber-700/40 rounded font-mono text-[10px] text-amber-200 flex items-center gap-1">
                {acc}
                <button onClick={() => setNamedAccounts(namedAccounts.filter((_, j) => j !== i))} className="hover:text-amber-100">
                  <XCircle className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newAccount}
              onChange={e => setNewAccount(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newAccount.trim()) {
                  setNamedAccounts([...namedAccounts, newAccount.trim()]);
                  setNewAccount('');
                }
              }}
              placeholder="e.g., IES Holdings, Echelon"
              className="flex-1 bg-black/40 border border-zinc-800/60 rounded px-2 py-1 text-xs text-white outline-none focus:border-amber-500/40"
            />
            <button
              onClick={() => {
                if (newAccount.trim()) {
                  setNamedAccounts([...namedAccounts, newAccount.trim()]);
                  setNewAccount('');
                }
              }}
              className="px-3 py-1 bg-amber-700/30 hover:bg-amber-700/50 border border-amber-700/40 rounded font-mono text-[10px] uppercase tracking-wider text-amber-200"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder={`Paste the prospect's reply here...\n\nExample:\n"Hey Braden — thanks for reaching out. We're actually looking at custom polos for our team of 80. Can you send pricing for 100 units in navy with our logo embroidered on the left chest? We'd need them by mid-June."`}
          className="w-full h-40 bg-black/40 border border-zinc-800/60 rounded p-3 text-white text-xs placeholder-zinc-600 outline-none focus:border-purple-500/40 resize-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            value={prospectName}
            onChange={e => setProspectName(e.target.value)}
            placeholder="Prospect name (optional)"
            className="bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
          />
          <input
            value={prospectCompany}
            onChange={e => setProspectCompany(e.target.value)}
            placeholder="Company (optional)"
            className="bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={originalSubject}
            onChange={e => setOriginalSubject(e.target.value)}
            placeholder="Original subject (optional)"
            className="bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
          />
          <select
            value={originalBrand}
            onChange={e => setOriginalBrand(e.target.value)}
            className="bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40 cursor-pointer"
          >
            <option value="">Original brand (auto)</option>
            {Object.keys(BRANDS).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSubmit}
            disabled={!replyText.trim()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> Classify reply
          </button>
        </div>
      </div>
    </div>
  );
};

const ClassificationBadge = ({ classification, priority }) => {
  const c = CLASSIFICATIONS[classification];
  if (!c) return null;
  const Icon = c.icon;
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider"
           style={{ background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}40` }}>
        <Icon className="w-3 h-3" />
        {c.label}
      </div>
      <div className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
        priority === 'P0' ? 'bg-red-950/40 text-red-300 border border-red-800/40' :
        priority === 'P1' ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40' :
        priority === 'P2' ? 'bg-blue-950/40 text-blue-300 border border-blue-800/40' :
        'bg-zinc-900/40 text-zinc-500 border border-zinc-800/40'
      }`}>
        {priority}
      </div>
    </div>
  );
};

const ReplyCard = ({ item, onUpdate, onDelete }) => {
  const [editingDraft, setEditingDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  if (item.status === 'processing') {
    return (
      <div className="bg-zinc-950/60 border border-purple-900/30 rounded-lg p-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        <div className="font-mono text-xs text-zinc-400">Classifying reply...</div>
      </div>
    );
  }

  if (item.status === 'error') {
    return (
      <div className="bg-red-950/20 border border-red-800/40 rounded-lg p-5">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-mono text-xs text-red-300 uppercase tracking-wider mb-1">Classification failed</div>
            <div className="text-sm text-red-200/80">{item.error}</div>
          </div>
          <button onClick={() => onDelete(item.id)} className="text-red-400 hover:text-red-200">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="font-mono text-xs text-zinc-500 mt-3 p-3 bg-black/40 rounded border border-zinc-800/40 max-h-24 overflow-y-auto">
          {item.input.replyText}
        </div>
      </div>
    );
  }

  const result = item.result;
  const classification = CLASSIFICATIONS[result.classification];
  const brand = BRANDS[result.brand];
  const isEscalation = result.classification === 'escalate';
  const isSuppress = ['not_interested', 'unsubscribe'].includes(result.classification);

  const copyDraft = () => {
    const full = `Subject: ${result.draft_subject}\n\n${result.draft_body}\n\n${brand?.sig || ''}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-zinc-950/60 border rounded-lg overflow-hidden ${
      isEscalation ? 'border-red-700/50 pulse-glow' : 
      result.priority === 'P0' ? 'border-red-700/40' :
      result.priority === 'P1' ? 'border-amber-700/40' :
      'border-purple-900/30'
    }`}>
      {/* Header */}
      <div className="px-5 py-3 border-b flex items-center justify-between"
           style={{ 
             background: isEscalation ? 'rgba(220, 38, 38, 0.1)' : `${classification?.color}08`,
             borderColor: isEscalation ? 'rgba(220, 38, 38, 0.3)' : `${classification?.color}30`
           }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ClassificationBadge classification={result.classification} priority={result.priority} />
          {result.brand && (
            <>
              <div className="text-zinc-600">·</div>
              <div className="font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5" style={{ color: brand?.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: brand?.color }} />
                {result.brand}
              </div>
            </>
          )}
          {item.input.prospectCompany && (
            <>
              <div className="text-zinc-600">·</div>
              <div className="font-mono text-[10px] text-zinc-400 truncate">{item.input.prospectCompany}</div>
            </>
          )}
        </div>
        <button onClick={() => onDelete(item.id)} className="text-zinc-600 hover:text-red-400 flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary */}
      <div className="px-5 py-3 border-b border-zinc-900/60">
        <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Summary</div>
        <div className="text-sm text-zinc-200">{result.summary}</div>
      </div>

      {/* Original reply (collapsible context) */}
      <details className="border-b border-zinc-900/60">
        <summary className="px-5 py-2.5 cursor-pointer text-zinc-500 hover:text-zinc-300 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2">
          <ChevronRight className="w-3 h-3" /> Original reply
        </summary>
        <div className="px-5 pb-4 text-xs text-zinc-400 whitespace-pre-wrap font-body leading-relaxed bg-black/30">
          {item.input.replyText}
        </div>
      </details>

      {/* Escalation case */}
      {isEscalation && (
        <div className="p-5 bg-red-950/20">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-red-300 mb-1">
                Escalation — Braden review required
              </div>
              <div className="text-sm text-red-200/90">{result.escalation_reason}</div>
            </div>
          </div>
          <div className="bg-black/40 rounded border border-red-900/40 p-3 font-mono text-xs text-zinc-400">
            <span className="text-red-300 uppercase tracking-wider mr-2">Next:</span>
            {result.next_action}
          </div>
        </div>
      )}

      {/* Suppress case */}
      {isSuppress && (
        <div className="p-5 bg-zinc-900/30">
          <div className="flex items-start gap-3">
            <Snowflake className="w-5 h-5 text-zinc-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-1">No response — suppress</div>
              <div className="text-sm text-zinc-400">{result.next_action}</div>
            </div>
          </div>
        </div>
      )}

      {/* Draft (normal case) */}
      {!isEscalation && !isSuppress && result.draft_body && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-purple-400/70">
              Draft response
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingDraft(!editingDraft)}
                className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-purple-300 flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> {editingDraft ? 'Done' : 'Edit'}
              </button>
              <button
                onClick={copyDraft}
                className={`font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                  copied ? 'text-emerald-400' : 'text-zinc-500 hover:text-purple-300'
                }`}
              >
                {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>

          <div className="bg-black/40 rounded border border-zinc-800/60 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800/60 bg-black/40">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Subject</div>
              {editingDraft ? (
                <input
                  value={result.draft_subject}
                  onChange={e => onUpdate(item.id, { result: { ...result, draft_subject: e.target.value } })}
                  className="w-full bg-transparent border-none p-0 text-white text-sm font-body outline-none"
                />
              ) : (
                <div className="text-white text-sm font-body">{result.draft_subject}</div>
              )}
            </div>
            <div className="p-4">
              {editingDraft ? (
                <textarea
                  value={result.draft_body}
                  onChange={e => onUpdate(item.id, { result: { ...result, draft_body: e.target.value } })}
                  rows={Math.max(6, result.draft_body.split('\n').length + 1)}
                  className="w-full bg-transparent border-none p-0 text-zinc-200 text-sm font-body outline-none resize-none leading-relaxed"
                />
              ) : (
                <div className="text-zinc-200 text-sm font-body leading-relaxed whitespace-pre-wrap">
                  {result.draft_body}
                </div>
              )}
              {brand?.sig && (
                <div className="mt-4 pt-4 border-t border-zinc-800/60 text-zinc-500 text-xs font-body whitespace-pre-wrap">
                  {brand.sig}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 bg-purple-950/20 rounded border border-purple-900/30 p-3 font-mono text-xs">
            <span className="text-purple-300 uppercase tracking-wider mr-2">Next:</span>
            <span className="text-zinc-300">{result.next_action}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ExportPanel = ({ items, onClearAll }) => {
  const processed = items.filter(i => i.status === 'done');
  const escalations = processed.filter(i => i.result?.classification === 'escalate');
  const hotRfqs = processed.filter(i => i.result?.classification === 'hot_rfq');

  const exportCSV = () => {
    const rows = processed.map(item => ({
      prospect_name: item.input.prospectName,
      prospect_company: item.input.prospectCompany,
      classification: item.result.classification,
      priority: item.result.priority,
      brand: item.result.brand,
      summary: item.result.summary,
      next_action: item.result.next_action,
      escalation_reason: item.result.escalation_reason || '',
      draft_subject: item.result.draft_subject || '',
      draft_body: item.result.draft_body || '',
      original_reply: item.input.replyText,
    }));
    const headers = Object.keys(rows[0] || {});
    const csvContent = [
      headers.join(','),
      ...rows.map(r => headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `aynp-replies-${date}.csv`;
    link.click();
  };

  if (processed.length === 0) return null;

  return (
    <div className="bg-zinc-950/60 border border-purple-900/30 rounded-lg p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-3">
        Session summary
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-black/40 border border-zinc-800/60 rounded p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Total</div>
          <div className="font-display text-2xl text-white">{processed.length}</div>
        </div>
        <div className="bg-red-950/20 border border-red-800/30 rounded p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-red-400/80 mb-1">Escalations</div>
          <div className="font-display text-2xl text-red-300">{escalations.length}</div>
        </div>
        <div className="bg-amber-950/20 border border-amber-800/30 rounded p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80 mb-1">Hot RFQs</div>
          <div className="font-display text-2xl text-amber-300">{hotRfqs.length}</div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/80 mb-1">Drafts ready</div>
          <div className="font-display text-2xl text-emerald-300">
            {processed.filter(i => i.result?.draft_body).length}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider rounded-md flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" /> Export session CSV
        </button>
        <button
          onClick={onClearAll}
          className="px-4 py-2 text-zinc-400 hover:text-red-400 font-mono text-xs uppercase tracking-wider rounded-md flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear all
        </button>
      </div>
    </div>
  );
};

const ClassificationLegend = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-zinc-400 hover:text-white"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
          <FileText className="w-3 h-3" /> How classifications work
        </div>
        <ArrowDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(CLASSIFICATIONS).map(([key, c]) => {
            const Icon = c.icon;
            return (
              <div key={key} className="flex items-start gap-2 bg-black/30 border border-zinc-800/40 rounded p-2.5">
                <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: c.color }} />
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-wider mb-0.5" style={{ color: c.color }}>
                    {c.label} · {c.priority}
                  </div>
                  <div className="text-xs text-zinc-400 leading-snug">{c.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ROOT
// ============================================================================
export default function App() {
  const [items, setItems] = useState([]);
  const [namedAccounts, setNamedAccounts] = useState(['IES Holdings', 'Echelon', 'Reveel']);

  const handleAdd = async (input) => {
    const id = `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem = { id, input, status: 'processing', result: null };
    setItems(prev => [newItem, ...prev]);

    try {
      const result = await classifyReply({
        replyText: input.replyText,
        originalContext: {
          brand: input.originalBrand,
          topic: input.originalSubject,
          prospectName: input.prospectName,
          prospectCompany: input.prospectCompany,
        },
        namedAccounts,
      });
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'done', result } : it));
    } catch (err) {
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'error', error: err.message } : it));
    }
  };

  const handleUpdate = (id, patch) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Clear all replies from this session?')) {
      setItems([]);
    }
  };

  const sortedItems = useMemo(() => {
    const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
    return [...items].sort((a, b) => {
      if (a.status !== 'done' && b.status === 'done') return -1;
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status === 'done' && b.status === 'done') {
        const pa = priorityOrder[a.result?.priority] ?? 99;
        const pb = priorityOrder[b.result?.priority] ?? 99;
        if (pa !== pb) return pa - pb;
      }
      return 0;
    });
  }, [items]);

  return (
    <div className="min-h-screen bg-black text-white font-body terminal-grid">
      <FontStyles />
      <Header count={items.length} />
      
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Intro for empty state */}
        {items.length === 0 && (
          <div className="text-center py-6 mb-2">
            <h2 className="font-display text-4xl font-bold text-white mb-3 tracking-tight">
              Paste a reply. Get the right response.
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Inbound reply from Instantly, Gmail, anywhere. The engine classifies (RFQ / interested / bad timing / escalation), drafts the response in the right brand voice, and flags whatever needs your eyes.
            </p>
          </div>
        )}

        <ReplyForm onAdd={handleAdd} namedAccounts={namedAccounts} setNamedAccounts={setNamedAccounts} />

        <ClassificationLegend />

        {items.length > 0 && (
          <>
            <div className="border-t border-zinc-900/60 pt-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-4 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Processed replies · sorted by priority
              </div>
              <div className="space-y-4">
                {sortedItems.map(item => (
                  <ReplyCard 
                    key={item.id} 
                    item={item} 
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            <ExportPanel items={items} onClearAll={handleClearAll} />
          </>
        )}
      </div>
    </div>
  );
}
