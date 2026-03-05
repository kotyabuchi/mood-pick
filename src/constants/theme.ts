import { Brain, Coffee, HeartCrack, Laugh, Zap } from 'lucide-react';

export const Colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#262626',
  border: '#333333',

  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textDisabled: '#666666',

  accent: '#FF6B00',
  accentHover: '#FF8533',
  accentSubtle: 'rgba(255, 107, 0, 0.125)',

  success: '#22C55E',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export const Moods = [
  { id: 'excited', icon: Zap, label: '興奮したい', shortLabel: '興奮' },
  { id: 'sad', icon: HeartCrack, label: '切ない気分', shortLabel: '切ない' },
  { id: 'funny', icon: Laugh, label: '笑いたい', shortLabel: '笑い' },
  { id: 'think', icon: Brain, label: '考えたい', shortLabel: '思考' },
  {
    id: 'chill',
    icon: Coffee,
    label: 'まったりしたい',
    shortLabel: 'まったり',
  },
] as const;

export const Durations = [
  { id: '30min', label: '30分', minutes: 30 },
  { id: '1hour', label: '1時間', minutes: 60 },
  { id: '2hour', label: '2時間', minutes: 120 },
  { id: 'unlimited', label: '∞', minutes: Number.POSITIVE_INFINITY },
] as const;

export const AttentionLevels = [
  { id: 'focused', label: 'がっつり集中' },
  { id: 'casual', label: 'ながら見OK' },
] as const;
