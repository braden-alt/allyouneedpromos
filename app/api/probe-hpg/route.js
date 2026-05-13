// HPG PromoStandards probe — server-side route
// Hits all 4 HPG endpoints with credentials from env vars
// Returns labeled, readable JSON of what each endpoint actually returns

export const dynamic = 'force-dynamic';

function buildProductDataSoap({ id, password, productID }) {
return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/">
<soap:Body>
<ns:GetProductRequest>
<ns:wsVersion>2.0.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:localizationCountry>US</ns:localizationCountry>
<ns:localizationLanguage>en</ns:localizationLanguage>
<ns:productId>${productID}</ns:productId>
</ns:GetProductRequest>
</soap:Body>
</soap:Envelope>`;
}

function buildPricingSoap({ id, password, productID }) {
return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:ns="http://www.promostandards.org/WSDL/PricingAndConfigurationService/1.0.0/">
<soap:Body>
<ns:GetConfigurationAndPricingRequest>
<ns:wsVersion>1.0.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:productId>${productID}</ns:productId>
<ns:currency>USD</ns:currency>
<ns:fobId>F1</ns:fobId>
<ns:priceType>Net</ns:priceType>
<ns:localizationCountry>US</ns:localizationCountry>
<ns:localizationLanguage>en</ns:localizationLanguage>
<ns:configurationType>Blank</ns:configurationType>
</ns:GetConfigurationAndPricingRequest>
</soap:Body>
</soap:Envelope>`;
}

function buildInventorySoap({ id, password, productID }) {
return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/2.0.0/">
<soap:Body>
<ns:GetInventoryLevelsRequest>
<ns:wsVersion>2.0.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:productId>${productID}</ns:productId>
</ns:GetInventoryLevelsRequest>
</soap:Body>
</soap:Envelope>`;
}

function buildMediaSoap({ id, password, productID }) {
return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
xmlns:ns="http://www.promostandards.org/WSDL/MediaContentService/1.1.0/">
<soap:Body>
<ns:GetMediaContentRequest>
<ns:wsVersion>1.1.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:cultureName>en-US</ns:cultureName>
<ns:mediaType>Image</ns:mediaType>
<ns:productId>${productID}</ns:productId>
</ns:GetMediaContentRequest>
</soap:Body>
</soap:Envelope>`;
}

async function hitEndpoint(url, soapBody, label, soapAction) {
try {
const response = await fetch(url, {
method: 'POST',
headers: {
'Content-Type': 'text/xml; charset=utf-8',
'SOAPAction': soapAction || '""',
},
body: soapBody,
signal: AbortSignal.timeout(20000),
});

const responseText = await response.text();

return {
label,
url,
status: response.status,
ok: response.ok,
contentType: response.headers.get('content-type'),
bodyLength: responseText.length,
bodyPreview: responseText.slice(0, 5000),
isFault: responseText.includes('soap:Fault') || responseText.includes('Fault'),
hasImprintData: /imprint|decoration.*method|imprint.*location|imprint.*size/i.test(responseText),
errorHint: extractError(responseText),
};
} catch (err) {
return {
label,
url,
status: 'NETWORK_ERROR',
ok: false,
error: err.message,
};
}
}

function extractError(text) {
const faultMatch = text.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/i);
if (faultMatch) return `SOAP Fault: ${faultMatch[1]}`;

const errorMessageMatch = text.match(/<errorMessage[^>]*>([^<]+)<\/errorMessage>/i);
if (errorMessageMatch) return `Error: ${errorMessageMatch[1]}`;

return null;
}

export async function POST(request) {
try {
const { productID, brandPath = 'hubpen' } = await request.json();

if (!productID) {
return Response.json({ error: 'productID is required' }, { status: 400 });
}

const ALLOWED_BRANDS = ['hubpen','beacon','mixie','sugarspot','best','origaudio','debco','handstands'];
if (!ALLOWED_BRANDS.includes(brandPath)) {
return Response.json({ error: `Unknown brand: ${brandPath}` }, { status: 400 });
}
const HPG_ENDPOINTS = {
productData: `https://svc2.hpgbrands.com/${brandPath}/PRODUCT/2.0.0`,
pricing: `https://svc2.hpgbrands.com/${brandPath}/PPC/1.0.0`,
inventory: `https://svc2.hpgbrands.com/${brandPath}/INVENTORY/2.0.0`,
media: `https://svc2.hpgbrands.com/${brandPath}/MEDIA/1.1.0`,
};

const id = process.env.HPG_LOGIN_ID;
const password = process.env.HPG_PASSWORD;

if (!id || !password) {
return Response.json({
error: 'HPG credentials not configured',
hint: 'Add HPG_LOGIN_ID and HPG_PASSWORD as Vercel environment variables and redeploy.'
}, { status: 500 });
}

const results = await Promise.all([
hitEndpoint(HPG_ENDPOINTS.productData, buildProductDataSoap({ id, password, productID }), 'Product Data v2.0.0', 'getProduct'),
hitEndpoint(HPG_ENDPOINTS.pricing, buildPricingSoap({ id, password, productID }), 'Pricing & Configuration v1.0.0', 'getConfigurationAndPricing'),
hitEndpoint(HPG_ENDPOINTS.inventory, buildInventorySoap({ id, password, productID }), 'Inventory v2.0.0', 'getInventoryLevels'),
hitEndpoint(HPG_ENDPOINTS.media, buildMediaSoap({ id, password, productID }), 'Media Content v1.1.0', 'getMediaContent'),
]);

const summary = {
productID,
brandPath,
timestamp: new Date().toISOString(),
credentials: { id, passwordPresent: !!password },
endpoints: results,
verdict: {
successCount: results.filter(r => r.ok && !r.isFault).length,
faultCount: results.filter(r => r.isFault).length,
errorCount: results.filter(r => !r.ok).length,
imprintDataFound: results.some(r => r.hasImprintData),
},
};

return Response.json(summary);
} catch (err) {
return Response.json({
error: 'Probe failed',
message: err.message,
stack: err.stack
}, { status: 500 });
}
}
