'use server';

import { serverFetch } from '@/lib/serverFetch';
import { clearAllAuthCookies } from './tokenHandler';

export async function logout(): Promise<{ success: boolean; message: string }> {
  try {
    await serverFetch.post('/auth/logout').catch(() => null);
    await clearAllAuthCookies();

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error: unknown) {
    await clearAllAuthCookies().catch(() => null);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}
