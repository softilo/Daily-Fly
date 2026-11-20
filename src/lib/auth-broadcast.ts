'use client';

export const AUTH_SYNC_CHANNEL = 'dailyfly-auth-sync';
export const AUTH_SYNC_STORAGE_KEY = 'dailyfly_auth_sync_event';

export type AuthSyncEvent =
  | {
      type: 'TOKEN_REFRESHED';
      accessExpiresAtMs: number;
      accessIssuedAtMs?: number | null;
      ts: number;
    }
  | {
      type: 'SIGNED_OUT';
      ts: number;
    };

export function broadcastAuthSync(
  event:
    | {
        type: 'TOKEN_REFRESHED';
        accessExpiresAtMs: number;
        accessIssuedAtMs?: number | null;
      }
    | { type: 'SIGNED_OUT' },
): void {
  if (typeof window === 'undefined') return;
  const payload: AuthSyncEvent = { ...event, ts: Date.now() };

  try {
    if ('BroadcastChannel' in window) {
      const ch = new BroadcastChannel(AUTH_SYNC_CHANNEL);
      ch.postMessage(payload);
      ch.close();
    }
  } catch {
    // Ignore BroadcastChannel restriction
  }

  try {
    window.localStorage.setItem(AUTH_SYNC_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / private mode restriction
  }
}
