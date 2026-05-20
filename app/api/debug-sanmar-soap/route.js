// app/api/debug-sanmar-soap/route.js
// Returns raw XML SOAP response from SanMar ProductDataService for debugging
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/"
                  xmlns:shar="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/SharedObjects/">
   <soapenv:Body>
      <ns:GetProductRequest>
         <shar:wsVersion>2.0.0</shar:wsVersion>
         <shar:id>219370</shar:id>
         <shar:password>ZOUj8zCwWeZMx4</shar:password>
         <shar:localizationCountry>US</shar:localizationCountry>
         <shar:localizationLanguage>en</shar:localizationLanguage>
         <shar:productId>PC61</shar:productId>
      </ns:GetProductRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch('https://ws.sanmar.com:8080/promostandards/ProductDataServiceBinding', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'getProduct',
      },
      body: soapEnvelope,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const rawXml = await res.text();

    return new Response(rawXml, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    return new Response('ERROR: ' + err.message, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
