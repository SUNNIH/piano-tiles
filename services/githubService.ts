
const GITHUB_API_BASE = 'https://api.github.com';

export const githubService = {
  /**
   * Fetch user profile info using access token
   */
  async getUser(token: string) {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch GitHub user');
    return response.json();
  },

  /**
   * List user repositories
   */
  async listRepos(token: string) {
    const response = await fetch(`${GITHUB_API_BASE}/user/repos?sort=updated&per_page=20`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!response.ok) throw new Error('Failed to list repositories');
    return response.json();
  },

  /**
   * Create a new repository
   */
  async createRepo(token: string, name: string, description: string) {
    const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        auto_init: true,
      }),
    });
    if (!response.ok) throw new Error('Failed to create repository');
    return response.json();
  },

  /**
   * Commit a file to a repository
   */
  async commitFile(token: string, owner: string, repo: string, path: string, content: string, message: string) {
    // 1. Get current file SHA if it exists (for updates)
    let sha: string | undefined;
    try {
      const getRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}` },
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File probably doesn't exist, which is fine for creation
    }

    // 2. Commit/Update file
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: btoa(content), // GitHub API requires base64
        sha,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to commit file');
    }
    return response.json();
  }
};
