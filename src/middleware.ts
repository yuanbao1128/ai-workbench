import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  response.headers.set(
    'Cache-Control',
    'public, max-age=10, stale-while-revalidate=59'
  )
  return response
}

export const config = {
  matcher: ['/((?!api|_next|favicon).*)'],
}