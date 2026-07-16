// src/userProfile.ts

// 간단한 UUID v4 생성기 (외부 라이브러리 없이 구현)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const ADJECTIVES = ['신나는', '배고픈', '달리는', '산책하는', '따뜻한', '용감한', '수영하는', '행복한', '건강한', '씩씩한'];
const NOUNS = ['다람쥐', '치타', '고양이', '토끼', '호랑이', '돌고래', '강아지', '쿼카', '거북이', '판다'];

export interface UserProfile {
  userId: string;
  nickname: string;
}

export function getOrCreateProfile(): UserProfile {
  try {
    const stored = localStorage.getItem('localhub_chat_profile');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to parse local profile", e);
  }

  // 랜덤 조합 닉네임 생성
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const nickname = `${adj} ${noun}`;
  const userId = `user_${generateUUID().substring(0, 8)}`; // 고유 ID 부여

  const profile = { userId, nickname };
  localStorage.setItem('localhub_chat_profile', JSON.stringify(profile));
  return profile;
}
