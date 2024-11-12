import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Verificar se é admin para acessar rotas administrativas
    if (
      req.nextUrl.pathname.startsWith('/admin') &&
      req.nextauth.token?.role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acesso a rotas públicas
        if (
          req.nextUrl.pathname.startsWith('/login') ||
          req.nextUrl.pathname.startsWith('/register') ||
          req.nextUrl.pathname.startsWith('/forgot-password') ||
          req.nextUrl.pathname.startsWith('/reset-password') ||
          req.nextUrl.pathname.startsWith('/convite')
        ) {
          return true
        }
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/moradores/:path*',
    '/despesas/:path*',
    '/transacoes/:path*',
    '/compras/:path*'
  ]
} 