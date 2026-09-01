import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isWritableRole } from '../lib/team';

describe('team roles', () => {
  it('treats owner and admin as writable roles', () => {
    assert.equal(isWritableRole('owner'), true);
    assert.equal(isWritableRole('admin'), true);
    assert.equal(isWritableRole('viewer'), false);
  });
});
