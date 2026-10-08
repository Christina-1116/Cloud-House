import test from 'node:test';
import assert from 'node:assert/strict';
import { PETS, restorePetSelection } from '../src/pets-model.mjs';

test('legacy cat and dog selections continue to identify the same pet', () => {
  for (const [saved, id] of [[0, 'cat0'], [1, 'cat1'], [2, 'cat2'], [3, 'dog0'], [4, 'dog1']]) {
    assert.equal(PETS[restorePetSelection({pet: saved})].id, id);
  }
});

test('a stable saved pet ID restores the selected new cat even when the index is stale', () => {
  assert.equal(PETS[restorePetSelection({pet: 3, petId: 'cat8'})].n, '墨墨');
  assert.equal(PETS[restorePetSelection({pet: 0, petId: 'cat5'})].n, '暹罗');
});

test('malformed or unknown pet selections recover without preventing boot', () => {
  for (const saved of [null, {}, {pet:-1}, {pet:99}, {pet:2.5}, {pet:'3'}, {petId:'unknown'}]) {
    assert.equal(restorePetSelection(saved), 0);
  }
  assert.equal(PETS[restorePetSelection({pet:4, petId:'removed'})].id, 'dog1');
});
