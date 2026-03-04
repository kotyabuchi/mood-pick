'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AuthButton } from '@/components/ui/auth-button';
import { AuthInput } from '@/components/ui/auth-input';
import { ScreenHeader } from '@/components/ui/screen-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useOwnProfile } from '@/hooks/use-profile';
import {
  useCheckHandle,
  useUpdateProfile,
  useUploadAvatar,
} from '@/hooks/use-profile-mutations';
import { profileFormSchema } from '@/lib/profile';

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useOwnProfile();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ name?: string; handle?: string }>({});
  const [handleStatus, setHandleStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [submitError, setSubmitError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedHandle = useRef<string>('');

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const checkHandle = useCheckHandle();

  // Initialize form from profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setHandle(profile.handle ?? '');
    }
  }, [profile]);

  // Debounced handle availability check
  const handleHandleChange = useCallback(
    (value: string) => {
      const normalized = value.toLowerCase();
      setHandle(normalized);
      setErrors((prev) => ({ ...prev, handle: undefined }));
      setHandleStatus('idle');

      if (handleCheckTimer.current) {
        clearTimeout(handleCheckTimer.current);
      }

      // Skip check if same as current handle or empty
      if (!normalized || normalized === profile?.handle) {
        return;
      }

      // Validate format first
      if (normalized.length >= 3 && /^[a-z0-9_]+$/.test(normalized)) {
        setHandleStatus('checking');
        handleCheckTimer.current = setTimeout(() => {
          lastCheckedHandle.current = normalized;
          checkHandle.mutate(normalized, {
            onSuccess: (available) => {
              // Ignore stale responses
              if (lastCheckedHandle.current !== normalized) return;
              setHandleStatus(available ? 'available' : 'taken');
            },
            onError: () => {
              if (lastCheckedHandle.current !== normalized) return;
              setHandleStatus('idle');
            },
          });
        }, 500);
      }
    },
    [profile?.handle, checkHandle],
  );

  const handleAvatarSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setSubmitError('');
    setErrors({});

    // Validate with Zod
    const parseResult = profileFormSchema.safeParse({
      name,
      handle: handle || undefined,
    });

    if (!parseResult.success) {
      const fieldErrors: { name?: string; handle?: string } = {};
      for (const issue of parseResult.error.issues) {
        const field = issue.path[0] as 'name' | 'handle';
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (handleStatus === 'taken') {
      setErrors({ handle: 'このハンドルは既に使用されています' });
      return;
    }

    try {
      // Upload avatar first if changed
      let avatarUrl: string | undefined;
      if (avatarFile) {
        avatarUrl = await uploadAvatar.mutateAsync(avatarFile);
      }

      // Update profile (empty handle → null to clear)
      await updateProfile.mutateAsync({
        name,
        handle: handle || null,
        avatar_url: avatarUrl,
      });

      router.back();
    } catch (error: unknown) {
      const pgError = error as { code?: string };
      if (pgError.code === '23505') {
        setErrors({ handle: 'このハンドルは既に使用されています' });
      } else {
        setSubmitError('プロフィールの更新に失敗しました');
      }
    }
  }, [
    name,
    handle,
    handleStatus,
    avatarFile,
    uploadAvatar,
    updateProfile,
    router,
  ]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  const isSaving = updateProfile.isPending || uploadAvatar.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <ScreenHeader title="プロフィール編集" showBack />

      <div className="px-4 pb-8 lg:px-0">
        {/* Avatar */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <button
            type="button"
            onClick={handleAvatarSelect}
            className="relative"
          >
            <UserAvatar
              uri={avatarPreview ?? profile?.avatar_url}
              name={name || profile?.name}
              size={80}
            />
            <div className="absolute bottom-0 right-0 bg-accent rounded-full p-1.5">
              <Camera size={14} className="text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Form */}
        <AuthInput
          label="名前"
          value={name}
          onChange={(v) => {
            setName(v);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          placeholder="名前を入力"
          maxLength={50}
        />

        <div>
          <AuthInput
            label="ハンドル"
            value={handle}
            onChange={handleHandleChange}
            error={
              errors.handle ??
              (handleStatus === 'taken'
                ? 'このハンドルは既に使用されています'
                : undefined)
            }
            placeholder="英小文字・数字・_ (3-20文字)"
            maxLength={20}
          />
          {handleStatus === 'checking' && (
            <p className="text-xs text-text-secondary -mt-2 mb-4">確認中...</p>
          )}
          {handleStatus === 'available' && (
            <p className="text-xs text-green-500 -mt-2 mb-4">使用可能です</p>
          )}
        </div>

        {submitError && (
          <p className="text-error text-sm text-center mb-4">{submitError}</p>
        )}

        <AuthButton
          title="保存"
          onClick={handleSave}
          loading={isSaving}
          disabled={handleStatus === 'checking'}
        />
      </div>
    </div>
  );
}
