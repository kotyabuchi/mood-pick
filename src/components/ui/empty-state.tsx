import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
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
    </div>
  );
}
