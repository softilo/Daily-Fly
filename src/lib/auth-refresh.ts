import crypto from 'node:crypto';
import { extractTokensFromAuthResponse } from './auth-cookies';
import { getJwtSecrets, inspectJwtToken } from './jwtHandler';

const BackendURL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:5000';

export const buildBackendUrl = (endpoint: string): string | null => {
  if (!BackendURL) return null;

  try {
    const normalizedBase = BackendURL.endsWith('/')
      ? BackendURL
      : `${BackendURL}/`;
    let normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;

    if (
      !normalizedEndpoint.startsWith('api/v1') &&
      !normalizedEndpoint.startsWith('api/')
    ) {
      normalizedEndpoint = `api/v1/${normalizedEndpoint}`;
    }

    return new URL(normalizedEndpoint, normalizedBase).toString();
  } catch {
    return null;
  }
};

export interface RefreshTokenOutcome {
  ok: boolean;
  authRejected: boolean;
  accessToken?: string;
  refreshToken?: string;
  accessExpiresAtMs?: number;
  refreshExpiresAtMs?: number;
}

interface RecentRefreshCacheEntry {
  outcome: RefreshTokenOutcome;
  cachedAt: number;
}

const RECENT_REFRESH_DEDUP_MS = 3000;
const MAX_CACHE_SIZE = 50;

const globalRefreshState = globalThis as unknown as {
  __dailyFlyInFlightRefresh?: Map<string, Promise<RefreshTokenOutcome>>;
  __dailyFlyRecentRefresh?: Map<string, RecentRefreshCacheEntry>;
};

const inFlightMap =
  globalRefreshState.__dailyFlyInFlightRefresh ??
  (globalRefreshState.__dailyFlyInFlightRefresh = new Map());

const recentMap =
  globalRefreshState.__dailyFlyRecentRefresh ??
  (globalRefreshState.__dailyFlyRecentRefresh = new Map());

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function pruneRecentCache(now: number): void {
  if (recentMap.size <= MAX_CACHE_SIZE) return;
  for (const [key, entry] of recentMap.entries()) {
    if (now - entry.cachedAt > RECENT_REFRESH_DEDUP_MS) {
      recentMap.delete(key);
    }
  }
}

async function executeRefreshRequest(
  refreshToken: string,
): Promise<RefreshTokenOutcome> {
  const requestUrl = buildBackendUrl('/api/v1/auth/refresh');
  if (!requestUrl) {
    return { ok: false, authRejected: false };
  }

  try {
    const res = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'x-refresh-token': refreshToken,
      },
      cache: 'no-store',
    });

    if (res.status === 400 || res.status === 401 || res.status === 403) {
      return { ok: false, authRejected: true };
    }

    if (!res.ok) {
      return { ok: false, authRejected: false };
    }

    const body = await res.json().catch(() => null);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      extractTokensFromAuthResponse(res, body);

    if (!newAccessToken) {
      return { ok: false, authRejected: true };
    }

    const accessInspect = inspectJwtToken(
      newAccessToken,
      getJwtSecrets('access'),
    );
    if (!accessInspect.valid) {
      return { ok: false, authRejected: true };
    }

    let refreshExpiresAtMs: number | undefined;
    const effectiveRefreshToken = newRefreshToken || refreshToken;
    const refreshInspect = inspectJwtToken(
      effectiveRefreshToken,
      getJwtSecrets('refresh'),
    );
    if (refreshInspect.valid && refreshInspect.expiresAtMs) {
      refreshExpiresAtMs = refreshInspect.expiresAtMs;
    } else if (newRefreshToken && !refreshInspect.valid) {
      // Backend explicitly returned an invalid/expired new refresh token
      return { ok: false, authRejected: true };
    }

    return {
      ok: true,
      authRejected: false,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken || undefined,
      accessExpiresAtMs: accessInspect.expiresAtMs,
      refreshExpiresAtMs,
    };
  } catch {
    return { ok: false, authRejected: false };
  }
}

/**
 * Refreshes the backend JWT session using single-flight locking + brief post-refresh dedup
 * so concurrent SSR, Proxy, and client requests sharing a single-use refresh token do not race.
 */
export async function refreshBackendSession(
  refreshToken: string,
): Promise<RefreshTokenOutcome> {
  if (!refreshToken) {
    return { ok: false, authRejected: true };
  }

  const key = hashRefreshToken(refreshToken);
  const now = Date.now();
  const cached = recentMap.get(key);
  if (cached && now - cached.cachedAt <= RECENT_REFRESH_DEDUP_MS) {
    return cached.outcome;
  }

  const existing = inFlightMap.get(key);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      const outcome = await executeRefreshRequest(refreshToken);
      if (outcome.ok) {
        pruneRecentCache(Date.now());
        recentMap.set(key, { outcome, cachedAt: Date.now() });
      }
      return outcome;
    } finally {
      inFlightMap.delete(key);
    }
  })();

  inFlightMap.set(key, promise);
  return promise;
}
