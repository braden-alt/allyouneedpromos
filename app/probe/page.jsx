'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
Search, Zap, AlertCircle, CheckCircle2, XCircle, Loader2,
FileText, Activity, AlertTriangle, ChevronLeft, Database, Eye
} from 'lucide-react';

const SUPPLIER_SYSTEMS = [
{ value: 'hpg', label: 'HPG Brands' },
{ value: 'sanmar', label: 'SanMar (UAT)' },
{ value: 'logomark', label: 'Logomark' },
  { value: 'gemline', label: 'Gemline' },
];

const SANMAR_SKUS = ['PC61', 'K500', 'CS401'];

const LOGOMARK_SKUS = ['LM100', 'WB100', 'NB200'];
const GEMLINE_SKUS = ['1625-06', '8070-41', '702-73'];

const BRANDS = [
{ value: 'hubpen', label: 'Hub Pen' },
{ value: 'beacon', label: 'Beacon Promotions' },
{ value: 'best', label: 'Best Promotions USA' },
{ value: 'handstands', label: 'Handstands' },
{ value: 'mixie', label: 'Mixie' },
{ value: 'origaudio', label: 'Origaudio' },
{ value: 'sugarspot', label: 'SugarSpot' },
{ value: 'debco', label: 'Debco Bag (USA)' },
{ value: 'debcocanada', label: 'Debco Bag (Canada)' },
];

const BRAND_SKUS = {
hubpen: [
{ sku: '296', label: 'Javalina Revive Pen' },
{ sku: '230', label: 'Hub Pen 230' },
{ sku: '280', label: 'Hub Pen 280' },
],
beacon: [],
best: [],
handstands: [],
mixie: [],
origaudio: [],
sugarspot: [],
debco: [],
debcocanada: [],
};

export default function ProbePage() {
const [productID, setProductID] = useState('');
const [brandPath, setBrandPath] = useState('hubpen');
const [supplierSystem, setSupplierSystem] = useState('hpg');
const [loading, setLoading] = useState(false);
const [results, setResults] = useState(null);
const [error, setError] = useState(null);

const runProbe = async () => {
if (!productID.trim()) {
setError('Enter a product ID first');
return;
}

setLoading(true);
setError(null);
setResults(null);

try {
const response = await fetch('/api/probe-hpg', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ productID: productID.trim(), brandPath, supplierSystem }),
});

const data = await response.json();

if (!response.ok) {
setError(data.error || 'Probe failed');
if (data.hint) setError(prev => `${prev} — ${data.hint}`);
} else {
// Normalize: endpoints object → array, verdict string → counts object
const epList = Array.isArray(data.endpoints)
? data.endpoints
: Object.values(data.endpoints || {});
const normalized = {
...data,
endpoints: epList,
verdict: typeof data.verdict === 'object' ? data.verdict : {
successCount: epList.filter(e => e.ok && !e.isFault).length,
faultCount: epList.filter(e => e.isFault).length,
errorCount: epList.filter(e => !e.ok).length,
imprintDataFound: epList.some(e => e.hasImprintData),
},
};
setResults(normalized);
}
} catch (err) {
setError(`Network error: ${err.message}`);
} finally {
setLoading(false);
}
};

return (
<div className="min-h-screen bg-black text-white">
<div className="terminal-grid min-h-screen">
<div className="max-w-5xl mx-auto px-6 py-12">
<Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 text-sm font-mono uppercase tracking-wider">
<ChevronLeft className="w-4 h-4" />
Back to dashboard
</Link>

<div className="mb-8">
<div className="flex items-center gap-3 mb-3">
<div className="w-12 h-12 rounded-lg flex items-center justify-center"
style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #4A2DC4 100%)', boxShadow: '0 0 24px rgba(108, 71, 255, 0.4)' }}>
<Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
</div>
<div>
<div className="font-display text-3xl font-bold tracking-tight leading-none">PromoStandards Probe</div>
<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mt-1.5">
Multi-supplier diagnostic · HPG · SanMar · Logomark
</div>
</div>
</div>
<p className="text-zinc-400 max-w-2xl leading-relaxed text-sm">
Tests PromoStandards endpoints with your credentials. Reports back exactly what data each endpoint returns — so we know what to build into the real integration before we build it.
</p>
</div>

<div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden mb-6">
<div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40">
<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
Enter a product ID to probe
</div>
</div>
<div className="p-5 space-y-3">
<div className="mb-4">
<label className="block text-sm font-medium text-gray-700 mb-1">Supplier System</label>
<select
value={supplierSystem}
onChange={e => setSupplierSystem(e.target.value)}
className="border rounded px-3 py-2 w-full"
>
{SUPPLIER_SYSTEMS.map(s => (
<option key={s.value} value={s.value}>{s.label}</option>
))}
</select>
</div>
{supplierSystem === 'sanmar' && (
<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
Using SanMar UAT endpoint with public test credentials. Product data may differ from production.
</div>
)}
{supplierSystem === 'logomark' && (
<div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
Using Logomark production endpoint. Probing 6 endpoints: Product Data v2 + v1, Pricing v1, Media v1, Inventory v2 + v1.
</div>
)}
{supplierSystem === 'hpg' && (
<div className="mb-4">
<label className="block text-xs text-purple-300 mb-1 uppercase tracking-wide">Brand</label>
<select
value={brandPath}
onChange={e => setBrandPath(e.target.value)}
className="w-full bg-gray-800 border border-purple-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
>
{BRANDS.map(b => (
<option key={b.value} value={b.value}>{b.label}</option>
))}
</select>
</div>
)}
{supplierSystem === 'gemline' && (
<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
<p className="text-sm font-medium text-green-800">Gemline — Account 3000135</p>
<p className="text-xs text-green-600 mt-1">PromoStandards: Product Data v1/v2 · Pricing · Media · Inventory v1/v2</p>
</div>
)}
{supplierSystem === 'sanmar' && (
<div className="mb-4">
<label className="block text-sm font-medium text-gray-700 mb-1">Quick picks</label>
<div className="flex gap-2">
{SANMAR_SKUS.map(sku => (
<button key={sku} onClick={() => setProductID(sku)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">{sku}</button>
))}
</div>
</div>
)}
{supplierSystem === 'logomark' && (
<div className="mb-4">
<label className="block text-sm font-medium text-gray-700 mb-1">Quick picks</label>
<div className="flex gap-2">
{LOGOMARK_SKUS.map(sku => (
<button key={sku} onClick={() => setProductID(sku)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">{sku}</button>
))}
</div>
</div>
)}
{supplierSystem === 'gemline' && (
<div className="mb-4">
<label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Quick picks (Gemline)</label>
<div className="flex gap-2">
{GEMLINE_SKUS.map(sku => (
<button key={sku} onClick={() => setProductID(sku)} className="px-3 py-1 text-xs bg-zinc-100 hover:bg-zinc-200 rounded border border-zinc-200 font-mono">{sku}</button>
))}
</div>
</div>
)}
<div className="flex gap-2">
<input
value={productID}
onChange={e => setProductID(e.target.value)}
onKeyDown={e => { if (e.key === 'Enter') runProbe(); }}
placeholder="Product ID (e.g., B7, 15012, HS-1100)"
className="flex-1 bg-black/40 border border-zinc-800/60 rounded px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500/40 font-mono"
/>
<button
onClick={runProbe}
disabled={loading || !productID.trim()}
className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs uppercase tracking-wider rounded transition-all flex items-center gap-2"
style={{ boxShadow: !loading && productID.trim() ? '0 0 16px rgba(108, 71, 255, 0.3)' : 'none' }}
>
{loading ? (
<><Loader2 className="w-3.5 h-3.5 animate-spin" /> Probing...</>
) : (
<><Zap className="w-3.5 h-3.5" /> Run probe</>
)}
</button>
</div>

<div className="flex flex-wrap gap-1.5">
<span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Quick samples:</span>
{supplierSystem === 'hpg' && (BRAND_SKUS[brandPath] || []).length > 0 ? (
<div className="flex flex-wrap gap-1 mt-1">
{(BRAND_SKUS[brandPath]).map(s => (
<button
key={s.sku}
onClick={() => setProductID(s.sku)}
className="px-2 py-1 bg-purple-950/30 hover:bg-purple-900/40 border border-purple-900/30 rounded text-[10px] text-purple-300 font-mono transition-all"
>
{s.label} ({s.sku})
</button>
))}
</div>
) : supplierSystem === 'hpg' ? (
<p className="text-xs text-gray-500 italic mt-1">No quick samples — enter a SKU manually</p>
) : null}
</div>
</div>
</div>

{error && (
<div className="bg-red-950/30 border border-red-700/40 rounded p-4 flex items-start gap-2 mb-6">
<AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
<div className="text-sm text-red-200">{error}</div>
</div>
)}

{results && (
<div className="space-y-4">
<div className="bg-zinc-950/80 border-2 border-purple-700/40 rounded-lg p-5"
style={{ boxShadow: '0 0 24px rgba(108, 71, 255, 0.2)' }}>
<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-3">
Probe verdict · {results.productID}
</div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
<Stat label="Endpoints" value={results.endpoints.length} color="#6C47FF" />
<Stat label="Success" value={results.verdict.successCount} color="#10B981" />
<Stat label="Faults" value={results.verdict.faultCount} color="#F5C842" />
<Stat label="Network errors" value={results.verdict.errorCount - results.verdict.faultCount} color="#EF4444" />
</div>

<div className="mt-4 pt-4 border-t border-zinc-800/60">
<div className="flex items-center gap-2">
{results.verdict.imprintDataFound ? (
<>
<CheckCircle2 className="w-5 h-5 text-emerald-400" />
<span className="text-emerald-300 text-sm">Imprint-related fields detected in response — we may have what we need for mockups</span>
</>
) : (
<>
<AlertTriangle className="w-5 h-5 text-amber-400" />
<span className="text-amber-300 text-sm">No imprint location/size data detected — will need to source separately</span>
</>
)}
</div>
</div>
</div>

{results.endpoints.map((ep, i) => (
<EndpointCard key={i} endpoint={ep} />
))}

<div className="text-center font-mono text-[10px] text-zinc-600 pt-2">
Probe ran at {new Date(results.timestamp).toLocaleString()}
</div>
</div>
)}
</div>
</div>
</div>
);
}

function Stat({ label, value, color }) {
return (
<div className="bg-black/40 border border-zinc-800/60 rounded p-3">
<div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{label}</div>
<div className="font-display text-3xl font-bold" style={{ color }}>{value}</div>
</div>
);
}

function EndpointCard({ endpoint }) {
const ep = endpoint;
const success = ep.ok && !ep.isFault;
const statusColor = success ? '#10B981' : ep.isFault ? '#F5C842' : '#EF4444';

return (
<div className="bg-zinc-950/80 border rounded-lg overflow-hidden" style={{ borderColor: `${statusColor}40` }}>
<div className="px-4 py-3 border-b flex items-center justify-between"
style={{ background: `${statusColor}10`, borderColor: `${statusColor}30` }}>
<div className="flex items-center gap-2">
{success ? (
<CheckCircle2 className="w-4 h-4" style={{ color: statusColor }} />
) : (
<XCircle className="w-4 h-4" style={{ color: statusColor }} />
)}
<span className="font-mono text-xs uppercase tracking-wider" style={{ color: statusColor }}>
{ep.label}
</span>
</div>
<div className="font-mono text-[10px] text-zinc-400">
{ep.status} {ep.contentType && `· ${ep.contentType.split(';')[0]}`}
</div>
</div>

<div className="p-4 space-y-3">
{ep.error && (
<div className="bg-red-950/30 border border-red-700/40 rounded p-3 flex items-start gap-2">
<AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
<div className="text-xs text-red-200 font-mono">{ep.error}</div>
</div>
)}

{ep.errorHint && (
<div className="bg-amber-950/30 border border-amber-700/40 rounded p-3 flex items-start gap-2">
<AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
<div className="text-xs text-amber-100 font-mono">{ep.errorHint}</div>
</div>
)}

<div className="text-xs space-y-1.5">
<div className="flex gap-2">
<span className="font-mono uppercase tracking-wider text-zinc-500 w-32 flex-shrink-0">URL</span>
<span className="font-mono text-zinc-400 break-all">{ep.url}</span>
</div>
{ep.bodyLength != null && (
<div className="flex gap-2">
<span className="font-mono uppercase tracking-wider text-zinc-500 w-32 flex-shrink-0">Body size</span>
<span className="font-mono text-zinc-300">{ep.bodyLength.toLocaleString()} characters</span>
</div>
)}
{ep.hasImprintData && (
<div className="flex gap-2">
<span className="font-mono uppercase tracking-wider text-zinc-500 w-32 flex-shrink-0">Imprint fields</span>
<span className="font-mono text-emerald-400">✓ Detected in response</span>
</div>
)}
</div>

{ep.bodyPreview && (
<details className="border-t border-zinc-900/60 pt-3">
<summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
<Eye className="w-3 h-3" /> Response body preview ({(ep.bodyLength || ep.bodyPreview.length).toLocaleString()} chars)
</summary>
<pre className="mt-2 bg-black/60 border border-zinc-800/60 rounded p-3 text-[10px] text-zinc-400 overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap break-all leading-relaxed">
{ep.bodyPreview}
</pre>
</details>
)}
</div>
</div>
);
}
