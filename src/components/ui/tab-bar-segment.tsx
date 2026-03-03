'use client';

import * as Tabs from '@radix-ui/react-tabs';

interface TabBarSegmentProps {
  tabs: { id: string; label: string; count?: number }[];
  activeId: string;
  onTabChange: (id: string) => void;
}

export function TabBarSegment({
  tabs,
  activeId,
  onTabChange,
}: TabBarSegmentProps) {
  return (
    <Tabs.Root value={activeId} onValueChange={onTabChange}>
      <Tabs.List className="flex bg-surface rounded-lg p-1">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="flex-1 text-center px-3 py-1.5 rounded-md text-xs font-semibold transition-colors data-[state=active]:bg-accent data-[state=active]:text-white text-text-secondary"
          >
            {tab.label}
            {tab.count !== undefined ? ` ${tab.count}` : ''}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
