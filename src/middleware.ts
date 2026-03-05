import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;

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
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                const { pathname } = req.nextUrl;

                // Protect dashboard and admin routes
                const protectedPaths = ['/dashboard', '/admin'];
                const isProtected = protectedPaths.some(path => pathname.startsWith(path));

                if (isProtected) {
                    return !!token;
                }

                return true;
            }
        }
    }
);

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/test-:path*',
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
