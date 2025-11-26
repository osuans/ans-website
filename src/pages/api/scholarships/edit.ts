import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { commitFileToGitHub, deleteFileFromGitHub, getFileFromGitHub } from '../../../utils/githubEvents';

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
    const name = String(formData.get('name') ?? '');
    const amount = Number(formData.get('amount') ?? 0);
    const frequency = String(formData.get('frequency') ?? '');
    const deadline = String(formData.get('deadline') ?? '');
    const description = String(formData.get('description') ?? '');
    const eligibility = String(formData.get('eligibility') ?? '');

    if (!originalSlug || !name || !amount || !frequency || !deadline || !description || !eligibility) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const existingScholarship = await getEntry('scholarships', originalSlug);
    if (!existingScholarship) {
      return new Response(JSON.stringify({ error: "Scholarship not found" }), { status: 404 });
    }

    const newSlug = createSlug(name);

    if (newSlug !== originalSlug) {
      const oldMarkdownPath = `src/content/scholarships/${originalSlug}.md`;
      await deleteFileFromGitHub(oldMarkdownPath);
    }

    const frontmatter = [
      '---',
      `name: "${name.replace(/"/g, '\\"')}"`,
      `amount: ${amount}`,
      `frequency: "${frequency.replace(/"/g, '\\"')}"`,
      `deadline: ${deadline}`,
      `description: "${description.replace(/"/g, '\\"')}"`,
      `eligibility:\n${eligibility.split('\n').map(e => `  - "${e.trim().replace(/"/g, '\\"')}"`).join('\n')}`,
      '---'
    ].filter(Boolean).join('\n');

    const markdown = `${frontmatter}\n`;

    let existingFileSha: string | undefined;
    if (newSlug === originalSlug) {
      const existingFileData = await getFileFromGitHub(`src/content/scholarships/${originalSlug}.md`);
      existingFileSha = existingFileData?.sha;
    }

    const newMarkdownPath = `src/content/scholarships/${newSlug}.md`;
    await commitFileToGitHub(
      newMarkdownPath,
      markdown,
      false,
      newSlug === originalSlug ? existingFileSha : undefined
    );

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to edit scholarship:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
};