'use client';

import { useTransition } from 'react';
import { logout } from '@/services/auth/logout';
import { broadcastAuthSync } from '@/lib/auth-broadcast';
import { Button } from '@/components/ui/button';

export function LogoutBtn() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout().catch(() => null);
      broadcastAuthSync({ type: 'SIGNED_OUT' });
      window.location.replace('/');
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
