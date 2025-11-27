import type { APIRoute } from 'astro';
import { commitFileToGitHub, getFileFromGitHub } from '../../../utils/githubEvents';
import { slugify } from '../../../utils/slugify';
import { createValidationError, createServerError } from '../../../utils/apiHelpers';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const formData = await request.formData();

    const name = String(formData.get('name') ?? '');
    const type = String(formData.get('type') ?? '');
    const amount = Number(formData.get('amount') ?? 0);
    const frequency = String(formData.get('frequency') ?? '');
    const deadline = String(formData.get('deadline') ?? '');
    const description = String(formData.get('description') ?? '');
    const eligibility = String(formData.get('eligibility') ?? '');

    if (!name || !type || !amount || !frequency || !deadline || !description || !eligibility) {
      return createValidationError();
    }

    const slug = slugify(name);
    if (!slug) {
      return createValidationError("Name must contain valid characters to generate a slug");
    }

    const markdownRepoPath = `src/content/scholarships/${slug}.md`;

    const frontmatter = [
      '---',
      `name: "${name.replace(/"/g, '\\"')}"`,
      `type: "${type}"`,
      `amount: ${amount}`,
      `frequency: "${frequency.replace(/"/g, '\\"')}"`,
      `deadline: ${deadline}`,
      `description: "${description.replace(/"/g, '\\"')}"`,
      `eligibility:\n${eligibility.split('\n').map(e => `  - "${e.trim().replace(/"/g, '\\"')}"`).join('\n')}`,
      '---'
    ].filter(Boolean).join('\n');

    const content = `${frontmatter}\n`;

    // Check if file already exists and get its SHA if it does
    const existingFile = await getFileFromGitHub(markdownRepoPath);
    const existingFileSha = existingFile?.sha;

    // Commit markdown to GitHub
    await commitFileToGitHub(markdownRepoPath, content, false, existingFileSha);

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to create scholarship:', error);
    return createServerError();
  }
};
