import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ContentCard } from '@/components/ui/content-card';

import type { ContentDetail, WatchlistItem } from '@/types';

const mockContent: ContentDetail = {
  id: 'c-1',
  tmdbId: 12345,
  title: 'テスト映画',
  type: 'movie',
  posterUrl: 'https://example.com/poster.jpg',
  year: 2023,
  genre: 'アクション',
  runtime: 120,
  synopsis: 'テスト概要',
  moodTags: ['excited'],
  attentionLevel: 'focused',
  streaming: [
    {
      service: 'netflix',
      expiresAt: null,
      url: 'https://netflix.example.com',
    },
  ],
};

const mockWatchlistItem: WatchlistItem = {
  ...mockContent,
  watchlistId: 'wl-1',
  status: 'watching',
  memo: 'テストメモ',
  rating: 4,
  review: 'テストレビュー',
  watchedAt: null,
  droppedAt: null,
  createdAt: new Date().toISOString(),
};

describe('ContentCard - horizontal variant', () => {
  it('タイトルが表示される', () => {
    render(<ContentCard item={mockContent} variant="horizontal" />);
    expect(screen.getByText('テスト映画')).toBeInTheDocument();
  });

  it('ジャンルとランタイムが表示される', () => {
    render(<ContentCard item={mockContent} variant="horizontal" />);
    expect(screen.getByText('アクション · 120分 · 2023年')).toBeInTheDocument();
  });

  it('ストリーミングサービスが表示される', () => {
    render(<ContentCard item={mockContent} variant="horizontal" />);
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('showMemoがtrueの場合、メモが表示される', () => {
    render(
      <ContentCard item={mockWatchlistItem} variant="horizontal" showMemo />,
    );
    expect(screen.getByText('テストメモ')).toBeInTheDocument();
  });

  it('showMemoがfalseの場合、メモが表示されない', () => {
    render(<ContentCard item={mockWatchlistItem} variant="horizontal" />);
    expect(screen.queryByText('テストメモ')).not.toBeInTheDocument();
  });

  it('showRatingがtrueの場合、星評価が表示される', () => {
    render(
      <ContentCard item={mockWatchlistItem} variant="horizontal" showRating />,
    );
    const filled = screen.getAllByTestId('star-filled');
    expect(filled).toHaveLength(4);
  });

  it('ポスター画像が表示される', () => {
    render(<ContentCard item={mockContent} variant="horizontal" />);
    const img = screen.getByAltText('テスト映画');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/poster.jpg');
  });
});

describe('ContentCard - poster variant', () => {
  it('タイトルが表示される', () => {
    render(<ContentCard item={mockContent} variant="poster" />);
    expect(screen.getByText('テスト映画')).toBeInTheDocument();
  });

  it('ポスター画像が表示される', () => {
    render(<ContentCard item={mockContent} variant="poster" />);
    const img = screen.getByAltText('テスト映画');
    expect(img).toBeInTheDocument();
  });

  it('ストリーミングサービス名が表示される', () => {
    render(<ContentCard item={mockContent} variant="poster" />);
    expect(screen.getByText('netflix')).toBeInTheDocument();
  });
});

describe('ContentCard - list-item variant', () => {
  it('タイトルが表示される', () => {
    render(<ContentCard item={mockContent} variant="list-item" />);
    expect(screen.getByText('テスト映画')).toBeInTheDocument();
  });

  it('ジャンルとランタイムが表示される', () => {
    render(<ContentCard item={mockContent} variant="list-item" />);
    expect(screen.getByText('アクション · 120分 · 2023年')).toBeInTheDocument();
  });

  it('showAddButtonがtrueの場合、追加ボタンが表示される', () => {
    const onAddPress = vi.fn();
    render(
      <ContentCard
        item={mockContent}
        variant="list-item"
        showAddButton
        onAddPress={onAddPress}
      />,
    );
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('追加ボタンをクリックするとonAddPressが呼ばれる', () => {
    const onAddPress = vi.fn();
    render(
      <ContentCard
        item={mockContent}
        variant="list-item"
        showAddButton
        onAddPress={onAddPress}
      />,
    );
    fireEvent.click(screen.getByText('追加'));
    expect(onAddPress).toHaveBeenCalledTimes(1);
  });

  it('showAddButtonがfalseの場合、追加ボタンが表示されない', () => {
    render(<ContentCard item={mockContent} variant="list-item" />);
    expect(screen.queryByText('追加')).not.toBeInTheDocument();
  });
});

describe('ContentCard - navigation', () => {
  it('hrefが渡された場合、そのリンク先になる', () => {
    render(
      <ContentCard item={mockContent} variant="horizontal" href="/custom" />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/custom');
  });

  it('hrefが渡されない場合、デフォルトのdetailリンクになる', () => {
    render(<ContentCard item={mockContent} variant="horizontal" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/detail/12345?type=movie');
  });

  it('animeタイプの場合、type=tvでリンクされる', () => {
    const animeContent: ContentDetail = {
      ...mockContent,
      type: 'anime',
    };
    render(<ContentCard item={animeContent} variant="horizontal" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/detail/12345?type=tv');
  });
});
