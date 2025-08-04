// GitHub 图片存储工具
export class GitHubImageStorage {
  private owner: string;
  private repo: string;
  private token: string;
  private branch: string;

  constructor() {
    this.owner = process.env.GITHUB_OWNER!;
    this.repo = process.env.GITHUB_REPO!;
    this.token = process.env.GITHUB_TOKEN!;
    this.branch = process.env.GITHUB_BRANCH || "main";
  }

  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Content = buffer.toString("base64");

      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Upload image: ${path}`,
            content: base64Content,
            branch: this.branch,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      // 返回 GitHub raw URL
      return `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${path}`;
    } catch (error) {
      console.error("Error uploading to GitHub:", error);
      throw error;
    }
  }

  generateImagePath(userId: string, filename: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
    return `uploads/${userId}/${timestamp}-${randomString}.${extension}`;
  }
}
