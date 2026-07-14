import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePost, normalizeComment } from './api';

test('normalizePost maps backend payload to frontend post shape', () => {
  const rawPost = {
    id: 'post_1',
    title: '보라매공원 저녁 러닝',
    description: '오늘 저녁 6시',
    location: '보라매공원',
    address: '서울특별시 동작구 ...',
    sport: '러닝',
    status: '모집중',
    createdAt: '2026-07-14T14:00:00Z',
    authorId: 'user_1',
    authorName: '익명',
    views: 128,
    joinedCount: 3,
    maxCount: 10,
    lat: 37.4928,
    lng: 126.9243,
    tags: ['러닝', '초보환영'],
    commentCount: 2,
    isJoined: false,
    comments: []
  };

  const post = normalizePost(rawPost);

  assert.equal(post.id, 'post_1');
  assert.equal(post.author, '익명');
  assert.equal(post.comments.length, 0);
  assert.equal(post.joinedCount, 3);
  assert.equal(post.maxCount, 10);
  assert.deepEqual(post.tags, ['러닝', '초보환영']);
});

test('normalizeComment maps backend comment payload', () => {
  const rawComment = {
    id: 'comment_1',
    authorName: '익명 1',
    content: '참여하고 싶어요',
    createdAt: '2026-07-14T14:10:00Z'
  };

  const comment = normalizeComment(rawComment);

  assert.equal(comment.author, '익명 1');
  assert.equal(comment.content, '참여하고 싶어요');
});
