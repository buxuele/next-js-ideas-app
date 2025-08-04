import fs from "fs";
import path from "path";

export interface ImageInfo {
  filename: string;
  url: string;
  folder: string;
}

// GitHub API 响应类型定义
interface GitHubFileItem {
  name: string;
  type: "file" | "dir";
  size?: number;
  download_url?: string;
}

interface GitHubDirectoryItem {
  name: string;
  type: "file" | "dir";
  size?: number;
}

class ImageCacheService {
  private cache: Map<string, ImageInfo[]> = new Map();
  private lastUpdate: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 获取GitHub仓库中的图片文件列表
   */
  private async fetchGitHubImages(folder: string): Promise<ImageInfo[]> {
    try {
      const apiUrl = `https://api.github.com/repos/buxuele/next-js-ideas-app/contents/public/imgs/${encodeURIComponent(
        folder
      )}`;

      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "next-js-ideas-app",
        },
      });

      if (!response.ok) {
        console.warn(
          `Failed to fetch GitHub folder contents for ${folder}:`,
          response.status
        );
        return [];
      }

      const files = await response.json();

      if (!Array.isArray(files)) {
        console.warn(`Unexpected response format for folder ${folder}`);
        return [];
      }

      // 过滤出图片文件
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
      ];
      const imageFiles = (files as GitHubFileItem[])
        .filter((file) => file.type === "file")
        .map((file) => file.name)
        .filter((filename: string) => {
          const ext = filename
            .toLowerCase()
            .substring(filename.lastIndexOf("."));
          return imageExtensions.includes(ext);
        })
        .sort();

      const GITHUB_REPO_BASE =
        "https://raw.githubusercontent.com/buxuele/next-js-ideas-app/main/public/imgs";

      return imageFiles.map((filename) => ({
        filename,
        url: `${GITHUB_REPO_BASE}/${encodeURIComponent(
          folder
        )}/${encodeURIComponent(filename)}`,
        folder,
      }));
    } catch (error) {
      console.error(`Error fetching GitHub files for folder ${folder}:`, error);
      return [];
    }
  }

  /**
   * 获取本地图片文件列表
   */
  private getLocalImages(folder: string): ImageInfo[] {
    try {
      const folderPath = path.join(process.cwd(), "public", "imgs", folder);

      if (!fs.existsSync(folderPath)) {
        return [];
      }

      const files = fs.readdirSync(folderPath);
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
      ];

      const imageFiles = files
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .sort();

      return imageFiles.map((filename) => ({
        filename,
        url: `/imgs/${folder}/${filename}`,
        folder,
      }));
    } catch (error) {
      console.error(`Error reading local images for folder ${folder}:`, error);
      return [];
    }
  }

  /**
   * 获取图片列表（带缓存）
   */
  async getImages(folder: string): Promise<ImageInfo[]> {
    const now = Date.now();
    const lastUpdate = this.lastUpdate.get(folder) || 0;

    // 检查缓存是否有效
    if (this.cache.has(folder) && now - lastUpdate < this.CACHE_DURATION) {
      return this.cache.get(folder)!;
    }

    let images: ImageInfo[];

    if (process.env.NODE_ENV === "production") {
      // 生产环境：从GitHub获取
      images = await this.fetchGitHubImages(folder);
    } else {
      // 开发环境：从本地文件系统获取
      images = this.getLocalImages(folder);
    }

    // 更新缓存
    this.cache.set(folder, images);
    this.lastUpdate.set(folder, now);

    return images;
  }

  /**
   * 获取所有文件夹列表
   */
  async getFolders(): Promise<string[]> {
    if (process.env.NODE_ENV === "production") {
      // 生产环境：从GitHub获取文件夹列表
      try {
        const apiUrl = `https://api.github.com/repos/buxuele/next-js-ideas-app/contents/public/imgs`;

        const response = await fetch(apiUrl, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "next-js-ideas-app",
          },
        });

        if (!response.ok) {
          console.warn(
            `Failed to fetch GitHub folder contents:`,
            response.status
          );
          return [];
        }

        const items = await response.json();

        if (!Array.isArray(items)) {
          console.warn(`Unexpected response format for folders`);
          return [];
        }

        return (items as GitHubDirectoryItem[])
          .filter((item) => item.type === "dir")
          .map((item) => item.name)
          .sort();
      } catch (error) {
        console.error(`Error fetching GitHub folders:`, error);
        return [];
      }
    } else {
      // 开发环境：从本地文件系统获取
      try {
        const imgsPath = path.join(process.cwd(), "public", "imgs");

        if (!fs.existsSync(imgsPath)) {
          return [];
        }

        const items = fs.readdirSync(imgsPath, { withFileTypes: true });
        return items
          .filter((item) => item.isDirectory())
          .map((item) => item.name)
          .sort();
      } catch (error) {
        console.error("Error reading local folders:", error);
        return [];
      }
    }
  }

  /**
   * 清除缓存
   */
  clearCache(folder?: string) {
    if (folder) {
      this.cache.delete(folder);
      this.lastUpdate.delete(folder);
    } else {
      this.cache.clear();
      this.lastUpdate.clear();
    }
  }
}

// 单例实例
export const imageCache = new ImageCacheService();
