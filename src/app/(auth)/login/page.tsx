'use client';

import { useOptimistic, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthButton } from '@/components/ui/auth-button';
import { AuthInput } from '@/components/ui/auth-input';
import { useAuth } from '@/context/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [optimisticError, setOptimisticError] = useOptimistic(error);

  const handleLogin = () => {
    startTransition(async () => {
      setOptimisticError('');

      const { error: authError } = await signIn(email, password);
      if (authError) {
        setError(getAuthErrorMessage(authError));
        return;
      }

      router.replace('/');
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-accent text-center mb-12">
        MoodPick
      </h1>

      <div className="mb-6">
        <AuthInput
          label="メールアドレス"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
        />
        <AuthInput
          label="パスワード"
          value={password}
          onChange={setPassword}
          type="password"
          autoComplete="current-password"
        />
      </div>

      {optimisticError && (
        <p className="text-error text-xs text-center mb-4">{optimisticError}</p>
      )}

      <AuthButton
        title="ログイン"
        onClick={handleLogin}
        loading={isPending}
        disabled={!email || !password}
      />

      <Link
        href="/forgot-password"
        className="block mt-4 text-text-secondary text-xs text-center hover:text-text-primary transition-colors"
      >
        パスワードを忘れた方はこちら
      </Link>

      <div className="mt-8">
        <p className="text-text-secondary text-xs text-center mb-3">
          アカウントをお持ちでない方
        </p>
        <AuthButton
          title="新規登録"
          onClick={() => router.push('/signup')}
          variant="secondary"
        />
      </div>
    </>
  );
}
