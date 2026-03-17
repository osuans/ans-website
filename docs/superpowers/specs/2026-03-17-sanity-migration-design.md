# Full Sanity CMS Migration + Dynamic Amount Display

**Date:** 2026-03-17
**Status:** Draft

## Summary

Migrate all content (resources, events, staff) from local Astro content collections and markdown files to Sanity.io. Replace the custom admin interface with embedded Sanity Studio at `/studio`. Additionally, change the resource `amount` field from a numeric type to a freeform string to support varied display formats (e.g., "$25/hr", "$1,000", "Varies").

## 1. Dynamic Amount Field

**Change:** `amount` goes from `number` to `string` across the entire stack.

- **Sanity schema:** `amount` is a `string` field
- **Display:** Render the string as-is, no formatting logic
- **Examples:** `"$1,000"`, `"$25/hr"`, `"Varies"`, `"$3,500 stipend"`

## 2. Sanity Setup

### Dependencies

Install: `sanity`, `@sanity/client`, `@sanity/image-url`, `@sanity/vision`

### Configuration Files

- `sanity.config.ts` — Studio configuration (project ID, dataset, schemas, plugins)
- `sanity.cli.ts` — CLI configuration
- `src/lib/sanity.ts` — Sanity client for frontend queries (projectId, dataset, apiVersion, useCdn)
- `src/lib/image.ts` — Image URL builder helper using `@sanity/image-url`

### Environment Variables

- `SANITY_PROJECT_ID`
- `SANITY_DATASET` (default: `production`)
- `SANITY_API_VERSION` (e.g., `2026-03-17`)
- `SANITY_TOKEN` (for authenticated reads if needed)

### Sanity Studio

Embedded at `/studio` via a catch-all Astro route (`src/pages/studio/[...index].astro`) that renders the Sanity Studio React app. This replaces the entire `/admin` section.

## 3. Sanity Schemas

### Resource (`resource`)

| Field           | Type              | Notes                                      |
|-----------------|-------------------|---------------------------------------------|
| name            | string            | Required                                    |
| slug            | slug              | Source: name                                |
| type            | string            | Options: scholarship, fellowship, internship|
| amount          | string            | Freeform (e.g., "$1,000", "$25/hr")         |
| frequency       | string            | e.g., "Annually", "One-time"               |
| deadline        | date              | Required                                    |
| description     | text              | Required                                    |
| eligibility     | array of strings  | Required, min 1                             |
| applicationUrl  | url               | Optional                                    |
| image           | image             | Optional, with hotspot                      |
| order           | number            | For manual sorting                          |

### Event (`event`)

| Field                | Type              | Notes                                  |
|----------------------|-------------------|----------------------------------------|
| title                | string            | Required                               |
| slug                 | slug              | Source: title                           |
| date                 | datetime          | Event start                            |
| endDate              | datetime          | Optional                               |
| time                 | string            | e.g., "5:00 PM - 8:00 PM"             |
| location             | string            | Required                               |
| image                | image             | With hotspot                           |
| summary              | text              | Required                               |
| body                 | block content     | Rich text (portable text)              |
| tags                 | array of strings  | Optional                               |
| registrationLink     | url               | Optional                               |
| registrationRequired | boolean           | Default: false                         |
| featured             | boolean           | Default: false                         |
| draft                | boolean           | Default: false                         |

### Staff Member (`staffMember`)

| Field  | Type    | Notes                    |
|--------|---------|--------------------------|
| name   | string  | Required                 |
| title  | string  | Required (role/position) |
| image  | image   | With hotspot             |
| email  | string  | Optional                 |
| phone  | string  | Optional                 |
| bio    | text    | Optional                 |
| order  | number  | For manual sorting       |
| draft  | boolean | Default: false           |

## 4. Frontend Changes

### Pages to Update (fetch from Sanity instead of `getCollection`)

| Page                            | Current Source                    | New Source          |
|---------------------------------|----------------------------------|---------------------|
| `src/pages/resources/index.astro` | `getCollection("scholarships")`  | Sanity GROQ query   |
| `src/pages/scholarships/[slug].astro` | `getCollection("scholarships")` | Sanity GROQ query |
| `src/pages/events/index.astro`  | `getCollection("events")`        | Sanity GROQ query   |
| `src/pages/events/[slug].astro` | `getEntry("events", slug)`       | Sanity GROQ query   |
| `src/pages/staff.astro`         | Via `StaffList` component        | Sanity GROQ query   |

### Components to Update

| Component                                  | Change                                          |
|--------------------------------------------|-------------------------------------------------|
| `src/components/UI/ScholarshipCard.astro`  | `amount: number` → `amount: string`, render as-is |
| `src/components/Sections/StaffList.astro`  | Accept staff data as prop instead of `getCollection` |
| `src/components/UI/EventCard.astro` (if exists) | Use Sanity image URLs |

### Image Handling

- Staff and event images currently served from `/uploads/` will be uploaded to Sanity's asset CDN
- Use `@sanity/image-url` builder to generate optimized image URLs
- Create a shared `urlFor(image)` helper in `src/lib/image.ts`

### Dynamic Routes

- `src/pages/scholarships/[slug].astro` — changes from `getStaticPaths()` with `prerender = true` to server-rendered fetching from Sanity by slug
- `src/pages/events/[slug].astro` — same pattern, already server-rendered

## 5. Files to Remove

### Admin Pages (entire section)
- `src/pages/admin/index.astro`
- `src/pages/admin/create.astro`
- `src/pages/admin/edit/[slug].astro`
- `src/pages/admin/delete/[slug].astro`
- `src/pages/admin/scholarships/create.astro`
- `src/pages/admin/scholarships/edit/[slug].astro`
- `src/pages/admin/scholarships/delete/[slug].astro`

### Admin Components
- `src/components/Admin/EventForm.astro`
- `src/components/Admin/ScholarshipForm.astro`
- `src/components/Admin/DeleteConfirmation.astro`

### API Routes
- `src/pages/api/events/create.ts`
- `src/pages/api/events/edit.ts`
- `src/pages/api/events/delete.ts`
- `src/pages/api/scholarships/create.ts`
- `src/pages/api/scholarships/edit.ts`
- `src/pages/api/scholarships/delete.ts`

### Admin Layout
- `src/layouts/AdminLayout.astro`

### Content Collections
- `src/content/scholarships/` — all 4 markdown files
- `src/content/events/` — all 18 markdown files
- `src/content/staff/` — all 10 markdown files + .gitkeep
- `src/content/config.ts` — remove entirely (no more local collections)

### Domain/Validation (replaced by Sanity validation)
- `src/core/entities/Scholarship.ts`
- `src/core/validation/scholarship.schema.ts`

## 6. Content Seeding

All existing content must be migrated to Sanity before removing local files:

- **4 resources** (scholarships/internships) with their data
- **18 events** with their data and images
- **10 staff members** with their data and photos
- All images in `/uploads/staff/` and `/uploads/events/` uploaded to Sanity assets

A one-time migration script (`scripts/seed-sanity.ts`) will read the markdown files and push documents + images to Sanity.

## 7. What Stays Unchanged

- `astro.config.mjs` — only needs Sanity Studio integration added
- All non-content pages (home, about-us, join, etc.) — only update data-fetching calls
- Existing page layouts and styling
- URL structure (`/resources`, `/scholarships/[slug]`, `/events/[slug]`, `/staff`)
- Utility functions not tied to admin CRUD (dateUtils, stringHelpers, slugify, etc.)

## 8. GROQ Queries (Key Examples)

```groq
// All resources, sorted by deadline
*[_type == "resource"] | order(deadline asc) {
  name, slug, type, amount, deadline, description, "imageUrl": image.asset->url
}

// Single resource by slug
*[_type == "resource" && slug.current == $slug][0]

// Upcoming events (non-draft)
*[_type == "event" && !draft && date >= now()] | order(date asc) {
  title, slug, date, time, location, summary, featured, "imageUrl": image.asset->url
}

// All staff, sorted by order
*[_type == "staffMember" && !draft] | order(order asc) {
  name, title, bio, "imageUrl": image.asset->url
}
```
