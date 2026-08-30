import prisma from '../src/lib/prisma';
import { ensureDefaultSettings } from '../src/lib/settings';

async function main() {
  await ensureDefaultSettings();

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          title: 'Creator Launch Kit',
          slug: 'creator-launch-kit',
          summary: 'A ready-to-sell bundle of landing page copy, onboarding email templates, and pricing worksheets.',
          description: 'A practical bundle for independent creators launching a new digital product. Includes editable copy, pricing worksheets, and a release checklist.',
          tags: ['launch', 'copywriting', 'operations'],
          priceCents: 2900,
          currency: 'USD',
          status: 'published',
          version: '1.0.0',
          changelog: 'Initial release.',
          seoTitle: 'Creator Launch Kit for Digital Product Sellers',
          metaDescription: 'A practical launch bundle for creators selling digital products from their own store.',
          publishedAt: new Date(),
        },
        {
          title: 'Studio Invoice Templates',
          slug: 'studio-invoice-templates',
          summary: 'Polished invoice and proposal templates for freelancers and micro-studios.',
          description: 'A neatly structured set of invoice and proposal templates that help you look consistent across discovery, quoting, and billing.',
          tags: ['templates', 'freelance', 'finance'],
          priceCents: 1900,
          currency: 'USD',
          status: 'draft',
          version: '0.9.0',
          changelog: 'Draft sample product.',
          seoTitle: 'Invoice Templates for Freelancers',
          metaDescription: 'Sell polished invoice and proposal templates from your own infrastructure.',
        },
      ],
    });
    console.log('Seeded sample products');
  }

  console.log('Seed complete. Run the setup wizard at /setup to create the admin account.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
