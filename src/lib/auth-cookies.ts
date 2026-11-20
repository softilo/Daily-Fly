import type { NextRequest, NextResponse } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { StaffUser } from '@/types/api';
import {
  DEFAULT_ACCESS_TTL_SECONDS,
  DEFAULT_REFRESH_TTL_SECONDS,
  getTokenMaxAgeSeconds,
} from './jwtHandler';

export const NO_STORE_AUTH_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  Pragma: 'no-cache',
} as const;

export function isSameOriginRequest(request: NextRequest): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite && secFetchSite === 'cross-site') {
    return false;
  }

  const origin = request.headers.get('origin');
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (origin && host) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  return true;
}

export function extractStaffUserPayload(raw: unknown): StaffUser | null {
  if (!raw || typeof raw !== 'object') return null;
  if ('id' in raw && typeof (raw as { id?: unknown }).id === 'string') {
    return raw as StaffUser;
  }
  if (
    'data' in raw &&
    raw.data &&
    typeof raw.data === 'object' &&
    'id' in raw.data &&
    typeof (raw.data as { id?: unknown }).id === 'string'
  ) {
    return raw.data as StaffUser;
  }
  return null;
}

export const ACCESS_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';
export const LEGACY_DUPLICATE_COOKIE_NAMES = [
  'accessToken',
  'refreshToken',
  'userSession',
] as const;

export const ACCESS_COOKIE_NAMES = ['access_token', 'accessToken'] as const;
export const REFRESH_COOKIE_NAMES = ['refresh_token', 'refreshToken'] as const;
export const ALL_AUTH_COOKIE_NAMES = [
  ...ACCESS_COOKIE_NAMES,
  ...REFRESH_COOKIE_NAMES,
  'userSession',
] as const;

export interface AuthTokenPair {
  accessToken: string;
  refreshToken?: string | null;
}

export function getStaffPortalPath(): string {
  const raw = process.env.STAFF_LOGIN_PATH?.trim() || '/office-portal';
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return normalized.length > 1 && normalized.endsWith('/')
    ? normalized.slice(0, -1)
    : normalized;
}

export function isSafeRelativePath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('://') &&
    !path.includes('\\')
  );
}

export function buildAuthCookieOptions(
  overrides: Partial<ResponseCookie> = {},
): Partial<ResponseCookie> {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    ...overrides,
  };
}

export function parseCookieString(cookieStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieStr) return result;

  cookieStr.split(';').forEach((part, index) => {
    const eqIndex = part.indexOf('=');
    if (eqIndex <= 0) return;
    const key = part.slice(0, eqIndex).trim();
    const rawVal = part.slice(eqIndex + 1).trim();
    const unquoted =
      rawVal.startsWith('"') && rawVal.endsWith('"')
        ? rawVal.slice(1, -1)
        : rawVal;
    try {
      result[key] = unquoted ? decodeURIComponent(unquoted) : '';
    } catch {
      result[key] = unquoted;
    }
    if (index === 0) {
      result.name = key;
      result.value = result[key];
    }
  });
  return result;
}

export function extractTokensFromAuthResponse(
  res: Response,
  body: unknown,
): { accessToken: string | null; refreshToken: string | null } {
  const record =
    body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  const nestedData =
    record?.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : null;

  let accessToken: string | null =
    (typeof record?.accessToken === 'string' && record.accessToken) ||
    (typeof record?.access_token === 'string' && record.access_token) ||
    (typeof nestedData?.accessToken === 'string' && nestedData.accessToken) ||
    (typeof nestedData?.access_token === 'string' && nestedData.access_token) ||
    null;

  let refreshToken: string | null =
    (typeof record?.refreshToken === 'string' && record.refreshToken) ||
    (typeof record?.refresh_token === 'string' && record.refresh_token) ||
    (typeof nestedData?.refreshToken === 'string' && nestedData.refreshToken) ||
    (typeof nestedData?.refresh_token === 'string' && nestedData.refresh_token) ||
    null;

  const setCookieHeaders =
    typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : [];

  for (const cookie of setCookieHeaders) {
    const parsed = parseCookieString(cookie);
    if (
      parsed.name === 'access_token' ||
      parsed.name === 'accessToken' ||
      parsed.access_token ||
      parsed.accessToken
    ) {
      accessToken =
        parsed.access_token || parsed.accessToken || parsed.value || accessToken;
    }
    if (
      parsed.name === 'refresh_token' ||
      parsed.name === 'refreshToken' ||
      parsed.refresh_token ||
      parsed.refreshToken
    ) {
      refreshToken =
        parsed.refresh_token ||
        parsed.refreshToken ||
        parsed.value ||
        refreshToken;
    }
  }

  return { accessToken, refreshToken };
}

export function clearLegacyAuthCookiesOnResponse(response: NextResponse): void {
  const expiredOpts = buildAuthCookieOptions({
    maxAge: 0,
    expires: new Date(0),
  });
  for (const name of LEGACY_DUPLICATE_COOKIE_NAMES) {
    response.cookies.set(
      name,
      '',
      name === 'userSession'
        ? { ...expiredOpts, httpOnly: false }
        : expiredOpts,
    );
  }
}

export function setAuthCookiesOnResponse(
  response: NextResponse,
  tokens: AuthTokenPair,
): void {
  const accessMaxAge = getTokenMaxAgeSeconds(
    tokens.accessToken,
    DEFAULT_ACCESS_TTL_SECONDS,
  );
  response.cookies.set(
    ACCESS_COOKIE_NAME,
    tokens.accessToken,
    buildAuthCookieOptions({ maxAge: accessMaxAge }),
  );

  if (tokens.refreshToken) {
    const refreshMaxAge = getTokenMaxAgeSeconds(
      tokens.refreshToken,
      DEFAULT_REFRESH_TTL_SECONDS,
    );
    response.cookies.set(
      REFRESH_COOKIE_NAME,
      tokens.refreshToken,
      buildAuthCookieOptions({ maxAge: refreshMaxAge }),
    );
  }

  // Remove duplicate camelCase aliases & legacy client-readable userSession cookie
  clearLegacyAuthCookiesOnResponse(response);
}

export function clearAuthCookiesOnResponse(response: NextResponse): void {
  const expiredOpts = buildAuthCookieOptions({
    maxAge: 0,
    expires: new Date(0),
  });
  for (const name of ALL_AUTH_COOKIE_NAMES) {
    response.cookies.set(
      name,
      '',
      name === 'userSession'
        ? { ...expiredOpts, httpOnly: false }
        : expiredOpts,
    );
  }
}
