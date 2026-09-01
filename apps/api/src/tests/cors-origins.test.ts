import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildAllowedOrigins } from '../lib/cors-origins';

describe('buildAllowedOrigins', () => {
  it('allows localhost and 127.0.0.1 variants', () => {
    const origins = buildAllowedOrigins('http://localhost:5173');
    assert.ok(origins.has('http://localhost:5173'));
    assert.ok(origins.has('http://127.0.0.1:5173'));
  });
});
