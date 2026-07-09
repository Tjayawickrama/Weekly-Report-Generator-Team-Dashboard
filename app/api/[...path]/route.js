import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function handleProxy(req, { params }) {
  const path = params.path.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/api/${path}${searchParams ? '?' + searchParams : ''}`;

  // Get NextAuth token to extract custom accessToken (JWT signed by Express)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (token?.accessToken) {
    headers.set('Authorization', `Bearer ${token.accessToken}`);
  }

  const method = req.method;
  let body = null;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      body = await req.text();
    } catch (e) {
      body = null;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy error for ${url}:`, error);
    return NextResponse.json({ error: 'Backend server unreachable' }, { status: 502 });
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as PUT, handleProxy as DELETE };
