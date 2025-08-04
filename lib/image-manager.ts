import fs from "fs";
import path from "path";

export interface ImageInfo {
  filename: string;
  url: string;
  localPath: string;
}

export class ImageManager {
  private readonly GITHUB_REPO =
    "https://raw.githubusercontent.com/buxuele/next-js-ideas-app/main";
  private readonly LOCAL_IMAGE_DIR = "public/imgs/good_art";

  /**
   * 获取图片URL - 根据环境返回本地或GitHub URL
   */
  getImageUrl(filename: string): string {
    if (process.env.NODE_ENV === "development") {
      // 本地开发环境，直接使用public目录的静态文件
      return `/imgs/good_art/${filename}`;
    } else {
      // 生产环境，使用GitHub raw URL
      return `${this.GITHUB_REPO}/imgs/good_art/${filename}`;
    }
  }

  /**
   * 获取所有图片信息
   */
  getAllImages(): ImageInfo[] {
    try {
      const imageDir = path.join(process.cwd(), this.LOCAL_IMAGE_DIR);

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
        url: this.getImageUrl(filename),
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
  getImageMetadata(filename: string) {
    try {
      const imagePath = path.join(
        process.cwd(),
        this.LOCAL_IMAGE_DIR,
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
        url: this.getImageUrl(filename),
      };
    } catch (error) {
      console.error(`Error getting metadata for ${filename}:`, error);
      return null;
    }
  }
}
