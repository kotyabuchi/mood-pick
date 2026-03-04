import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';

interface EmptyStateAction {
  label: string;
  href: string;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-8">
      <Icon size={48} className="text-text-disabled" />
      <h3 className="text-lg font-bold text-text-primary mt-4 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary mt-2 text-center">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 px-6 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
