'use client';

import { useState } from 'react';

export default function ProbePage() {
  const [productId, setProductId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runProbe() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const url = productId.trim()
        ? `/api/probe-hpg?productId=${encodeURIComponent(productId.trim())}`
        : '/api/probe-hpg';
      const res = await fetch(url);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const ok = result?.ok;

  return (
    <div style={{
      fontFamily: "'Courier New', monospace",
      background: '#0a0a0a',
      minHeight: '100vh',
      color: '#e0e0e0',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>HPG Probe</h1>
          <p style={{ color: '#666', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
            Test HPG auth + product lookup · leave SKU blank to test credentials only
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            value={productId}
            onChange={e => setProductId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runProbe()}
            placeholder="HPG product SKU (optional)"
            style={{
              flex: 1,
              padding: '0.6rem 0.9rem',
              fontSize: '1rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '6px',
              color: '#fff',
              outline: 'none',
            }}
          />
          <button
            onClick={runProbe}
            disabled={loading}
            style={{
              padding: '0.6rem 1.4rem',
              fontSize: '1rem',
              background: loading ? '#444' : '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Running…' : 'Run probe'}
          </button>
        </div>

        {error && (
          <div style={{
            background: '#2a0a0a', border: '1px solid #c00',
            borderRadius: '6px', padding: '0.9rem 1rem', marginBottom: '1rem',
            color: '#f88',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.85rem', borderRadius: '20px', marginBottom: '1rem',
              background: ok ? '#0a2a0a' : '#2a0a0a',
              border: `1px solid ${ok ? '#0a0' : '#c00'}`,
              color: ok ? '#4f4' : '#f66',
              fontWeight: 'bold', fontSize: '0.9rem',
            }}>
              {ok ? '✓' : '✗'} {result.step || 'unknown'} · status {result.status || result.authStatus || '—'}
            </div>
            <pre style={{
              background: '#111',
              border: '1px solid #222',
              borderRadius: '8px',
              padding: '1.25rem',
              overflow: 'auto',
              fontSize: '0.82rem',
              maxHeight: '520px',
              lineHeight: '1.5',
              color: '#d4d4d4',
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
