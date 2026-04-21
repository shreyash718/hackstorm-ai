import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. ALWAYS allow the authorization page so you can fix your access
  if (pathname === '/admin/authorize') {
    return NextResponse.next();
  }

  // Only apply restriction to other /admin/* routes
  if (pathname.startsWith('/admin')) {
    // 2. Check for Device Secret (Laptop Authorization Cookie)
    const deviceSecret = process.env.ADMIN_DEVICE_SECRET;
    const adminCookie = request.cookies.get('hackstorm_admin_auth')?.value;

    if (deviceSecret && adminCookie === deviceSecret) {
      return NextResponse.next();
    }

    // 3. Fallback: Check for IP Restriction
    const allowedIpsStr = process.env.ALLOWED_ADMIN_IPS || '';
    if (allowedIpsStr) {
      const allowedIps = allowedIpsStr.split(',').map(ip => ip.trim()).filter(Boolean);
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const clientIp = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';

      if (allowedIps.includes(clientIp)) {
        return NextResponse.next();
      }
    }

    // 4. If neither Device Secret nor IP matches, and at least one is configured, block
    if (deviceSecret || allowedIpsStr) {
      // Redirect to forbidden page
      const url = request.nextUrl.clone();
      url.pathname = '/forbidden';
      const forwarded = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const clientIp = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1';
      url.searchParams.set('ip', clientIp);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
