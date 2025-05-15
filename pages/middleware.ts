// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = [
    '/users/superadmin/dashboard',
    '/users/admin/dashboard',
    '/staff/dashboard'
  ];

  // Auth routes
  const authRoutes = ['/'];

  // If trying to access protected route without auth
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If authenticated but trying to access auth route
  if (authRoutes.includes(pathname) && token) {
    const role = typeof token === 'object' && token && 'role' in token ? (token as { role?: string }).role : undefined;
    const redirectPath = getRedirectPath(role);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

function getRedirectPath(role: string = '') {
  const lowerRole = role.toLowerCase();
  const rolePaths: { [key: string]: string } = {
    superadmin: "/users/superadmin/dashboard",
    admin: "/users/admin/dashboard",
    staff: "/staff/dashboard",
  };
  return rolePaths[lowerRole] || "/";
}