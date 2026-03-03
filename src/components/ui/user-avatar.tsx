import Image from 'next/image';

interface UserAvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

export function UserAvatar({ uri, name, size = 48 }: UserAvatarProps) {
  if (uri) {
    return (
      <Image
        src={uri}
        alt={name ?? 'ユーザーアバター'}
        width={size}
        height={size}
        className="rounded-full object-cover"
        data-testid="avatar-image"
      />
    );
  }

  return (
    <div
      className="bg-surface-light flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <span
        className="text-text-primary font-bold"
        style={{ fontSize: size * 0.4 }}
      >
        {name?.charAt(0) ?? '?'}
      </span>
    </div>
  );
}
