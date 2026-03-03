interface SectionDividerProps {
  label?: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  if (label) {
    return (
      <div className="flex items-center px-4 py-2">
        <div className="flex-1 h-px bg-border" data-testid="divider-line" />
        <span className="text-xs text-text-secondary mx-3">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <hr className="border-border" data-testid="divider-line" />
    </div>
  );
}
