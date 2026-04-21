import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only apply IP restriction to /admin/* routes
  if (pathname.startsWith('/admin')) {
    const allowedIpsStr = process.env.ALLOWED_ADMIN_IPS || '';
    
    // If no IPs configured, allow all (for local dev)
    if (!allowedIpsStr) {
      return NextResponse.next();
    }

    const allowedIps = allowedIpsStr.split(',').map(ip => ip.trim()).filter(Boolean);

    // Get client IP from headers (handles proxies like Vercel)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';

    if (!allowedIps.includes(clientIp)) {
      // Redirect to our custom 403 page with the IP info
      const url = request.nextUrl.clone();
      url.pathname = '/forbidden';
      url.searchParams.set('ip', clientIp);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
