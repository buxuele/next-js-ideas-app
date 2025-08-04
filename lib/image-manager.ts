import fs from "fs";
import path from "path";

export interface ImageInfo {
  filename: string;
  url: string;
  localPath?: string;
}

export class ImageManager {
  private readonly GITHUB_REPO =
    "https://raw.githubusercontent.com/buxuele/next-js-ideas-app/main/public";
  private readonly LOCAL_IMAGE_DIR = "public/imgs/good_art";

  /**
   * 获取图片URL - 根据环境返回本地或GitHub URL
   */
  getImageUrl(filename: string, folder: string = "good_art"): string {
    if (process.env.NODE_ENV === "development") {
      // 本地开发环境，直接使用public目录的静态文件
      return `/imgs/${folder}/${filename}`;
    } else {
      // 生产环境，使用GitHub raw URL
      return `${this.GITHUB_REPO}/imgs/${encodeURIComponent(
        folder
      )}/${encodeURIComponent(filename)}`;
    }
  }

  /**
   * 获取所有图片信息
   */
  getAllImages(folder: string = "good_art"): ImageInfo[] {
    // 在生产环境中，不读取文件系统，直接返回空数组
    // 应该使用 API 路由来获取图片列表
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "ImageManager.getAllImages() should not be used in production. Use API routes instead."
      );
      return [];
    }

    try {
      const imageDir = path.join(process.cwd(), "public", "imgs", folder);

      // 检查目录是否存在
      if (!fs.existsSync(imageDir)) {
        console.warn(`Image directory not found: ${imageDir}`);
        return [];
      }

      const files = fs.readdirSync(imageDir);

      // 过滤图片文件
      const imageFiles = files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      });

      // 按文件名排序
      imageFiles.sort();

      return imageFiles.map((filename) => ({
        filename,
        url: this.getImageUrl(filename, folder),
        localPath: path.join(imageDir, filename),
      }));
    } catch (error) {
      console.error("Error reading image directory:", error);
      return [];
    }
  }

  /**
   * 获取图片的元数据
   */
  getImageMetadata(filename: string, folder: string = "good_art") {
    // 在生产环境中，不读取文件系统
    if (process.env.NODE_ENV === "production") {
      return {
        filename,
        url: this.getImageUrl(filename, folder),
      };
    }

    try {
      const imagePath = path.join(
        process.cwd(),
        "public",
        "imgs",
        folder,
        filename
      );

      if (!fs.existsSync(imagePath)) {
        return null;
      }

      const stats = fs.statSync(imagePath);

      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: this.getImageUrl(filename, folder),
      };
    } catch (error) {
      console.error(`Error getting metadata for ${filename}:`, error);
      return null;
    }
  }
}
