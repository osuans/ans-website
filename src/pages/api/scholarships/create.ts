import type { APIRoute } from 'astro';
import { commitFileToGitHub, getFileFromGitHub } from '../../../utils/githubEvents';

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

    const name = String(formData.get('name') ?? '');
    const amount = Number(formData.get('amount') ?? 0);
    const frequency = String(formData.get('frequency') ?? '');
    const deadline = String(formData.get('deadline') ?? '');
    const description = String(formData.get('description') ?? '');
    const eligibility = String(formData.get('eligibility') ?? '');

    if (!name || !amount || !frequency || !deadline || !description || !eligibility) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const slug = createSlug(name);
    if (!slug) {
      return new Response(JSON.stringify({ error: "Name must contain valid characters to generate a slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const markdownRepoPath = `src/content/scholarships/${slug}.md`;

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

    const content = `${frontmatter}\n`;

    // Check if file already exists and get its SHA if it does
    const existingFile = await getFileFromGitHub(markdownRepoPath);
    const existingFileSha = existingFile?.sha;

    // Commit markdown to GitHub
    await commitFileToGitHub(markdownRepoPath, content, false, existingFileSha);

    return redirect('/admin', 303);

  } catch (error) {
    console.error('Failed to create scholarship:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
