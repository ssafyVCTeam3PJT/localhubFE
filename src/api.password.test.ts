import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPostRequestPayload } from './api';

test('buildPostRequestPayload includes editPassword when provided', () => {
  const payload = buildPostRequestPayload({
    title: '테스트 모임',
    description: '설명',
    location: '보라매공원',
    address: '서울시',
    sport: '러닝',
    maxCount: 4,
    editPassword: '1234'
  });

  assert.equal(payload.editPassword, '1234');
  assert.equal(payload.title, '테스트 모임');
});
