'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthButton } from '@/components/ui/auth-button';
import { AuthInput } from '@/components/ui/auth-input';
import { useAuth } from '@/context/auth-context';
import { getAuthErrorMessage } from '@/lib/auth-errors';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [optimisticError, setOptimisticError] = useOptimistic(error);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleReset = () => {
    startTransition(async () => {
      setOptimisticError('');

      const { error: authError } = await resetPassword(email);

      if (authError) {
        setError(getAuthErrorMessage(authError));
      } else {
        setShowSuccess(true);
      }
    });
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center">
        <CheckCircle2 size={64} className="text-success" />
        <h2 className="text-lg font-bold text-text-primary text-center mt-6 mb-4">
          メールを送信しました
        </h2>
        <p className="text-sm text-text-secondary text-center mb-8">
          パスワードリセット用のリンクをメールで送信しました。
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
          <ChevronLeft size={24} />
        </button>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-4">
        パスワードをリセット
      </h1>
      <p className="text-sm text-text-secondary mb-8">
        登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
      </p>

      <div className="mb-6">
        <AuthInput
          label="メールアドレス"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
        />
      </div>

      {optimisticError && (
        <p className="text-error text-xs text-center mb-4">{optimisticError}</p>
      )}

      <AuthButton
        title="リセットリンクを送信"
        onClick={handleReset}
        loading={isPending}
        disabled={!email}
      />
    </>
  );
}
