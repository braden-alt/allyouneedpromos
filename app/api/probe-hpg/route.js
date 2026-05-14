// PromoStandards probe — multi-supplier: HPG + SanMar
// Hits all 4 PromoStandards endpoints per supplier
// Returns labeled, readable results for each

import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// ── SOAP builders ──────────────────────────────────────────────────────────

function buildProductDataSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/" xmlns:ns1="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/SharedObjects/">
  <SOAP-ENV:Body>
    <ns:GetProductRequest>
      <ns1:wsVersion>2.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:localizationCountry>US</ns1:localizationCountry>
      <ns1:localizationLanguage>en</ns1:localizationLanguage>
      <ns1:productId>${productId}</ns1:productId>
    </ns:GetProductRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

function buildPricingSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/" xmlns:ns1="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/SharedObjects/">
  <SOAP-ENV:Body>
    <ns:GetConfigurationAndPricingRequest>
      <ns1:wsVersion>1.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
      <ns1:currency>USD</ns1:currency>
      <ns1:fobId>1</ns1:fobId>
      <ns1:priceType>List</ns1:priceType>
    </ns:GetConfigurationAndPricingRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

function buildInventorySoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/Inventory/2.0.0/" xmlns:ns1="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">
  <SOAP-ENV:Body>
    <ns:GetInventoryLevelsRequest>
      <ns1:wsVersion>2.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
    </ns:GetInventoryLevelsRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

function buildMediaSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/MediaContent/1.1.0/" xmlns:ns1="http://www.promostandards.org/WSDL/MediaContent/1.1.0/SharedObjects/">
  <SOAP-ENV:Body>
    <ns:GetMediaContentRequest>
      <ns1:wsVersion>1.1.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
      <ns1:mediaType>Image</ns1:mediaType>
    </ns:GetMediaContentRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

// ── HTTP caller ────────────────────────────────────────────────────────────

async function hitEndpoint(url, soapBody, label, soapAction) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': soapAction },
      body: soapBody,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await res.text();
    const isFault = text.includes('<soap:Fault>') || text.includes('<SOAP-ENV:Fault>') || text.includes('<faultstring>');
    const isServiceErr = text.includes('<ServiceMessage>') && text.includes('<severity>Error</severity>');
    const bodyPreview = text.slice(0, 800);
    let errorHint = null;
    if (isFault) {
      const m = text.match(/<faultstring[^>]*>([^<]+)/);
      errorHint = m ? 'SOAP Fault: ' + m[1].trim() : 'SOAP Fault (unknown)';
    } else if (isServiceErr) {
      const m = text.match(/<description[^>]*>([^<]+)/);
      errorHint = m ? 'ServiceMessage: ' + m[1].trim() : 'ServiceMessage error';
    }
    return { label, ok: res.ok, status: res.status, isFault: isFault || isServiceErr, bodyPreview, errorHint };
  } catch (e) {
    clearTimeout(timeout);
    return { label, ok: false, status: 'NETWORK_ERROR', isFault: false, bodyPreview: '', errorHint: e.message };
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const { productID, brandPath = 'hubpen', supplierSystem = 'hpg' } = await request.json();
    if (!productID) return NextResponse.json({ error: 'productID required' }, { status: 400 });

    // ── SanMar ─────────────────────────────────────────────────────────────
    if (supplierSystem === 'sanmar') {
      const id = process.env.SANMAR_ID || 'WEBSERVICES-TEST';
      const password = process.env.SANMAR_PASSWORD || 'sanmar1';
      const base = 'https://uat-ws.sanmar.com:8080/promostandards';
      const creds = { id, password, productId: productID };
      const [productData, inventory, media] = await Promise.all([
        hitEndpoint(base + '/ProductDataServiceBinding', buildProductDataSoap(creds), 'Product Data v2.0.0', 'getProduct'),
        hitEndpoint(base + '/InventoryServiceBinding', buildInventorySoap(creds), 'Inventory v2.0.0', 'getInventoryLevels'),
        hitEndpoint(base + '/MediaContentServiceBinding', buildMediaSoap(creds), 'Media Content v1.1.0', 'getMediaContent'),
      ]);
      const endpoints = { productData, inventory, media };
      const allOk = Object.values(endpoints).every(e => e.ok && !e.isFault);
      return NextResponse.json({
        productID, supplierSystem: 'sanmar', brandPath: 'sanmar',
        timestamp: new Date().toISOString(),
        credentials: { id, note: id === 'WEBSERVICES-TEST' ? 'UAT test creds' : 'production' },
        endpoints, verdict: allOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED',
      });
    }

    // ── HPG ────────────────────────────────────────────────────────────────
    const ALLOWED_BRANDS = ['hubpen','beacon','mixie','sugarspot','best','origaudio','debco','handstands','debcocanada'];
    if (!ALLOWED_BRANDS.includes(brandPath)) {
      return NextResponse.json({ error: `Unknown brand: ${brandPath}` }, { status: 400 });
    }
    const id = process.env.HPG_LOGIN_ID;
    const password = process.env.HPG_PASSWORD;
    if (!id || !password) return NextResponse.json({ error: 'HPG credentials not configured' }, { status: 500 });
    const base = `https://svc2.hpgbrands.com/${brandPath}`;
    const creds = { id, password, productId: productID };
    const [productData, pricing, inventory, media] = await Promise.all([
      hitEndpoint(base + '/PRODUCT/2.0.0', buildProductDataSoap(creds), 'Product Data v2.0.0', 'getProduct'),
      hitEndpoint(base + '/PPC/1.0.0', buildPricingSoap(creds), 'Pricing & Configuration v1.0.0', 'getConfigurationAndPricing'),
      hitEndpoint(base + '/INVENTORY/2.0.0', buildInventorySoap(creds), 'Inventory v2.0.0', 'getInventoryLevels'),
      hitEndpoint(base + '/MEDIA/1.1.0', buildMediaSoap(creds), 'Media Content v1.1.0', 'getMediaContent'),
    ]);
    const endpoints = { productData, pricing, inventory, media };
    const allOk = Object.values(endpoints).every(e => e.ok && !e.isFault);
    return NextResponse.json({
      productID, supplierSystem: 'hpg', brandPath,
      timestamp: new Date().toISOString(),
      credentials: { id, note: 'HPG production' },
      endpoints, verdict: allOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED',
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
