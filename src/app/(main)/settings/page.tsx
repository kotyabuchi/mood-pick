'use client';

import { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Switch from '@radix-ui/react-switch';
import { CaretRightIcon } from '@phosphor-icons/react/ssr';
import { useRouter } from 'next/navigation';

import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionDivider } from '@/components/ui/section-divider';
import { useAuth } from '@/context/auth-context';

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [expirationAlert, setExpirationAlert] = useState(true);
  const [alert7Days, setAlert7Days] = useState(true);
  const [alert3Days, setAlert3Days] = useState(true);
  const [alertPreviousDay, setAlertPreviousDay] = useState(true);
  const [followNotification, setFollowNotification] = useState(true);
  const [recommendNotification, setRecommendNotification] = useState(true);

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader title="設定" showBack />

      <div className="pb-10">
        {/* アカウント */}
        <SectionDivider label="アカウント" />
        <SettingRow
          label="プロフィール編集"
          onPress={() => router.push('/profile/edit')}
        />
        <SettingRow label="メールアドレス変更" />
        <SettingRow label="パスワード変更" />

        {/* プライバシー */}
        <SectionDivider label="プライバシー" />
        <SettingRow label="見たいリスト公開" />
        <SettingRow label="見たリスト公開" />
        <SettingRow label="アクティビティ公開" />

        {/* 通知 */}
        <SectionDivider label="通知" />
        <SettingToggle
          label="配信終了アラート"
          checked={expirationAlert}
          onCheckedChange={setExpirationAlert}
        />
        {expirationAlert && (
          <>
            <SettingToggle
              label="7日前"
              checked={alert7Days}
              onCheckedChange={setAlert7Days}
              indent
            />
            <SettingToggle
              label="3日前"
              checked={alert3Days}
              onCheckedChange={setAlert3Days}
              indent
            />
            <SettingToggle
              label="前日"
              checked={alertPreviousDay}
              onCheckedChange={setAlertPreviousDay}
              indent
            />
          </>
        )}
        <SettingToggle
          label="フォロー通知"
          checked={followNotification}
          onCheckedChange={setFollowNotification}
        />
        <SettingToggle
          label="おすすめ通知"
          checked={recommendNotification}
          onCheckedChange={setRecommendNotification}
        />

        {/* その他 */}
        <SectionDivider label="その他" />

        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <button
              type="button"
              data-testid="logout-button"
              className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-surface-light transition-colors lg:px-0"
            >
              ログアウト
            </button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
            <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-xl p-6 max-w-sm w-[90%]">
              <AlertDialog.Title className="text-lg font-bold text-text-primary text-center">
                ログアウト
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-text-secondary mt-2 text-center">
                ログアウトしますか？
              </AlertDialog.Description>
              <div className="flex gap-3 mt-4">
                <AlertDialog.Cancel asChild>
                  <button
                    type="button"
                    className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-text-secondary hover:bg-surface-light transition-colors"
                  >
                    キャンセル
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex-1 py-2.5 rounded-lg bg-error text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    ログアウト
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <button
          type="button"
          className="w-full text-left px-4 py-3 text-sm text-error hover:bg-surface-light transition-colors lg:px-0"
        >
          アカウント削除
        </button>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex items-center justify-between w-full px-4 py-3 hover:bg-surface-light transition-colors lg:px-0"
    >
      <span className="text-sm text-text-primary">{label}</span>
      <CaretRightIcon size={20} className="text-text-secondary" />
    </button>
  );
}

function SettingToggle({
  label,
  checked,
  onCheckedChange,
  indent,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        indent ? 'pl-8 pr-4 lg:pl-8 lg:pr-0' : 'px-4 lg:px-0'
      }`}
    >
      <span className="text-sm text-text-primary">{label}</span>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-[42px] h-[24px] rounded-full bg-border data-[state=checked]:bg-accent relative transition-colors"
      >
        <Switch.Thumb className="block w-[20px] h-[20px] rounded-full bg-white transition-transform translate-x-0.5 data-[state=checked]:translate-x-[20px]" />
      </Switch.Root>
    </div>
  );
}
