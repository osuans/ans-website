# Full Sanity CMS Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all content (resources, events, staff) from local Astro content collections to Sanity.io CMS, embed Sanity Studio at `/studio`, make resource amount a freeform string, and remove the old admin interface.

**Architecture:** Sanity.io as headless CMS with embedded Studio at `/studio`. All pages fetch data via GROQ queries through `@sanity/client`. Images served from Sanity's CDN via `@sanity/image-url`. Event body content rendered with `@portabletext/react`.

**Tech Stack:** Astro 5, Sanity v3, React (for Studio + portable text), TypeScript, Tailwind CSS, Vercel

**Spec:** `docs/superpowers/specs/2026-03-17-sanity-migration-design.md`

---

## File Structure

### New Files
- `sanity.config.ts` — Sanity Studio configuration (project ID, dataset, schema imports, plugins)
- `sanity.cli.ts` — Sanity CLI configuration
- `src/lib/sanity.ts` — Sanity client singleton for GROQ queries
- `src/lib/image.ts` — `urlFor()` helper using `@sanity/image-url`
- `src/sanity/schemas/resource.ts` — Resource document schema
- `src/sanity/schemas/event.ts` — Event document schema
- `src/sanity/schemas/staffMember.ts` — Staff member document schema
- `src/sanity/schemas/index.ts` — Schema barrel export
- `src/pages/studio/[...index].astro` — Catch-all route for Sanity Studio
- `src/components/Studio.tsx` — React component wrapping Sanity Studio
- `src/components/PortableText.tsx` — React component for rendering portable text
- `scripts/seed-sanity.ts` — One-time migration script

### Files to Modify
- `package.json` — Add dependencies
- `astro.config.mjs` — Add React integration
- `src/pages/resources/index.astro` — Fetch from Sanity
- `src/pages/scholarships/[slug].astro` — SSR fetch from Sanity, remove prerender
- `src/pages/events/index.astro` — Fetch from Sanity
- `src/pages/events/[slug].astro` — Fetch from Sanity, use PortableText
- `src/pages/staff.astro` — Fetch from Sanity, pass as prop
- `src/pages/index.astro` — Fetch events from Sanity, pass as prop to EventList
- `src/components/UI/ScholarshipCard.astro` — amount: number → string
- `src/components/UI/EventCard.astro` — Accept string image URLs
- `src/components/Sections/EventList.astro` — Accept events as prop
- `src/components/Sections/StaffList.astro` — Accept staff as prop
- `src/constants/index.ts` — Remove admin-only constants

### Files to Delete
- `src/pages/admin/` — Entire directory (7 files)
- `src/pages/api/events/` — 3 files
- `src/pages/api/scholarships/` — 3 files
- `src/components/Admin/` — 3 files
- `src/layouts/AdminLayout.astro`
- `src/content/config.ts`
- `src/content/scholarships/` — 4 markdown files
- `src/content/events/` — 18 markdown files
- `src/content/staff/` — 10 markdown files + .gitkeep
- `src/core/` — Entire directory (6 files)
- `src/utils/githubEvents.ts` — Only used by deleted API routes
- `src/utils/apiHelpers.ts` — Only used by deleted API routes
- `src/utils/frontmatter.ts` — Only used by deleted API routes
- `src/constants/paths.ts` — Admin/API/repo paths, all dead after migration
- `src/constants/messages.ts` — Error/success messages only used by deleted API routes
- `src/middleware.ts` — Basic auth for `/admin`, no longer needed (Sanity Studio has its own auth)

---

## Task 1: Install Dependencies and Configure Sanity

**Files:**
- Modify: `package.json`
- Create: `sanity.config.ts`
- Create: `sanity.cli.ts`
- Modify: `astro.config.mjs`

**Prerequisites:** User must have a Sanity project created at sanity.io/manage. Need the project ID.

- [ ] **Step 1: Install Sanity and React dependencies**

```bash
npm install sanity @sanity/client @sanity/image-url @sanity/vision @astrojs/react react react-dom @portabletext/react
```

- [ ] **Step 2: Create `sanity.cli.ts`**

```ts
import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID!,
    dataset: process.env.SANITY_DATASET || 'production',
  },
});
```

- [ ] **Step 3: Create `sanity.config.ts`**

This file will initially import an empty schema array — schemas are created in Task 2.

```ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemas';

export default defineConfig({
  name: 'ans-website',
  title: 'ANS at OSU',
  projectId: import.meta.env.SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID!,
  dataset: import.meta.env.SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
```

- [ ] **Step 4: Add React integration to `astro.config.mjs`**

Add `import react from '@astrojs/react';` and add `react()` to the integrations array.

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  output: "server",
  site: 'https://ohiostateans.com',
  adapter: vercel({}),
  integrations: [
    tailwind(),
    sitemap(),
    react(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  },
});
```

- [ ] **Step 5: Create `.env` entries (user must fill in values)**

Add to `.env`:
```
SANITY_PROJECT_ID=<your-project-id>
SANITY_DATASET=production
SANITY_API_VERSION=2026-03-17
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json sanity.config.ts sanity.cli.ts astro.config.mjs .env.example
git commit -m "feat: install Sanity dependencies and configure Studio + React integration"
```

---

## Task 2: Create Sanity Schemas

**Files:**
- Create: `src/sanity/schemas/resource.ts`
- Create: `src/sanity/schemas/event.ts`
- Create: `src/sanity/schemas/staffMember.ts`
- Create: `src/sanity/schemas/index.ts`

- [ ] **Step 1: Create `src/sanity/schemas/resource.ts`**

```ts
import { defineField, defineType } from 'sanity';

export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 200 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Scholarship', value: 'scholarship' },
          { title: 'Fellowship', value: 'fellowship' },
          { title: 'Internship', value: 'internship' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'amount',
      title: 'Amount',
      type: 'string',
      description: 'Freeform display value, e.g. "$1,000", "$25/hr", "Varies"',
    }),
    defineField({
      name: 'frequency',
      title: 'Frequency',
      type: 'string',
    }),
    defineField({
      name: 'deadline',
      title: 'Deadline',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'eligibility',
      title: 'Eligibility',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'applicationUrl',
      title: 'Application URL',
      type: 'url',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'draft',
      title: 'Draft',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'type' },
  },
});
```

- [ ] **Step 2: Create `src/sanity/schemas/event.ts`**

```ts
import { defineField, defineType } from 'sanity';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 200 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
    defineField({
      name: 'time',
      title: 'Time',
      type: 'string',
      description: 'e.g. "5:00 PM - 8:00 PM"',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'registrationLink',
      title: 'Registration Link',
      type: 'url',
    }),
    defineField({
      name: 'registrationRequired',
      title: 'Registration Required',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'draft',
      title: 'Draft',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'date' },
  },
});
```

- [ ] **Step 3: Create `src/sanity/schemas/staffMember.ts`**

```ts
import { defineField, defineType } from 'sanity';

export const staffMember = defineType({
  name: 'staffMember',
  title: 'Staff Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title / Role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'draft',
      title: 'Draft',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'title' },
  },
});
```

- [ ] **Step 4: Create `src/sanity/schemas/index.ts`**

```ts
import { resource } from './resource';
import { event } from './event';
import { staffMember } from './staffMember';

export const schemaTypes = [resource, event, staffMember];
```

- [ ] **Step 5: Commit**

```bash
git add src/sanity/
git commit -m "feat: add Sanity schemas for resource, event, and staffMember"
```

---

## Task 3: Create Sanity Client and Image Helper

**Files:**
- Create: `src/lib/sanity.ts`
- Create: `src/lib/image.ts`

- [ ] **Step 1: Create `src/lib/sanity.ts`**

```ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: import.meta.env.SANITY_API_VERSION || '2026-03-17',
  useCdn: true,
});
```

- [ ] **Step 2: Create `src/lib/image.ts`**

```ts
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityClient } from './sanity';

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/
git commit -m "feat: add Sanity client and image URL helper"
```

---

## Task 4: Embed Sanity Studio at /studio

**Files:**
- Create: `src/pages/studio/[...index].astro`

- [ ] **Step 1: Create the Studio React component**

Create `src/components/Studio.tsx`:

```tsx
import { Studio } from 'sanity';
import config from '../../sanity.config';

export default function StudioPage() {
  return <Studio config={config} />;
}
```

- [ ] **Step 2: Create the Studio catch-all route**

Create `src/pages/studio/[...index].astro`:

```astro
---
import StudioPage from "../../components/Studio";
export const prerender = false;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>ANS at OSU — Studio</title>
  </head>
  <body style="margin: 0; height: 100vh;">
    <StudioPage client:only="react" />
  </body>
</html>
```

> Using `client:only="react"` ensures the Studio renders entirely client-side (no SSR), which is required since Sanity Studio is a React SPA.

- [ ] **Step 2: Verify Studio loads**

Run `npm run dev` and navigate to `http://localhost:4321/studio`. You should see the Sanity Studio login screen.

- [ ] **Step 4: Commit**

```bash
git add src/pages/studio/ src/components/Studio.tsx
git commit -m "feat: embed Sanity Studio at /studio"
```

---

## Task 5: Create Content Migration Script and Seed Sanity

**Files:**
- Create: `scripts/seed-sanity.ts`

**Prerequisites:** Sanity project must be created, env vars set, and you need a write token from sanity.io/manage → API → Tokens.

- [ ] **Step 1: Create `scripts/seed-sanity.ts`**

This script reads all existing markdown files and pushes documents + images to Sanity.

```ts
import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2026-03-17',
  token: process.env.SANITY_TOKEN!,
  useCdn: false,
});

// Simple frontmatter parser
function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, body: '' };
  const frontmatterStr = match[1];
  const body = content.slice(match[0].length).trim();

  // Parse YAML-like frontmatter (simple key: value pairs and arrays)
  const data: Record<string, any> = {};
  let currentKey = '';
  for (const line of frontmatterStr.split('\n')) {
    const arrayMatch = line.match(/^\s+-\s+"?(.*?)"?\s*$/);
    if (arrayMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(arrayMatch[1]);
      continue;
    }
    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      let value = kvMatch[2].trim();
      // Remove surrounding quotes
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
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seedResources() {
  console.log('--- Seeding Resources ---');
  const dir = 'src/content/scholarships';
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = parseFrontmatter(content);
    const slug = file.replace('.md', '');

    // Convert numeric amount to string with $ prefix
    const amount = typeof data.amount === 'number' ? `$${data.amount.toLocaleString()}` : String(data.amount || '');

    const doc = {
      _type: 'resource',
      _id: `resource-${slug}`,
      name: data.name,
      slug: { _type: 'slug', current: slug },
      type: data.type,
      amount,
      frequency: data.frequency,
      deadline: data.deadline, // already a string like "2026-04-26"
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

    // Upload image if exists
    let image = null;
    if (data.image) {
      const imagePath = path.join('public', data.image);
      image = await uploadImage(imagePath);
    }

    // Convert markdown body to simple portable text block
    const bodyBlocks = body
      ? [{ _type: 'block', _key: 'body0', style: 'normal', children: [{ _type: 'span', _key: 's0', text: body }], markDefs: [] }]
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

    // Upload image if exists
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
```

- [ ] **Step 2: Run the seed script**

```bash
npx tsx scripts/seed-sanity.ts
```

Expected: All 4 resources, 18 events, and 10 staff members created in Sanity with images uploaded.

- [ ] **Step 3: Verify in Sanity Studio**

Navigate to `/studio` and confirm all documents and images appear correctly.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-sanity.ts
git commit -m "feat: add content seeding script for Sanity migration"
```

---

## Task 6: Create PortableText Component

**Files:**
- Create: `src/components/PortableText.tsx`

- [ ] **Step 1: Create `src/components/PortableText.tsx`**

```tsx
import { PortableText as PortableTextReact } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

interface Props {
  value: PortableTextBlock[];
}

export default function PortableText({ value }: Props) {
  if (!value || value.length === 0) return null;
  return <PortableTextReact value={value} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PortableText.tsx
git commit -m "feat: add PortableText React component for Sanity rich text"
```

---

## Task 7: Update Resource Pages to Fetch from Sanity

**Files:**
- Modify: `src/components/UI/ScholarshipCard.astro`
- Modify: `src/pages/resources/index.astro`
- Modify: `src/pages/scholarships/[slug].astro`

- [ ] **Step 1: Update ScholarshipCard — amount and deadline types**

In `src/components/UI/ScholarshipCard.astro`:

Change the Props interface:
- `amount: number` → `amount: string`
- `deadline: Date` → `deadline: Date | string`

In the component body, convert deadline to Date:
```ts
const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
```

Change the amount display from:
```astro
<span class="ml-2">${amount.toLocaleString()}</span>
```
to:
```astro
<span class="ml-2">{amount}</span>
```

Change `formatDate(deadline)` to `formatDate(deadlineDate)`.

- [ ] **Step 2: Update `src/pages/resources/index.astro`**

Replace the `getCollection` import and calls with Sanity GROQ queries:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import PageHeader from "../../components/Sections/PageHeader.astro";
import ScholarshipCard from "../../components/UI/ScholarshipCard.astro";
import { sanityClient } from "../../lib/sanity";
import { CONFIG } from "../../constants";

const allResources = await sanityClient.fetch(
  `*[_type == "resource" && !draft] | order(deadline asc) {
    name, "slug": slug.current, type, amount, deadline, description,
    "imageUrl": image.asset->url
  }`
);

const scholarships = allResources.filter((s: any) => s.type === 'scholarship');
const fellowships = allResources.filter((s: any) => s.type === 'fellowship');
const internships = allResources.filter((s: any) => s.type === 'internship');
---
```

Update all `ScholarshipCard` usages: change `item.data.X` → `item.X` and `item.slug` stays `item.slug`.

- [ ] **Step 3: Update `src/pages/scholarships/[slug].astro`**

Remove `prerender = true` and `getStaticPaths()`. Switch to SSR fetch:

```astro
---
import { sanityClient } from "../../lib/sanity";
import PostLayout from "../../layouts/PostLayout.astro";
import BaseLayout from "../../layouts/BaseLayout.astro";

const { slug } = Astro.params;
if (!slug) return new Response("Not found", { status: 404 });

const scholarship = await sanityClient.fetch(
  `*[_type == "resource" && slug.current == $slug && !draft][0] {
    name, "slug": slug.current, type, amount, frequency, deadline,
    description, eligibility, applicationUrl, "imageUrl": image.asset->url
  }`,
  { slug }
);

if (!scholarship) return new Response("Not found", { status: 404 });
---
<BaseLayout
  title={`${scholarship.name} - ANS at OSU`}
  description={scholarship.description}
>
  <PostLayout
    title={scholarship.name}
    description={scholarship.description}
  >
    <div class="mb-6">
      <a href="/resources" class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Resources
      </a>
    </div>

    <div class="prose max-w-none">
      <div class="mb-8">
        <h2 class="text-2xl font-bold">Details</h2>
        <p><strong>Amount:</strong> {scholarship.amount}</p>
        <p><strong>Frequency:</strong> {scholarship.frequency}</p>
        <p><strong>Deadline:</strong> {new Date(scholarship.deadline).toLocaleDateString()}</p>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold">Eligibility</h2>
        <ul class="list-disc pl-5">
          {scholarship.eligibility.map((item: string) => (
            <li>{item}</li>
          ))}
        </ul>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-bold">Description</h2>
        <p>{scholarship.description}</p>
      </div>

      {scholarship.applicationUrl && (
        <div class="mb-8">
          <h2 class="text-2xl font-bold">Apply</h2>
          <p><a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:text-primary-700 underline">Apply Here →</a></p>
        </div>
      )}
    </div>
  </PostLayout>
</BaseLayout>
```

- [ ] **Step 4: Verify resources pages work**

Run `npm run dev`, navigate to `/resources` and click through to individual resource detail pages. Verify:
- Amount displays as freeform string (e.g., "$1,000" not "$1,000" with double-dollar)
- All data renders correctly
- Tabs still work

- [ ] **Step 5: Commit**

```bash
git add src/components/UI/ScholarshipCard.astro src/pages/resources/index.astro src/pages/scholarships/[slug].astro
git commit -m "feat: migrate resource pages to fetch from Sanity, amount is now freeform string"
```

---

## Task 8: Update Event Pages to Fetch from Sanity

**Files:**
- Modify: `src/pages/events/index.astro`
- Modify: `src/pages/events/[slug].astro`
- Modify: `src/components/UI/EventCard.astro`

- [ ] **Step 1: Update `src/pages/events/index.astro`**

Replace `getCollection("events")` with Sanity fetch. Replace `event.data.X` with `event.X` and `event.slug` with `event.slug`. Image is now a URL string from Sanity.

Key changes in the frontmatter:
```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import PageHeader from "../../components/Sections/PageHeader.astro";
import EventCard from "../../components/UI/EventCard.astro";
import { sanityClient } from "../../lib/sanity";
import { isTodayOrFuture, isPastDate, groupEventsBySemester } from "../../utils/dateUtils";
import { CONFIG } from "../../constants";

const allEvents = await sanityClient.fetch(
  `*[_type == "event" && !draft] {
    title, "slug": slug.current, date, endDate, time, location,
    summary, tags, registrationLink, registrationRequired, featured,
    "imageUrl": image.asset->url
  }`
);

const upcomingEvents = allEvents
  .filter((event: any) => isTodayOrFuture(new Date(event.date)))
  .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

const pastEvents = allEvents
  .filter((event: any) => isPastDate(new Date(event.date)))
  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
```

In the template, change all `event.data.X` → `event.X`. The image is now a URL string from Sanity in the `imageUrl` field. Use `event.imageUrl || CONFIG.DEFAULTS.EVENT_IMAGE` for the image prop. Change `event.data.date` to `new Date(event.date)` since Sanity returns ISO strings.

`groupEventsBySemester` expects `{ data: { date: Date } }` shape. Map the flat Sanity objects to match:

```ts
const groupedPastEvents = groupEventsBySemester(
  pastEvents.map((e: any) => ({ data: { ...e, date: new Date(e.date) }, slug: e.slug }))
);
```

In the template, past events within `groupedPastEvents` are accessed as `event.data.title`, `event.data.image`, etc. — this matches because we wrapped them in the `{ data: ... }` shape above. Use `event.slug` for the slug.

- [ ] **Step 2: Update `src/components/UI/EventCard.astro`**

The `date` prop currently expects a `Date` object. Sanity returns ISO strings. Accept `Date | string` and convert:

Change the Props interface:
```ts
date: Date | string;
```

And in the component body, ensure date is a Date:
```ts
const dateObj = typeof date === 'string' ? new Date(date) : date;
```

Use `dateObj` instead of `date` when calling `formatDate(dateObj)`.

- [ ] **Step 3: Update `src/pages/events/[slug].astro`**

Replace `getEntry("events", slug)` with Sanity GROQ fetch. Replace `<Content />` with the PortableText component:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import PostLayout from "../../layouts/PostLayout.astro";
import Button from "../../components/UI/Button.astro";
import PortableText from "../../components/PortableText";
import { sanityClient } from "../../lib/sanity";
import { formatDate } from "../../utils/dateUtils";
import { CONFIG } from "../../constants";

const { slug } = Astro.params;
if (!slug) return new Response("Not found", { status: 404 });

const entry = await sanityClient.fetch(
  `*[_type == "event" && slug.current == $slug && !draft][0] {
    title, "slug": slug.current, date, endDate, time, location,
    summary, body, tags, registrationLink, registrationRequired, featured,
    "imageUrl": image.asset->url
  }`,
  { slug }
);

if (!entry) return new Response("Event not found", { status: 404 });

const formattedDate = formatDate(new Date(entry.date));
const formattedEndDate = entry.endDate ? formatDate(new Date(entry.endDate)) : null;
const isFutureEvent = new Date(entry.date) > new Date();
const eventImage = entry.imageUrl || CONFIG.DEFAULTS.EVENT_IMAGE;
---
```

In the template, replace all `entry.data.X` → `entry.X`.

Replace `<Content />` with:
```astro
<PortableText client:load value={entry.body} />
```

- [ ] **Step 4: Verify event pages work**

Run `npm run dev`, navigate to `/events`, click through to event detail pages. Verify:
- Upcoming/past event filtering works
- Event images display (from Sanity CDN)
- Event body content renders
- Accordion for past events works
- Registration links work

- [ ] **Step 5: Commit**

```bash
git add src/pages/events/ src/components/UI/EventCard.astro
git commit -m "feat: migrate event pages to fetch from Sanity"
```

---

## Task 9: Update Staff and Home Pages to Fetch from Sanity

**Files:**
- Modify: `src/components/Sections/StaffList.astro`
- Modify: `src/pages/staff.astro`
- Modify: `src/components/Sections/EventList.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Update `src/components/Sections/StaffList.astro`**

Remove `getCollection` call. Accept staff data as a prop:

```astro
---
import { urlFor } from "../../lib/image";

interface StaffMember {
  name: string;
  title: string;
  bio?: string;
  imageUrl?: string;
  image?: any;
}

export interface Props {
  staff: StaffMember[];
}

const { staff } = Astro.props;
---
```

In the template, replace `staffMembers.map(staff => ...)` with `staff.map(member => ...)`. Change `staff.data.image` to `member.imageUrl` and `staff.data.name` to `member.name`, etc.

- [ ] **Step 2: Update `src/pages/staff.astro`**

Fetch staff from Sanity and pass as prop:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import PageHeader from "../components/Sections/PageHeader.astro";
import StaffList from "../components/Sections/StaffList.astro";
import { sanityClient } from "../lib/sanity";

const staff = await sanityClient.fetch(
  `*[_type == "staffMember" && !draft] | order(order asc) {
    name, title, bio, "imageUrl": image.asset->url
  }`
);
---
```

Pass `<StaffList staff={staff} />` instead of `<StaffList />`.

- [ ] **Step 3: Update `src/components/Sections/EventList.astro`**

Remove `getCollection` call. Accept events as a prop:

```astro
---
import Card from "../UI/Card.astro";
import Button from "../UI/Button.astro";
import { formatDate } from "../../utils/dateUtils";
import { CONFIG } from "../../constants";

interface EventItem {
  title: string;
  slug: string;
  date: string;
  time?: string;
  location: string;
  summary: string;
  imageUrl?: string;
  featured?: boolean;
}

export interface Props {
  events: EventItem[];
  count?: number;
  showViewAll?: boolean;
}

const { events: allEvents, count = 3, showViewAll = true } = Astro.props;

// Try featured events first, fall back to all passed events
const featuredEvents = allEvents.filter(event => event.featured);
const hasFeatured = featuredEvents.length > 0;
const events = (hasFeatured ? featuredEvents : allEvents).slice(0, count);

const sectionTitle = hasFeatured ? "Featured Events" : "Upcoming Events";
const sectionDescription = hasFeatured
  ? "Explore our featured technical seminars, networking events, and professional development opportunities"
  : "Explore our upcoming technical seminars, networking events, and professional development opportunities";
---
```

In the template, replace `event.data.X` → `event.X`. Use `event.imageUrl || CONFIG.DEFAULTS.EVENT_IMAGE` for the image. `event.slug` stays as-is. Pass `new Date(event.date)` to `formatDate()`.

- [ ] **Step 4: Update `src/pages/index.astro`**

Fetch upcoming events from Sanity and pass to EventList:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import HeroSection from "../components/Sections/HeroSection.astro";
import EventList from "../components/Sections/EventList.astro";
import CalendarEvents from "../components/Sections/CalendarEvents.astro";
import Button from "../components/UI/Button.astro";
import { sanityClient } from "../lib/sanity";

const upcomingEvents = await sanityClient.fetch(
  `*[_type == "event" && !draft && date >= now()] | order(date asc) {
    title, "slug": slug.current, date, time, location, summary, featured,
    "imageUrl": image.asset->url
  }`
);
---
```

Replace `<EventList />` with `<EventList events={upcomingEvents} />`.

- [ ] **Step 5: Verify home and staff pages work**

Run `npm run dev`:
- Home page (`/`): Featured/upcoming events display with images
- Staff page (`/staff`): All staff members display with photos and bios

- [ ] **Step 6: Commit**

```bash
git add src/components/Sections/StaffList.astro src/pages/staff.astro src/components/Sections/EventList.astro src/pages/index.astro
git commit -m "feat: migrate staff and home page event list to Sanity"
```

---

## Task 10: Remove Old Admin, APIs, Content Collections, and Domain Code

**Files to delete:** See spec section 5 for full list.

- [ ] **Step 1: Delete admin pages**

```bash
rm -rf src/pages/admin/
```

- [ ] **Step 2: Delete API routes**

```bash
rm -rf src/pages/api/events/ src/pages/api/scholarships/
```

Check if `src/pages/api/` has other files. If empty, remove the directory too.

- [ ] **Step 3: Delete admin components and layout**

```bash
rm -rf src/components/Admin/
rm src/layouts/AdminLayout.astro
```

- [ ] **Step 4: Delete content collections**

```bash
rm -rf src/content/scholarships/ src/content/events/ src/content/staff/
rm src/content/config.ts
```

If `src/content/` is now empty, remove it:
```bash
rm -rf src/content/
```

- [ ] **Step 5: Delete domain/validation code**

```bash
rm -rf src/core/
```

- [ ] **Step 6: Delete unused utilities**

```bash
rm src/utils/githubEvents.ts src/utils/apiHelpers.ts src/utils/frontmatter.ts
```

- [ ] **Step 7: Delete middleware**

The middleware only protected `/admin` routes with basic auth. Sanity Studio has its own authentication. Delete:

```bash
rm src/middleware.ts
```

- [ ] **Step 8: Clean up constants**

Delete `src/constants/paths.ts` and `src/constants/messages.ts` — they contain only admin/API/repo path helpers and error/success messages, all dead code after migration:

```bash
rm src/constants/paths.ts src/constants/messages.ts
```

In `src/constants/index.ts`:
- Remove `export * from './paths';`
- Remove `export * from './messages';`
- Remove the `ContentType` enum
- Remove `CONFIG.GITHUB` (only used by deleted GitHub API utils)
- Remove `CONFIG.FILE` (only used by deleted admin image upload)
- Remove `CONFIG.VALIDATION` (only used by deleted `src/core/validation/`)
- Keep: `CONFIG.PAGINATION`, `CONFIG.TYPE_BADGES`, `CONFIG.DEFAULTS`, `CONFIG.CALENDAR`

- [ ] **Step 9: Verify the build**

```bash
npm run build
```

Expected: Build succeeds with no import errors referencing deleted files.

- [ ] **Step 10: Run dev and smoke test all pages**

```bash
npm run dev
```

Visit each page and verify:
- `/` — Home page loads, events display
- `/events` — Event list loads
- `/events/<slug>` — Event detail loads
- `/resources` — Resources list loads with freeform amount strings
- `/scholarships/<slug>` — Resource detail loads
- `/staff` — Staff page loads
- `/studio` — Sanity Studio loads
- `/admin` — Returns 404 (removed)

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: remove old admin pages, APIs, content collections, and domain code"
```
