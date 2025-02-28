import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = [
    '/bedrock',
    '/api/bedrock-chat'
  ];
  
  // Check if the path is in the public paths list
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // If it's a public path, allow access without auth
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // For other paths, you can implement your auth logic here
  // or just pass through if you're removing auth entirely
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Add paths that should be checked by the middleware
    '/bedrock/:path*',
    '/api/bedrock-chat/:path*',
    // Add other paths that need auth checks
  ],
};
