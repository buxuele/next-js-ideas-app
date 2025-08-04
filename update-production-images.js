const fs = require("fs");
const path = require("path");

/**
 * 更新生产环境图片列表的脚本
 * 扫描本地 public/imgs 文件夹，生成当前的文件列表
 */

function scanImagesFolder() {
  const imgsPath = path.join(__dirname, "public", "imgs");
  const result = {};

  if (!fs.existsSync(imgsPath)) {
    console.error("Images folder not found:", imgsPath);
    return result;
  }

  // 读取所有子文件夹
  const folders = fs
    .readdirSync(imgsPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  console.log("Found folders:", folders);

  // 扫描每个文件夹中的图片
  folders.forEach((folder) => {
    const folderPath = path.join(imgsPath, folder);
    const files = fs.readdirSync(folderPath);

    // 过滤图片文件
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .sort();

    result[folder] = imageFiles;
    console.log(`${folder}: ${imageFiles.length} images`);
    imageFiles.forEach((file) => console.log(`  - ${file}`));
  });

  return result;
}

// 执行扫描
const imagesList = scanImagesFolder();

// 输出结果
console.log("\n=== 当前图片文件列表 ===");
console.log(JSON.stringify(imagesList, null, 2));

// 生成用于更新 API 的代码片段
console.log("\n=== 用于更新 API 的代码片段 ===");
console.log(
  "const PRODUCTION_IMAGES = " + JSON.stringify(imagesList, null, 2) + ";"
);
