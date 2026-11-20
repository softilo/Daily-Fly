import { NextRequest, NextResponse } from 'next/server';
import {
  AuthTokenPair,
  clearAuthCookiesOnResponse,
  extractStaffUserPayload,
  NO_STORE_AUTH_HEADERS,
  setAuthCookiesOnResponse,
} from '@/lib/auth-cookies';
import { buildBackendUrl, refreshBackendSession } from '@/lib/auth-refresh';
import { getJwtSecrets, inspectJwtToken } from '@/lib/jwtHandler';

function unauthenticatedResponse(message = 'Session expired') {
  const res = NextResponse.json(
    { authenticated: false, message },
    { status: 401, headers: NO_STORE_AUTH_HEADERS },
  );
  clearAuthCookiesOnResponse(res);
  return res;
}

export async function GET(request: NextRequest) {
  let accessToken =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value;
  let refreshToken =
    request.cookies.get('refresh_token')?.value ||
    request.cookies.get('refreshToken')?.value;

  if (!accessToken && !refreshToken) {
    return unauthenticatedResponse('Authentication required');
  }

  const accessSecrets = getJwtSecrets('access');
  const refreshSecrets = getJwtSecrets('refresh');

  let accessInspect = accessToken
    ? inspectJwtToken(accessToken, accessSecrets)
    : null;
  const refreshInspect = refreshToken
    ? inspectJwtToken(refreshToken, refreshSecrets)
    : null;

  let refreshedTokens: AuthTokenPair | undefined;
  const refreshValid = Boolean(
    refreshToken && (refreshInspect ? refreshInspect.valid : true),
  );

  // Refresh when access token is missing/expired OR within the 2-minute pre-expiry window
  if (
    (!accessInspect?.valid || accessInspect.shouldProactivelyRefresh) &&
    refreshToken &&
    refreshValid
  ) {
    const outcome = await refreshBackendSession(refreshToken);
    if (outcome.ok && outcome.accessToken) {
      accessToken = outcome.accessToken;
      refreshToken = outcome.refreshToken || refreshToken;
      refreshedTokens = { accessToken, refreshToken };
      accessInspect = inspectJwtToken(accessToken, accessSecrets);
    } else if (outcome.authRejected || !accessInspect?.valid) {
      return unauthenticatedResponse('Session expired. Please sign in again.');
    }
  }

  if (!accessInspect?.valid || !accessToken) {
    return unauthenticatedResponse('Invalid or expired session token');
  }

  // Verify live session & staff status against backend /auth/me
  const meUrl = buildBackendUrl('/auth/me');
  if (meUrl) {
    try {
      let meRes = await fetch(meUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: [
            `access_token=${accessToken}`,
            refreshToken ? `refresh_token=${refreshToken}` : null,
          ]
            .filter(Boolean)
            .join('; '),
        },
        cache: 'no-store',
      });

      if (meRes.status === 401 && !refreshedTokens && refreshToken && refreshValid) {
        const retryOutcome = await refreshBackendSession(refreshToken);
        if (retryOutcome.ok && retryOutcome.accessToken) {
          accessToken = retryOutcome.accessToken;
          refreshToken = retryOutcome.refreshToken || refreshToken;
          refreshedTokens = { accessToken, refreshToken };
          accessInspect = inspectJwtToken(accessToken, accessSecrets);

          meRes = await fetch(meUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Cookie: [
                `access_token=${accessToken}`,
                refreshToken ? `refresh_token=${refreshToken}` : null,
              ]
                .filter(Boolean)
                .join('; '),
            },
            cache: 'no-store',
          });
        } else if (retryOutcome.authRejected) {
          return unauthenticatedResponse('Session revoked or expired');
        }
      }

      if (meRes.status === 401 || meRes.status === 403) {
        return unauthenticatedResponse('Session rejected by backend');
      }

      if (meRes.ok) {
        const raw = await meRes.json().catch(() => null);
        const user = extractStaffUserPayload(raw);
        if (!user?.id || user.status === 'INACTIVE') {
          return unauthenticatedResponse('Staff account is inactive');
        }
      }
    } catch {
      // Transient backend outage while access JWT is still valid locally
    }
  }

  if (!accessInspect?.valid) {
    return unauthenticatedResponse('Session expired');
  }

  const res = NextResponse.json(
    {
      authenticated: true,
      refreshed: Boolean(refreshedTokens),
      accessExpiresAtMs: accessInspect.expiresAtMs ?? null,
      accessIssuedAtMs: accessInspect.issuedAtMs ?? null,
      refreshExpiresAtMs: refreshInspect?.expiresAtMs ?? null,
    },
    { status: 200, headers: NO_STORE_AUTH_HEADERS },
  );

  if (refreshedTokens) {
    setAuthCookiesOnResponse(res, refreshedTokens);
  }

  return res;
}
