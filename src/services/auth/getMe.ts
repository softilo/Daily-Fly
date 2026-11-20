import { cache } from 'react';
import { redirect } from 'next/navigation';
import { extractStaffUserPayload } from '@/lib/auth-cookies';
import { getJwtSecrets, inspectJwtToken } from '@/lib/jwtHandler';
import { serverFetch } from '@/lib/serverFetch';
import { StaffRole, StaffUser } from '@/types/api';
import {
  clearAllAuthCookies,
  getAuthTokenPairFromCookies,
} from './tokenHandler';

export const getMe = cache(async (): Promise<StaffUser | null> => {
  const { accessToken, refreshToken } = await getAuthTokenPairFromCookies();
  if (!accessToken && !refreshToken) {
    return null;
  }

  const accessInspect = accessToken
    ? inspectJwtToken(accessToken, getJwtSecrets('access'))
    : null;
  const refreshInspect = refreshToken
    ? inspectJwtToken(refreshToken, getJwtSecrets('refresh'))
    : null;

  if (!accessInspect?.valid && !refreshInspect?.valid) {
    return null;
  }

  try {
    const res = await serverFetch.get('/auth/me');
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        try {
          await clearAllAuthCookies();
        } catch {
          // Ignore in RSC render
        }
      }
      return null;
    }

    const raw = await res.json().catch(() => null);
    const user = extractStaffUserPayload(raw);

    if (!user?.id || user.status === 'INACTIVE') {
      try {
        await clearAllAuthCookies();
      } catch {
        // Ignore in RSC render
      }
      return null;
    }

    return user;
  } catch {
    return null;
  }
});

export async function requireStaffSession(
  allowedRoles?: StaffRole[],
): Promise<StaffUser> {
  const user = await getMe();
  if (!user) {
    redirect('/');
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect('/dashboard?error=unauthorized');
  }
  return user;
}

export const getCurrentAccessTiming = cache(
  async (): Promise<{ expiresAtMs: number | null; issuedAtMs: number | null }> => {
    const { accessToken } = await getAuthTokenPairFromCookies();
    if (!accessToken) {
      return { expiresAtMs: null, issuedAtMs: null };
    }

    const inspect = inspectJwtToken(accessToken, getJwtSecrets('access'), {
      requireIdentity: false,
    });
    if (!inspect.valid) {
      return { expiresAtMs: null, issuedAtMs: null };
    }

    return {
      expiresAtMs: inspect.expiresAtMs ?? null,
      issuedAtMs: inspect.issuedAtMs ?? null,
    };
  },
);
