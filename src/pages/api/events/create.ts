import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

// Helper: slugify title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Collapse whitespace and hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const title = String(formData.get('title') ?? '');
    const date = String(formData.get('date') ?? '');
    const endDate = String(formData.get('endDate') ?? '');
    const time = String(formData.get('time') ?? '');
    const location = String(formData.get('location') ?? '');
    const summary = String(formData.get('summary') ?? '');
    const tags = String(formData.get('tags') ?? '');
    const registrationLink = String(formData.get('registrationLink') ?? '');
    const registrationRequired = formData.get('registrationRequired') === 'on';
    const draft = formData.get('draft') === 'on';
    const body = String(formData.get('body') ?? '');
    const imageFile = formData.get('image');

    // Required validation
    if (!title || !date || !location || !summary || !(imageFile instanceof File) || imageFile.size === 0) {
      return new Response(JSON.stringify({ error: "Missing required fields or empty image file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!imageFile.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Uploaded file must be an image" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const slug = createSlug(title);
    if (!slug) {
      return new Response(JSON.stringify({ error: "Title must contain valid characters to generate a slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Directory paths
    const eventsDir = path.join(process.cwd(), 'src/content/events');
    const uploadsDir = path.join(process.cwd(), 'public/uploads/events', slug);

    // Ensure directories exist before checking for file
    await fs.mkdir(eventsDir, { recursive: true });

    const markdownFilePath = path.join(eventsDir, `${slug}.md`);
    try {
      await fs.access(markdownFilePath);
      return new Response(JSON.stringify({ error: "Event with this title already exists" }), {
        status: 409, // Conflict
        headers: { "Content-Type": "application/json" }
      });
    } catch {
      // File doesn't exist, which is good.
    }

    await fs.mkdir(uploadsDir, { recursive: true });

    // Save uploaded image
    const extension = imageFile.name.split('.').pop() || 'png';
    const fileName = `event-${Date.now()}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    await fs.writeFile(filePath, imageBuffer);

    const imageUrl = `/uploads/events/${slug}/${fileName}`;

    // Generate clean frontmatter
    const frontmatter = [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: ${date}`,
      endDate && `endDate: ${endDate}`,
      time && `time: "${time}"`,
      `location: "${location.replace(/"/g, '\\"')}"`,
      `image: "${imageUrl}"`,
      `summary: "${summary.replace(/"/g, '\\"')}"`,
      tags && `tags:\n${tags.split(',').map(t => `  - ${t.trim()}`).join('\n')}`,
      registrationLink && `registrationLink: "${registrationLink}"`,
      `registrationRequired: ${registrationRequired}`,
      `draft: ${draft}`,
      '---'
    ].filter(Boolean).join('\n');

    const content = `${frontmatter}\n\n${body}`;

    await fs.writeFile(markdownFilePath, content, "utf-8");

    // Use the modern redirect helper
    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to create event:', error);
    // Return a generic error response if something unexpected happens
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
