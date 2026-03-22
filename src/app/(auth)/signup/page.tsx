'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { CaretLeftIcon, EnvelopeSimpleIcon } from '@phosphor-icons/react/ssr';
import { useRouter } from 'next/navigation';

import { AuthButton } from '@/components/ui/auth-button';
import { AuthInput } from '@/components/ui/auth-input';
import { useAuth } from '@/context/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [optimisticError, setOptimisticError] = useOptimistic(error);
  const [showEmailSent, setShowEmailSent] = useState(false);

  const handleSignup = () => {
    if (password !== passwordConfirm) {
      setError('パスワードが一致しません');
      return;
    }

    startTransition(async () => {
      setOptimisticError('');

      const { error: authError, needsEmailVerification } = await signUp(
        email,
        password,
      );

      if (authError) {
        setError(getAuthErrorMessage(authError));
      } else if (needsEmailVerification) {
        setShowEmailSent(true);
      } else {
        router.replace('/');
      }
    });
  };

  if (showEmailSent) {
    return (
      <div className="flex flex-col items-center">
        <EnvelopeSimpleIcon size={64} className="text-accent" />
        <h2 className="text-lg font-bold text-text-primary text-center mt-6 mb-4">
          確認メールを送信しました
        </h2>
        <p className="text-sm text-text-secondary text-center mb-8">
          確認メールを送信しました。メールをご確認ください。
        </p>
        <AuthButton
          title="ログイン画面に戻る"
          onClick={() => router.push('/login')}
          variant="secondary"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center mb-6 -ml-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-text-primary hover:text-text-secondary transition-colors"
          data-testid="back-button"
        >
          <CaretLeftIcon size={24} />
        </button>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-8">
        アカウント作成
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
          autoComplete="new-password"
        />
        <p className="text-text-disabled text-xs -mt-2 mb-4">6文字以上</p>
        <AuthInput
          label="パスワード（確認）"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          type="password"
          autoComplete="new-password"
        />
      </div>

      {optimisticError && (
        <p className="text-error text-xs text-center mb-4">{optimisticError}</p>
      )}

      <AuthButton
        title="アカウント作成"
        onClick={handleSignup}
        loading={isPending}
        disabled={!email || !password || !passwordConfirm}
      />
    </>
  );
}
