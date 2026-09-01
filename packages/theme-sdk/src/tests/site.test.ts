import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getTrustBlocks, hasFaqSection, hasTrustSection } from '../helpers/site';

describe('storefront content helpers', () => {
  it('detects FAQ section from body content', () => {
    assert.equal(hasFaqSection({ faqBody: '' }), false);
    assert.equal(hasFaqSection({ faqBody: '**Delivery** — Files arrive by email.' }), true);
  });

  it('collects trust blocks and ignores empty slots', () => {
    const blocks = getTrustBlocks({
      trustBlock1Title: 'Secure checkout',
      trustBlock1Body: 'Stripe and bKash supported.',
      trustBlock2Title: '',
      trustBlock2Body: '',
      trustBlock3Title: 'Fast delivery',
      trustBlock3Body: 'Download links are emailed instantly.',
    });

    assert.equal(blocks.length, 2);
    assert.equal(hasTrustSection({ trustBlock1Title: '', trustBlock1Body: '' }), false);
    assert.equal(hasTrustSection({ trustBlock1Title: 'Secure checkout', trustBlock1Body: '' }), true);
  });
});
