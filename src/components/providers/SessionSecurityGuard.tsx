'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AUTH_SYNC_CHANNEL,
  AUTH_SYNC_STORAGE_KEY,
  AuthSyncEvent,
  broadcastAuthSync,
} from '@/lib/auth-broadcast';

const PROACTIVE_REFRESH_LEAD_MS = 2 * 60 * 1000; // 2 minutes before JWT expires
const SHORT_TOKEN_THRESHOLD_MS = PROACTIVE_REFRESH_LEAD_MS + 15_000;
const MIN_REFRESH_ATTEMPT_GAP_MS = 15_000;
const HEARTBEAT_CHECK_INTERVAL_MS = 15_000;
const STALE_TAB_VERIFY_MS = 60_000;

interface SessionTimingState {
  expiresAtMs: number | null;
  issuedAtMs: number | null;
}

function computeClientLeadMs(
  issuedAtMs: number | null,
  expiresAtMs: number,
): number {
  if (issuedAtMs && expiresAtMs > issuedAtMs) {
    const totalTtl = expiresAtMs - issuedAtMs;
    if (totalTtl <= SHORT_TOKEN_THRESHOLD_MS) {
      return Math.max(5_000, Math.floor(totalTtl * 0.25));
    }
  }
  return PROACTIVE_REFRESH_LEAD_MS;
}

export function SessionSecurityGuard({
  initialAccessExpiresAtMs,
  initialAccessIssuedAtMs = null,
}: {
  initialAccessExpiresAtMs: number | null;
  initialAccessIssuedAtMs?: number | null;
}) {
  const [timing, setTiming] = useState<SessionTimingState>({
    expiresAtMs: initialAccessExpiresAtMs,
    issuedAtMs: initialAccessIssuedAtMs,
  });

  const timingRef = useRef(timing);
  const lastVerifiedAtRef = useRef<number>(0);
  const lastAttemptAtRef = useRef<number>(0);
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);
  const kickingOutRef = useRef<boolean>(false);

  useEffect(() => {
    lastVerifiedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    timingRef.current = timing;
  }, [timing]);

  useEffect(() => {
    if (
      initialAccessExpiresAtMs &&
      (!timingRef.current.expiresAtMs ||
        initialAccessExpiresAtMs > timingRef.current.expiresAtMs)
    ) {
      setTiming({
        expiresAtMs: initialAccessExpiresAtMs,
        issuedAtMs: initialAccessIssuedAtMs,
      });
    }
  }, [initialAccessExpiresAtMs, initialAccessIssuedAtMs]);

  const forceKickOut = useCallback(() => {
    if (kickingOutRef.current) return;
    kickingOutRef.current = true;

    broadcastAuthSync({ type: 'SIGNED_OUT' });

    fetch('/api/auth/logout', {
      method: 'POST',
      keepalive: true,
      cache: 'no-store',
    }).catch(() => null);

    window.location.replace('/');
  }, []);

  const refreshTokenNow = useCallback(async () => {
    if (kickingOutRef.current) return;
    if (inFlightPromiseRef.current) return inFlightPromiseRef.current;

    const run = (async () => {
      lastAttemptAtRef.current = Date.now();
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          cache: 'no-store',
        });

        const data = (await res.json().catch(() => null)) as {
          authenticated?: boolean;
          accessExpiresAtMs?: number | null;
          accessIssuedAtMs?: number | null;
        } | null;

        if (res.status === 401 || res.status === 403 || !data?.authenticated) {
          forceKickOut();
          return;
        }

        if (res.ok && data?.accessExpiresAtMs) {
          lastVerifiedAtRef.current = Date.now();
          const nextState: SessionTimingState = {
            expiresAtMs: data.accessExpiresAtMs,
            issuedAtMs: data.accessIssuedAtMs ?? null,
          };
          timingRef.current = nextState;
          setTiming(nextState);

          broadcastAuthSync({
            type: 'TOKEN_REFRESHED',
            accessExpiresAtMs: data.accessExpiresAtMs,
            accessIssuedAtMs: data.accessIssuedAtMs ?? null,
          });
        } else if (
          timingRef.current.expiresAtMs &&
          Date.now() >= timingRef.current.expiresAtMs
        ) {
          forceKickOut();
        }
      } catch {
        if (
          timingRef.current.expiresAtMs &&
          Date.now() >= timingRef.current.expiresAtMs
        ) {
          forceKickOut();
        }
      } finally {
        inFlightPromiseRef.current = null;
      }
    })();

    inFlightPromiseRef.current = run;
    return run;
  }, [forceKickOut]);

  const verifySessionNow = useCallback(async () => {
    if (kickingOutRef.current) return;
    if (inFlightPromiseRef.current) return inFlightPromiseRef.current;

    const run = (async () => {
      lastAttemptAtRef.current = Date.now();
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = (await res.json().catch(() => null)) as {
          authenticated?: boolean;
          refreshed?: boolean;
          accessExpiresAtMs?: number | null;
          accessIssuedAtMs?: number | null;
        } | null;

        if (!res.ok || !data?.authenticated) {
          forceKickOut();
          return;
        }

        lastVerifiedAtRef.current = Date.now();
        if (data.accessExpiresAtMs) {
          const nextState: SessionTimingState = {
            expiresAtMs: data.accessExpiresAtMs,
            issuedAtMs: data.accessIssuedAtMs ?? null,
          };
          timingRef.current = nextState;
          setTiming(nextState);

          if (data.refreshed) {
            broadcastAuthSync({
              type: 'TOKEN_REFRESHED',
              accessExpiresAtMs: data.accessExpiresAtMs,
              accessIssuedAtMs: data.accessIssuedAtMs ?? null,
            });
          }
        }
      } catch {
        if (
          !timingRef.current.expiresAtMs ||
          Date.now() >= timingRef.current.expiresAtMs
        ) {
          forceKickOut();
        }
      } finally {
        inFlightPromiseRef.current = null;
      }
    })();

    inFlightPromiseRef.current = run;
    return run;
  }, [forceKickOut]);

  // Schedule 2-minute pre-expiry proactive refresh & hard expiration watchdog
  useEffect(() => {
    if (kickingOutRef.current) return;

    const { expiresAtMs, issuedAtMs } = timing;
    if (!expiresAtMs) {
      const immediateTimer = window.setTimeout(() => {
        void verifySessionNow();
      }, 0);
      return () => window.clearTimeout(immediateTimer);
    }

    const now = Date.now();
    const remaining = expiresAtMs - now;

    if (remaining <= 0) {
      const immediateVerify = window.setTimeout(() => {
        void verifySessionNow();
      }, 0);
      return () => window.clearTimeout(immediateVerify);
    }

    const leadMs = computeClientLeadMs(issuedAtMs, expiresAtMs);
    const untilRefresh = Math.max(0, remaining - leadMs);
    const sinceLastAttempt = now - lastAttemptAtRef.current;
    const refreshDelay =
      untilRefresh === 0 && sinceLastAttempt < MIN_REFRESH_ATTEMPT_GAP_MS
        ? MIN_REFRESH_ATTEMPT_GAP_MS - sinceLastAttempt
        : untilRefresh;

    const refreshTimer = window.setTimeout(() => {
      void refreshTokenNow();
    }, refreshDelay);

    const expiryTimer = window.setTimeout(() => {
      void verifySessionNow();
    }, remaining + 250);

    return () => {
      window.clearTimeout(refreshTimer);
      window.clearTimeout(expiryTimer);
    };
  }, [timing, refreshTokenNow, verifySessionNow]);

  // Periodic drift check + visibility/focus/online/bfcache handlers
  useEffect(() => {
    const checkHealth = () => {
      if (kickingOutRef.current) return;
      const { expiresAtMs, issuedAtMs } = timingRef.current;
      const now = Date.now();

      if (!expiresAtMs || now >= expiresAtMs) {
        void verifySessionNow();
        return;
      }

      const leadMs = computeClientLeadMs(issuedAtMs, expiresAtMs);
      if (
        now >= expiresAtMs - leadMs &&
        now - lastAttemptAtRef.current >= MIN_REFRESH_ATTEMPT_GAP_MS
      ) {
        void refreshTokenNow();
        return;
      }

      if (now - lastVerifiedAtRef.current >= STALE_TAB_VERIFY_MS) {
        void verifySessionNow();
      }
    };

    const intervalId = window.setInterval(
      checkHealth,
      HEARTBEAT_CHECK_INTERVAL_MS,
    );

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkHealth();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void verifySessionNow();
      } else {
        checkHealth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkHealth);
    window.addEventListener('online', checkHealth);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkHealth);
      window.removeEventListener('online', checkHealth);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [refreshTokenNow, verifySessionNow]);

  // Multi-tab session synchronization (sign-out & token rotation)
  useEffect(() => {
    const handleEvent = (payload: AuthSyncEvent | null) => {
      if (!payload || kickingOutRef.current) return;

      if (payload.type === 'SIGNED_OUT') {
        kickingOutRef.current = true;
        window.location.replace('/');
        return;
      }

      if (
        payload.type === 'TOKEN_REFRESHED' &&
        payload.accessExpiresAtMs &&
        (!timingRef.current.expiresAtMs ||
          payload.accessExpiresAtMs > timingRef.current.expiresAtMs)
      ) {
        lastVerifiedAtRef.current = Date.now();
        setTiming({
          expiresAtMs: payload.accessExpiresAtMs,
          issuedAtMs: payload.accessIssuedAtMs ?? null,
        });
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
        channel.onmessage = (event: MessageEvent<AuthSyncEvent>) => {
          handleEvent(event.data);
        };
      }
    } catch {
      // BroadcastChannel unavailable
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_SYNC_STORAGE_KEY || !event.newValue) return;
      try {
        handleEvent(JSON.parse(event.newValue) as AuthSyncEvent);
      } catch {
        // Ignore malformed storage sync event
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return null;
}
