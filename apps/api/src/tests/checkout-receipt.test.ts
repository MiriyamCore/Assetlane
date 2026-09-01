import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildCheckoutReceiptResponse } from '../lib/checkout-receipt';

describe('buildCheckoutReceiptResponse', () => {
  const purchase = {
    id: 'purchase-1',
    status: 'pending' as const,
    downloadToken: 'token-abc',
    product: { title: 'Starter Kit' },
  };

  it('returns pending receipt without download url', () => {
    const receipt = buildCheckoutReceiptResponse(purchase, 'http://localhost:5173', 'purchase-1');

    assert.equal(receipt.status, 'pending');
    assert.equal(receipt.productTitle, 'Starter Kit');
    assert.equal(receipt.orderReference, 'purchase-1');
    assert.equal('downloadUrl' in receipt, false);
  });

  it('returns paid receipt with download url', () => {
    const receipt = buildCheckoutReceiptResponse(
      { ...purchase, status: 'paid' },
      'http://localhost:5173/',
      'cs_test_123',
    );

    assert.equal(receipt.status, 'paid');
    assert.equal(receipt.downloadUrl, 'http://localhost:5173/download/token-abc');
    assert.equal(receipt.orderReference, 'cs_test_123');
  });

  it('models checkout to paid download flow', () => {
    const pending = buildCheckoutReceiptResponse(purchase, 'http://localhost:5173', purchase.id);
    const paid = buildCheckoutReceiptResponse({ ...purchase, status: 'paid' }, 'http://localhost:5173', purchase.id);

    assert.equal(pending.status, 'pending');
    assert.equal(paid.status, 'paid');
    if (paid.status === 'paid') {
      assert.match(paid.downloadUrl, /\/download\/token-abc$/);
    }
  });
});
