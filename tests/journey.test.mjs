import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEY_ROOMS, freshJourney, restoreJourney, journeyAction, journeyStats } from '../src/journey-model.mjs';

test('every retreat is accessible from the start without changing earned progress', () => {
  let s = freshJourney();
  for (const room of JOURNEY_ROOMS) {
    const out = journeyAction(s, { type: 'travel', room: room.id });
    assert.equal(out.state.room, room.id);
    assert.equal(out.reward, 0);
    s = out.state;
  }
  assert.equal(journeyStats(s).completed, 0);
});
test('each discovery pays once and the third discovery earns the exploration stamp', () => {
  let s = freshJourney();
  const first = journeyAction(s, { type: 'discover', clue: 0 });
  assert.equal(first.reward, 5);
  assert.equal(journeyAction(first.state, { type: 'discover', clue: 0 }).reward, 0);
  s = first.state;
  s = journeyAction(s, { type: 'discover', clue: 1 }).state;
  s = journeyAction(s, { type: 'discover', clue: 2 }).state;
  assert.ok(s.rooms.home.marks.includes('discover'));
  assert.equal(s.rooms.home.found.length, 3);
});
test('a postcard requires discoveries, a successful ritual and a real story choice', () => {
  let s = freshJourney();
  assert.equal(journeyAction(s, { type: 'ritual', score: 0 }).reward, 0);
  assert.equal(journeyAction(s, { type: 'story', choice: 9 }).reward, 0);
  for (let clue = 0; clue < 3; clue++) s = journeyAction(s, { type: 'discover', clue }).state;
  s = journeyAction(s, { type: 'ritual', score: 85 }).state;
  assert.equal(journeyStats(s).completed, 0);
  const last = journeyAction(s, { type: 'story', choice: 1 });
  assert.equal(last.postcard, 'home');
  assert.equal(last.reward, 100);
  assert.equal(journeyStats(last.state).completed, 1);
  assert.equal(journeyAction(last.state, { type: 'story', choice: 0 }).reward, 0);
  assert.equal(journeyAction(last.state, { type: 'ritual', score: 100 }).reward, 0);
});
test('switching rooms keeps independent progress and does not mutate the previous state', () => {
  const s = freshJourney();
  let next = journeyAction(s, { type: 'discover', clue: 0 }).state;
  next = journeyAction(next, { type: 'travel', room: 'winter' }).state;
  next = journeyAction(next, { type: 'discover', clue: 1 }).state;
  assert.deepEqual(s.rooms, {});
  assert.deepEqual(next.rooms.home.found, [0]);
  assert.deepEqual(next.rooms.winter.found, [1]);
});
test('restoring a partial or malformed save normalizes room progress safely', () => {
  const s = restoreJourney({ room: 'missing', rooms: { home: { found: [0, 0, 8], marks: ['story', 'fake'], choice: 99, best: -2 }, fake: { marks: [] } } });
  assert.equal(s.room, 'home');
  assert.deepEqual(s.rooms.home.found, [0]);
  assert.deepEqual(s.rooms.home.marks, []);
  assert.equal(s.rooms.home.best, 0);
  assert.equal(s.rooms.fake, undefined);
  assert.deepEqual(restoreJourney(null), freshJourney());
});
test('unknown actions and invalid clues do not grant rewards or corrupt progress', () => {
  const s = freshJourney();
  for (const action of [{type:'travel',room:'fake'},{type:'discover',clue:-1},{type:'discover',clue:Infinity},{type:'story',choice:0.5},{type:'ritual',score:NaN},{type:'fake'}]) {
    const out = journeyAction(s, action);
    assert.equal(out.reward, 0);
    assert.deepEqual(out.state, s);
  }
});
test('festival cannot finish early and the ending pays only once', () => {
  let s = freshJourney();
  assert.equal(journeyAction(s, { type: 'festival' }).reward, 0);
  for (const room of JOURNEY_ROOMS.slice(0, 5)) {
    s = journeyAction(s, {type:'travel',room:room.id}).state;
    for (let clue = 0; clue < 3; clue++) s = journeyAction(s, {type:'discover',clue}).state;
    s = journeyAction(s, {type:'ritual',score:80}).state;
    s = journeyAction(s, {type:'story',choice:0}).state;
  }
  assert.ok(journeyStats(s).festivalReady);
  const end = journeyAction(s, {type:'festival'});
  assert.equal(end.reward, 300);
  assert.ok(end.state.ending);
  assert.equal(journeyAction(end.state, {type:'festival'}).reward, 0);
});
