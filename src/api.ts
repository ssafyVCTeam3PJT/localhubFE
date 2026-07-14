import type { Post, Comment } from './types';

const API_BASE_URL = '/api';

export interface BackendPostResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string;
  sport: string;
  status: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
  views: number;
  joinedCount: number;
  maxCount: number;
  lat: number;
  lng: number;
  tags: string[];
  commentCount?: number;
  isJoined?: boolean;
  comments?: BackendCommentResponse[];
}

export interface BackendCommentResponse {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const normalizeComment = (raw: BackendCommentResponse): Comment => ({
  id: raw.id,
  author: raw.authorName,
  content: raw.content,
  createdAt: raw.createdAt
});

export const normalizePost = (raw: BackendPostResponse): Post => ({
  id: raw.id,
  title: raw.title,
  location: raw.location,
  address: raw.address,
  sport: (raw.sport as Post['sport']) ?? '기타',
  status: (raw.status as Post['status']) ?? '모집중',
  createdAt: raw.createdAt,
  author: raw.authorName ?? '익명',
  views: raw.views ?? 0,
  description: raw.description,
  tags: raw.tags ?? [],
  joinedCount: raw.joinedCount ?? 0,
  maxCount: raw.maxCount ?? 0,
  lat: raw.lat ?? 0,
  lng: raw.lng ?? 0,
  comments: (raw.comments ?? []).map(normalizeComment),
  image: undefined
});

const requestJson = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || '요청이 실패했습니다.');
  }

  return payload as T;
};

export const fetchPosts = async (): Promise<Post[]> => {
  const payload = await requestJson<ApiEnvelope<{ posts: BackendPostResponse[] }>>('/posts');
  return (payload.data?.posts ?? []).map(normalizePost);
};

export const fetchPostById = async (postId: string): Promise<Post> => {
  const payload = await requestJson<ApiEnvelope<BackendPostResponse>>(`/posts/${postId}`);
  return normalizePost(payload.data);
};

export const fetchPlaces = async () => {
  const payload = await requestJson<ApiEnvelope<{ places: Array<{ id: string; name: string; address: string; lat: number; lng: number; postCount: number }> }>>('/places');
  return payload.data?.places ?? [];
};

export const createPost = async (input: Partial<Post>) => {
  const payload = await requestJson<ApiEnvelope<BackendPostResponse>>('/posts', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      location: input.location,
      address: input.address,
      sport: input.sport,
      maxCount: input.maxCount,
      lat: input.lat,
      lng: input.lng,
      tags: input.tags
    })
  });
  return normalizePost(payload.data);
};

export const addComment = async (postId: string, content: string) => {
  const payload = await requestJson<ApiEnvelope<{ comment: BackendCommentResponse }>>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  return normalizeComment(payload.data.comment);
};

export const joinPost = async (postId: string) => {
  const payload = await requestJson<ApiEnvelope<{ joinedCount: number; isJoined: boolean }>>(`/posts/${postId}/join`, {
    method: 'POST'
  });
  return payload.data;
};

export const viewPost = async (postId: string) => {
  const payload = await requestJson<ApiEnvelope<{ views: number }>>(`/posts/${postId}/view`, {
    method: 'POST'
  });
  return payload.data;
};
