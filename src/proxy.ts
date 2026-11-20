import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ACCESS_COOKIE_NAME,
  ALL_AUTH_COOKIE_NAMES,
  AuthTokenPair,
  clearAuthCookiesOnResponse,
  clearLegacyAuthCookiesOnResponse,
  getStaffPortalPath,
  isSafeRelativePath,
  LEGACY_DUPLICATE_COOKIE_NAMES,
  REFRESH_COOKIE_NAME,
  setAuthCookiesOnResponse,
} from '@/lib/auth-cookies';
import { refreshBackendSession } from '@/lib/auth-refresh';
import { getJwtSecrets, inspectJwtToken } from '@/lib/jwtHandler';
import { StaffRole } from '@/types/api';

const ADMIN_ONLY_PREFIXES = [
  '/dashboard/staff',
  '/dashboard/settings',
  '/dashboard/audit-logs',
  '/dashboard/packages/create',
];

const PROTECTED_PAGE_PREFIXES = ['/dashboard', '/my-profile', '/change-password'];
const PROTECTED_API_PREFIXES = ['/api/quotations'];
const HIDDEN_PUBLIC_AUTH_PROBES = ['/login', '/signin', '/admin', '/staff-login'];

interface ProxySessionResult {
  hasValidSession: boolean;
  role?: StaffRole;
  status?: string;
  shouldClearCookies: boolean;
  refreshedTokens?: AuthTokenPair;
}

function buildForwardedCookieHeader(
  request: NextRequest,
  tokens: AuthTokenPair,
): string {
  const excluded = new Set<string>(ALL_AUTH_COOKIE_NAMES);
  const parts = request.cookies
    .getAll()
    .filter((c) => !excluded.has(c.name))
    .map((c) => `${c.name}=${c.value}`);

  parts.push(`${ACCESS_COOKIE_NAME}=${tokens.accessToken}`);
  if (tokens.refreshToken) {
    parts.push(`${REFRESH_COOKIE_NAME}=${tokens.refreshToken}`);
  }

  return parts.join('; ');
}

async function resolveProxySession(
  request: NextRequest,
  shouldAttemptRefresh: boolean,
): Promise<ProxySessionResult> {
  const initialAccessToken =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value;
  const initialRefreshToken =
    request.cookies.get('refresh_token')?.value ||
    request.cookies.get('refreshToken')?.value;

  const hasAnyAuthCookie = Boolean(
    initialAccessToken ||
      initialRefreshToken ||
      request.cookies.get('userSession')?.value,
  );

  if (!initialAccessToken && !initialRefreshToken) {
    return {
      hasValidSession: false,
      shouldClearCookies: hasAnyAuthCookie,
    };
  }

  const accessSecrets = getJwtSecrets('access');
  const refreshSecrets = getJwtSecrets('refresh');

  let accessInspect = initialAccessToken
    ? inspectJwtToken(initialAccessToken, accessSecrets)
    : null;
  const refreshInspect = initialRefreshToken
    ? inspectJwtToken(initialRefreshToken, refreshSecrets)
    : null;

  let refreshedTokens: AuthTokenPair | undefined;
  const refreshTokenIsValid = Boolean(
    initialRefreshToken && (refreshInspect ? refreshInspect.valid : true),
  );

  // Trigger refresh when access token is missing/expired OR within 2 minutes of expiring
  const needsRefresh =
    !accessInspect?.valid || Boolean(accessInspect?.shouldProactivelyRefresh);

  if (shouldAttemptRefresh && needsRefresh && initialRefreshToken && refreshTokenIsValid) {
    const outcome = await refreshBackendSession(initialRefreshToken);
    if (outcome.ok && outcome.accessToken) {
      refreshedTokens = {
        accessToken: outcome.accessToken,
        refreshToken: outcome.refreshToken || initialRefreshToken,
      };
      accessInspect = inspectJwtToken(outcome.accessToken, accessSecrets);
    } else if (outcome.authRejected) {
      return {
        hasValidSession: false,
        shouldClearCookies: true,
      };
    }
  }

  if (!accessInspect?.valid || !accessInspect.payload) {
    return {
      hasValidSession: false,
      shouldClearCookies: hasAnyAuthCookie,
    };
  }

  const role = accessInspect.payload.role as StaffRole | undefined;
  const status = accessInspect.payload.status as string | undefined;

  if (status === 'INACTIVE') {
    return {
      hasValidSession: false,
      role,
      status,
      shouldClearCookies: true,
    };
  }

  return {
    hasValidSession: true,
    role,
    status,
    shouldClearCookies: false,
    refreshedTokens,
  };
}

function applySecurityHeaders(
  response: NextResponse,
  isPrivateRoute: boolean,
): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  );

  if (isPrivateRoute) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Reject spoofed internal Next.js subrequest header
  if (request.headers.has('x-middleware-subrequest')) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Forbidden request header' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // 2. Reject path traversal or null-byte injection attempts
  const lowerUrl = request.url.toLowerCase();
  if (
    lowerUrl.includes('%00') ||
    pathname.includes('..') ||
    lowerUrl.includes('%2e%2e')
  ) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Malformed request path' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const staffPortalPath = getStaffPortalPath();
  const isSecretPortal =
    pathname === staffPortalPath || pathname.startsWith(`${staffPortalPath}/`);
  const isHiddenAuthProbe = HIDDEN_PUBLIC_AUTH_PROBES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // 2b. Conceal common login/admin paths (/login, /admin, /signin) from the public with 404
  if (isHiddenAuthProbe && staffPortalPath !== '/login') {
    const notFoundRes = NextResponse.rewrite(
      new URL('/__hidden-portal-404', request.url),
    );
    return applySecurityHeaders(notFoundRes, true);
  }

  const isAuthApiRoute = pathname.startsWith('/api/auth/');
  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isProtectedApi = PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAdminOnlyRoute = ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isPrivateRoute =
    isProtectedPage || isProtectedApi || isSecretPortal || isAuthApiRoute;

  // Let /api/auth/* endpoints handle their own session/refresh lifecycle without proxy pre-refresh
  const session = await resolveProxySession(
    request,
    (isProtectedPage || isProtectedApi || isSecretPortal) && !isAuthApiRoute,
  );

  // 3. Protect private API routes with strict 401 JSON response
  if (isProtectedApi && !session.hasValidSession) {
    const res = NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 },
    );
    clearAuthCookiesOnResponse(res);
    return applySecurityHeaders(res, true);
  }

  // 4. Protect Dashboard & staff account routes (redirect expired/unauthorized callers without leaking portal URL)
  if (isProtectedPage && !session.hasValidSession) {
    const res = NextResponse.redirect(new URL('/', request.url));
    clearAuthCookiesOnResponse(res);
    return applySecurityHeaders(res, true);
  }

  // 5. Enforce RBAC for OWNER_ADMIN-only routes
  if (isAdminOnlyRoute && session.role && session.role !== 'OWNER_ADMIN') {
    const fallbackUrl = new URL('/dashboard', request.url);
    fallbackUrl.searchParams.set('error', 'unauthorized');
    const res = NextResponse.redirect(fallbackUrl);
    if (session.refreshedTokens) {
      setAuthCookiesOnResponse(res, session.refreshedTokens);
    }
    return applySecurityHeaders(res, true);
  }

  // 6. Handle the Stealth Official Staff Portal URL (rewrites internally to /login)
  if (isSecretPortal) {
    if (session.hasValidSession) {
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '';
      const destination = isSafeRelativePath(callbackUrl)
        ? callbackUrl
        : '/dashboard';
      const res = NextResponse.redirect(new URL(destination, request.url));
      if (session.refreshedTokens) {
        setAuthCookiesOnResponse(res, session.refreshedTokens);
      }
      return applySecurityHeaders(res, true);
    }

    const internalLoginUrl = new URL(`/login${search}`, request.url);
    const res = NextResponse.rewrite(internalLoginUrl);
    if (session.shouldClearCookies) {
      clearAuthCookiesOnResponse(res);
    }
    return applySecurityHeaders(res, true);
  }

  // 7. Attach security headers & refreshed cookies/context downstream
  const requestHeaders = new Headers(request.headers);
  if (session.refreshedTokens) {
    requestHeaders.set(
      'cookie',
      buildForwardedCookieHeader(request, session.refreshedTokens),
    );
  }
  if (session.hasValidSession && session.role) {
    requestHeaders.set('x-staff-role', session.role);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (session.refreshedTokens) {
    setAuthCookiesOnResponse(response, session.refreshedTokens);
  } else if (session.shouldClearCookies && isPrivateRoute && !isAuthApiRoute) {
    clearAuthCookiesOnResponse(response);
  } else if (
    session.hasValidSession &&
    request.cookies.has(ACCESS_COOKIE_NAME) &&
    LEGACY_DUPLICATE_COOKIE_NAMES.some((name) => request.cookies.has(name))
  ) {
    clearLegacyAuthCookiesOnResponse(response);
  }

  return applySecurityHeaders(response, isPrivateRoute);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
