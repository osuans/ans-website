import type { APIRoute } from 'astro';
import { commitFileToGitHub } from '../../../utils/githubEvents';

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
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const newSlug = createSlug(name);

    const frontmatter = [
      '---',
      `name: "${name.replace(/