import { vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ComponentProps<'img'>) => (
    <img src={src} alt={alt ?? ''} {...props} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: React.PropsWithChildren<React.ComponentProps<'a'>>) => (
    <a {...props}>{children}</a>
  ),
}));
