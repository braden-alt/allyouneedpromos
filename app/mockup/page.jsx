'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Image as ImageIcon, Download, Trash2, Plus, Move,
  RotateCw, Maximize2, Copy, Eye, FileText, Layers, X,
  ChevronLeft, ChevronRight, Sparkles, Building2, User, Hash,
  Palette, Type, AlertCircle, CheckCircle2, Layout, Grid3x3
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
    
    .checker-bg {
      background-image:
        linear-gradient(45deg, #1a1a2a 25%, transparent 25%),
        linear-gradient(-45deg, #1a1a2a 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #1a1a2a 75%),
        linear-gradient(-45deg, transparent 75%, #1a1a2a 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
      background-color: #0e0e18;
    }
    
    textarea, input, select { font-family: 'IBM Plex Mono', monospace; }
    
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a0a0f; }
    ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #3a3a4a; }
    
    .mockup-canvas {
      cursor: move;
      user-select: none;
      -webkit-user-select: none;
    }
    
    @keyframes slide-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .slide-in { animation: slide-in 0.3s ease-out; }
  `}</style>
);

// ============================================================================
// CONFIG
// ============================================================================
const BRANDS = {
  Swagr: { 
    color: '#6C47FF', 
    accent: '#F5C842',
    bg: '#F0EDE6',
    ink: '#1C1C1C',
    sig: 'sales@swagrshop.com · swagrshop.com',
    name: 'Swagr'
  },
  ForgedGear: { 
    color: '#FF7A1A', 
    accent: '#3D3D3D',
    bg: '#E8E5E0',
    ink: '#1A1A1A',
    sig: 'sales@swagrshop.com · forgedgear.net',
    name: 'ForgedGear'
  },
  ForgeEvents: { 
    color: '#F5C842', 
    accent: '#6C47FF',
    bg: '#FFFBF0',
    ink: '#1C1C1C',
    sig: 'sales@swagrshop.com · forgeevent.co',
    name: 'ForgeEvents'
  },
  Calibr: { 
    color: '#00D9B2', 
    accent: '#1C1C1C',
    bg: '#F5F5F2',
    ink: '#1C1C1C',
    sig: 'sales@swagrshop.com · getcalibr.co',
    name: 'Calibr'
  },
  AYNP: { 
    color: '#1C1C1C', 
    accent: '#C9A227',
    bg: '#FFFFFF',
    ink: '#1C1C1C',
    sig: 'All You Need Promos · ASI #117382 · allyouneedpromos.net',
    name: 'All You Need Promos'
  },
};

const PLACEMENT_PRESETS = {
  'Left chest': { x: 0.30, y: 0.32, size: 0.12 },
  'Full front': { x: 0.50, y: 0.50, size: 0.32 },
  'Right chest': { x: 0.70, y: 0.32, size: 0.12 },
  'Center': { x: 0.50, y: 0.50, size: 0.20 },
  'Cap front': { x: 0.50, y: 0.45, size: 0.22 },
  'Tumbler wrap': { x: 0.50, y: 0.50, size: 0.28 },
  'Sleeve': { x: 0.18, y: 0.40, size: 0.08 },
  'Custom': { x: 0.50, y: 0.50, size: 0.18 },
};

// ============================================================================
// HELPERS
// ============================================================================
const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// ============================================================================
// MOCKUP CANVAS — the heart of the tool
// ============================================================================
const MockupCanvas = ({ mockup, onUpdate, height = 480 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setDimensions({ width: w, height });
    }
  }, [height]);

  // Redraw whenever mockup or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mockup.productImg || dimensions.width === 0) return;
    
    drawMockup(canvas, mockup, dimensions);
  }, [mockup, dimensions]);

  const drawMockup = async (canvas, mockup, dims) => {
    const ctx = canvas.getContext('2d');
    canvas.width = dims.width;
    canvas.height = dims.height;
    
    ctx.clearRect(0, 0, dims.width, dims.height);
    
    // Draw product image (contain-fit)
    try {
      const productImg = await loadImage(mockup.productImg);
      const ratio = Math.min(dims.width / productImg.width, dims.height / productImg.height);
      const drawW = productImg.width * ratio;
      const drawH = productImg.height * ratio;
      const drawX = (dims.width - drawW) / 2;
      const drawY = (dims.height - drawH) / 2;
      ctx.drawImage(productImg, drawX, drawY, drawW, drawH);
      
      // Draw logo if present
      if (mockup.logoImg) {
        const logoImg = await loadImage(mockup.logoImg);
        const logoSize = mockup.logoSize * Math.min(drawW, drawH);
        const logoRatio = logoImg.width / logoImg.height;
        let logoW, logoH;
        if (logoRatio > 1) {
          logoW = logoSize;
          logoH = logoSize / logoRatio;
        } else {
          logoH = logoSize;
          logoW = logoSize * logoRatio;
        }
        
        const logoX = drawX + (mockup.logoX * drawW) - logoW / 2;
        const logoY = drawY + (mockup.logoY * drawH) - logoH / 2;
        
        ctx.save();
        if (mockup.logoRotation) {
          ctx.translate(logoX + logoW / 2, logoY + logoH / 2);
          ctx.rotate((mockup.logoRotation * Math.PI) / 180);
          ctx.translate(-(logoX + logoW / 2), -(logoY + logoH / 2));
        }
        ctx.globalAlpha = mockup.logoOpacity ?? 1;
        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
        ctx.restore();
        
        // Store for hit detection
        canvas._logoBounds = { x: logoX, y: logoY, w: logoW, h: logoH };
      }
    } catch (err) {
      console.error('Mockup draw error:', err);
    }
  };

  // Drag handling
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !mockup.logoImg) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const bounds = canvas._logoBounds;
    if (bounds && x >= bounds.x && x <= bounds.x + bounds.w &&
        y >= bounds.y && y <= bounds.y + bounds.h) {
      setDragging({ startX: x, startY: y, origX: mockup.logoX, origY: mockup.logoY });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find the actual draw region of the product image
    const dx = (x - dragging.startX) / dimensions.width;
    const dy = (y - dragging.startY) / dimensions.height;
    
    onUpdate({
      ...mockup,
      logoX: Math.max(0.05, Math.min(0.95, dragging.origX + dx * 1.5)),
      logoY: Math.max(0.05, Math.min(0.95, dragging.origY + dy * 1.5)),
    });
  };

  const handleMouseUp = () => setDragging(null);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="checker-bg rounded-md w-full mockup-canvas"
        style={{ height: `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

// ============================================================================
// EXPORT MOCKUP TO DATA URL (for PDF generation)
// ============================================================================
const renderMockupToDataURL = async (mockup, size = 1200) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);
  
  if (!mockup.productImg) return canvas.toDataURL('image/png');
  
  const productImg = await loadImage(mockup.productImg);
  const ratio = Math.min(size / productImg.width, size / productImg.height);
  const drawW = productImg.width * ratio;
  const drawH = productImg.height * ratio;
  const drawX = (size - drawW) / 2;
  const drawY = (size - drawH) / 2;
  ctx.drawImage(productImg, drawX, drawY, drawW, drawH);
  
  if (mockup.logoImg) {
    const logoImg = await loadImage(mockup.logoImg);
    const logoSize = mockup.logoSize * Math.min(drawW, drawH);
    const logoRatio = logoImg.width / logoImg.height;
    let logoW, logoH;
    if (logoRatio > 1) {
      logoW = logoSize;
      logoH = logoSize / logoRatio;
    } else {
      logoH = logoSize;
      logoW = logoSize * logoRatio;
    }
    const logoX = drawX + (mockup.logoX * drawW) - logoW / 2;
    const logoY = drawY + (mockup.logoY * drawH) - logoH / 2;
    
    ctx.save();
    if (mockup.logoRotation) {
      ctx.translate(logoX + logoW / 2, logoY + logoH / 2);
      ctx.rotate((mockup.logoRotation * Math.PI) / 180);
      ctx.translate(-(logoX + logoW / 2), -(logoY + logoH / 2));
    }
    ctx.globalAlpha = mockup.logoOpacity ?? 1;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    ctx.restore();
  }
  
  return canvas.toDataURL('image/png');
};

// ============================================================================
// PDF GENERATION — builds a branded HTML page and triggers print-to-PDF
// ============================================================================
const generatePDF = async ({ mockups, projectInfo, brand, mode }) => {
  const brandConfig = BRANDS[brand];
  
  // Render all mockups to data URLs
  const renderedMockups = await Promise.all(
    mockups.map(async m => ({
      ...m,
      renderedDataURL: await renderMockupToDataURL(m, mode === 'sheet' ? 800 : 1400)
    }))
  );
  
  // Build the HTML
  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked. Allow pop-ups for this tool to export PDFs.');
    return;
  }
  
  const isSheet = mode === 'sheet' && renderedMockups.length > 1;
  const gridCols = renderedMockups.length <= 4 ? 2 : 4;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${projectInfo.client || 'Mockup Proof'} — ${brandConfig.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Fraunces:wght@500;600;700;900&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    background: ${brandConfig.bg};
    color: ${brandConfig.ink};
  }
  
  .page {
    width: 8.5in;
    min-height: 11in;
    padding: 0.5in;
    margin: 0 auto;
    background: ${brandConfig.bg};
    page-break-after: always;
  }
  
  .page:last-child { page-break-after: auto; }
  
  .header {
    border-bottom: 2px solid ${brandConfig.color};
    padding-bottom: 16px;
    margin-bottom: 32px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  
  .brand-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 28px;
    color: ${brandConfig.color};
    letter-spacing: -0.02em;
  }
  
  .brand-mark .ampersand { color: ${brandConfig.accent}; }
  
  .header-right {
    text-align: right;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${brandConfig.ink};
    opacity: 0.7;
    line-height: 1.6;
  }
  
  .project-info {
    background: rgba(255,255,255,0.6);
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 6px;
    padding: 20px 24px;
    margin-bottom: 28px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .info-block .label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${brandConfig.color};
    margin-bottom: 4px;
  }
  
  .info-block .value {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 16px;
    font-weight: 600;
    color: ${brandConfig.ink};
  }
  
  .section-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 24px;
    font-weight: 700;
    color: ${brandConfig.ink};
    margin-bottom: 4px;
  }
  
  .section-subtitle {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${brandConfig.color};
    margin-bottom: 20px;
  }
  
  /* Single mockup mode */
  .single-mockup {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
    margin-bottom: 24px;
  }
  
  .single-mockup img {
    width: 100%;
    height: auto;
    display: block;
    margin-bottom: 20px;
  }
  
  .mockup-meta {
    border-top: 1px solid rgba(0,0,0,0.1);
    padding-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .mockup-meta .field .label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${brandConfig.color};
    margin-bottom: 2px;
  }
  
  .mockup-meta .field .value {
    font-size: 13px;
    font-weight: 500;
  }
  
  /* Sheet mode (multi-product) */
  .mockup-grid {
    display: grid;
    grid-template-columns: repeat(${gridCols}, 1fr);
    gap: 16px;
  }
  
  .mockup-cell {
    background: white;
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  }
  
  .mockup-cell img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: contain;
    background: #fafafa;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  
  .mockup-cell .product-name {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 4px;
    line-height: 1.2;
  }
  
  .mockup-cell .product-meta {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${brandConfig.ink};
    opacity: 0.6;
    line-height: 1.5;
  }
  
  .footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${brandConfig.ink};
    opacity: 0.6;
  }
  
  .approval-box {
    margin-top: 24px;
    background: rgba(255,255,255,0.8);
    border: 2px dashed ${brandConfig.color}40;
    border-radius: 6px;
    padding: 20px;
  }
  
  .approval-box .label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: ${brandConfig.color};
    margin-bottom: 12px;
  }
  
  .approval-fields {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
  
  .approval-fields .field {
    border-bottom: 1px solid ${brandConfig.ink};
    padding-bottom: 4px;
    min-height: 32px;
    font-family: 'Fraunces', Georgia, serif;
  }
  
  .approval-fields .field-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: ${brandConfig.ink};
    opacity: 0.6;
    margin-top: 4px;
  }
  
  @media print {
    @page { margin: 0; size: letter; }
    body { background: ${brandConfig.bg}; }
    .no-print { display: none !important; }
  }
</style>
</head>
<body>

<div class="no-print" style="position:fixed;top:16px;right:16px;z-index:1000;background:#1C1C1C;color:white;padding:12px 18px;border-radius:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;border:none;box-shadow:0 4px 16px rgba(0,0,0,0.2);" onclick="window.print()">
  ⌘P · Save as PDF
</div>

${isSheet ? `
<!-- SHEET MODE: Multi-product on one page -->
<div class="page">
  <div class="header">
    <div class="brand-mark">${brandConfig.name}</div>
    <div class="header-right">
      Mockup proof<br>
      ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
      ${brandConfig.sig}
    </div>
  </div>
  
  <div class="project-info">
    <div class="info-block">
      <div class="label">Prepared for</div>
      <div class="value">${projectInfo.client || '—'}</div>
    </div>
    <div class="info-block">
      <div class="label">Project</div>
      <div class="value">${projectInfo.project || 'Proof Sheet'}</div>
    </div>
    <div class="info-block">
      <div class="label">Quote ref</div>
      <div class="value">${projectInfo.quoteRef || '—'}</div>
    </div>
  </div>
  
  <div class="section-title">Proof sheet · ${mockups.length} items</div>
  <div class="section-subtitle">For approval before production</div>
  
  <div class="mockup-grid">
    ${renderedMockups.map(m => `
      <div class="mockup-cell">
        <img src="${m.renderedDataURL}" alt="${m.productName}">
        <div class="product-name">${m.productName || 'Product'}</div>
        <div class="product-meta">
          ${m.color ? `${m.color}<br>` : ''}
          ${m.decoration || ''} ${m.placement ? `· ${m.placement}` : ''}
          ${m.quantity ? `<br>Qty ${m.quantity}` : ''}
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="approval-box">
    <div class="label">Approval</div>
    <div class="approval-fields">
      <div>
        <div class="field"></div>
        <div class="field-label">Approved by — name</div>
      </div>
      <div>
        <div class="field"></div>
        <div class="field-label">Date</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <span>${brandConfig.name} · Mockup Proof</span>
    <span>Page 1 of 1</span>
  </div>
</div>

` : renderedMockups.map((m, idx) => `

<!-- SINGLE MODE: One product per page -->
<div class="page">
  <div class="header">
    <div class="brand-mark">${brandConfig.name}</div>
    <div class="header-right">
      Mockup proof<br>
      ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
      ${brandConfig.sig}
    </div>
  </div>
  
  <div class="project-info">
    <div class="info-block">
      <div class="label">Prepared for</div>
      <div class="value">${projectInfo.client || '—'}</div>
    </div>
    <div class="info-block">
      <div class="label">Project</div>
      <div class="value">${projectInfo.project || 'Custom Order'}</div>
    </div>
    <div class="info-block">
      <div class="label">Quote ref</div>
      <div class="value">${projectInfo.quoteRef || '—'}</div>
    </div>
  </div>
  
  <div class="section-title">${m.productName || 'Product'}</div>
  <div class="section-subtitle">Mockup · for approval</div>
  
  <div class="single-mockup">
    <img src="${m.renderedDataURL}" alt="${m.productName}">
    <div class="mockup-meta">
      ${m.color ? `<div class="field"><div class="label">Color</div><div class="value">${m.color}</div></div>` : ''}
      ${m.decoration ? `<div class="field"><div class="label">Decoration</div><div class="value">${m.decoration}</div></div>` : ''}
      ${m.placement ? `<div class="field"><div class="label">Placement</div><div class="value">${m.placement}</div></div>` : ''}
      ${m.quantity ? `<div class="field"><div class="label">Quantity</div><div class="value">${m.quantity}</div></div>` : ''}
      ${m.notes ? `<div class="field" style="grid-column:1/-1;"><div class="label">Notes</div><div class="value">${m.notes}</div></div>` : ''}
    </div>
  </div>
  
  ${idx === renderedMockups.length - 1 ? `
  <div class="approval-box">
    <div class="label">Approval</div>
    <div class="approval-fields">
      <div>
        <div class="field"></div>
        <div class="field-label">Approved by — name</div>
      </div>
      <div>
        <div class="field"></div>
        <div class="field-label">Date</div>
      </div>
    </div>
  </div>
  ` : ''}
  
  <div class="footer">
    <span>${brandConfig.name} · ${m.productName || 'Mockup'}</span>
    <span>Page ${idx + 1} of ${renderedMockups.length}</span>
  </div>
</div>

`).join('')}

</body>
</html>
`;
  
  win.document.write(html);
  win.document.close();
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Header = ({ mockupCount, brand, onBrandChange }) => (
  <div className="border-b border-purple-900/40 bg-black/60 backdrop-blur sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-purple"
             style={{ background: 'linear-gradient(135deg, #6C47FF 0%, #4A2DC4 100%)' }}>
          <Layers className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-xl font-bold text-white tracking-tight leading-none">
            Mockup Studio
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mt-1">
            HMH Holdings · Internal
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {mockupCount > 0 && (
          <div className="font-mono text-xs flex items-center gap-2">
            <span className="text-zinc-500 uppercase tracking-wider">Mockups</span>
            <span className="text-white font-semibold">{mockupCount}</span>
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

const ProjectInfo = ({ info, onChange }) => (
  <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden mb-6">
    <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
        Project info · shown on every PDF
      </div>
    </div>
    <div className="p-4 grid grid-cols-3 gap-3">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Client</label>
        <input
          value={info.client}
          onChange={e => onChange({ ...info, client: e.target.value })}
          placeholder="Acme Construction"
          className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
        />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Project name</label>
        <input
          value={info.project}
          onChange={e => onChange({ ...info, project: e.target.value })}
          placeholder="Summer crew gear"
          className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
        />
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Quote ref</label>
        <input
          value={info.quoteRef}
          onChange={e => onChange({ ...info, quoteRef: e.target.value })}
          placeholder="Q-2026-0512"
          className="w-full bg-black/40 border border-zinc-800/60 rounded px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
        />
      </div>
    </div>
  </div>
);

const LogoLibrary = ({ logos, currentLogo, onSelectLogo, onAddLogo, onRemoveLogo }) => {
  const fileInputRef = useRef(null);
  
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataURL = await readFileAsDataURL(file);
    const name = file.name.split('.')[0];
    onAddLogo({ id: `logo-${Date.now()}`, name, dataURL });
    e.target.value = '';
  };
  
  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden mb-6">
      <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70">
          Logo library · {logos.length}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="font-mono text-[10px] uppercase tracking-wider text-purple-300 hover:text-purple-200 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add logo
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      <div className="p-3">
        {logos.length === 0 ? (
          <div className="text-center py-6 text-zinc-600 text-xs font-mono">
            No logos yet. Upload a PNG or SVG to get started.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {logos.map(logo => (
              <div key={logo.id} className="relative group">
                <button
                  onClick={() => onSelectLogo(logo)}
                  className={`w-20 h-20 checker-bg rounded-md p-2 transition-all ${
                    currentLogo?.id === logo.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : 'hover:ring-1 hover:ring-purple-500/40'
                  }`}
                >
                  <img src={logo.dataURL} alt={logo.name} className="w-full h-full object-contain" />
                </button>
                <button
                  onClick={() => onRemoveLogo(logo.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="font-mono text-[9px] text-zinc-500 mt-1 truncate w-20">{logo.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MockupEditor = ({ mockup, onUpdate, onDelete, currentLogo, brand }) => {
  const productInputRef = useRef(null);
  
  const handleProductUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataURL = await readFileAsDataURL(file);
    onUpdate({ ...mockup, productImg: dataURL });
    e.target.value = '';
  };

  const applyLogoToMockup = () => {
    if (!currentLogo) return;
    onUpdate({ ...mockup, logoImg: currentLogo.dataURL, logoName: currentLogo.name });
  };

  const applyPreset = (presetName) => {
    const preset = PLACEMENT_PRESETS[presetName];
    onUpdate({
      ...mockup,
      logoX: preset.x,
      logoY: preset.y,
      logoSize: preset.size,
      placement: presetName,
    });
  };

  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-purple-900/30 bg-black/40 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 flex items-center gap-2">
          <Layout className="w-3 h-3" />
          {mockup.productName || 'Untitled mockup'}
        </div>
        <button onClick={onDelete} className="text-zinc-500 hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-0">
        {/* Canvas */}
        <div className="col-span-2 p-4 border-r border-zinc-900/60">
          {!mockup.productImg ? (
            <div 
              onClick={() => productInputRef.current?.click()}
              className="checker-bg rounded-md h-96 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border-2 border-dashed border-zinc-700"
            >
              <Upload className="w-8 h-8 text-zinc-500 mb-2" />
              <div className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                Upload product image
              </div>
              <div className="font-mono text-[10px] text-zinc-600 mt-1">
                PNG · JPG · transparent or solid bg
              </div>
            </div>
          ) : (
            <>
              <MockupCanvas mockup={mockup} onUpdate={onUpdate} height={400} />
              <div className="flex items-center justify-between mt-2 font-mono text-[10px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3 h-3" /> Drag logo to position
                </span>
                <button
                  onClick={() => productInputRef.current?.click()}
                  className="hover:text-purple-300"
                >
                  Replace image
                </button>
              </div>
            </>
          )}
          <input ref={productInputRef} type="file" accept="image/*" onChange={handleProductUpload} className="hidden" />
        </div>
        
        {/* Controls */}
        <div className="p-4 space-y-3 max-h-[450px] overflow-y-auto">
          {/* Apply logo button */}
          {currentLogo && mockup.productImg && !mockup.logoImg && (
            <button
              onClick={applyLogoToMockup}
              className="w-full px-3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" /> Apply selected logo
            </button>
          )}
          
          {mockup.logoImg && (
            <div className="bg-emerald-950/20 border border-emerald-700/30 rounded p-2 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="font-mono text-[10px] text-emerald-300 truncate">
                Logo: {mockup.logoName}
              </span>
              <button
                onClick={() => onUpdate({ ...mockup, logoImg: null, logoName: null })}
                className="text-emerald-400 hover:text-emerald-200 ml-auto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {/* Product details */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Product name</label>
            <input
              value={mockup.productName || ''}
              onChange={e => onUpdate({ ...mockup, productName: e.target.value })}
              placeholder="Port Authority K500 Polo"
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Color</label>
              <input
                value={mockup.color || ''}
                onChange={e => onUpdate({ ...mockup, color: e.target.value })}
                placeholder="Navy"
                className="w-full bg-black/40 border border-zinc-800/60 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Qty</label>
              <input
                value={mockup.quantity || ''}
                onChange={e => onUpdate({ ...mockup, quantity: e.target.value })}
                placeholder="100"
                className="w-full bg-black/40 border border-zinc-800/60 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40"
              />
            </div>
          </div>
          
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Decoration</label>
            <select
              value={mockup.decoration || ''}
              onChange={e => onUpdate({ ...mockup, decoration: e.target.value })}
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-purple-500/40 cursor-pointer"
            >
              <option value="">Select method</option>
              <option value="Embroidery">Embroidery</option>
              <option value="Screen print">Screen print</option>
              <option value="DTF / Heat transfer">DTF / Heat transfer</option>
              <option value="Sublimation">Sublimation</option>
              <option value="Laser engraving">Laser engraving</option>
              <option value="Pad print">Pad print</option>
              <option value="UV print">UV print</option>
            </select>
          </div>
          
          {/* Placement presets */}
          {mockup.logoImg && (
            <div>
              <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5 block">Placement preset</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(PLACEMENT_PRESETS).map(preset => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className={`px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider rounded transition-all ${
                      mockup.placement === preset
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                        : 'bg-black/40 text-zinc-400 border border-zinc-800/60 hover:border-purple-700/40 hover:text-zinc-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Size + rotation */}
          {mockup.logoImg && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block flex items-center justify-between">
                  <span>Logo size</span>
                  <span className="text-purple-300">{Math.round((mockup.logoSize || 0.18) * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.04"
                  max="0.6"
                  step="0.01"
                  value={mockup.logoSize || 0.18}
                  onChange={e => onUpdate({ ...mockup, logoSize: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
              
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block flex items-center justify-between">
                  <span>Rotation</span>
                  <span className="text-purple-300">{mockup.logoRotation || 0}°</span>
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={mockup.logoRotation || 0}
                  onChange={e => onUpdate({ ...mockup, logoRotation: parseInt(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
              
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block flex items-center justify-between">
                  <span>Opacity</span>
                  <span className="text-purple-300">{Math.round((mockup.logoOpacity ?? 1) * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={mockup.logoOpacity ?? 1}
                  onChange={e => onUpdate({ ...mockup, logoOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-1 block">Notes (optional)</label>
            <textarea
              value={mockup.notes || ''}
              onChange={e => onUpdate({ ...mockup, notes: e.target.value })}
              placeholder="Anything specific to flag"
              rows={2}
              className="w-full bg-black/40 border border-zinc-800/60 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-purple-500/40 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ExportBar = ({ mockups, projectInfo, brand, onExport }) => {
  const readyCount = mockups.filter(m => m.productImg && m.logoImg).length;
  const partial = mockups.length - readyCount;
  
  return (
    <div className="bg-zinc-950/80 border border-purple-900/40 rounded-lg p-5 sticky bottom-4 glow-purple z-40 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-purple-400/70 mb-1">
            Ready to export
          </div>
          <div className="flex items-center gap-4">
            <div className="font-display text-2xl text-white">
              {readyCount} <span className="text-zinc-600 text-base">/ {mockups.length}</span>
            </div>
            {partial > 0 && (
              <div className="font-mono text-xs text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {partial} missing product or logo
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onExport('single')}
            disabled={readyCount === 0}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-700 text-white font-mono text-xs uppercase tracking-wider rounded-md border border-zinc-800 flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Single-product PDF
          </button>
          <button
            onClick={() => onExport('sheet')}
            disabled={readyCount < 2}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs uppercase tracking-wider rounded-md flex items-center gap-2"
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            Proof sheet PDF ({readyCount} items)
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ROOT
// ============================================================================
export default function App() {
  const [brand, setBrand] = useState('Swagr');
  const [logos, setLogos] = useState([]);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [mockups, setMockups] = useState([]);
  const [projectInfo, setProjectInfo] = useState({
    client: '',
    project: '',
    quoteRef: '',
  });

  const addMockup = () => {
    const newMockup = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productImg: null,
      productName: '',
      color: '',
      quantity: '',
      decoration: '',
      placement: 'Left chest',
      notes: '',
      logoImg: null,
      logoName: null,
      logoX: 0.30,
      logoY: 0.32,
      logoSize: 0.12,
      logoRotation: 0,
      logoOpacity: 1,
    };
    setMockups(prev => [...prev, newMockup]);
  };

  const updateMockup = (id, updated) => {
    setMockups(prev => prev.map(m => m.id === id ? updated : m));
  };

  const deleteMockup = (id) => {
    setMockups(prev => prev.filter(m => m.id !== id));
  };

  const addLogo = (logo) => {
    setLogos(prev => [...prev, logo]);
    setCurrentLogo(logo);
  };

  const removeLogo = (id) => {
    setLogos(prev => prev.filter(l => l.id !== id));
    if (currentLogo?.id === id) {
      setCurrentLogo(null);
    }
  };

  const handleExport = async (mode) => {
    const readyMockups = mockups.filter(m => m.productImg && m.logoImg);
    if (readyMockups.length === 0) return;
    await generatePDF({ mockups: readyMockups, projectInfo, brand, mode });
  };

  return (
    <div className="min-h-screen bg-black text-white font-body terminal-grid">
      <FontStyles />
      <Header mockupCount={mockups.length} brand={brand} onBrandChange={setBrand} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {mockups.length === 0 && (
          <div className="text-center py-12 mb-4">
            <h2 className="font-display text-4xl font-bold text-white mb-3 tracking-tight">
              Customer logo. Their product. PDF in 60 seconds.
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Upload a logo, upload product photos, drag the logo where it goes. Export as a single-product PDF or a multi-item proof sheet — branded under {BRANDS[brand].name}.
            </p>
          </div>
        )}

        <ProjectInfo info={projectInfo} onChange={setProjectInfo} />

        <LogoLibrary
          logos={logos}
          currentLogo={currentLogo}
          onSelectLogo={setCurrentLogo}
          onAddLogo={addLogo}
          onRemoveLogo={removeLogo}
        />

        <div className="space-y-4">
          {mockups.map(m => (
            <div key={m.id} className="slide-in">
              <MockupEditor
                mockup={m}
                onUpdate={updated => updateMockup(m.id, updated)}
                onDelete={() => deleteMockup(m.id)}
                currentLogo={currentLogo}
                brand={brand}
              />
            </div>
          ))}
        </div>

        <button
          onClick={addMockup}
          className="w-full mt-6 px-4 py-4 bg-zinc-950/40 hover:bg-zinc-900/60 border-2 border-dashed border-purple-900/40 hover:border-purple-700/60 rounded-lg text-zinc-400 hover:text-purple-300 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> Add product mockup
        </button>

        {mockups.length > 0 && (
          <ExportBar 
            mockups={mockups} 
            projectInfo={projectInfo} 
            brand={brand} 
            onExport={handleExport}
          />
        )}
      </div>
    </div>
  );
}
