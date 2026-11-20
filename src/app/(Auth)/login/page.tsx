import { Suspense } from 'react';
import { LoginForm } from '@/components/module/Auth/LoginForm';
import { LoginFormSkeleton } from '@/components/shared/AppSkeletons';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
