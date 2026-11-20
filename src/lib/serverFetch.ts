import { parseCookieString } from '@/lib/auth-cookies';
import { buildBackendUrl, refreshBackendSession } from '@/lib/auth-refresh';
import { getJwtSecrets, inspectJwtToken } from '@/lib/jwtHandler';
import {
  applyAuthTokensCookies,
  clearAllAuthCookies,
  getAuthTokenPairFromCookies,
} from '@/services/auth/tokenHandler';

export { parseCookieString };
export const buildRequestUrl = buildBackendUrl;

function isAuthBootstrapEndpoint(endpoint: string): boolean {
  const normalized = endpoint.toLowerCase();
  return (
    normalized.includes('/auth/login') ||
    normalized.includes('/auth/refresh') ||
    normalized.includes('/auth/logout')
  );
}

const serverFetchHelper = async (
  endpoint: string,
  options: RequestInit,
  allowRetry = true,
): Promise<Response> => {
  const { headers, ...restOptions } = options;
  const requestUrl = buildBackendUrl(endpoint);

  if (!requestUrl) {
    return new Response(
      JSON.stringify({
        code: 'CONFIG_ERROR',
        message: 'Backend URL is missing or invalid',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  let { accessToken, refreshToken } = await getAuthTokenPairFromCookies();
  const isBootstrap = isAuthBootstrapEndpoint(endpoint);

  // Enforce strict token validation & 2-minute pre-expiry proactive refresh on protected calls
  if (!isBootstrap && (accessToken || refreshToken)) {
    const accessInspect = accessToken
      ? inspectJwtToken(accessToken, getJwtSecrets('access'))
      : null;
    const refreshInspect = refreshToken
      ? inspectJwtToken(refreshToken, getJwtSecrets('refresh'))
      : null;

    const accessValid = Boolean(accessInspect?.valid);
    const needsRefresh =
      !accessValid || Boolean(accessInspect?.shouldProactivelyRefresh);

    if (needsRefresh) {
      if (refreshToken && (refreshInspect ? refreshInspect.valid : true)) {
        const outcome = await refreshBackendSession(refreshToken);
        if (outcome.ok && outcome.accessToken) {
          accessToken = outcome.accessToken;
          if (outcome.refreshToken) {
            refreshToken = outcome.refreshToken;
          }
          try {
            await applyAuthTokensCookies({
              accessToken: outcome.accessToken,
              refreshToken: outcome.refreshToken,
            });
          } catch {
            // Cookie mutation throws inside Server Component render (proxy handles response cookies on SSR)
          }
        } else if (outcome.authRejected || !accessValid) {
          try {
            await clearAllAuthCookies();
          } catch {
            // Ignore in RSC render
          }
          if (!accessValid) {
            return new Response(
              JSON.stringify({
                code: 'SESSION_EXPIRED',
                message: 'Session has expired. Please sign in again.',
              }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }
        }
      } else if (!accessValid) {
        try {
          await clearAllAuthCookies();
        } catch {
          // Ignore in RSC render
        }
        return new Response(
          JSON.stringify({
            code: 'SESSION_EXPIRED',
            message: 'Session has expired. Please sign in again.',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }
  }

  const requestHeaders = new Headers(headers);
  const authCookies = [
    accessToken ? `access_token=${accessToken}` : null,
    refreshToken ? `refresh_token=${refreshToken}` : null,
  ].filter(Boolean);

  if (authCookies.length > 0 && !requestHeaders.has('Cookie')) {
    requestHeaders.set('Cookie', authCookies.join('; '));
  }

  if (accessToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  try {
    const response = await fetch(requestUrl, {
      headers: requestHeaders,
      cache: restOptions.cache ?? 'no-store',
      ...restOptions,
    });

    if (response.status === 401 && !isBootstrap) {
      if (refreshToken && allowRetry) {
        const outcome = await refreshBackendSession(refreshToken);
        if (outcome.ok && outcome.accessToken) {
          try {
            await applyAuthTokensCookies({
              accessToken: outcome.accessToken,
              refreshToken: outcome.refreshToken,
            });
          } catch {
            // Ignore in RSC render
          }

          const nextRefresh = outcome.refreshToken || refreshToken;
          const retryHeaders = new Headers(headers);
          retryHeaders.set('Authorization', `Bearer ${outcome.accessToken}`);
          retryHeaders.set(
            'Cookie',
            [
              `access_token=${outcome.accessToken}`,
              nextRefresh ? `refresh_token=${nextRefresh}` : null,
            ]
              .filter(Boolean)
              .join('; '),
          );

          return serverFetchHelper(
            endpoint,
            { ...restOptions, headers: retryHeaders },
            false,
          );
        }
      }

      // Unrecoverable 401 -> wipe cookies best-effort
      try {
        await clearAllAuthCookies();
      } catch {
        // Ignore in RSC render
      }
    }

    return response;
  } catch {
    return new Response(
      JSON.stringify({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Unable to reach TravelPilot backend server',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};

export const serverFetch = {
  get: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'GET' }),
  post: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'POST' }),
  put: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'PUT' }),
  patch: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'PATCH' }),
  delete: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'DELETE' }),
};
