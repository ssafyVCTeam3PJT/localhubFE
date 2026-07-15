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

export interface BackendPlaceResponse {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  postCount: number;
  category?: string | null;
  imageUrl?: string;
}

export const normalizeComment = (raw: BackendCommentResponse): Comment => ({
  id: raw.id,
  author: raw.authorName,
  content: raw.content,
  createdAt: raw.createdAt
});

const unwrapPostPayload = (raw: any): BackendPostResponse => {
  if (!raw || typeof raw !== 'object') {
    return raw as BackendPostResponse;
  }

  if ('id' in raw && 'title' in raw) {
    return raw as BackendPostResponse;
  }

  if ('post' in raw && raw.post && typeof raw.post === 'object') {
    return raw.post as BackendPostResponse;
  }

  if ('data' in raw && raw.data && typeof raw.data === 'object') {
    if ('post' in raw.data && raw.data.post && typeof raw.data.post === 'object') {
      return raw.data.post as BackendPostResponse;
    }
    if ('id' in raw.data && 'title' in raw.data) {
      return raw.data as BackendPostResponse;
    }
  }

  return raw as BackendPostResponse;
};

export const normalizePost = (raw: any): Post => {
  const post = unwrapPostPayload(raw);

  return {
    id: post.id,
    title: post.title,
    location: post.location,
    address: post.address,
    sport: (post.sport as Post['sport']) ?? '기타',
    status: (post.status as Post['status']) ?? '모집중',
    createdAt: post.createdAt,
    author: post.authorName ?? '익명',
    views: post.views ?? 0,
    description: post.description,
    tags: post.tags ?? [],
    joinedCount: post.joinedCount ?? 0,
    maxCount: post.maxCount ?? 0,
    lat: post.lat ?? 0,
    lng: post.lng ?? 0,
    comments: (post.comments ?? []).map(normalizeComment),
    image: undefined
  };
};

export const mergePostWithLocalState = (freshPost: Partial<Post> | null | undefined, fallbackPost?: Partial<Post> | null): Post => {
  const base = freshPost ?? {};
  const fallback = fallbackPost ?? {};

  const mergedJoinedCount = (base.joinedCount ?? 0) > 0
    ? (base.joinedCount as number)
    : (fallback.joinedCount ?? 0);

  return {
    id: base.id ?? fallback.id ?? '',
    title: base.title ?? fallback.title ?? '',
    location: base.location ?? fallback.location ?? '',
    address: base.address ?? fallback.address ?? '',
    sport: (base.sport as Post['sport']) ?? (fallback.sport as Post['sport']) ?? '기타',
    status: (base.status as Post['status']) ?? (fallback.status as Post['status']) ?? '모집중',
    createdAt: base.createdAt ?? fallback.createdAt ?? '',
    author: base.author ?? fallback.author ?? '익명',
    views: base.views ?? fallback.views ?? 0,
    description: base.description ?? fallback.description ?? '',
    tags: base.tags ?? fallback.tags ?? [],
    joinedCount: mergedJoinedCount,
    maxCount: base.maxCount ?? fallback.maxCount ?? 0,
    lat: base.lat ?? fallback.lat ?? 0,
    lng: base.lng ?? fallback.lng ?? 0,
    comments: base.comments ?? fallback.comments ?? [],
    image: base.image ?? fallback.image
  } as Post;
};

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
  const [postsPayload, places] = await Promise.all([
    requestJson<ApiEnvelope<{ posts: BackendPostResponse[] }>>('/posts'),
    fetchPlaces()
  ]);
  return (postsPayload.data?.posts ?? []).map((raw) => {
    const post = normalizePost(raw);
    const matchedPlace = places.find(place => 
      place.name.toLowerCase().includes(post.location.toLowerCase()) ||
      post.location.toLowerCase().includes(place.name.toLowerCase()) || 
      post.title.toLowerCase().includes(place.name.toLowerCase()) ||
      (post.location.includes("보라매") && place.name.includes("보라매")) ||
      (post.location.includes("한강") && place.name.includes("한강")) ||
      (post.location.includes("관악") && place.name.includes("관악"))
    );
    if (matchedPlace?.imageUrl) {
      post.image = matchedPlace.imageUrl;
    }
    return post;
  });
};

export const fetchPostById = async (postId: string): Promise<Post> => {
  const [payload, places] = await Promise.all([
    requestJson<ApiEnvelope<BackendPostResponse>>(`/posts/${postId}`),
    fetchPlaces()
  ]);
  const post = normalizePost(payload.data);
  const matchedPlace = places.find(place => 
    place.name.toLowerCase().includes(post.location.toLowerCase()) ||
    post.location.toLowerCase().includes(place.name.toLowerCase()) || 
    post.title.toLowerCase().includes(place.name.toLowerCase()) ||
    (post.location.includes("보라매") && place.name.includes("보라매")) ||
    (post.location.includes("한강") && place.name.includes("한강")) ||
    (post.location.includes("관악") && place.name.includes("관악"))
  );
  if (matchedPlace?.imageUrl) {
    post.image = matchedPlace.imageUrl;
  }
  return post;
};

export const fetchPlaces = async (): Promise<BackendPlaceResponse[]> => {
  const payload = await requestJson<ApiEnvelope<{ places: BackendPlaceResponse[] }>>('/places');
  return payload.data?.places ?? [];
};

export interface PostCreateInput extends Partial<Post> {
  editPassword?: string;
}

export const buildPostRequestPayload = (input: PostCreateInput) => ({
  title: input.title,
  description: input.description,
  location: input.location,
  address: input.address,
  sport: input.sport,
  maxCount: input.maxCount,
  lat: input.lat,
  lng: input.lng,
  tags: input.tags,
  editPassword: input.editPassword
});

export const createPost = async (input: PostCreateInput) => {
  const payload = await requestJson<ApiEnvelope<any>>('/posts', {
    method: 'POST',
    body: JSON.stringify(buildPostRequestPayload(input))
  });
  return normalizePost(payload.data ?? payload);
};

export const updatePost = async (postId: string, input: Partial<Post> & { password?: string }) => {
  const payload = await requestJson<ApiEnvelope<BackendPostResponse>>(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  });
  return normalizePost(payload.data);
};

export const deletePost = async (postId: string, password: string) => {
  await requestJson<ApiEnvelope<null>>(`/posts/${postId}`, {
    method: 'DELETE',
    body: JSON.stringify({ password })
  });
};

export const addComment = async (postId: string, content: string) => {
  const payload = await requestJson<ApiEnvelope<{ comment: BackendCommentResponse }>>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
  return normalizeComment(payload.data.comment);
};

export const joinPost = async (postId: string) => {
  const payload = await requestJson<ApiEnvelope<any>>(`/posts/${postId}/join`, {
    method: 'POST'
  });

  const data = payload.data ?? payload;
  const joinedCount = Number(
    data?.joinedCount ?? data?.participants ?? data?.memberCount ?? data?.count ?? 0
  );
  const isJoined = data?.isJoined ?? data?.joined ?? false;

  return {
    joinedCount,
    isJoined
  };
};

export const leavePost = async (postId: string) => {
  const payload = await requestJson<ApiEnvelope<any>>(`/posts/${postId}/join`, {
    method: 'DELETE'
  });

  const data = payload.data ?? payload;
  const joinedCount = Number(
    data?.joinedCount ?? data?.participants ?? data?.memberCount ?? data?.count ?? 0
  );

  return {
    joinedCount
  };
};

export const viewPost = async (postId: string) => {
  const payload = await requestJson<ApiEnvelope<{ views: number }>>(`/posts/${postId}/view`, {
    method: 'POST'
  });
  return payload.data;
};
