import { NextResponse } from 'next/server';

const HPG_API_BASE = process.env.HPG_API_BASE || 'https://www.hubpromo.com';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  const loginId = process.env.HPG_LOGIN_ID;
  const password = process.env.HPG_PASSWORD;

  if (!loginId || !password) {
    return NextResponse.json({
      ok: false,
      error: 'Missing HPG credentials (HPG_LOGIN_ID / HPG_PASSWORD)',
    }, { status: 500 });
  }

  const log = [];

  try {
    // Step 1: Authenticate
    log.push({ step: 'auth_start', loginId, base: HPG_API_BASE });

    const authResp = await fetch(`${HPG_API_BASE}/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: loginId, password }),
      cache: 'no-store',
    });

    const authText = await authResp.text();
    let authData = null;
    try { authData = JSON.parse(authText); } catch {}

    log.push({ step: 'auth_response', status: authResp.status, ok: authResp.ok });

    if (!authResp.ok) {
      return NextResponse.json({
        ok: false,
        step: 'auth_failed',
        status: authResp.status,
        response: authData || authText.slice(0, 1000),
        log,
      });
    }

    const token = authData?.token || authData?.access_token || authData?.sessionId || null;
    log.push({ step: 'auth_success', tokenFound: !!token });

    // If no product ID, just verify credentials
    if (!productId) {
      return NextResponse.json({
        ok: true,
        step: 'auth_only',
        message: 'Credentials valid — pass ?productId=SKU to look up a product',
        authStatus: authResp.status,
        tokenFound: !!token,
        log,
      });
    }

    // Step 2: Fetch product
    const headers = {
      Accept: 'application/json',
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : { Authorization: 'Basic ' + Buffer.from(`${loginId}:${password}`).toString('base64') }),
    };

    log.push({ step: 'product_fetch', productId });

    const productResp = await fetch(
      `${HPG_API_BASE}/products/${encodeURIComponent(productId)}`,
      { headers, cache: 'no-store' }
    );

    const productText = await productResp.text();
    let productData = null;
    try { productData = JSON.parse(productText); } catch {}

    log.push({ step: 'product_response', status: productResp.status, ok: productResp.ok });

    return NextResponse.json({
      ok: productResp.ok,
      step: 'product',
      status: productResp.status,
      product: productData || productText.slice(0, 3000),
      log,
    });

  } catch (err) {
    return NextResponse.json({
      ok: false,
      step: 'exception',
      error: err.message,
      log,
    }, { status: 500 });
  }
}
