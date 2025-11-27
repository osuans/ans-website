import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { deleteFileFromGitHub } from '../../../utils/githubEvents';
import { createValidationError, createServerError } from '../../../utils/apiHelpers';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();
    const slug = String(formData.get('slug') ?? '');

    if (!slug) {
      return createValidationError("Missing slug");
    }

    const scholarship = await getEntry('scholarships', slug);
    if (!scholarship) {
      return redirect('/admin', 303); // If already gone, we treat as success
    }

    const markdownRepoPath = `src/content/scholarships/${slug}.md`;
    await deleteFileFromGitHub(markdownRepoPath);

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to delete scholarship:', error);
    return createServerError();
  }
};
