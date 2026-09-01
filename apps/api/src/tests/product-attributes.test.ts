import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseProductAttributes } from '../lib/product-attributes';

describe('parseProductAttributes', () => {
  it('returns an empty array for missing values', () => {
    assert.deepEqual(parseProductAttributes(null), []);
    assert.deepEqual(parseProductAttributes(''), []);
  });

  it('parses valid JSON arrays and trims rows', () => {
    assert.deepEqual(
      parseProductAttributes(
        JSON.stringify([
          { label: ' WordPress ', value: ' 6.0+ ' },
          { label: 'License', value: 'GPL' },
        ]),
      ),
      [
        { label: 'WordPress', value: '6.0+' },
        { label: 'License', value: 'GPL' },
      ],
    );
  });

  it('drops incomplete rows and invalid payloads', () => {
    assert.deepEqual(parseProductAttributes([{ label: 'Format', value: 'ZIP' }, { label: 'Missing value' }]), [
      { label: 'Format', value: 'ZIP' },
    ]);
    assert.deepEqual(parseProductAttributes('not-json'), []);
    assert.deepEqual(parseProductAttributes({ label: 'Nope', value: 'Nope' }), []);
  });
});
