// PromoStandards probe Ã¢ÂÂ multi-supplier: HPG + SanMar + Logomark
// Hits all PromoStandards endpoints per supplier
// Returns labeled, readable results for each

import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Ã¢ÂÂÃ¢ÂÂ SOAP builders Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

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
</ns:getMediaContentRequest>
</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

function buildSanMarProductDataSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/" xmlns:ns1="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/SharedObjects/">
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

function buildSanMarInventorySoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/">
  <SOAP-ENV:Body>
    <ns:Request>
      <ns:wsVersion>1.0.0</ns:wsVersion>
      <ns:id>${id}</ns:id>
      <ns:password>${password}</ns:password>
      <ns:productID>${productId}</ns:productID>
      <ns:productIDtype>Supplier</ns:productIDtype>
    </ns:Request>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

function buildSanMarMediaSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/MediaService/1.0.0/" xmlns:ns1="http://www.promostandards.org/WSDL/MediaService/1.0.0/SharedObjects/">
  <SOAP-ENV:Body>
    <ns:GetMediaContentRequest>
      <ns1:wsVersion>1.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
      <ns1:mediaType>Image</ns1:mediaType>
    </ns:GetMediaContentRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}
function buildSanMarPricingSoap({ id, password, productId }) {
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
      <ns1:localizationCountry>US</ns1:localizationCountry>
      <ns1:localizationLanguage>en</ns1:localizationLanguage>
      <ns1:configurationType>Blank</ns1:configurationType>
    </ns:GetConfigurationAndPricingRequest>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}


// Ã¢ÂÂÃ¢ÂÂ Logomark SOAP builders Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

function buildLogomarkProductDataV2Soap({ id, password, productId }) {
return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0">
<soapenv:Header/>
<soapenv:Body>
<ns:GetProductRequest>
<ns:wsVersion>2.0.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:localizationCountry>US</ns:localizationCountry>
<ns:localizationLanguage>en</ns:localizationLanguage>
<ns:productId>${productId}</ns:productId>
<ns:partId></ns:partId>
<ns:colorName></ns:colorName>
<ns:ApparelSizeArray/>
</ns:GetProductRequest>
</soapenv:Body>
</soapenv:Envelope>`;
}

function buildLogomarkProductDataV1Soap({ id, password, productId }) {
return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0">
<soapenv:Header/>
<soapenv:Body>
<ns:GetProductRequest>
<ns:wsVersion>1.0.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:localizationCountry>US</ns:localizationCountry>
<ns:localizationLanguage>en</ns:localizationLanguage>
<ns:productId>${productId}</ns:productId>
</ns:GetProductRequest>
</soapenv:Body>
</soapenv:Envelope>`;
}

function buildLogomarkPricingSoap({ id, password, productId }) {
return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/">
<soapenv:Header/>
<soapenv:Body>
<ns:GetConfigurationAndPricingRequest>
<ns:wsVersion>1.0.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:productId>${productId}</ns:productId>
</ns:GetConfigurationAndPricingRequest>
</soapenv:Body>
</soapenv:Envelope>`;
}

function buildLogomarkMediaSoap({ id, password, productId }) {
return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/MediaService/1.0.0/">
<soapenv:Header/>
<soapenv:Body>
<ns:getMediaContentRequest>
<ns:wsVersion>1.1.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:productId>${productId}</ns:productId>
<ns:mediaType>Image</ns:mediaType>
</ns:getMediaContentRequest>
</soapenv:Body>
</soapenv:Envelope>`;
}

function buildLogomarkInventoryV2Soap({ id, password, productId }) {
return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/1.2.1/">
<soapenv:Header/>
<soapenv:Body>
<ns:GetInventoryLevelsRequest>
<ns:wsVersion>1.2.1</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:productId>${productId}</ns:productId>
</ns:GetInventoryLevelsRequest>
</soapenv:Body>
</soapenv:Envelope>`;
}

function buildLogomarkInventoryV1Soap({ id, password, productId }) {
return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/Inventory/1.0.0/">
<soapenv:Header/>
<soapenv:Body>
<ns:GetInventoryLevelsRequest>
<ns:wsVersion>1.0.0</ns:wsVersion>
<ns:id>${id}</ns:id>
<ns:password>${password}</ns:password>
<ns:productId>${productId}</ns:productId>
</ns:GetInventoryLevelsRequest>
</soapenv:Body>
</soapenv:Envelope>`;
}

// Ã¢ÂÂÃ¢ÂÂ HTTP caller Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

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
    let faultcode = null, faultstring = null, faultdetail = null;
    if (isFault) {
      const fcParts = text.split('<faultcode');
      faultcode = fcParts.length > 1 ? fcParts[1].split('>').slice(1).join('>').split('<')[0].trim() : null;
      const fsParts = text.split('<faultstring');
      faultstring = fsParts.length > 1 ? fsParts[1].split('>').slice(1).join('>').split('<')[0].trim() : null;
      const fdParts = text.split('<detail');
      faultdetail = fdParts.length > 1 ? fdParts[1].split('>').slice(1).join('>').split('</detail')[0].trim() : null;
      errorHint = faultstring ? 'SOAP Fault: ' + faultstring : 'SOAP Fault (unknown)';
    } else if (isServiceErr) {
      const descParts = text.split('<description');
      const desc = descParts.length > 1 ? descParts[1].split('>').slice(1).join('>').split('<')[0].trim() : null;
      errorHint = desc ? 'ServiceMessage: ' + desc : 'ServiceMessage error';
    }
    return { label, ok: res.ok, status: res.status, isFault: isFault || isServiceErr, bodyPreview, errorHint, faultcode, faultstring, faultdetail };
  } catch (e) {
    clearTimeout(timeout);
    return { label, ok: false, status: 'NETWORK_ERROR', isFault: false, bodyPreview: '', errorHint: e.message };
  }
}


function buildGemlineProductDataV2Soap({ id, password, productId }) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <ns:wsVersion>2.0.0</ns:wsVersion>
      <ns:id>${id}</ns:id>
      <ns:password>${password}</ns:password>
      <ns:localizationCountry>US</ns:localizationCountry>
      <ns:localizationLanguage>en</ns:localizationLanguage>
      <ns:productId>${productId}</ns:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}
function buildGemlineProductDataV1Soap({ id, password, productId }) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <ns:wsVersion>1.0.0</ns:wsVersion>
      <ns:id>${id}</ns:id>
      <ns:password>${password}</ns:password>
      <ns:localizationCountry>US</ns:localizationCountry>
      <ns:localizationLanguage>en</ns:localizationLanguage>
      <ns:productId>${productId}</ns:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}
function buildGemlinePricingSoap({ id, password, productId }) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetConfigurationAndPricingRequest>
      <ns:wsVersion>1.0.0</ns:wsVersion>
      <ns:id>${id}</ns:id>
      <ns:password>${password}</ns:password>
      <ns:productId>${productId}</ns:productId>
      <ns:currency>USD</ns:currency>
      <ns:fobId>1</ns:fobId>
    </ns:GetConfigurationAndPricingRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}
function buildGemlineMediaSoap({ id, password, productId }) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/MediaService/1.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetMediaContentRequest>
      <ns:wsVersion>1.0.0</ns:wsVersion>
      <ns:id>${id}</ns:id>
      <ns:password>${password}</ns:password>
      <ns:productId>${productId}</ns:productId>
      <ns:mediaType>Image</ns:mediaType>
    </ns:GetMediaContentRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}
function buildGemlineInventoryV2Soap({ id, password, productId }) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/Inventory/2.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetInventoryLevelsRequest>
      <ns:wsVersion>2.0.0</ns:wsVersion>
      <ns:id>${id}</ns:id>
      <ns:password>${password}</ns:password>
      <ns:productId>${productId}</ns:productId>
    </ns:GetInventoryLevelsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}
function buildGemlineInventoryV1Soap({ id, password, productId }) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetInventoryLevelsRequest>
      <ns:wsVersion>1.0.0</ns:wsVersion>
      <ns:id>${id}</ns:id>
      <ns:password>${password}</ns:password>
      <ns:productId>${productId}</ns:productId>
    </ns:GetInventoryLevelsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}
export async function POST(request) {
try {
const { productID, brandPath = 'hubpen', supplierSystem = 'hpg', sanmarEnv = 'uat', pcnaEnv = 'staging' } = await request.json();
if (!productID) return NextResponse.json({ error: 'productID required' }, { status: 400 });

// Ã¢ÂÂÃ¢ÂÂ SanMar Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
if (supplierSystem === 'sanmar') {
        const isProduction = sanmarEnv === 'production';
        const id = isProduction ? process.env.SANMAR_API_USER : (process.env.SANMAR_ID || 'WEBSERVICES-TEST');
        const password = isProduction ? process.env.SANMAR_API_PASS : (process.env.SANMAR_PASSWORD || 'sanmar1');
        const base = isProduction
          ? 'https://ws.sanmar.com:8080/promostandards'
          : 'https://uat-ws.sanmar.com:8080/promostandards';
        const creds = { id, password, productId: productID };
        if (isProduction) {
          const [productData, inventory, media, pricing] = await Promise.all([
            hitEndpoint(base + '/ProductDataServiceBinding', buildSanMarProductDataSoap(creds), 'Product Data v1.0.0', 'getProduct'),
            hitEndpoint(base + '/InventoryServiceBinding', buildSanMarInventorySoap(creds), 'Inventory v1.0.0', 'getInventoryLevels'),
            hitEndpoint(base + '/MediaContentServiceBinding', buildSanMarMediaSoap(creds), 'Media Content v1.0.0', 'getMediaContent'),
            hitEndpoint(base + '/PricingAndConfigurationServiceBinding', buildSanMarPricingSoap(creds), 'Pricing & Configuration v1.0.0', 'getConfigurationAndPricing'),
          ]);
          const endpoints = { productData, inventory, media, pricing };
          const allOk = Object.values(endpoints).every(e => e.ok && !e.isFault);
          return NextResponse.json({ productID, supplierSystem: 'sanmar', brandPath: 'sanmar', sanmarEnv: 'production', timestamp: new Date().toISOString(), credentials: { id, note: 'SanMar production credentials' }, endpoints, verdict: allOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED' });
        } else {
          const [productData, inventory, media] = await Promise.all([
            hitEndpoint(base + '/ProductDataServiceBinding', buildSanMarProductDataSoap(creds), 'Product Data v1.0.0', 'getProduct'),
            hitEndpoint(base + '/InventoryServiceBinding', buildSanMarInventorySoap(creds), 'Inventory v1.0.0', 'getInventoryLevels'),
            hitEndpoint(base + '/MediaContentServiceBinding', buildSanMarMediaSoap(creds), 'Media Content v1.0.0', 'getMediaContent'),
          ]);
          const endpoints = { productData, inventory, media };
          const allOk = Object.values(endpoints).every(e => e.ok && !e.isFault);
          return NextResponse.json({ productID, supplierSystem: 'sanmar', brandPath: 'sanmar', sanmarEnv: 'uat', timestamp: new Date().toISOString(), credentials: { id, note: 'UAT test credentials' }, endpoints, verdict: allOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED' });
        }
      }

// Ã¢ÂÂÃ¢ÂÂ Logomark Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
if (supplierSystem === 'logomark') {
const id = process.env.LOGOMARK_USER_ID;
const password = process.env.LOGOMARK_PASSWORD;
if (!id || !password) return NextResponse.json({ error: 'Logomark credentials not configured' }, { status: 500 });
const creds = { id, password, productId: productID };
const [productDataV2, pricing, media, inventoryV2, productDataV1, inventoryV1] = await Promise.all([
hitEndpoint('https://psapi.logomark.com/ProductDataV2Service.svc', buildLogomarkProductDataV2Soap(creds), 'Product Data v2 (primary)', 'getProduct'),
hitEndpoint('https://psapi.logomark.com/PricingAndConfigurationService.svc', buildLogomarkPricingSoap(creds), 'Pricing & Config v1', 'GetConfigurationAndPricing'),
hitEndpoint('https://psapi.logomark.com/MediaContentService.svc', buildLogomarkMediaSoap(creds), 'Media Content v1.1', 'getMediaContent'),
hitEndpoint('https://psapi.logomark.com/LogomarkInventoryV2Service.svc', buildLogomarkInventoryV2Soap(creds), 'Inventory v1.2.1 (primary)', 'getInventoryLevels'),
hitEndpoint('https://psapi.logomark.com/ProductDataService.svc', buildLogomarkProductDataV1Soap(creds), 'Product Data v1 (fallback)', 'getProduct'),
hitEndpoint('https://psapi.logomark.com/LogomarkInventoryService.svc', buildLogomarkInventoryV1Soap(creds), 'Inventory v1 (fallback)', 'getInventoryLevels'),
]);
const endpoints = [productDataV2, pricing, media, inventoryV2, productDataV1, inventoryV1];
const allOk = endpoints.every(e => e.ok && !e.isFault);
return NextResponse.json({
productID, supplierSystem: 'logomark', brandPath: 'logomark',
timestamp: new Date().toISOString(),
credentials: { id, note: 'Logomark production' },
endpoints, verdict: allOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED',
});
}
if (supplierSystem === 'gemline') {
  const gid = process.env.GEMLINE_ACCOUNT_ID;
  const gpw = process.env.GEMLINE_PASSWORD;
  if (!gid || !gpw) return NextResponse.json({ error: 'Gemline credentials not configured' }, { status: 500 });
  const creds = { id: gid, password: gpw, productId: productID };
  const [gPdV2, gPdV1, gPricing, gMedia, gInvV2, gInvV1] = await Promise.all([
    hitEndpoint('https://wsp.gemline.com/GemlineWebService/ProductData/v2/GemlineProductDataService.svc', buildGemlineProductDataV2Soap(creds), 'Product Data v2', 'getProduct'),
    hitEndpoint('https://wsp.gemline.com/GemlineWebService/ProductData/v1/GemlineProductDataService.svc', buildGemlineProductDataV1Soap(creds), 'Product Data v1', 'getProduct'),
    hitEndpoint('https://wsp.gemline.com/GemlineWebService/PricingAndConfiguration/v1/GemlinePricingAndConfigurationService.svc', buildGemlinePricingSoap(creds), 'Pricing & Config v1', 'getConfigurationAndPricing'),
    hitEndpoint('https://wsp.gemline.com/GemlineWebService/MediaContent/v1/GemlineMediaContentService.svc', buildGemlineMediaSoap(creds), 'Media Content v1', 'getMediaContent'),
    hitEndpoint('https://wsp.gemline.com/GemlineWebService/Inventory/v2/GemlineInventoryService.svc', buildGemlineInventoryV2Soap(creds), 'Inventory v2', 'getInventoryLevels'),
    hitEndpoint('https://wsp.gemline.com/GemlineWebService/Inventory/v1/GemlineInventoryService.svc', buildGemlineInventoryV1Soap(creds), 'Inventory v1', 'getInventoryLevels'),
  ]);
  const gEndpoints = [gPdV2, gPdV1, gPricing, gMedia, gInvV2, gInvV1];
  const gAllOk = gEndpoints.every(e => e.ok && !e.isFault);
  return NextResponse.json({
    productID, supplierSystem: 'gemline',
    timestamp: new Date().toISOString(),
    credentials: { id: gid, note: 'Gemline production' },
    endpoints: gEndpoints, verdict: gAllOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED',
  });
}


// Ã¢ÂÂÃ¢ÂÂ HPG Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

// ── PCNA SOAP builders ──────────────────────────────────────────────────────

function buildPcnaProductDataSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <ns1:wsVersion>2.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:localizationCountry>US</ns1:localizationCountry>
      <ns1:localizationLanguage>en</ns1:localizationLanguage>
      <ns1:productId>${productId}</ns1:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildPcnaPricingSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetConfigurationAndPricingRequest>
      <ns1:wsVersion>1.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
      <ns1:currency>USD</ns1:currency>
      <ns1:fobId>1</ns1:fobId>
    </ns:GetConfigurationAndPricingRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildPcnaMediaSoap({ id, password, productId }) {
  // PCNA uses MediaService/1.0.0 namespace (not MediaContent/1.1.0)
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/MediaService/1.0.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/MediaService/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:getMediaContentRequest>
      <ns1:wsVersion>1.1.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
      <ns1:mediaType>Image</ns1:mediaType>
    </ns:getMediaContentRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildPcnaInventorySoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/Inventory/2.0.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetInventoryLevelsRequest>
      <ns1:wsVersion>2.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
    </ns:GetInventoryLevelsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// ── S&S Activewear SOAP builders ─────────────────────────────────────────────

function buildSSProductDataSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetProductRequest>
      <ns1:wsVersion>2.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:localizationCountry>US</ns1:localizationCountry>
      <ns1:localizationLanguage>en</ns1:localizationLanguage>
      <ns1:productId>${productId}</ns1:productId>
    </ns:GetProductRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildSSPricingSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/PricingAndConfiguration/1.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetConfigurationAndPricingRequest>
      <ns1:wsVersion>1.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
      <ns1:currency>USD</ns1:currency>
      <ns1:fobId>1</ns1:fobId>
    </ns:GetConfigurationAndPricingRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildSSMediaSoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/MediaContent/1.1.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/MediaContent/1.1.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetMediaContentRequest>
      <ns1:wsVersion>1.1.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
      <ns1:mediaType>Image</ns1:mediaType>
    </ns:GetMediaContentRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function buildSSInventorySoap({ id, password, productId }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="http://www.promostandards.org/WSDL/Inventory/2.0.0/"
  xmlns:ns1="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:GetInventoryLevelsRequest>
      <ns1:wsVersion>2.0.0</ns1:wsVersion>
      <ns1:id>${id}</ns1:id>
      <ns1:password>${password}</ns1:password>
      <ns1:productId>${productId}</ns1:productId>
    </ns:GetInventoryLevelsRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// ── PCNA handler ─────────────────────────────────────────────────────────────
if (supplierSystem === 'pcna') {
  const isStaging = pcnaEnv !== 'production';
  const id = isStaging ? process.env.PCNA_STAGING_ID : process.env.PCNA_PRODUCTION_ID;
  const password = isStaging ? process.env.PCNA_STAGING_PASSWORD : process.env.PCNA_PRODUCTION_PASSWORD;
  if (!id || !password) return NextResponse.json({ error: 'PCNA credentials not configured' }, { status: 500 });
  const creds = { id, password, productId: productID };
  const envPrefix = isStaging ? '-stg' : '';
  const [pdv2, pricing, media, inventory] = await Promise.all([
    hitEndpoint(`https://psproductdata200${envPrefix}.pcna.online/psProductData.svc`, buildPcnaProductDataSoap(creds), 'Product Data v2', 'getProduct'),
    hitEndpoint(`https://pspriceconfig100${envPrefix}.pcna.online/psPriceConfig.svc`, buildPcnaPricingSoap(creds), 'Pricing & Config v1', 'getConfigurationAndPricing'),
    hitEndpoint(`https://psmediacontent110${envPrefix}.pcna.online/psMediaContent.svc`, buildPcnaMediaSoap(creds), 'Media Content v1.1', 'getMediaContent'),
    hitEndpoint(`https://psinventory200${envPrefix}.pcna.online/psInventory.svc`, buildPcnaInventorySoap(creds), 'Inventory v2', 'getInventoryLevels'),
  ]);
  const endpoints = [pdv2, pricing, media, inventory];
  const allOk = endpoints.every(e => e.ok && !e.isFault);
  return NextResponse.json({
    productID, supplierSystem: 'pcna', pcnaEnv: isStaging ? 'staging' : 'production',
    timestamp: new Date().toISOString(),
    credentials: { id, note: `PCNA ${isStaging ? 'staging' : 'production'}` },
    endpoints, verdict: allOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED',
  });
}

// ── S&S Activewear handler ───────────────────────────────────────────────────
if (supplierSystem === 'ss') {
  const id = process.env.SS_ACCOUNT_NUMBER;
  const password = process.env.SS_API_KEY;
  if (!id || !password) return NextResponse.json({ error: 'S&S Activewear credentials not configured' }, { status: 500 });
  const creds = { id, password, productId: productID };
  const base = 'https://promostandards.ssactivewear.com';
  const [pdv2, pricing, media, inventory] = await Promise.all([
    hitEndpoint(`${base}/productdata/v2/productdataservicev2.svc`, buildSSProductDataSoap(creds), 'Product Data v2', 'getProduct'),
    hitEndpoint(`${base}/pricingandconfiguration/v1/pricingandconfigurationservice.svc`, buildSSPricingSoap(creds), 'Pricing & Config v1', 'getConfigurationAndPricing'),
    hitEndpoint(`${base}/mediacontent/v1/mediacontentservice.svc`, buildSSMediaSoap(creds), 'Media Content v1.1', 'getMediaContent'),
    hitEndpoint(`${base}/Inventory/v2RC4/InventoryService.svc`, buildSSInventorySoap(creds), 'Inventory v2RC4', 'getInventoryLevels'),
  ]);
  const endpoints = [pdv2, pricing, media, inventory];
  const allOk = endpoints.every(e => e.ok && !e.isFault);
  return NextResponse.json({
    productID, supplierSystem: 'ss',
    timestamp: new Date().toISOString(),
    credentials: { id, note: 'S&S Activewear production' },
    endpoints, verdict: allOk ? 'ALL_OK' : 'PARTIAL_OR_FAILED',
  });
}


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
