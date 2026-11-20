import jwt, { JwtPayload } from 'jsonwebtoken';

export const PROACTIVE_REFRESH_WINDOW_MS = 2 * 60 * 1000; // 2 minutes before expiry
export const DEFAULT_ACCESS_TTL_SECONDS = 15 * 60;
export const DEFAULT_REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

const MAX_JWT_LENGTH = 8192;
const ALLOWED_ALGORITHMS: jwt.Algorithm[] = ['HS256', 'HS384', 'HS512', 'RS256'];

export interface JwtInspectionResult {
  valid: boolean;
  expired: boolean;
  reason?: string;
  payload?: JwtPayload;
  issuedAtMs?: number;
  expiresAtMs?: number;
  remainingMs?: number;
  shouldProactivelyRefresh: boolean;
}

export interface TokenVerificationResult {
  success: boolean;
  payload?: JwtPayload;
  message?: string;
}

export function getJwtSecrets(kind: 'access' | 'refresh'): string[] {
  const candidates =
    kind === 'access'
      ? [process.env.JWT_ACCESS_SECRET, process.env.JWT_SECRET]
      : [process.env.JWT_REFRESH_SECRET, process.env.JWT_SECRET];

  return Array.from(
    new Set(candidates.map((v) => v?.trim()).filter((v): v is string => Boolean(v))),
  );
}

/**
 * Computes when proactive refresh should fire before expiry.
 * Uses 2 minutes (120s) for all normal tokens; for ultra-short test tokens (<= 2m15s),
 * refreshes at 25% remaining lifetime to avoid tight infinite refresh loops.
 */
export function getEffectiveProactiveLeadMs(
  issuedAtMs?: number,
  expiresAtMs?: number,
): number {
  if (issuedAtMs && expiresAtMs && expiresAtMs > issuedAtMs) {
    const totalTtlMs = expiresAtMs - issuedAtMs;
    if (totalTtlMs <= PROACTIVE_REFRESH_WINDOW_MS + 15_000) {
      return Math.max(5_000, Math.floor(totalTtlMs * 0.25));
    }
  }
  return PROACTIVE_REFRESH_WINDOW_MS;
}

function parseProtectedHeader(token: string): { alg?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
      return null;
    }
    const headerJson = Buffer.from(parts[0], 'base64url').toString('utf8');
    const parsed = JSON.parse(headerJson) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as { alg?: string };
  } catch {
    return null;
  }
}

function hasSubjectIdentity(payload: JwtPayload): boolean {
  const record = payload as Record<string, unknown>;
  const candidates = [record.sub, record.id, record.userId, record.email];
  return candidates.some((val) => typeof val === 'string' && val.trim().length > 0);
}

function buildValidTimingResult(
  payload: JwtPayload,
  nowMs: number,
  requireIdentity = true,
): JwtInspectionResult {
  if (requireIdentity && !hasSubjectIdentity(payload)) {
    return {
      valid: false,
      expired: false,
      reason: 'Missing token subject identity claim',
      shouldProactivelyRefresh: false,
    };
  }

  if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
    return {
      valid: false,
      expired: false,
      reason: 'Missing mandatory JWT exp claim',
      shouldProactivelyRefresh: false,
    };
  }

  if (
    typeof payload.nbf === 'number' &&
    Number.isFinite(payload.nbf) &&
    payload.nbf * 1000 > nowMs + 5000
  ) {
    return {
      valid: false,
      expired: false,
      reason: 'Token is not active yet',
      shouldProactivelyRefresh: false,
    };
  }

  const issuedAtMs =
    typeof payload.iat === 'number' && Number.isFinite(payload.iat)
      ? payload.iat * 1000
      : undefined;
  const expiresAtMs = payload.exp * 1000;
  const remainingMs = expiresAtMs - nowMs;

  if (remainingMs <= 0) {
    return {
      valid: false,
      expired: true,
      reason: 'Token has expired',
      payload,
      issuedAtMs,
      expiresAtMs,
      remainingMs: 0,
      shouldProactivelyRefresh: true,
    };
  }

  const leadMs = getEffectiveProactiveLeadMs(issuedAtMs, expiresAtMs);
  return {
    valid: true,
    expired: false,
    payload,
    issuedAtMs,
    expiresAtMs,
    remainingMs,
    shouldProactivelyRefresh: remainingMs <= leadMs,
  };
}

/**
 * Inspects & validates a JWT cleanly:
 * - Rejects malformed strings, oversized tokens, missing 3 segments, and `alg=none` headers.
 * - When signing secrets are configured, requires cryptographic verification (no unverified decode fallback).
 * - Requires finite `exp` claim and subject identity.
 */
export function inspectJwtToken(
  token: string | undefined | null,
  secrets: string[] = [],
  options: { requireIdentity?: boolean; clockToleranceSec?: number } = {},
): JwtInspectionResult {
  if (!token || typeof token !== 'string' || token.length > MAX_JWT_LENGTH) {
    return {
      valid: false,
      expired: false,
      reason: 'Missing or oversized token',
      shouldProactivelyRefresh: false,
    };
  }

  const header = parseProtectedHeader(token);
  if (
    !header ||
    typeof header.alg !== 'string' ||
    header.alg.toLowerCase() === 'none'
  ) {
    return {
      valid: false,
      expired: false,
      reason: 'Unsupported or unsigned JWT algorithm',
      shouldProactivelyRefresh: false,
    };
  }

  const nowMs = Date.now();
  const requireIdentity = options.requireIdentity ?? true;

  if (secrets.length > 0) {
    let sawExpiredError = false;
    for (const secret of secrets) {
      try {
        const verified = jwt.verify(token, secret, {
          algorithms: ALLOWED_ALGORITHMS,
          clockTolerance: options.clockToleranceSec ?? 5,
        });
        if (verified && typeof verified === 'object') {
          return buildValidTimingResult(
            verified as JwtPayload,
            nowMs,
            requireIdentity,
          );
        }
      } catch (err: unknown) {
        if (err instanceof jwt.TokenExpiredError) {
          sawExpiredError = true;
        }
      }
    }

    return {
      valid: false,
      expired: sawExpiredError,
      reason: sawExpiredError
        ? 'Token has expired'
        : 'JWT signature verification failed',
      shouldProactivelyRefresh: sawExpiredError,
    };
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') {
      return {
        valid: false,
        expired: false,
        reason: 'Invalid token payload',
        shouldProactivelyRefresh: false,
      };
    }

    return buildValidTimingResult(decoded as JwtPayload, nowMs, requireIdentity);
  } catch {
    return {
      valid: false,
      expired: false,
      reason: 'Malformed JWT token',
      shouldProactivelyRefresh: false,
    };
  }
}

export function getTokenMaxAgeSeconds(
  token: string,
  fallbackSeconds: number,
): number {
  const result = inspectJwtToken(token, [], { requireIdentity: false });
  if (result.remainingMs && result.remainingMs > 0) {
    return Math.max(1, Math.floor(result.remainingMs / 1000));
  }
  return fallbackSeconds;
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenVerificationResult> {
  const result = inspectJwtToken(token, getJwtSecrets('access'));
  if (!result.valid || !result.payload) {
    return {
      success: false,
      message: result.reason || 'Invalid or expired token',
    };
  }

  return {
    success: true,
    payload: result.payload,
  };
}
