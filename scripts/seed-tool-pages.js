const { MongoClient } = require('mongodb');

const MONGO_URL = process.argv[2] || 'mongodb://localhost:27017/tinytools';

const toolPages = [
  { title: 'JSON Formatter', slug: 'json-formatter', navLabel: 'JSON Formatter', template: 'tool' },
  { title: 'JSON Diff', slug: 'json-diff', navLabel: 'JSON Diff', template: 'tool' },
  { title: 'JWT Decoder', slug: 'jwt-decoder', navLabel: 'JWT Decoder', template: 'tool' },
  { title: 'Image Compressor', slug: 'image-compressor', navLabel: 'Image Compressor', template: 'tool' },
];

const staticPages = [
  { title: 'Blog', slug: 'blog', navLabel: 'Blog', template: 'static', footerGroup: 'Resources', footerGroupOrder: 2 },
  { title: 'Privacy Policy', slug: 'privacy', navLabel: 'Privacy Policy', template: 'static', footerGroup: 'Legal', footerGroupOrder: 3 },
  { title: 'Terms of Use', slug: 'terms', navLabel: 'Terms of Use', template: 'static', footerGroup: 'Legal', footerGroupOrder: 3 },
];

async function seed() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db();
  const pages = db.collection('pages');

  const now = new Date();

  for (const tool of toolPages) {
    const existing = await pages.findOne({ slug: tool.slug });
    if (existing) {
      console.log(`  exists: ${tool.slug} — updating nav fields`);
      await pages.updateOne(
        { slug: tool.slug },
        {
          $set: {
            navPlacement: existing.navPlacement || 'both',
            navLabel: existing.navLabel || tool.navLabel,
            footerGroup: existing.footerGroup || 'Tools',
            footerGroupOrder: existing.footerGroupOrder ?? 1,
          },
        },
      );
    } else {
      console.log(`  creating: ${tool.slug}`);
      await pages.insertOne({
        title: tool.title,
        slug: tool.slug,
        content: '',
        status: 'published',
        template: tool.template,
        navPlacement: 'both',
        navLabel: tool.navLabel,
        footerGroup: 'Tools',
        footerGroupOrder: 1,
        order: toolPages.indexOf(tool) + 1,
        seo: { metaTitle: '', metaDescription: '', noIndex: false },
        faq: [],
        relatedPages: [],
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  for (const page of staticPages) {
    const existing = await pages.findOne({ slug: page.slug });
    if (existing) {
      console.log(`  exists: ${page.slug} — updating nav fields`);
      await pages.updateOne(
        { slug: page.slug },
        {
          $set: {
            navPlacement: existing.navPlacement || 'footer',
            navLabel: existing.navLabel || page.navLabel,
            footerGroup: existing.footerGroup || page.footerGroup,
            footerGroupOrder: existing.footerGroupOrder ?? page.footerGroupOrder,
          },
        },
      );
    } else {
      console.log(`  creating: ${page.slug}`);
      await pages.insertOne({
        title: page.title,
        slug: page.slug,
        content: '',
        status: 'published',
        template: page.template,
        navPlacement: 'footer',
        navLabel: page.navLabel,
        footerGroup: page.footerGroup,
        footerGroupOrder: page.footerGroupOrder,
        order: 10 + staticPages.indexOf(page),
        seo: { metaTitle: '', metaDescription: '', noIndex: false },
        faq: [],
        relatedPages: [],
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  console.log('Done!');
  await client.close();
}

seed().catch(console.error);
