import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isPortalRoute = req.nextUrl.pathname.startsWith('/portal')
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/login'

  // Redirect logged-in users away from login page
  if (isLoggedIn && isLoginPage) {
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
    // If admin user with admin callback, go to admin
    if (callbackUrl === '/admin' && req.auth?.user?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.redirect(new URL(callbackUrl || '/portal', req.url))
  }

  // Protect portal routes
  if (isPortalRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
  }

  // Protect admin routes (require admin role)
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url))
    }
    if (req.auth?.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/portal', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*', '/login'],
}
