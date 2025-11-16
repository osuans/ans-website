import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { deleteFileFromGitHub } from '../../../utils/githubEvents'; // ⬅ helper we created earlier

function extractImageFolder(imageUrl: string): string {
  // from /uploads/events/slug/filename.jpg => uploads/events/slug
  const parts = imageUrl.split('/');
  return parts.slice(1, -1).join('/'); // remove leading slash + filename
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
      return redirect('/admin', 303); // Already gone, no problem
    }

    // Markdown file path in repo
    const markdownRepoPath = `src/content/events/${slug}.md`;

    // Delete markdown file from GitHub
    await deleteFileFromGitHub(markdownRepoPath);

    // Extract GitHub folder containing event images
    const imagePath = event.data.image as string;
    const imageFolder = extractImageFolder(imagePath);
    const imageRepoDir = `public/${imageFolder}`;

    // Delete entire image folder
    await deleteFileFromGitHub(imageRepoDir);

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to delete event:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};
