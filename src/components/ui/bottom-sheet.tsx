'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { XIcon } from '@phosphor-icons/react/ssr';

import { cn } from '@/lib/cn';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-2xl px-6 pt-6 pb-8',
            'max-h-[85vh] overflow-y-auto',
            'lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-w-md lg:rounded-xl',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom',
            'lg:data-[state=open]:slide-in-from-bottom-0 lg:data-[state=open]:fade-in',
            className,
          )}
        >
          <Dialog.Close className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
            <XIcon size={20} />
          </Dialog.Close>

          {title && (
            <Dialog.Title className="text-lg font-bold text-text-primary mb-2 text-center">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="text-xs text-text-secondary mb-4 text-center">
              {description}
            </Dialog.Description>
          )}

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
