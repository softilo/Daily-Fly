import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import {
  ACCESS_COOKIE_NAME,
  ALL_AUTH_COOKIE_NAMES,
  AuthTokenPair,
  LEGACY_DUPLICATE_COOKIE_NAMES,
  REFRESH_COOKIE_NAME,
} from '@/lib/auth-cookies';
import {
  DEFAULT_ACCESS_TTL_SECONDS,
  DEFAULT_REFRESH_TTL_SECONDS,
  getTokenMaxAgeSeconds,
} from '@/lib/jwtHandler';
import { getDefaultCookieOptions } from './cookieOptions';

export const setCookie = async (
  key: string,
  value: string,
  options: Partial<ResponseCookie> = {},
) => {
  const cookiesStore = await cookies();
  cookiesStore.set(key, value, getDefaultCookieOptions(options));
};

export const getCookies = async (key: string) => {
  const cookiesStore = await cookies();
  return cookiesStore.get(key)?.value || null;
};

export const deleteCookies = async (key: string) => {
  const cookiesStore = await cookies();
  cookiesStore.set(
    key,
    '',
    getDefaultCookieOptions({
      maxAge: 0,
      expires: new Date(0),
      httpOnly: key === 'userSession' ? false : true,
    }),
  );
};

export const getAuthTokenPairFromCookies = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  const cookiesStore = await cookies();
  const accessToken =
    cookiesStore.get('access_token')?.value ||
    cookiesStore.get('accessToken')?.value ||
    null;
  const refreshToken =
    cookiesStore.get('refresh_token')?.value ||
    cookiesStore.get('refreshToken')?.value ||
    null;
  return { accessToken, refreshToken };
};

export const applyAuthTokensCookies = async (
  tokens: AuthTokenPair,
): Promise<void> => {
  const cookiesStore = await cookies();

  const accessMaxAge = getTokenMaxAgeSeconds(
    tokens.accessToken,
    DEFAULT_ACCESS_TTL_SECONDS,
  );
  cookiesStore.set(
    ACCESS_COOKIE_NAME,
    tokens.accessToken,
    getDefaultCookieOptions({ maxAge: accessMaxAge }),
  );

  if (tokens.refreshToken) {
    const refreshMaxAge = getTokenMaxAgeSeconds(
      tokens.refreshToken,
      DEFAULT_REFRESH_TTL_SECONDS,
    );
    cookiesStore.set(
      REFRESH_COOKIE_NAME,
      tokens.refreshToken,
      getDefaultCookieOptions({ maxAge: refreshMaxAge }),
    );
  }

  // Remove duplicate camelCase aliases & legacy client-readable userSession cookie
  for (const name of LEGACY_DUPLICATE_COOKIE_NAMES) {
    cookiesStore.set(
      name,
      '',
      getDefaultCookieOptions({
        httpOnly: name === 'userSession' ? false : true,
        maxAge: 0,
        expires: new Date(0),
      }),
    );
  }
};

export const clearAllAuthCookies = async (): Promise<void> => {
  const cookiesStore = await cookies();
  for (const name of ALL_AUTH_COOKIE_NAMES) {
    cookiesStore.set(
      name,
      '',
      getDefaultCookieOptions({
        httpOnly: name === 'userSession' ? false : true,
        maxAge: 0,
        expires: new Date(0),
      }),
    );
  }
};
