import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getDatabaseProvider } from '../lib/database';

describe('database provider', () => {
  it('defaults to sqlite for file urls', () => {
    assert.equal(getDatabaseProvider({ DATABASE_URL: 'file:./assetlane.db' }), 'sqlite');
  });

  it('detects postgres from DATABASE_URL', () => {
    assert.equal(
      getDatabaseProvider({ DATABASE_URL: 'postgresql://assetlane:assetlane@localhost:5432/assetlane' }),
      'postgresql',
    );
  });

  it('respects DATABASE_PROVIDER override', () => {
    assert.equal(getDatabaseProvider({ DATABASE_URL: 'file:./assetlane.db', DATABASE_PROVIDER: 'postgresql' }), 'postgresql');
  });
});
