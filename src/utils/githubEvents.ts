// src/lib/github.ts

const OWNER = process.env.GITHUB_OWNER!;
const REPO = process.env.GITHUB_REPO!;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN!;

const BASE_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

/**
 * Fetch SHA of a file from GitHub so we can update or delete it.
 */
async function getSha(path: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(path)}?ref=${BRANCH}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.sha ?? null;
}

/**
 * Create or update a file in GitHub (used for event .md files & images).
 */
export async function commitFileToGitHub(
  repoPath: string,
  content: string | Buffer,
  isBinary = false
) {
  if (!TOKEN || !OWNER || !REPO) {
    console.warn("GitHub credentials missing. Skipping commit.");
    return;
  }

  const sha = await getSha(repoPath);
  const base64 = Buffer.from(content).toString("base64");

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(repoPath)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: sha
        ? `chore(events): update ${repoPath}`
        : `chore(events): create ${repoPath}`,
      content: base64,
      branch: BRANCH,
      sha: sha ?? undefined,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("GitHub commit failed:", txt);
    throw new Error(`Failed to commit ${repoPath}`);
  }
}

/**
 * Delete a file from GitHub by path.
 */
export async function deleteFileFromGitHub(repoPath: string) {
  if (!TOKEN || !OWNER || !REPO) {
    console.warn("GitHub credentials missing. Skipping delete.");
    return;
  }

  const sha = await getSha(repoPath);
  if (!sha) {
    console.warn(`File not found on GitHub: ${repoPath}`);
    return;
  }

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(repoPath)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      message: `chore(events): delete ${repoPath}`,
      branch: BRANCH,
      sha,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("GitHub delete failed:", txt);
    throw new Error(`Failed to delete ${repoPath}`);
  }
}

/**
 * List all files in a GitHub directory (used to delete all event images).
 */
export async function getDirectoryFilesFromGitHub(directory: string) {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(directory)}?ref=${BRANCH}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
