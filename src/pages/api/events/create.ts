import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';
import { commitFileToGitHub } from '../../../utils/githubEvents';
import { slugify } from '../../../utils/slugify';
import { createValidationError, createServerError } from '../../../utils/apiHelpers';
import { CONFIG } from '../../../constants';

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

    // Required validation (image is now optional)
    if (!title || !date || !location || !summary) {
      return createValidationError("Missing required fields");
    }

    const slug = slugify(title);
    if (!slug) {
      return createValidationError("Title must contain valid characters to generate a slug");
    }

    // Handle image upload if provided
    let imageUrl: string = CONFIG.DEFAULTS.EVENT_IMAGE; // Use default image

    if (imageFile instanceof File && imageFile.size > 0) {
      // Validate image type
      if (!imageFile.type.startsWith("image/")) {
        return createValidationError("Uploaded file must be an image");
      }

      // Paths
      const imageRepoDir = `public/uploads/events/${slug}`;

      // Create repo image filename
      const extension = imageFile.name.split('.').pop() || 'png';
      const fileName = `event-${Date.now()}.${extension}`;
      const imageRepoPath = `${imageRepoDir}/${fileName}`;

      // Convert image
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

      // Commit image to GitHub (binary)
      await commitFileToGitHub(imageRepoPath, imageBuffer, true);

      imageUrl = `/uploads/events/${slug}/${fileName}`;
    }

    // Paths
    const markdownRepoPath = `src/content/events/${slug}.md`;

    // Construct frontmatter
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

    // Commit markdown to GitHub
    await commitFileToGitHub(markdownRepoPath, content);

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to create event:', error);
    return createServerError();
  }
};
