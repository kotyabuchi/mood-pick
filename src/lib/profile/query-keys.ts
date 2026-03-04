export const profileKeys = {
  all: ['profile'] as const,
  own: (userId: string) => [...profileKeys.all, 'own', userId] as const,
};
