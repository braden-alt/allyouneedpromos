'use client';

import React, { useState, useMemo } from 'react';
import {
  Lightbulb, Sparkles, Search, Filter, Plus, Trash2, Copy,
  Download, RefreshCw, Loader2, X, ChevronRight, ChevronDown,
  Heart, Package, Shirt, Coffee, Briefcase, Pencil, HardHat,
  Headphones, Gift, Mail, AlertCircle, CheckCircle2, Layers,
  Calculator, Image as ImageIcon, ArrowRight, Star, Tag, Eye
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
        linear-gradient(rgba(108, 71, 255, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108, 71, 255, 0.04) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    
    .glow-purple { box-shadow: 0 0 24px rgba(108, 71, 255, 0.4); }
    .glow-gold { box-shadow: 0 0 16px rgba(245, 200, 66, 0.3); }
    
    textarea, input, select { font-family: 'IBM Plex Mono', monospace; }
    
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
    
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
    .shimmer {
      background: linear-gradient(90deg, #1a1a24 0%, #2a2a3a 50%, #1a1a24 100%);
      background-size: 200px 100%;
      animation: shimmer 1.5s infinite linear;
    }
    
    .card-hover {
      transition: all 0.25s ease;
    }
    .card-hover:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(108, 71, 255, 0.2);
    }
    
    .gradient-purple-gold {
      background: linear-gradient(135deg, #6C47FF 0%, #F5C842 100%);
    }
  `}</style>
);

// ============================================================================
// BRAND CONFIG
// ============================================================================
const BRANDS = {
  Swagr: { color: '#6C47FF', tone: 'fun, modern, SMB-friendly' },
  ForgedGear: { color: '#FF7A1A', tone: 'industrial, trades, durable' },
  ForgeEvents: { color: '#F5C842', tone: 'events, conferences, hospitality' },
  Calibr: { color: '#00D9B2', tone: 'precision, premium, tech' },
  AYNP: { color: '#1C1C1C', tone: 'distributor-professional, all-purpose' },
};

// ============================================================================
// PRODUCT CATALOG — curated reference set across promo categories
// Used for: (1) browse alternatives, (2) AI grounding so it doesn't invent
// products that don't exist
// ============================================================================
const CATALOG = [
  // ---- APPAREL ----
  { id: 'ap-1', name: 'Ringspun cotton tee', category: 'Apparel', icon: 'shirt', priceRange: '$8-14', decoration: 'Screen print, DTF, embroidery', tags: ['budget', 'everyday', 'tradeshow', 'startup', 'welcome kit'], desc: 'Mid-weight ringspun cotton. The workhorse promo item — solid value, works for any audience.', emoji: '👕' },
  { id: 'ap-2', name: 'Tri-blend tee', category: 'Apparel', icon: 'shirt', priceRange: '$12-18', decoration: 'DTF, screen print', tags: ['premium', 'soft', 'lifestyle', 'startup', 'tech'], desc: 'Vintage-feel cotton/poly/rayon blend. Softer drape, premium feel for tech and lifestyle brands.', emoji: '👕' },
  { id: 'ap-3', name: 'Performance polo', category: 'Apparel', icon: 'shirt', priceRange: '$18-32', decoration: 'Embroidery (recommended), heat seal', tags: ['corporate', 'sales', 'trade show', 'professional'], desc: 'Moisture-wicking polo. Embroidered logo on left chest. The standard for client-facing teams.', emoji: '👔' },
  { id: 'ap-4', name: 'Quarter-zip pullover', category: 'Apparel', icon: 'shirt', priceRange: '$28-48', decoration: 'Embroidery', tags: ['premium', 'gift', 'executive', 'cold weather'], desc: 'Mid-layer pullover. Executive-friendly, works as a customer thank-you gift or executive holiday item.', emoji: '🧥' },
  { id: 'ap-5', name: 'Pullover hoodie', category: 'Apparel', icon: 'shirt', priceRange: '$22-42', decoration: 'Screen print, embroidery, DTF', tags: ['comfort', 'startup', 'employee gift', 'fall/winter'], desc: 'Mid-weight fleece hoodie. The #1 employee favorite. Embroidered logos hold up longer than print.', emoji: '🧥' },
  { id: 'ap-6', name: 'Softshell jacket', category: 'Apparel', icon: 'shirt', priceRange: '$45-85', decoration: 'Embroidery', tags: ['premium', 'executive gift', 'crew gear', 'cold weather'], desc: 'Water-resistant softshell. Premium positioning. Common for executive gifts or branded field service teams.', emoji: '🧥' },
  
  // ---- HEADWEAR ----
  { id: 'hw-1', name: 'Structured snapback', category: 'Headwear', icon: 'hat', priceRange: '$10-18', decoration: 'Embroidery (3D puff for premium), patch', tags: ['everyday', 'streetwear', 'startup', 'event'], desc: 'Six-panel structured cap with flat brim and snap closure. Embroidered logo or sewn-on patch.', emoji: '🧢' },
  { id: 'hw-2', name: 'Dad hat (unstructured)', category: 'Headwear', icon: 'hat', priceRange: '$10-16', decoration: 'Embroidery', tags: ['lifestyle', 'casual', 'startup', 'trendy'], desc: 'Soft-crown unstructured cap. The modern style for casual-leaning brands.', emoji: '🧢' },
  { id: 'hw-3', name: 'Trucker cap (mesh back)', category: 'Headwear', icon: 'hat', priceRange: '$8-14', decoration: 'Embroidery, patch', tags: ['budget', 'trades', 'casual', 'outdoors'], desc: 'Foam front + mesh back. Trades-friendly, breathable. Patches work well here.', emoji: '🧢' },
  { id: 'hw-4', name: 'Cuffed beanie', category: 'Headwear', icon: 'hat', priceRange: '$8-14', decoration: 'Embroidery, woven label', tags: ['winter', 'crew gear', 'streetwear'], desc: 'Acrylic cuffed beanie. Strong for cold-weather field teams or winter events.', emoji: '🎩' },
  
  // ---- DRINKWARE ----
  { id: 'dw-1', name: '20oz vacuum tumbler', category: 'Drinkware', icon: 'coffee', priceRange: '$14-24', decoration: 'Laser engraving, UV print, wrap', tags: ['daily use', 'gift', 'office', 'event'], desc: 'Double-wall stainless tumbler. Holds heat 6hr, cold 24hr. The most-kept promo item across every category.', emoji: '🥤' },
  { id: 'dw-2', name: 'Insulated water bottle (24oz)', category: 'Drinkware', icon: 'coffee', priceRange: '$16-28', decoration: 'Laser engraving, UV print', tags: ['outdoor', 'fitness', 'daily use', 'event'], desc: 'Wide-mouth insulated bottle. Strong for outdoor events, fitness brands, jobsite crews.', emoji: '🍶' },
  { id: 'dw-3', name: 'Soft-sided 6-can cooler bag', category: 'Drinkware', icon: 'coffee', priceRange: '$12-22', decoration: 'Screen print, embroidery, heat transfer', tags: ['outdoor', 'tailgate', 'summer event', 'lifestyle'], desc: 'Insulated 6-pack cooler with shoulder strap. Tailgate, jobsite lunch, summer outdoor events.', emoji: '🎒' },
  { id: 'dw-4', name: '24-can rolling cooler', category: 'Drinkware', icon: 'coffee', priceRange: '$45-85', decoration: 'Screen print, embroidery, heat transfer', tags: ['event', 'premium', 'outdoor', 'high-end gift'], desc: 'Large wheeled cooler. Executive gift, big event giveaway, golf tournament prize.', emoji: '🧳' },
  { id: 'dw-5', name: 'Slim can koozie', category: 'Drinkware', icon: 'coffee', priceRange: '$1-2.50', decoration: 'Screen print, full-color print', tags: ['budget', 'event', 'tradeshow', 'tailgate'], desc: 'Neoprene koozie for slim cans. Cheap, ubiquitous, full-color printing makes the logo pop.', emoji: '🥫' },
  { id: 'dw-6', name: 'Ceramic mug (11oz)', category: 'Drinkware', icon: 'coffee', priceRange: '$6-12', decoration: 'Sublimation, wrap print', tags: ['office', 'gift', 'welcome kit'], desc: 'Classic ceramic coffee mug. Full-color sublimation looks great. Office-and-home favorite.', emoji: '☕' },
  { id: 'dw-7', name: 'Stainless French press', category: 'Drinkware', icon: 'coffee', priceRange: '$22-38', decoration: 'Laser engraving', tags: ['premium', 'gift', 'executive', 'lifestyle'], desc: 'Insulated stainless French press. Elevated coffee-lover gift. Great for executive thank-yous.', emoji: '🫖' },
  
  // ---- BAGS ----
  { id: 'bg-1', name: 'Cotton tote bag', category: 'Bags', icon: 'briefcase', priceRange: '$3-8', decoration: 'Screen print, DTF', tags: ['budget', 'event', 'tradeshow', 'eco'], desc: 'Standard canvas tote. Conference giveaway, retail bag, eco-friendly positioning.', emoji: '🛍️' },
  { id: 'bg-2', name: 'Heavyweight tote (12oz canvas)', category: 'Bags', icon: 'briefcase', priceRange: '$8-16', decoration: 'Screen print, embroidery, heat transfer', tags: ['premium', 'lifestyle', 'farmers market', 'shopping'], desc: 'Heavy 12oz canvas with structured base. Holds up under real load. Premium eco-friendly.', emoji: '🛍️' },
  { id: 'bg-3', name: 'Drawstring cinch bag', category: 'Bags', icon: 'briefcase', priceRange: '$3-7', decoration: 'Screen print, DTF', tags: ['budget', 'event', 'tradeshow', 'fitness'], desc: 'Polyester drawstring sport pack. Bulk-friendly cost for tradeshow attendee gifts.', emoji: '🎒' },
  { id: 'bg-4', name: 'Laptop backpack', category: 'Bags', icon: 'briefcase', priceRange: '$32-65', decoration: 'Embroidery, heat transfer', tags: ['premium', 'tech', 'employee', 'commuter'], desc: '15"-17" laptop backpack with padded sleeve. Tech company onboarding favorite.', emoji: '🎒' },
  { id: 'bg-5', name: 'Duffel bag (gym-size)', category: 'Bags', icon: 'briefcase', priceRange: '$22-45', decoration: 'Embroidery, screen print', tags: ['fitness', 'crew gear', 'sports team', 'event'], desc: 'Mid-size gym duffel. Trades crew, fitness brands, sports team event prize.', emoji: '👜' },
  
  // ---- TECH ----
  { id: 't-1', name: 'Wireless charging pad', category: 'Tech', icon: 'headphones', priceRange: '$12-22', decoration: 'UV print, laser engraving', tags: ['office', 'gift', 'desk', 'tech'], desc: 'Qi wireless charger. Office desk accessory. Strong for tech-company employee gifts.', emoji: '🔌' },
  { id: 't-2', name: 'Bluetooth speaker (mid-tier)', category: 'Tech', icon: 'headphones', priceRange: '$22-48', decoration: 'UV print, laser engraving', tags: ['premium', 'gift', 'outdoor', 'lifestyle'], desc: 'Portable Bluetooth speaker. Solid mid-range gift. Branded with UV print or laser.', emoji: '🔊' },
  { id: 't-3', name: 'Power bank (10,000 mAh)', category: 'Tech', icon: 'headphones', priceRange: '$14-26', decoration: 'UV print, laser engraving', tags: ['daily use', 'travel', 'gift'], desc: 'Portable battery pack. Travel/commute essential. Logo on top face.', emoji: '🔋' },
  { id: 't-4', name: 'Wireless earbuds', category: 'Tech', icon: 'headphones', priceRange: '$28-65', decoration: 'UV print on case', tags: ['premium', 'gift', 'tech', 'fitness'], desc: 'TWS earbuds with charging case. Logo on the case. Premium tech-company gift territory.', emoji: '🎧' },
  { id: 't-5', name: 'USB-C cable (braided)', category: 'Tech', icon: 'headphones', priceRange: '$4-10', decoration: 'Custom packaging, branded card', tags: ['budget', 'tradeshow', 'office'], desc: 'Braided USB-C-to-C cable. Cheap utility item — branding lives on the packaging.', emoji: '🔌' },
  
  // ---- WRITING ----
  { id: 'w-1', name: 'Metal twist pen', category: 'Writing', icon: 'pencil', priceRange: '$1.50-4', decoration: 'Laser engraving, pad print', tags: ['budget', 'office', 'mailers', 'tradeshow'], desc: 'Standard metal click pen. Bulk-friendly, laser engraving makes it look premium.', emoji: '🖊️' },
  { id: 'w-2', name: 'Soft-touch barrel pen', category: 'Writing', icon: 'pencil', priceRange: '$1-3', decoration: 'Pad print, laser engraving', tags: ['budget', 'tradeshow', 'event'], desc: 'Rubberized soft-touch finish. Looks more expensive than it is.', emoji: '✏️' },
  { id: 'w-3', name: 'Hardcover journal (5x8)', category: 'Writing', icon: 'pencil', priceRange: '$8-18', decoration: 'Debossing, screen print, foil stamp', tags: ['premium', 'gift', 'executive', 'event'], desc: 'Lined hardcover journal. Premium gift positioning. Debossing is the high-end finish.', emoji: '📓' },
  
  // ---- SAFETY / TRADES ----
  { id: 's-1', name: 'Hi-vis safety vest (ANSI Class 2)', category: 'Safety', icon: 'hardhat', priceRange: '$12-22', decoration: 'Heat transfer, screen print, embroidery', tags: ['trades', 'construction', 'field service'], desc: 'ANSI Class 2 reflective vest. Standard for jobsite visibility. Logo on chest + back yoke.', emoji: '🦺' },
  { id: 's-2', name: 'Hard hat', category: 'Safety', icon: 'hardhat', priceRange: '$14-28', decoration: 'Vinyl decal, custom branding', tags: ['trades', 'construction', 'field service'], desc: 'OSHA-compliant hard hat. Logo via vinyl decal on front + sides.', emoji: '⛑️' },
  { id: 's-3', name: 'FR-rated work shirt', category: 'Safety', icon: 'hardhat', priceRange: '$32-58', decoration: 'Embroidery (FR-rated thread required)', tags: ['trades', 'electrical', 'industrial', 'crew gear'], desc: 'Flame-resistant button-up shirt. Required gear for electrical and industrial crews.', emoji: '👷' },
  
  // ---- EVENTS / GIFTS ----
  { id: 'ev-1', name: 'Lanyard (badge + clip)', category: 'Events', icon: 'gift', priceRange: '$2-5', decoration: 'Dye sublimation, screen print', tags: ['event', 'tradeshow', 'conference'], desc: 'Polyester lanyard with bull clip + safety release. Full-color dye-sub looks best.', emoji: '🪪' },
  { id: 'ev-2', name: 'Premium welcome kit box', category: 'Events', icon: 'gift', priceRange: '$45-120/kit', decoration: 'Multi-item kit', tags: ['premium', 'employee onboarding', 'event', 'gift'], desc: 'Curated 4-6 item box. Typical mix: tumbler + tee + journal + tech item + custom packaging.', emoji: '🎁' },
  { id: 'ev-3', name: 'Stadium blanket', category: 'Events', icon: 'gift', priceRange: '$18-32', decoration: 'Embroidery, heat transfer', tags: ['cold weather', 'event', 'tailgate', 'gift'], desc: 'Fleece stadium blanket with carrying strap. Tailgate, outdoor event, cold-weather gift.', emoji: '🧣' },
  { id: 'ev-4', name: 'Branded socks', category: 'Apparel', icon: 'shirt', priceRange: '$8-15', decoration: 'Custom knit (full-color)', tags: ['lifestyle', 'gift', 'startup', 'unique'], desc: 'Custom-knit crew socks with logo. Memorable, surprisingly affordable at qty.', emoji: '🧦' },
];

const CATEGORIES = ['All', 'Apparel', 'Headwear', 'Drinkware', 'Bags', 'Tech', 'Writing', 'Safety', 'Events'];

const ICON_MAP = {
  shirt: Shirt,
  hat: HardHat, // reusing
  coffee: Coffee,
  briefcase: Briefcase,
  headphones: Headphones,
  pencil: Pencil,
  hardhat: HardHat,
  gift: Gift,
};

// ============================================================================
// AI PROMPT BUILDER
// ============================================================================
const buildPrompt = ({ brief, brand, count }) => `You are Braden Forge's product idea engine for HMH Holdings (Swagr, ForgedGear, ForgeEvents, Calibr, AYNP).

A customer just asked for ideas. Generate ${count} creative product recommendations.

# CUSTOMER BRIEF
"${brief.description}"
${brief.audience ? `Audience: ${brief.audience}` : ''}
${brief.occasion ? `Occasion: ${brief.occasion}` : ''}
${brief.budget ? `Budget guidance: ${brief.budget}` : ''}
${brief.quantity ? `Approximate quantity: ${brief.quantity}` : ''}

# BRAND VOICE
Sending under: ${brand} (${BRANDS[brand].tone})

# AVAILABLE PRODUCT CATALOG (use these EXACT names — don't invent products)
${CATALOG.map(p => `- ${p.name} (${p.category}, ${p.priceRange}, ${p.tags.join(', ')})`).join('\n')}

# RULES
- Pick products that MATCH the brief — don't just list random things
- Mix price tiers if the brief is open (one cheap, one mid, one premium)
- Vary categories unless brief is very specific (don't suggest 4 different t-shirts)
- For each idea, write a 1-2 sentence pitch in the right brand voice
- Pitches should feel like a knowledgeable promo person, not a generic ad
- For ${brand} specifically: ${BRANDS[brand].tone}
- Each "why_it_fits" should reference something SPECIFIC about the customer's brief
- No "premium quality," "best in class," "elevate your brand" type phrases

# OUTPUT
Return ONLY valid JSON. No preamble. No markdown fences. Schema:

{
  "intro": "1-2 sentence opener in brand voice that frames the suggestions",
  "ideas": [
    {
      "catalog_id": "ap-1 OR dw-3 etc — must match EXACTLY one of the catalog IDs above",
      "pitch_headline": "5-7 word headline for this idea",
      "why_it_fits": "1-2 sentences referencing something specific from the brief",
      "suggested_decoration": "specific method recommendation (e.g., 'Embroidered logo on left chest')",
      "estimated_unit_range": "rough price range for this customer's likely qty (e.g., '$14-18 all-in at 100 units')"
    }
  ],
  "follow_up_questions": [
    "1-3 questions to ask the customer to narrow it down",
    "Each one short — under 12 words"
  ]
}`;

// ============================================================================
// API CALLER
// ============================================================================
const generateIdeas = async (params) => {
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

const Header = ({ brand, onBrandChange, savedCount }) => (
  <div className="border-b border-purple-900/40 bg-black/60 backdrop-blur sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-purple gradient-purple-gold">
          <Lightbulb className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-xl font-bold text-white tracking-tight leading-none">
            Idea Generator
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mt-1">
            HMH Holdings · Product Recommendations
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {savedCount > 0 && (
          <div className="font-mono text-xs flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-white font-semibold">{savedCount}</span>
            <span className="text-zinc-500 uppercase tracking-wider">saved</span>
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

const BriefForm = ({ onSubmit, loading }) => {
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [quantity, setQuantity] = useState('');
  const [count, setCount] = useState(6);

  const handleSubmit = () => {
    if (!description.trim()) return;
    onSubmit({
      brief: { description, audience, occasion, budget, quantity },
      count,
    });
  };

  const examples = [
    "Show me some cooler bag ideas for a summer client appreciation event",
    "Welcome kit ideas for new hires at a 50-person SaaS startup",
    "Crew gear ideas for a 200-employee electrical contractor",
    "Conference giveaway ideas under $5 per item for 500 attendees",
    "Executive holiday gift ideas, premium feel, around $50 per person",
  ];

  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
          Customer brief
        </div>
        <div className="font-mono text-[10px] text-zinc-500">
          Required: description
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">
            What did the customer ask for?
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g., Show me some cooler bag ideas for a summer client appreciation event"
            rows={3}
            className="w-full bg-black/40 border border-zinc-800/60 rounded p-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40 resize-none leading-relaxed"
          />
          {!description && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setDescription(ex)}
                  className="px-2 py-1 bg-purple-950/20 hover:bg-purple-900/30 border border-purple-900/30 rounded text-[10px] text-purple-300 font-mono transition-all"
                >
                  + {ex.slice(0, 40)}...
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">
              Audience (optional)
            </label>
            <input
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="e.g., clients, new hires, jobsite crews"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">
              Occasion (optional)
            </label>
            <input
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
              placeholder="e.g., summer event, holiday gift, onboarding"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">
              Budget per item
            </label>
            <input
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="e.g., under $25"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">
              Quantity
            </label>
            <input
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="e.g., 100 units"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">
              # ideas
            </label>
            <select
              value={count}
              onChange={e => setCount(parseInt(e.target.value, 10))}
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40 cursor-pointer"
            >
              {[4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} ideas</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSubmit}
            disabled={!description.trim() || loading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-2 glow-purple"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Generate ideas</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const IdeaCard = ({ idea, catalogProduct, brand, onSave, onUnsave, isSaved, onAction }) => {
  const b = BRANDS[brand];
  if (!catalogProduct) return null;
  
  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden card-hover slide-in">
      {/* Visual header — emoji-based since we don't have product photos */}
      <div className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
           style={{ background: `linear-gradient(135deg, ${b.color}15 0%, ${b.color}05 100%)` }}>
        <div className="text-7xl drop-shadow-lg opacity-90">
          {catalogProduct.emoji}
        </div>
        
        {/* Save button */}
        <button
          onClick={() => isSaved ? onUnsave(idea.catalog_id) : onSave(idea)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur transition-all flex items-center justify-center ${
            isSaved 
              ? 'bg-pink-500/80 text-white' 
              : 'bg-black/40 hover:bg-pink-500/40 text-zinc-300 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        
        {/* Category tag */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded font-mono text-[9px] uppercase tracking-wider text-white">
          {catalogProduct.category}
        </div>
        
        {/* Price tag */}
        <div className="absolute bottom-3 right-3 px-2 py-1 backdrop-blur rounded font-mono text-[10px]"
             style={{ background: `${b.color}90`, color: 'white' }}>
          {catalogProduct.priceRange}
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4 space-y-2.5">
        <div>
          <div className="font-display text-lg font-bold text-white leading-tight">
            {idea.pitch_headline || catalogProduct.name}
          </div>
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
            {catalogProduct.name}
          </div>
        </div>
        
        <div className="text-xs text-zinc-300 leading-relaxed">
          {idea.why_it_fits}
        </div>
        
        <div className="border-t border-zinc-800/60 pt-2.5 space-y-1.5">
          <div className="flex items-start gap-2 text-[10px]">
            <Tag className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: b.color }} />
            <div className="text-zinc-400">{idea.suggested_decoration}</div>
          </div>
          {idea.estimated_unit_range && (
            <div className="flex items-start gap-2 text-[10px]">
              <Calculator className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: b.color }} />
              <div className="text-zinc-400">{idea.estimated_unit_range}</div>
            </div>
          )}
        </div>
        
        <div className="border-t border-zinc-800/60 pt-2.5 flex gap-1.5">
          <button
            onClick={() => onAction('mockup', catalogProduct)}
            className="flex-1 px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[10px] uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-all"
          >
            <ImageIcon className="w-3 h-3" /> Mockup
          </button>
          <button
            onClick={() => onAction('quote', catalogProduct)}
            className="flex-1 px-2 py-1.5 text-white font-mono text-[10px] uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-all"
            style={{ background: b.color }}
          >
            <Calculator className="w-3 h-3" /> Quote
          </button>
        </div>
      </div>
    </div>
  );
};

const CatalogBrowser = ({ savedIds, onSave, onUnsave, onAction, brand }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  const filtered = useMemo(() => {
    return CATALOG.filter(p => {
      if (category !== 'All' && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) &&
            !p.tags.some(t => t.toLowerCase().includes(q)) &&
            !p.desc.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [search, category]);
  
  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40 flex items-center justify-between flex-wrap gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 flex items-center gap-2">
          <Search className="w-3 h-3" /> Browse catalog · {filtered.length} of {CATALOG.length}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-black/40 border border-zinc-800/60 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40 w-32"
          />
        </div>
      </div>
      
      <div className="px-4 py-3 border-b border-zinc-900/60 bg-zinc-950/40 overflow-x-auto">
        <div className="flex gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'bg-black/40 text-zinc-400 border border-zinc-800/60 hover:border-purple-700/40 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <div className="font-mono text-xs text-zinc-500">No matches. Try a different search or category.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(p => {
              const isSaved = savedIds.has(p.id);
              const b = BRANDS[brand];
              return (
                <div key={p.id} className="bg-zinc-900/40 border border-zinc-800/60 rounded-md overflow-hidden card-hover">
                  <div className="aspect-square flex items-center justify-center relative"
                       style={{ background: `linear-gradient(135deg, ${b.color}15 0%, ${b.color}05 100%)` }}>
                    <div className="text-5xl opacity-80">{p.emoji}</div>
                    <button
                      onClick={() => isSaved 
                        ? onUnsave(p.id) 
                        : onSave({ catalog_id: p.id, pitch_headline: p.name, why_it_fits: p.desc, suggested_decoration: p.decoration, estimated_unit_range: p.priceRange })}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full backdrop-blur transition-all flex items-center justify-center ${
                        isSaved ? 'bg-pink-500/80 text-white' : 'bg-black/40 hover:bg-pink-500/40 text-zinc-300'
                      }`}
                    >
                      <Heart className="w-3 h-3" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="p-2.5">
                    <div className="font-display text-sm font-semibold text-white leading-tight mb-1">
                      {p.name}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-zinc-500 uppercase tracking-wider">{p.category}</span>
                      <span style={{ color: b.color }}>{p.priceRange}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => onAction('mockup', p)}
                        className="flex-1 px-1.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[9px] uppercase rounded"
                      >
                        Mockup
                      </button>
                      <button
                        onClick={() => onAction('quote', p)}
                        className="flex-1 px-1.5 py-1 text-white font-mono text-[9px] uppercase rounded"
                        style={{ background: b.color }}
                      >
                        Quote
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SavedPanel = ({ saved, onUnsave, onCopyEmail, onExportPDF, brand }) => {
  if (saved.length === 0) return null;
  const b = BRANDS[brand];
  
  return (
    <div className="bg-zinc-950/80 border-2 rounded-lg overflow-hidden sticky top-32" style={{ borderColor: `${b.color}40` }}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between" style={{ background: `${b.color}10`, borderColor: `${b.color}40` }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: b.color }}>
          <Heart className="w-3 h-3" fill="currentColor" />
          Saved · {saved.length}
        </div>
      </div>
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
        {saved.map(item => {
          const product = CATALOG.find(p => p.id === item.catalog_id);
          if (!product) return null;
          return (
            <div key={item.catalog_id} className="bg-black/40 border border-zinc-800/60 rounded p-2 flex items-center gap-2">
              <div className="text-2xl flex-shrink-0">{product.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm text-white truncate">{product.name}</div>
                <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                  {product.category} · {product.priceRange}
                </div>
              </div>
              <button
                onClick={() => onUnsave(item.catalog_id)}
                className="text-zinc-500 hover:text-red-400 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-zinc-900/60 bg-black/40 space-y-2">
        <button
          onClick={onCopyEmail}
          className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[10px] uppercase tracking-wider rounded flex items-center justify-center gap-1.5"
        >
          <Mail className="w-3 h-3" /> Copy as email
        </button>
        <button
          onClick={onExportPDF}
          className="w-full px-3 py-2 text-white font-mono text-[10px] uppercase tracking-wider rounded flex items-center justify-center gap-1.5"
          style={{ background: b.color }}
        >
          <Download className="w-3 h-3" /> Export pitch PDF
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS — email and PDF
// ============================================================================
const buildEmailBody = (saved, brand, customBrief) => {
  const b = BRANDS[brand];
  const sigs = {
    Swagr: 'Braden Forge | Swagr\nsales@swagrshop.com · swagrshop.com',
    ForgedGear: 'Braden Forge | ForgedGear\nsales@swagrshop.com · forgedgear.net',
    ForgeEvents: 'Braden Forge | ForgeEvents\nsales@swagrshop.com · forgeevent.co',
    Calibr: 'Braden Forge | Calibr\nsales@swagrshop.com · getcalibr.co',
    AYNP: 'Braden Forge\nAll You Need Promos · ASI #117382\nallyouneedpromos.net',
  };
  
  const openers = {
    Swagr: "Hey,\n\nPulled together a quick set of ideas based on what you mentioned:",
    ForgedGear: "Quick set of options for the crew gear:",
    ForgeEvents: "Here are some event-ready options to consider:",
    Calibr: "A curated set of options for your team:",
    AYNP: "Here are some options to consider for the project:",
  };
  
  const itemLines = saved.map((item, idx) => {
    const p = CATALOG.find(c => c.id === item.catalog_id);
    if (!p) return '';
    return `${idx + 1}. ${item.pitch_headline || p.name}
   ${item.why_it_fits || p.desc}
   Decoration: ${item.suggested_decoration || p.decoration}
   Est. range: ${item.estimated_unit_range || p.priceRange}`;
  }).join('\n\n');
  
  const closers = {
    Swagr: "Want me to put together real pricing on any of these? I can also send mockups so you can see your logo on whichever ones grab you.",
    ForgedGear: "Pick the ones that fit and I'll put real pricing together. Happy to send mockups first so you can see the crew gear with your logo on it.",
    ForgeEvents: "Which of these fit the event vibe? Once you pick I can lock in pricing and timeline so we hit your date.",
    Calibr: "Let me know which direction resonates and I'll put together pricing.",
    AYNP: "Let me know which direction interests you and I'll put together formal pricing on the selections.",
  };
  
  return `${openers[brand]}

${itemLines}

${closers[brand]}

Thanks,
${sigs[brand]}`;
};

const generatePDF = ({ saved, brand, brief }) => {
  const b = BRANDS[brand];
  const bConfig = {
    Swagr: { bg: '#F0EDE6', ink: '#1C1C1C', name: 'Swagr' },
    ForgedGear: { bg: '#E8E5E0', ink: '#1A1A1A', name: 'ForgedGear' },
    ForgeEvents: { bg: '#FFFBF0', ink: '#1C1C1C', name: 'ForgeEvents' },
    Calibr: { bg: '#F5F5F2', ink: '#1C1C1C', name: 'Calibr' },
    AYNP: { bg: '#FFFFFF', ink: '#1C1C1C', name: 'All You Need Promos' },
  }[brand];
  
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked. Allow pop-ups for this tool to export PDFs.');
    return;
  }
  
  const itemsHTML = saved.map(item => {
    const p = CATALOG.find(c => c.id === item.catalog_id);
    if (!p) return '';
    return `
      <div class="idea-card">
        <div class="idea-visual" style="background: linear-gradient(135deg, ${b.color}15 0%, ${b.color}05 100%);">
          <div class="emoji">${p.emoji}</div>
          <div class="price-tag" style="background: ${b.color};">${p.priceRange}</div>
        </div>
        <div class="idea-body">
          <div class="idea-category">${p.category}</div>
          <div class="idea-headline">${item.pitch_headline || p.name}</div>
          <div class="idea-subtitle">${p.name}</div>
          <div class="idea-pitch">${item.why_it_fits || p.desc}</div>
          <div class="idea-meta">
            <div class="meta-line"><strong>Decoration:</strong> ${item.suggested_decoration || p.decoration}</div>
            ${item.estimated_unit_range ? `<div class="meta-line"><strong>Est.:</strong> ${item.estimated_unit_range}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${brand} — Product Ideas — ${today}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Fraunces:wght@500;600;700;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    background: ${bConfig.bg};
    color: ${bConfig.ink};
  }
  
  .page {
    width: 8.5in;
    min-height: 11in;
    padding: 0.5in;
    margin: 0 auto;
    background: ${bConfig.bg};
  }
  
  .header {
    border-bottom: 3px solid ${b.color};
    padding-bottom: 18px;
    margin-bottom: 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  
  .brand-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 30px;
    color: ${b.color};
    letter-spacing: -0.02em;
  }
  
  .header-right {
    text-align: right;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${bConfig.ink};
    opacity: 0.7;
    line-height: 1.6;
  }
  
  .intro {
    margin-bottom: 28px;
  }
  
  .intro-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
    line-height: 1.05;
  }
  
  .intro-sub {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    color: ${bConfig.ink};
    opacity: 0.7;
    line-height: 1.5;
    max-width: 70%;
  }
  
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .idea-card {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    break-inside: avoid;
  }
  
  .idea-visual {
    aspect-ratio: 4/3;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .emoji {
    font-size: 72px;
    opacity: 0.9;
  }
  
  .price-tag {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 500;
  }
  
  .idea-body {
    padding: 14px 16px;
  }
  
  .idea-category {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${b.color};
    margin-bottom: 4px;
  }
  
  .idea-headline {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 2px;
  }
  
  .idea-subtitle {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${bConfig.ink};
    opacity: 0.5;
    margin-bottom: 8px;
  }
  
  .idea-pitch {
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 11px;
    color: ${bConfig.ink};
    opacity: 0.85;
    line-height: 1.45;
    margin-bottom: 10px;
  }
  
  .idea-meta {
    border-top: 1px solid rgba(0,0,0,0.08);
    padding-top: 8px;
    font-size: 9px;
    line-height: 1.5;
    color: ${bConfig.ink};
    opacity: 0.75;
  }
  
  .meta-line strong {
    color: ${b.color};
    font-weight: 600;
    margin-right: 4px;
  }
  
  .footer {
    margin-top: 32px;
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
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  
  .footer .right {
    text-align: right;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${bConfig.ink};
    opacity: 0.6;
    line-height: 1.6;
  }
  
  .next-step {
    background: ${b.color};
    color: white;
    padding: 14px 20px;
    border-radius: 8px;
    margin-top: 20px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 12px;
    line-height: 1.5;
  }
  
  .next-step strong {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 14px;
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
  }
  
  @media print {
    @page { margin: 0; size: letter; }
    body { background: ${bConfig.bg}; }
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
    <div class="brand-mark">${bConfig.name}</div>
    <div class="header-right">
      Product ideas<br>
      ${today}
    </div>
  </div>
  
  <div class="intro">
    <div class="intro-title">A few ideas worth a look.</div>
    <div class="intro-sub">${brief?.description ? `Based on your ask: "${brief.description.slice(0, 140)}${brief.description.length > 140 ? '...' : ''}". ` : ''}Pricing on any of these is one reply away.</div>
  </div>
  
  <div class="grid">
    ${itemsHTML}
  </div>
  
  <div class="next-step">
    <strong>Next step</strong>
    Pick the ideas that fit and reply with which ones you want real pricing on. Happy to send mockups of your logo on any of them before you commit.
  </div>
  
  <div class="footer">
    <div class="signature">
      <div class="name">Braden Forge</div>
      <div>${bConfig.name === 'All You Need Promos' ? 'All You Need Promos · ASI #117382' : `${bConfig.name}`}</div>
      <div>sales@swagrshop.com</div>
    </div>
    <div class="right">
      ${saved.length} ideas<br>
      ${today}
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // {intro, ideas, follow_up_questions}
  const [currentBrief, setCurrentBrief] = useState(null);
  const [saved, setSaved] = useState([]);
  const [actionConfirm, setActionConfirm] = useState(null);
  
  const savedIds = useMemo(() => new Set(saved.map(s => s.catalog_id)), [saved]);
  
  const handleGenerate = async ({ brief, count }) => {
    setLoading(true);
    setError('');
    setCurrentBrief(brief);
    try {
      const data = await generateIdeas({ brief, brand, count });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = (idea) => {
    if (savedIds.has(idea.catalog_id)) return;
    setSaved(prev => [...prev, idea]);
  };
  
  const handleUnsave = (catalogId) => {
    setSaved(prev => prev.filter(s => s.catalog_id !== catalogId));
  };
  
  const handleAction = (action, product) => {
    setActionConfirm({ action, product });
    setTimeout(() => setActionConfirm(null), 3500);
  };
  
  const handleCopyEmail = async () => {
    const body = buildEmailBody(saved, brand, currentBrief);
    await navigator.clipboard.writeText(body);
    setActionConfirm({ action: 'email-copied' });
    setTimeout(() => setActionConfirm(null), 2200);
  };
  
  const handleExportPDF = () => {
    generatePDF({ saved, brand, brief: currentBrief });
  };
  
  return (
    <div className="min-h-screen bg-black text-white font-body terminal-grid">
      <FontStyles />
      <Header brand={brand} onBrandChange={setBrand} savedCount={saved.length} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!result && !loading && (
          <div className="text-center py-8 mb-4">
            <h2 className="font-display text-4xl font-bold text-white mb-3 tracking-tight">
              "Show me some ideas." Solved.
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Customer asked open-ended? Drop the brief in, get 4-12 product ideas tailored to their audience, occasion, and budget. Save the ones you like, send as a branded "here are some ideas" deck.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT — main content */}
          <div className={saved.length > 0 ? 'col-span-9 space-y-6' : 'col-span-12 space-y-6'}>
            <BriefForm onSubmit={handleGenerate} loading={loading} />
            
            {error && (
              <div className="bg-red-950/30 border border-red-700/40 rounded p-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-mono text-xs text-red-300 uppercase tracking-wider mb-1">Generation failed</div>
                  <div className="text-sm text-red-200">{error}</div>
                </div>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg overflow-hidden">
                    <div className="aspect-[4/3] shimmer" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 shimmer rounded w-3/4" />
                      <div className="h-3 shimmer rounded w-full" />
                      <div className="h-3 shimmer rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {result && !loading && (
              <>
                {result.intro && (
                  <div className="bg-zinc-950/60 border border-purple-700/30 rounded-lg p-4 slide-in">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Pitch opener
                    </div>
                    <div className="text-sm text-zinc-200 leading-relaxed italic">"{result.intro}"</div>
                  </div>
                )}
                
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-3 h-3" /> Ideas · {result.ideas?.length || 0}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.ideas?.map((idea, idx) => {
                      const catalogProduct = CATALOG.find(p => p.id === idea.catalog_id);
                      return (
                        <IdeaCard
                          key={idx}
                          idea={idea}
                          catalogProduct={catalogProduct}
                          brand={brand}
                          isSaved={savedIds.has(idea.catalog_id)}
                          onSave={handleSave}
                          onUnsave={handleUnsave}
                          onAction={handleAction}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {result.follow_up_questions?.length > 0 && (
                  <div className="bg-amber-950/15 border border-amber-700/30 rounded-lg p-4 slide-in">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400 mb-3 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3" /> Questions to narrow it down
                    </div>
                    <div className="space-y-1.5">
                      {result.follow_up_questions.map((q, i) => (
                        <div key={i} className="text-sm text-amber-100 flex items-start gap-2">
                          <span className="text-amber-400 font-mono text-xs mt-0.5">{i + 1}.</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Browse catalog — always visible */}
            <CatalogBrowser
              savedIds={savedIds}
              onSave={handleSave}
              onUnsave={handleUnsave}
              onAction={handleAction}
              brand={brand}
            />
          </div>
          
          {/* RIGHT — saved panel */}
          {saved.length > 0 && (
            <div className="col-span-3">
              <SavedPanel
                saved={saved}
                onUnsave={handleUnsave}
                onCopyEmail={handleCopyEmail}
                onExportPDF={handleExportPDF}
                brand={brand}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Action confirmation toast */}
      {actionConfirm && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-purple-500/40 rounded-lg px-4 py-3 shadow-2xl glow-purple flex items-center gap-3 z-50 slide-in">
          {actionConfirm.action === 'email-copied' ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div className="text-sm text-white font-mono">Email copied to clipboard</div>
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4 text-purple-400" />
              <div className="text-sm text-zinc-200">
                Open <span className="font-mono text-purple-300">{actionConfirm.action === 'mockup' ? 'Mockup Studio' : 'Quote Engine'}</span> with{' '}
                <span className="text-white font-medium">{actionConfirm.product?.name}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
