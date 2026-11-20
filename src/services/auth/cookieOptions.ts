import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { buildAuthCookieOptions } from '@/lib/auth-cookies';

export const getDefaultCookieOptions = (
  overrides: Partial<ResponseCookie> = {},
): Partial<ResponseCookie> => buildAuthCookieOptions(overrides);
