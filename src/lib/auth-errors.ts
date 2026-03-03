export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials':
    'メールアドレスまたはパスワードが正しくありません',
  'Email not confirmed': 'メールアドレスの確認が完了していません',
  'User already registered': 'このメールアドレスは既に登録されています',
  'Password should be at least 6 characters':
    'パスワードは6文字以上で入力してください',
  'Unable to validate email address: invalid format':
    'メールアドレスの形式が正しくありません',
  'For security purposes, you can only request this once every 60 seconds':
    'セキュリティのため、60秒に1回のみリクエストできます',
  'Failed to fetch': 'ネットワークエラーが発生しました。接続を確認してください',
  default: 'エラーが発生しました。しばらくしてから再度お試しください',
};

export function getAuthErrorMessage(error: { message: string } | null): string {
  if (!error) return '';
  return AUTH_ERROR_MESSAGES[error.message] ?? AUTH_ERROR_MESSAGES.default;
}
