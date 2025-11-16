import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { deleteFileFromGitHub, getDirectoryFilesFromGitHub } from '../../../utils/githubEvents';

function extractImageFolder(imageUrl: string): string {
  // "/uploads/events/slug/file.jpg" → "uploads/events/slug"
  const parts = imageUrl.split('/');
  return parts.slice(1, -1).join('/');
}

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const slug = String(formData.get('slug') ?? '');

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
    }

    const event = await getEntry('events', slug);
    if (!event) {
      return redirect('/admin', 303); // If already gone, we treat as success
    }

    // 1️⃣ Delete markdown
    const markdownRepoPath = `src/content/events/${slug}.md`;
    await deleteFileFromGitHub(markdownRepoPath);

    // 2️⃣ Delete associated images
    const imageUrl = event.data.image as string;
    const folder = extractImageFolder(imageUrl); // uploads/events/slug
    const repoDir = `public/${folder}`;

    const files = await getDirectoryFilesFromGitHub(repoDir);

    for (const file of files) {
      if (file.type === 'file') {
        await deleteFileFromGitHub(`${repoDir}/${file.name}`);
      }
    }

    // After deleting all files, attempt to delete the now-empty directory.
    // This helps keep the repository clean.
    await deleteFileFromGitHub(repoDir).catch(e => console.warn(`Could not delete folder ${repoDir}. It might not be empty or already gone.`));

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to delete event:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
