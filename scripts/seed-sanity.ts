import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

const client = createClient({
  projectId: 'hqlm9lgy',
  dataset: 'production',
  apiVersion: '2026-03-17',
  token: process.env.SANITY_TOKEN!,
  useCdn: false,
});

// Simple frontmatter parser
function parseFrontmatter(content: string) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: {} as Record<string, any>, body: '' };
  const frontmatterStr = match[1];
  const body = content.slice(match[0].length).trim();

  const data: Record<string, any> = {};
  let currentKey = '';
  for (const line of frontmatterStr.split('\n')) {
    const trimmedLine = line.replace(/\r$/, '');
    const arrayMatch = trimmedLine.match(/^\s+-\s+"?(.*?)"?\s*$/);
    if (arrayMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(arrayMatch[1]);
      continue;
    }
    const kvMatch = trimmedLine.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      let value = kvMatch[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      if (value === 'true') data[currentKey] = true;
      else if (value === 'false') data[currentKey] = false;
      else if (value && !isNaN(Number(value)) && !value.includes('-')) data[currentKey] = Number(value);
      else if (value) data[currentKey] = value;
    }
  }
  return { data, body };
}

async function uploadImage(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.warn(`  Image not found: ${filePath}`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const asset = await client.assets.upload('image', buffer, { filename });
  return { _type: 'image' as const, asset: { _type: 'reference' as const, _ref: asset._id } };
}

async function seedResources() {
  console.log('--- Seeding Resources ---');
  const dir = 'src/content/scholarships';
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    const amount = typeof data.amount === 'number' ? `$${data.amount.toLocaleString()}` : String(data.amount || '');

    const doc = {
      _type: 'resource' as const,
      _id: `resource-${slug}`,
      name: data.name,
      slug: { _type: 'slug' as const, current: slug },
      type: data.type,
      amount,
      frequency: data.frequency,
      deadline: data.deadline,
      description: data.description,
      eligibility: Array.isArray(data.eligibility) ? data.eligibility : [],
      applicationUrl: data.applicationUrl || undefined,
      draft: false,
      order: data.order || 0,
    };

    await client.createOrReplace(doc);
    console.log(`  Created resource: ${data.name}`);
  }
}

async function seedEvents() {
  console.log('--- Seeding Events ---');
  const dir = 'src/content/events';
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, body } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    let image = null;
    if (data.image) {
      const imagePath = path.join('public', data.image);
      image = await uploadImage(imagePath);
    }

    const bodyBlocks = body
      ? [{ _type: 'block' as const, _key: 'body0', style: 'normal' as const, children: [{ _type: 'span' as const, _key: 's0', text: body }], markDefs: [] }]
      : [];

    const doc: Record<string, any> = {
      _type: 'event',
      _id: `event-${slug}`,
      title: data.title,
      slug: { _type: 'slug', current: slug },
      date: data.date ? new Date(data.date).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      time: data.time,
      location: data.location,
      summary: data.summary,
      body: bodyBlocks,
      tags: data.tags || [],
      registrationLink: data.registrationLink,
      registrationRequired: data.registrationRequired || false,
      featured: data.featured || false,
      draft: data.draft || false,
    };

    if (image) doc.image = image;

    await client.createOrReplace(doc);
    console.log(`  Created event: ${data.title}`);
  }
}

async function seedStaff() {
  console.log('--- Seeding Staff ---');
  const dir = 'src/content/staff';
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    let image = null;
    if (data.image) {
      const imagePath = path.join('public', data.image);
      image = await uploadImage(imagePath);
    }

    const doc: Record<string, any> = {
      _type: 'staffMember',
      _id: `staff-${slug}`,
      name: data.name,
      title: data.title,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      order: data.order || 0,
      draft: data.draft || false,
    };

    if (image) doc.image = image;

    await client.createOrReplace(doc);
    console.log(`  Created staff: ${data.name}`);
  }
}

async function main() {
  console.log('Starting Sanity content seeding...\n');
  await seedResources();
  console.log();
  await seedEvents();
  console.log();
  await seedStaff();
  console.log('\nDone! All content seeded to Sanity.');
}

main().catch(console.error);
