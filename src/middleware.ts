import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect dashboard and admin routes
    const protectedPaths = ['/dashboard', '/admin'];
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            // Prevent open redirect — only allow relative paths
            if (pathname.startsWith('/') && !pathname.startsWith('//')) {
                loginUrl.searchParams.set('callbackUrl', pathname);
            }
            return NextResponse.redirect(loginUrl);
        }
    }

    // Block test pages in production
    if (process.env.NODE_ENV === 'production' && pathname.startsWith('/test-')) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Add security headers to all responses
    const response = NextResponse.next();

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/test-:path*',
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
