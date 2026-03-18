import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    // Skip session refresh for static assets to improve performance
    const isAsset = req.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
    if (!isAsset) {
        const { data: { session } } = await supabase.auth.getSession()

        // Instant Server-side redirect for Admin pages
        if (req.nextUrl.pathname.startsWith('/dashboard/admin') && !req.nextUrl.pathname.startsWith('/dashboard/admin/login')) {
            if (!session) {
                return NextResponse.redirect(new URL('/dashboard/admin/login', req.url))
            }
        }
    }

    return res
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
