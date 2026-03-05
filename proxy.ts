import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const hasToken = request.cookies.has('auth_token')

  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|favicon\\.ico|.*\\.[^/]+$).*)'],
}
