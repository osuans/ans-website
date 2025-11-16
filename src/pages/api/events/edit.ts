import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import { getEntry } from 'astro:content';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    // Safely get form data
    const slug = String(formData.get('slug') ?? '');
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
    // Core validation
    if (!slug || !title || !date || !location || !summary) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const existingEvent = await getEntry('events', slug);
    if (!existingEvent) {
      return new Response(JSON.stringify({ error: "Event to edit not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    let imageUrl = existingEvent.data.image;

    // Handle new image upload
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return new Response(JSON.stringify({ error: "Uploaded file must be an image" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      const uploadsDir = path.join(process.cwd(), 'public/uploads/events', slug);
      await fs.mkdir(uploadsDir, { recursive: true });

      // Optional: Clean up old images before saving the new one
      // try { await fs.rm(uploadsDir, { recursive: true, force: true }); await fs.mkdir(uploadsDir, { recursive: true }); } catch (e) { console.error("Failed to clean old image directory:", e); }

      const extension = imageFile.name.split('.').pop() || 'png';
      const fileName = `event-${Date.now()}.${extension}`;
      const filePath = path.join(uploadsDir, fileName);
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, imageBuffer);

      imageUrl = `/uploads/events/${slug}/${fileName}`;
    }

    const filePath = path.join(process.cwd(), 'src/content/events', `${slug}.md`);

    // Build the frontmatter cleanly
    const frontmatter = [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: ${date}`,
      endDate && `endDate: ${endDate}`,
      time && `time: "${time}"`,
      `location: "${location.replace(/"/g, '\\"')}"`,
      `image: "${imageUrl}"`,
      `summary: "${summary.replace(/"/g, '\\"')}"`,
      tags && `tags:\n${tags.split(',').map(tag => `  - ${tag.trim()}`).join('\n')}`,
      registrationLink && `registrationLink: "${registrationLink}"`,
      `registrationRequired: ${registrationRequired}`,
      `draft: ${draft}`,
      '---'
    ].filter(Boolean).join('\n');

    const content = `${frontmatter}\n\n${body}`;

    await fs.writeFile(filePath, content, "utf-8");

    // Redirect back to the events list on success
    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to edit event:', error);
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
