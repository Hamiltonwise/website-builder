import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('========== MIDDLEWARE RUNNING ==========');
  console.log('Host:', request.headers.get('host'));
  console.log('Pathname:', request.nextUrl.pathname);
  console.log('=========================================');

  return NextResponse.next();
}

// Simplest possible matcher - match everything
export const config = {
  matcher: '/:path*',
};
