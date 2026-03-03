import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TabBarSegment } from '@/components/ui/tab-bar-segment';

const defaultTabs = [
  { id: 'tab1', label: 'タブ1' },
  { id: 'tab2', label: 'タブ2' },
  { id: 'tab3', label: 'タブ3' },
];

describe('TabBarSegment', () => {
  it('全てのタブが表示される', () => {
    render(
      <TabBarSegment
        tabs={defaultTabs}
        activeId="tab1"
        onTabChange={vi.fn()}
      />,
    );
    expect(screen.getByText('タブ1')).toBeInTheDocument();
    expect(screen.getByText('タブ2')).toBeInTheDocument();
    expect(screen.getByText('タブ3')).toBeInTheDocument();
  });

  it('countが設定されたタブにカウントが表示される', () => {
    const tabsWithCount = [
      { id: 'tab1', label: '見たい', count: 5 },
      { id: 'tab2', label: '視聴中', count: 3 },
    ];
    render(
      <TabBarSegment
        tabs={tabsWithCount}
        activeId="tab1"
        onTabChange={vi.fn()}
      />,
    );
    expect(screen.getByText('見たい 5')).toBeInTheDocument();
    expect(screen.getByText('視聴中 3')).toBeInTheDocument();
  });

  it('タブをクリックするとonTabChangeが呼ばれる', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <TabBarSegment
        tabs={defaultTabs}
        activeId="tab1"
        onTabChange={onTabChange}
      />,
    );
    await user.click(screen.getByText('タブ2'));
    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });

  it('countが0のタブも数値が表示される', () => {
    const tabsWithZero = [{ id: 'tab1', label: 'テスト', count: 0 }];
    render(
      <TabBarSegment
        tabs={tabsWithZero}
        activeId="tab1"
        onTabChange={vi.fn()}
      />,
    );
    expect(screen.getByText('テスト 0')).toBeInTheDocument();
  });

  it('countがundefinedのタブにはカウントが表示されない', () => {
    const tabsNoCount = [{ id: 'tab1', label: 'タブA' }];
    render(
      <TabBarSegment
        tabs={tabsNoCount}
        activeId="tab1"
        onTabChange={vi.fn()}
      />,
    );
    expect(screen.getByText('タブA')).toBeInTheDocument();
  });
});
