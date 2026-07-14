const categoryEmojiMap: Record<string, string> = {
  러닝: '🏃',
  running: '🏃',
  jog: '🏃',
  달리기: '🏃',
  축구: '⚽',
  soccer: '⚽',
  football: '⚽',
  풋살: '⚽',
  농구: '🏀',
  basketball: '🏀',
  배드민턴: '🏸',
  badminton: '🏸',
  테니스: '🎾',
  tennis: '🎾',
  클라이밍: '🧗',
  climbing: '🧗',
  등산: '🥾',
  hiking: '🥾',
  요가: '🧘',
  yoga: '🧘',
  헬스: '💪',
  fitness: '💪',
  피트니스: '💪',
  수영: '🏊',
  swimming: '🏊',
  swim: '🏊',
  자전거: '🚲',
  cycling: '🚲',
  bike: '🚲',
  볼링: '🎳',
  bowling: '🎳',
  야구: '⚾',
  baseball: '⚾',
  골프: '⛳',
  golf: '⛳',
  필라테스: '🧘',
  pilates: '🧘',
  기타: '📍',
  default: '📍'
};

export const getCategoryEmoji = (category?: string | null) => {
  if (!category) return categoryEmojiMap.default;

  const normalized = category.trim().toLowerCase();
  const directMatch = Object.keys(categoryEmojiMap).find((key) => key.toLowerCase() === normalized);
  if (directMatch) return categoryEmojiMap[directMatch];

  const fallback = Object.keys(categoryEmojiMap).find((key) => normalized.includes(key.toLowerCase()));
  return fallback ? categoryEmojiMap[fallback] : categoryEmojiMap.default;
};
