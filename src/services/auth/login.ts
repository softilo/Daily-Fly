'use server';

import { extractTokensFromAuthResponse } from '@/lib/auth-cookies';
import { getDefaultDashboard } from '@/lib/auth-utils';
import { getJwtSecrets, inspectJwtToken } from '@/lib/jwtHandler';
import { serverFetch } from '@/lib/serverFetch';
import { StaffUser } from '@/types/api';
import { applyAuthTokensCookies, clearAllAuthCookies } from './tokenHandler';

export interface LoginActionResult {
  success: boolean;
  message: string;
  user?: StaffUser;
  redirectTo?: string;
}

export const login = async (
  _prevState: unknown,
  formData: FormData,
): Promise<LoginActionResult> => {
  try {
    const callbackUrl = String(
      formData.get('callbackUrl') || formData.get('redirect') || '',
    ).trim();

    const payload = {
      email: String(formData.get('email') || '')
        .toLowerCase()
        .trim(),
      password: String(formData.get('password') || ''),
    };

    if (!payload.email || !payload.password) {
      return {
        success: false,
        message: 'Email and password are required',
      };
    }

    const res = await serverFetch.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: result?.message || 'Invalid email or password',
      };
    }

    const { accessToken: accessTokenValue, refreshToken: refreshTokenValue } =
      extractTokensFromAuthResponse(res, result);

    if (!accessTokenValue) {
      return {
        success: false,
        message: 'Authentication token missing from server response',
      };
    }

    const accessInspect = inspectJwtToken(
      accessTokenValue,
      getJwtSecrets('access'),
    );
    if (!accessInspect.valid) {
      await clearAllAuthCookies();
      return {
        success: false,
        message: 'Received invalid or expired authentication token',
      };
    }

    const user: StaffUser | undefined = result?.user || result?.data?.user;
    if (user?.status === 'INACTIVE') {
      await clearAllAuthCookies();
      return {
        success: false,
        message: 'Your staff account is inactive. Contact an administrator.',
      };
    }

    await applyAuthTokensCookies({
      accessToken: accessTokenValue,
      refreshToken: refreshTokenValue,
    });

    const defaultDashboard = getDefaultDashboard(user?.role);
    const isSafeCallback =
      callbackUrl.startsWith('/') &&
      !callbackUrl.startsWith('//') &&
      !callbackUrl.includes('://') &&
      !callbackUrl.includes('\\');

    return {
      success: true,
      message: 'Signed in successfully',
      user,
      redirectTo: isSafeCallback ? callbackUrl : defaultDashboard,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to sign in at this moment',
    };
  }
};
