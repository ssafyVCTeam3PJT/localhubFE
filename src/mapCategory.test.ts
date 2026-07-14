import test from 'node:test';
import assert from 'node:assert/strict';
import { getCategoryEmoji } from './mapCategory.ts';

test('maps known categories to emoji markers', () => {
  assert.equal(getCategoryEmoji('러닝'), '🏃');
  assert.equal(getCategoryEmoji('basketball'), '🏀');
  assert.equal(getCategoryEmoji('배드민턴'), '🏸');
  assert.equal(getCategoryEmoji('수영'), '🏊');
  assert.equal(getCategoryEmoji('야구'), '⚾');
  assert.equal(getCategoryEmoji('기타'), '📍');
});
