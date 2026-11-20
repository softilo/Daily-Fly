import { NextRequest, NextResponse } from 'next/server';
import {
  clearAuthCookiesOnResponse,
  isSameOriginRequest,
  NO_STORE_AUTH_HEADERS,
} from '@/lib/auth-cookies';
import { buildBackendUrl } from '@/lib/auth-refresh';

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { success: false, message: 'Forbidden origin' },
      { status: 403, headers: NO_STORE_AUTH_HEADERS },
    );
  }

  const accessToken =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value;
  const refreshToken =
    request.cookies.get('refresh_token')?.value ||
    request.cookies.get('refreshToken')?.value;

  const logoutUrl = buildBackendUrl('/auth/logout');
  if (logoutUrl && (accessToken || refreshToken)) {
    await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        Cookie: [
          accessToken ? `access_token=${accessToken}` : null,
          refreshToken ? `refresh_token=${refreshToken}` : null,
        ]
          .filter(Boolean)
          .join('; '),
      },
      cache: 'no-store',
    }).catch(() => null);
  }

  const res = NextResponse.json(
    { success: true, message: 'Signed out' },
    { status: 200, headers: NO_STORE_AUTH_HEADERS },
  );
  clearAuthCookiesOnResponse(res);
  return res;
}
