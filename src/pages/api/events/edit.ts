import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { commitFileToGitHub, deleteFileFromGitHub } from '../../../utils/githubEvents'; // <-- GitHub helper

function extractImageFolder(imageUrl: string): string {
  // from "/uploads/events/slug/file.jpg" → "public/uploads/events/slug"
  return `public${imageUrl.substring(0, imageUrl.lastIndexOf('/'))}`;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

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

    if (!slug || !title || !date || !location || !summary) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const existingEvent = await getEntry('events', slug);
    if (!existingEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

    let imageUrl = existingEvent.data.image as string;
    const oldImageUrl = existingEvent.data.image as string;

    // If a new image was uploaded, replace the old one
    if (imageFile instanceof File && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return new Response(JSON.stringify({ error: "Uploaded file must be an image" }), { status: 400 });
      }

      // Delete old image from GitHub
      const oldImageFolder = extractImageFolder(oldImageUrl);
      const oldFileName = oldImageUrl.split('/').pop();
      if (oldFileName) {
        await deleteFileFromGitHub(`${oldImageFolder}/${oldFileName}`);
      }

      // Upload new image
      const extension = imageFile.name.split('.').pop() || 'png';
      const fileName = `event-${Date.now()}.${extension}`;
      const repoImagePath = `public/uploads/events/${slug}/${fileName}`;

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await commitFileToGitHub(repoImagePath, buffer, true);

      imageUrl = `/uploads/events/${slug}/${fileName}`;
    }

    const markdownRepoPath = `src/content/events/${slug}.md`;

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

    const markdown = `${frontmatter}\n\n${body}`;

    // Commit updated markdown file
    await commitFileToGitHub(markdownRepoPath, markdown);

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to edit event:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
