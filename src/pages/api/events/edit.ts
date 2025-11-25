import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { commitFileToGitHub, deleteFileFromGitHub, getFileFromGitHub } from '../../../utils/githubEvents'; // <-- GitHub helper

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

    const originalSlug = String(formData.get('slug') ?? '');
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

    if (!originalSlug || !title || !date || !location || !summary) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const existingEvent = await getEntry('events', originalSlug);
    if (!existingEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
    }

    let imageUrl = existingEvent.data.image as string;
    const oldImageUrl = existingEvent.data.image as string;

    const newSlug = createSlug(title);

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
      const newFileName = `event-${Date.now()}.${extension}`;
      const repoImagePath = `public/uploads/events/${newSlug}/${newFileName}`;

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await commitFileToGitHub(repoImagePath, buffer, true);

      imageUrl = `/uploads/events/${newSlug}/${newFileName}`;
    }

    // Handle slug change (rename)
    if (newSlug !== originalSlug) {
      // Delete the old markdown file
      const oldMarkdownPath = `src/content/events/${originalSlug}.md`;
      await deleteFileFromGitHub(oldMarkdownPath);
      // Note: We are not renaming the image folder here for simplicity, but you could add that logic.
    }



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
    let existingFileSha: string | undefined;
    // Only provide a SHA if we are updating a file, not creating a new one (slug hasn't changed)
    if (newSlug === originalSlug) {
      const existingFileData = await getFileFromGitHub(`src/content/events/${originalSlug}.md`);
      existingFileSha = existingFileData?.sha;
    }

    const newMarkdownPath = `src/content/events/${newSlug}.md`;
    await commitFileToGitHub(
  newMarkdownPath,
  markdown,
  false,
  newSlug === originalSlug ? existingFileSha : undefined // ⬅ ensure sha not included
);


    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to edit event:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
