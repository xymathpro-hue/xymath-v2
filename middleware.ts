import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Para a fase de desenvolvimento, permitimos tudo
  // A autenticação será controlada pelo cliente por enquanto
  console.log(`Middleware: ${request.method} ${request.nextUrl.pathname}`);
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
