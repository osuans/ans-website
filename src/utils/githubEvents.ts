const OWNER = import.meta.env.GITHUB_OWNER;
const REPO = import.meta.env.GITHUB_REPO;
const BRANCH = import.meta.env.GITHUB_BRANCH || "main";
const TOKEN = import.meta.env.GITHUB_TOKEN;


const BASE_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

/**
 * Create or update a file in GitHub (used for event .md files & images).
 */
export async function commitFileToGitHub(
  repoPath: string,
  content: string | Buffer,
  isBinary = false,
  sha?: string, // Accept SHA as a parameter
) {
  if (!TOKEN || !OWNER || !REPO) {
    console.warn("GitHub credentials missing. Skipping commit.");
    return;
  }

  const base64 = Buffer.from(content).toString("base64");

  console.log("Committing to:", `${BASE_URL}/${encodeURIComponent(repoPath)}`, {
  branch: BRANCH,
  hasSha: !!sha,
  sha,
});


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

  const fileData = await getFileFromGitHub(repoPath);
  if (!fileData?.sha) {
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
      sha: fileData.sha, // Use the sha from the file data
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

// In src/utils/githubEvents.ts

export async function getFileFromGitHub(path: string): Promise<{ sha: string; content: string; name: string; } | null> {
  const url = `${BASE_URL}/${encodeURIComponent(path)}?ref=${BRANCH}`;

  try {
    const response = await fetch(url, {
      headers: {
        // Use Bearer for consistency
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // File doesn't exist, which is a valid case
      }
      throw new Error(`GitHub API responded with ${response.status} for path ${path}`);
    }

    const data = await response.json();
    // The content is base64 encoded, but for this use case, we only need the sha.
    return { sha: data.sha, content: data.content, name: data.name };
  } catch (error) {
    console.error(`Failed to get file from GitHub: ${path}`, error);
    throw error;
  }
}
