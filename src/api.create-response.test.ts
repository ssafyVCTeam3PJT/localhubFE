import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePost } from './api';

test('normalizePost unwraps nested create response payloads', () => {
  const post = normalizePost({
    success: true,
    data: {
      post: {
        id: 'post_123',
        title: '새로 만든 모임',
        description: '설명',
        location: '보라매공원',
        address: '서울시',
        sport: '러닝',
        status: '모집중',
        createdAt: '2026-07-15T00:00:00Z',
        authorName: '익명',
        views: 0,
        joinedCount: 1,
        maxCount: 4,
        lat: 37.5,
        lng: 126.9,
        tags: ['러닝'],
        comments: []
      }
    }
  });

  assert.equal(post.title, '새로 만든 모임');
  assert.equal(post.location, '보라매공원');
  assert.equal(post.id, 'post_123');
});
