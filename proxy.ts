import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_ONLY_ROUTES = ['/login', '/signup', '/forgot-password', '/confirm-email', '/onboarding']

// Rotas públicas que não são nem protegidas nem auth-only
const PUBLIC_ROUTES = ['/invite']

const PROTECTED_ROUTES = [
  '/dashboard',
  '/leads',
  '/pipeline',
  '/settings',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const isAuthOnly = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  // Não autenticado tentando acessar rota protegida → /login
  if (isProtected && !user && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Já autenticado tentando acessar login/signup → /dashboard
  if (isAuthOnly && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|auth/callback|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
