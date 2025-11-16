import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import { getEntry } from 'astro:content';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const slug = String(formData.get('slug') ?? '');

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
    }

    const event = await getEntry('events', slug);
    if (!event) {
      // Event already deleted, which is fine. Redirect gracefully.
      return redirect('/admin', 303);
    }

    // Delete the markdown file
    const markdownPath = path.join(process.cwd(), 'src/content/events', `${slug}.md`);
    await fs.unlink(markdownPath);

    // Delete the associated image directory
    const uploadsDir = path.join(process.cwd(), 'public', event.data.image.substring(0, event.data.image.lastIndexOf('/')));
    await fs.rm(uploadsDir, { recursive: true, force: true });

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to delete event:', error);
    return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500 });
  }
};