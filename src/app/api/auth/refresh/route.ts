import { NextRequest, NextResponse } from 'next/server';
import {
  clearAuthCookiesOnResponse,
  isSameOriginRequest,
  NO_STORE_AUTH_HEADERS,
  setAuthCookiesOnResponse,
} from '@/lib/auth-cookies';
import { refreshBackendSession } from '@/lib/auth-refresh';
import { getJwtSecrets, inspectJwtToken } from '@/lib/jwtHandler';

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { authenticated: false, message: 'Forbidden origin' },
      { status: 403, headers: NO_STORE_AUTH_HEADERS },
    );
  }

  const accessToken =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value;
  const refreshToken =
    request.cookies.get('refresh_token')?.value ||
    request.cookies.get('refreshToken')?.value;

  const accessInspect = accessToken
    ? inspectJwtToken(accessToken, getJwtSecrets('access'))
    : null;
  const refreshInspect = refreshToken
    ? inspectJwtToken(refreshToken, getJwtSecrets('refresh'))
    : null;

  if (!refreshToken || (refreshInspect && !refreshInspect.valid)) {
    const res = NextResponse.json(
      { authenticated: false, message: 'Refresh token missing or expired' },
      { status: 401, headers: NO_STORE_AUTH_HEADERS },
    );
    clearAuthCookiesOnResponse(res);
    return res;
  }

  const outcome = await refreshBackendSession(refreshToken);

  if (outcome.ok && outcome.accessToken) {
    const newAccessInspect = inspectJwtToken(
      outcome.accessToken,
      getJwtSecrets('access'),
    );
    const res = NextResponse.json(
      {
        authenticated: true,
        refreshed: true,
        accessExpiresAtMs:
          outcome.accessExpiresAtMs ?? newAccessInspect.expiresAtMs ?? null,
        accessIssuedAtMs: newAccessInspect.issuedAtMs ?? null,
        refreshExpiresAtMs:
          outcome.refreshExpiresAtMs ?? refreshInspect?.expiresAtMs ?? null,
      },
      { status: 200, headers: NO_STORE_AUTH_HEADERS },
    );
    setAuthCookiesOnResponse(res, {
      accessToken: outcome.accessToken,
      refreshToken: outcome.refreshToken || refreshToken,
    });
    return res;
  }

  if (outcome.authRejected || !accessInspect?.valid) {
    const res = NextResponse.json(
      { authenticated: false, message: 'Session expired. Please sign in again.' },
      { status: 401, headers: NO_STORE_AUTH_HEADERS },
    );
    clearAuthCookiesOnResponse(res);
    return res;
  }

  return NextResponse.json(
    {
      authenticated: true,
      refreshed: false,
      transientError: true,
      accessExpiresAtMs: accessInspect.expiresAtMs ?? null,
      accessIssuedAtMs: accessInspect.issuedAtMs ?? null,
    },
    { status: 503, headers: NO_STORE_AUTH_HEADERS },
  );
}
