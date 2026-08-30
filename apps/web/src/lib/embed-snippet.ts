export function buildEmbedScriptSnippet(storeUrl: string, productSlug?: string) {
  const base = storeUrl.replace(/\/$/, '');
  const productAttr = productSlug ? `\n  data-product="${productSlug}"` : '';

  return `<script
  src="${base}/embed.js"
  data-store="${base}"${productAttr}
  async
></script>
<div data-assetlane-product="${productSlug || 'your-product-slug'}"></div>`;
}

export function buildEmbedButtonSnippet(storeUrl: string, productSlug: string) {
  const base = storeUrl.replace(/\/$/, '');

  return `<script
  src="${base}/embed.js"
  data-store="${base}"
  data-product="${productSlug}"
  async
></script>`;
}
