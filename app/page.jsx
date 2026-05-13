'use client';

import Link from 'next/link';
import { Send, Inbox, Calculator, Layers, Lightbulb, ExternalLink, Sparkles } from 'lucide-react';

const TOOLS = [
  { href: '/outbound', icon: Send, name: 'Outbound Engine', desc: 'Apollo CSV → 4-email sequence per lead → CSV for Instantly', color: '#6C47FF' },
  { href: '/reply', icon: Inbox, name: 'Reply Handler', desc: 'Inbound reply → classify + draft response in brand voice', color: '#FF7A1A' },
  { href: '/quote', icon: Calculator, name: 'Quote Engine', desc: 'Line items + ZIP → all-inclusive PDF quote or email', color: '#F5C842' },
  { href: '/mockup', icon: Layers, name: 'Mockup Studio', desc: 'Product photo + logo → branded PDF proof', color: '#00D9B2' },
  { href: '/ideas', icon: Lightbulb, name: 'Idea Generator', desc: 'Customer brief → 4-12 product ideas → mood-board PDF', color: '#E6E1D4' },
];

const EXTERNAL = [
  { href: 'https://vectorizer.ai', name: 'Vectorizer.AI', desc: 'Raster logo → vector ($9/mo)' },
  { href: 'https://claude.ai', name: 'Claude · HMH OS Project', desc: '21 skills · brain layer' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="terminal-grid min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #F5C842 100%)', boxShadow: '0 0 24px rgba(108, 71, 255, 0.4)' }}>
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-display text-3xl font-bold tracking-tight leading-none">HMH Operating System</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mt-1.5">Internal · Braden Forge · HMH Holdings</div>
              </div>
            </div>
            <p className="text-zinc-400 max-w-2xl leading-relaxed">Five tools. One brain (Claude + 21 skills). Built for the way the business actually runs.</p>
          </div>

          <div className="mb-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-4">The 5 tools</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOOLS.map(tool => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.href} href={tool.href} className="group bg-zinc-950/80 border border-purple-900/40 rounded-lg p-5 hover:border-purple-500/60 transition-all hover:-translate-y-0.5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${tool.color}20`, border: `1px solid ${tool.color}40` }}>
                        <Icon className="w-5 h-5" style={{ color: tool.color }} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-lg font-bold text-white leading-tight mb-1 group-hover:text-purple-200 transition-colors">{tool.name}</div>
                        <div className="text-xs text-zinc-400 leading-relaxed">{tool.desc}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-4">External · paid services</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXTERNAL.map(item => (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-4 hover:border-zinc-700 transition-all flex items-center justify-between group">
                  <div>
                    <div className="text-sm text-white font-medium">{item.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{item.desc}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-purple-300 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-600">v1.0 · hmh holdings llc · do not share</div>
        </div>
      </div>
    </div>
  );
}
