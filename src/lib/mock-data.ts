import { daysFromNow } from './utils';

import type {
  AttentionLevelId,
  Content,
  DurationId,
  FeedItem,
  MoodId,
  Notification,
  SearchResult,
  User,
  UserProfile,
  WatchlistItem,
} from '@/types';

// === Contents (15作品) ===
export const mockContents: Content[] = [
  {
    id: 'c-1',
    tmdbId: 872585,
    title: 'オッペンハイマー',
    type: 'movie',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=Oppenheimer',
    year: 2023,
    genre: 'ドラマ',
    runtime: 180,
    synopsis:
      '第二次世界大戦中、理論物理学者のロバート・オッペンハイマーは、マンハッタン計画に参加し、世界初の原子爆弾の開発に成功する。しかし、その結果がもたらす倫理的な問題に苦しむことになる。',
    moodTags: ['think', 'excited'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'prime',
        expiresAt: daysFromNow(30),
        url: 'https://prime.example.com',
      },
    ],
  },
  {
    id: 'c-2',
    tmdbId: 438631,
    title: 'DUNE/デューン 砂の惑星',
    type: 'movie',
    posterUrl: 'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=DUNE',
    year: 2021,
    genre: 'SF',
    runtime: 155,
    synopsis:
      '砂の惑星アラキスを舞台に、若き貴族ポール・アトレイデスが、自らの運命と宇宙の未来をかけた壮大な戦いに挑む。',
    moodTags: ['excited', 'think'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'netflix',
        expiresAt: daysFromNow(5),
        url: 'https://netflix.example.com',
      },
    ],
  },
  {
    id: 'c-3',
    tmdbId: 603692,
    title: 'ジョン・ウィック4',
    type: 'movie',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=JohnWick4',
    year: 2023,
    genre: 'アクション',
    runtime: 169,
    synopsis:
      '裏社会の掟に背いたジョン・ウィックが、自由を勝ち取るため世界中を駆け巡り、最強の敵たちと壮絶な戦いを繰り広げる。',
    moodTags: ['excited'],
    attentionLevel: 'casual',
    streaming: [
      {
        service: 'prime',
        expiresAt: null,
        url: 'https://prime.example.com',
      },
    ],
  },
  {
    id: 'c-4',
    tmdbId: 699017,
    title: 'ドライブ・マイ・カー',
    type: 'movie',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=DriveMyCar',
    year: 2021,
    genre: 'ドラマ',
    runtime: 179,
    synopsis:
      '妻を失った舞台俳優兼演出家の家福悠介が、専属ドライバーの渡利みさきと出会い、喪失と向き合い再生していく物語。',
    moodTags: ['sad', 'think'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'netflix',
        expiresAt: daysFromNow(3),
        url: 'https://netflix.example.com',
      },
    ],
  },
  {
    id: 'c-5',
    tmdbId: 916371,
    title: '怪物',
    type: 'movie',
    posterUrl: 'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=Monster',
    year: 2023,
    genre: 'ドラマ',
    runtime: 126,
    synopsis:
      'ある学校で起きた出来事を、母親、教師、子供それぞれの視点から描き、真実の多面性を浮き彫りにする是枝裕和監督作品。',
    moodTags: ['think', 'sad'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'prime',
        expiresAt: daysFromNow(2),
        url: 'https://prime.example.com',
      },
    ],
  },
  {
    id: 'c-6',
    tmdbId: 100088,
    title: 'THE LAST OF US',
    type: 'tv',
    posterUrl: 'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=TLOU',
    year: 2023,
    genre: 'ドラマ',
    runtime: 55,
    synopsis:
      '菌類パンデミックにより崩壊した世界で、密輸業者ジョエルが免疫を持つ少女エリーを護送する過酷な旅に出る。',
    moodTags: ['excited', 'sad'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'u-next',
        expiresAt: null,
        url: 'https://u-next.example.com',
      },
    ],
  },
  {
    id: 'c-7',
    tmdbId: 66732,
    title: 'ストレンジャー・シングス',
    type: 'tv',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=StrangerThings',
    year: 2016,
    genre: 'SF',
    runtime: 50,
    synopsis:
      '1980年代のインディアナ州を舞台に、少年の失踪事件をきっかけに超常現象と政府の陰謀が明らかになっていく。',
    moodTags: ['excited', 'funny'],
    attentionLevel: 'casual',
    streaming: [
      {
        service: 'netflix',
        expiresAt: null,
        url: 'https://netflix.example.com',
      },
    ],
  },
  {
    id: 'c-8',
    tmdbId: 126308,
    title: 'SHOGUN 将軍',
    type: 'tv',
    posterUrl: 'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=SHOGUN',
    year: 2024,
    genre: '歴史',
    runtime: 60,
    synopsis:
      '1600年の日本を舞台に、英国人航海士と野望を持つ大名、そしてカトリックの通訳が、権力をめぐる壮大な駆け引きに巻き込まれていく。',
    moodTags: ['think', 'excited'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'disney',
        expiresAt: null,
        url: 'https://disney.example.com',
      },
    ],
  },
  {
    id: 'c-9',
    tmdbId: 210024,
    title: '地面師たち',
    type: 'tv',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=Jimenshi',
    year: 2024,
    genre: 'サスペンス',
    runtime: 50,
    synopsis:
      '不動産詐欺グループ「地面師」たちの大胆な犯行と、それを追う刑事たちの攻防を描く社会派サスペンス。',
    moodTags: ['think', 'excited'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'netflix',
        expiresAt: daysFromNow(6),
        url: 'https://netflix.example.com',
      },
    ],
  },
  {
    id: 'c-10',
    tmdbId: 1429,
    title: '進撃の巨人',
    type: 'anime',
    posterUrl: 'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=AoT',
    year: 2013,
    genre: 'アクション',
    runtime: 24,
    synopsis:
      '巨大な壁に囲まれた世界で、人類を脅かす巨人たちとの壮絶な戦いを描くダークファンタジー。エレン・イェーガーの復讐と自由への戦いが始まる。',
    moodTags: ['excited', 'sad'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'netflix',
        expiresAt: null,
        url: 'https://netflix.example.com',
      },
      {
        service: 'prime',
        expiresAt: null,
        url: 'https://prime.example.com',
      },
    ],
  },
  {
    id: 'c-11',
    tmdbId: 205584,
    title: 'SPY×FAMILY',
    type: 'anime',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=SPYxFAMILY',
    year: 2022,
    genre: 'コメディ',
    runtime: 24,
    synopsis:
      'スパイの父、殺し屋の母、超能力者の娘が、互いの正体を隠しながら偽装家族として暮らすホームコメディ。',
    moodTags: ['funny', 'chill'],
    attentionLevel: 'casual',
    streaming: [
      {
        service: 'prime',
        expiresAt: null,
        url: 'https://prime.example.com',
      },
    ],
  },
  {
    id: 'c-12',
    tmdbId: 209867,
    title: '葬送のフリーレン',
    type: 'anime',
    posterUrl: 'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=Frieren',
    year: 2023,
    genre: 'ファンタジー',
    runtime: 24,
    synopsis:
      '魔王を倒した勇者パーティーのエルフの魔法使いフリーレンが、仲間の死を経て「人を知ること」の旅に出る。',
    moodTags: ['sad', 'chill', 'think'],
    attentionLevel: 'casual',
    streaming: [
      {
        service: 'abema',
        expiresAt: null,
        url: 'https://abema.example.com',
      },
    ],
  },
  {
    id: 'c-13',
    tmdbId: 145064,
    title: '呪術廻戦',
    type: 'anime',
    posterUrl: 'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=JJK',
    year: 2020,
    genre: 'アクション',
    runtime: 24,
    synopsis:
      '呪いの力を持つ高校生・虎杖悠仁が、呪術師として人々を守るために戦うダークバトルファンタジー。',
    moodTags: ['excited'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'netflix',
        expiresAt: null,
        url: 'https://netflix.example.com',
      },
      {
        service: 'hulu',
        expiresAt: null,
        url: 'https://hulu.example.com',
      },
    ],
  },
  {
    id: 'c-14',
    tmdbId: 203737,
    title: '推しの子',
    type: 'anime',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=OshiNoKo',
    year: 2023,
    genre: 'ドラマ',
    runtime: 24,
    synopsis:
      '推しのアイドル・アイの子供に転生した双子の兄妹が、母の死の真相を追いながら芸能界を生き抜く物語。',
    moodTags: ['sad', 'think', 'excited'],
    attentionLevel: 'focused',
    streaming: [
      {
        service: 'prime',
        expiresAt: daysFromNow(15),
        url: 'https://prime.example.com',
      },
    ],
  },
  {
    id: 'c-15',
    tmdbId: 210263,
    title: '薬屋のひとりごと',
    type: 'anime',
    posterUrl:
      'https://via.placeholder.com/300x450/1A1A1A/FF6B00?text=Kusuriya',
    year: 2024,
    genre: 'ミステリー',
    runtime: 24,
    synopsis:
      '後宮に売られた薬師の少女・猫猫が、持ち前の薬学知識と推理力で宮廷の謎を解き明かしていくミステリー。',
    moodTags: ['think', 'funny'],
    attentionLevel: 'casual',
    streaming: [
      {
        service: 'hulu',
        expiresAt: null,
        url: 'https://hulu.example.com',
      },
    ],
  },
];

// === Watchlist Items (20件) ===
function createWatchlistItem(
  content: Content,
  overrides: Partial<WatchlistItem>,
): WatchlistItem {
  return {
    ...content,
    watchlistId: `wl-${content.id}`,
    status: 'want',
    memo: null,
    rating: null,
    review: null,
    watchedAt: null,
    droppedAt: null,
    createdAt: daysFromNow(-7),
    ...overrides,
  };
}

export const mockWatchlistItems: WatchlistItem[] = [
  createWatchlistItem(mockContents[1], {
    watchlistId: 'wl-1',
    status: 'want',
    createdAt: daysFromNow(-3),
    streaming: [
      {
        service: 'netflix',
        expiresAt: daysFromNow(5),
        url: 'https://netflix.example.com',
      },
    ],
  }),
  createWatchlistItem(mockContents[3], {
    watchlistId: 'wl-2',
    status: 'want',
    createdAt: daysFromNow(-10),
    streaming: [
      {
        service: 'netflix',
        expiresAt: daysFromNow(3),
        url: 'https://netflix.example.com',
      },
    ],
  }),
  createWatchlistItem(mockContents[4], {
    watchlistId: 'wl-3',
    status: 'want',
    createdAt: daysFromNow(-5),
    streaming: [
      {
        service: 'prime',
        expiresAt: daysFromNow(2),
        url: 'https://prime.example.com',
      },
    ],
  }),
  createWatchlistItem(mockContents[8], {
    watchlistId: 'wl-4',
    status: 'want',
    createdAt: daysFromNow(-1),
    streaming: [
      {
        service: 'netflix',
        expiresAt: daysFromNow(6),
        url: 'https://netflix.example.com',
      },
    ],
  }),
  createWatchlistItem(mockContents[2], {
    watchlistId: 'wl-5',
    status: 'want',
    createdAt: daysFromNow(-14),
  }),
  createWatchlistItem(mockContents[7], {
    watchlistId: 'wl-6',
    status: 'want',
    createdAt: daysFromNow(-20),
  }),
  createWatchlistItem(mockContents[13], {
    watchlistId: 'wl-7',
    status: 'want',
    createdAt: daysFromNow(-2),
  }),
  createWatchlistItem(mockContents[14], {
    watchlistId: 'wl-8',
    status: 'want',
    createdAt: daysFromNow(-30),
  }),
  createWatchlistItem(mockContents[5], {
    watchlistId: 'wl-9',
    status: 'watching',
    memo: 'シーズン1の3話まで見た',
    createdAt: daysFromNow(-7),
  }),
  createWatchlistItem(mockContents[6], {
    watchlistId: 'wl-10',
    status: 'watching',
    memo: 'シーズン3の5話まで',
    createdAt: daysFromNow(-60),
  }),
  createWatchlistItem(mockContents[11], {
    watchlistId: 'wl-11',
    status: 'watching',
    memo: '15話まで見た。次回から二次試験編',
    createdAt: daysFromNow(-14),
  }),
  createWatchlistItem(mockContents[0], {
    watchlistId: 'wl-12',
    status: 'watched',
    rating: 5,
    review: '映像と音楽が圧巻。3時間があっという間だった。',
    watchedAt: daysFromNow(-2),
    createdAt: daysFromNow(-30),
  }),
  createWatchlistItem(mockContents[9], {
    watchlistId: 'wl-13',
    status: 'watched',
    rating: 5,
    review: '最終回まで見た。壮大な物語の結末に圧倒された。',
    watchedAt: daysFromNow(-5),
    createdAt: daysFromNow(-90),
  }),
  createWatchlistItem(mockContents[10], {
    watchlistId: 'wl-14',
    status: 'watched',
    rating: 4,
    review: '家族で楽しめた。アーニャが可愛い。',
    watchedAt: daysFromNow(-10),
    createdAt: daysFromNow(-45),
  }),
  createWatchlistItem(mockContents[12], {
    watchlistId: 'wl-15',
    status: 'watched',
    rating: 4,
    review: 'バトルシーンの作画がすごい。',
    watchedAt: daysFromNow(-15),
    createdAt: daysFromNow(-60),
  }),
  createWatchlistItem(mockContents[1], {
    watchlistId: 'wl-16',
    status: 'watched',
    rating: 3,
    review: '映像美は素晴らしいが、テンポが少し遅かった。',
    watchedAt: daysFromNow(-20),
    createdAt: daysFromNow(-90),
  }),
  createWatchlistItem(mockContents[7], {
    watchlistId: 'wl-17',
    status: 'dropped',
    rating: 2,
    review: '自分には合わなかった。',
    droppedAt: daysFromNow(-8),
    createdAt: daysFromNow(-30),
  }),
  createWatchlistItem(mockContents[14], {
    watchlistId: 'wl-18',
    status: 'dropped',
    rating: 3,
    review: '面白いけど時間がなくて離脱。',
    droppedAt: daysFromNow(-12),
    createdAt: daysFromNow(-45),
  }),
  createWatchlistItem(mockContents[3], {
    watchlistId: 'wl-19',
    status: 'watched',
    rating: 5,
    review: '濱口竜介監督の最高傑作。',
    watchedAt: daysFromNow(-25),
    createdAt: daysFromNow(-100),
  }),
  createWatchlistItem(mockContents[4], {
    watchlistId: 'wl-20',
    status: 'watched',
    rating: 4,
    review: '是枝監督らしい繊細な描写。',
    watchedAt: daysFromNow(-30),
    createdAt: daysFromNow(-120),
  }),
];

// === Users (6人) ===
export const mockUsers: User[] = [
  {
    id: 'u-1',
    name: '田中太郎',
    handle: 'taro_tanaka',
    avatarUrl: null,
    followingCount: 15,
    followerCount: 22,
    isFollowing: true,
  },
  {
    id: 'u-2',
    name: '鈴木花子',
    handle: 'hanako_suzuki',
    avatarUrl: null,
    followingCount: 8,
    followerCount: 34,
    isFollowing: true,
  },
  {
    id: 'u-3',
    name: '佐藤健',
    handle: 'ken_sato',
    avatarUrl: null,
    followingCount: 20,
    followerCount: 18,
    isFollowing: true,
  },
  {
    id: 'u-4',
    name: '山田優',
    handle: 'yu_yamada',
    avatarUrl: null,
    followingCount: 5,
    followerCount: 12,
    isFollowing: true,
  },
  {
    id: 'u-5',
    name: '高橋大輝',
    handle: 'daiki_t',
    avatarUrl: null,
    followingCount: 30,
    followerCount: 45,
    isFollowing: false,
  },
  {
    id: 'u-6',
    name: '伊藤美咲',
    handle: 'misaki_ito',
    avatarUrl: null,
    followingCount: 12,
    followerCount: 28,
    isFollowing: false,
  },
];

// === Current User ===
export const mockCurrentUser: UserProfile = {
  id: 'u-self',
  name: '田中 ゆき',
  handle: 'yuki_movies',
  avatarUrl: null,
  followingCount: 12,
  followerCount: 8,
  stats: {
    watched: 58,
    watching: 3,
    want: 24,
    thisMonth: 8,
    thisYear: 42,
  },
  recentWatched: mockWatchlistItems
    .filter((i) => i.status === 'watched')
    .slice(0, 5),
};

// === Feed Items (8件) ===
export const mockFeedItems: FeedItem[] = [
  {
    id: 'f-1',
    user: mockUsers[0],
    actionType: 'watched',
    content: mockContents[0],
    timestamp: daysFromNow(0),
    rating: 5,
    review: '映像と音楽が圧巻だった！',
  },
  {
    id: 'f-2',
    user: mockUsers[1],
    actionType: 'watched',
    content: mockContents[9],
    timestamp: daysFromNow(-1),
    rating: 4,
    review: '最終シーズンが特に良かった。',
  },
  {
    id: 'f-3',
    user: mockUsers[2],
    actionType: 'watching',
    content: mockContents[11],
    timestamp: daysFromNow(0),
  },
  {
    id: 'f-4',
    user: mockUsers[3],
    actionType: 'watching',
    content: mockContents[5],
    timestamp: daysFromNow(-1),
  },
  {
    id: 'f-5',
    user: mockUsers[0],
    actionType: 'want',
    content: mockContents[1],
    timestamp: daysFromNow(-2),
  },
  {
    id: 'f-6',
    user: mockUsers[4],
    actionType: 'want',
    content: mockContents[8],
    timestamp: daysFromNow(-3),
  },
  {
    id: 'f-7',
    user: mockUsers[1],
    actionType: 'recommend',
    content: mockContents[1],
    timestamp: daysFromNow(0),
    message: 'DUNEの映像美、絶対見て！',
  },
  {
    id: 'f-8',
    user: mockUsers[2],
    actionType: 'recommend',
    content: mockContents[11],
    timestamp: daysFromNow(-1),
    message: 'フリーレン、まったり見れておすすめだよ',
  },
];

// === Notifications (8件) ===
export const mockNotifications: Notification[] = [
  {
    id: 'n-1',
    type: 'expiring',
    title: '「ドライブ・マイ・カー」が明日でNetflixから配信終了',
    timestamp: daysFromNow(0),
    isRead: false,
    targetId: 'c-4',
    serviceName: 'Netflix',
  },
  {
    id: 'n-2',
    type: 'follow',
    title: '高橋大輝さんがあなたをフォローしました',
    timestamp: daysFromNow(0),
    isRead: false,
    targetId: 'u-5',
  },
  {
    id: 'n-3',
    type: 'recommendation',
    title: '鈴木花子さんがあなたに「DUNE/デューン 砂の惑星」をおすすめしました',
    timestamp: daysFromNow(0),
    isRead: true,
    targetId: 'c-2',
  },
  {
    id: 'n-4',
    type: 'expiring',
    title: '「怪物」があと3日でPrime Videoから配信終了',
    timestamp: daysFromNow(-1),
    isRead: true,
    targetId: 'c-5',
    serviceName: 'Prime Video',
  },
  {
    id: 'n-5',
    type: 'recommendation',
    title: '佐藤健さんがあなたに「葬送のフリーレン」をおすすめしました',
    timestamp: daysFromNow(-1),
    isRead: true,
    targetId: 'c-12',
  },
  {
    id: 'n-6',
    type: 'expiring',
    title: '「地面師たち」があと6日でNetflixから配信終了',
    timestamp: daysFromNow(-3),
    isRead: true,
    targetId: 'c-9',
    serviceName: 'Netflix',
  },
  {
    id: 'n-7',
    type: 'follow',
    title: '伊藤美咲さんがあなたをフォローしました',
    timestamp: daysFromNow(-4),
    isRead: true,
    targetId: 'u-6',
  },
  {
    id: 'n-8',
    type: 'recommendation',
    title: '田中太郎さんがあなたに「オッペンハイマー」をおすすめしました',
    timestamp: daysFromNow(-5),
    isRead: true,
    targetId: 'c-1',
  },
];

// === Search Functions ===
export function mockSearchResults(query: string): SearchResult[] {
  if (!query) return [];
  return mockContents
    .filter((c) => c.title.includes(query))
    .map((c) => ({
      ...c,
      isInWatchlist: mockWatchlistItems.some((w) => w.id === c.id),
    }));
}

export function mockMoodSearchResults(
  moods: MoodId[],
  _duration?: DurationId,
  _attention?: AttentionLevelId,
): WatchlistItem[] {
  return mockWatchlistItems.filter(
    (item) =>
      item.status === 'want' &&
      moods.some((mood) => item.moodTags.includes(mood)),
  );
}
