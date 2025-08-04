const fs = require("fs");
const path = require("path");

/**
 * 验证图片文件的脚本
 * 1. 检查本地文件是否存在
 * 2. 验证GitHub URL是否可访问
 * 3. 生成部署报告
 */

const GITHUB_REPO_BASE =
  "https://raw.githubusercontent.com/buxuele/next-js-ideas-app/main/public/imgs";

async function checkGitHubUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return {
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    return {
      accessible: false,
      error: error.message,
    };
  }
}

async function verifyImages() {
  const imgsPath = path.join(__dirname, "public", "imgs");

  if (!fs.existsSync(imgsPath)) {
    console.error("Images folder not found:", imgsPath);
    return;
  }

  const folders = fs
    .readdirSync(imgsPath, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  console.log("=== 图片验证报告 ===\n");

  let totalImages = 0;
  let accessibleImages = 0;
  let inaccessibleImages = [];

  for (const folder of folders) {
    console.log(`📁 ${folder}`);

    const folderPath = path.join(imgsPath, folder);
    const files = fs.readdirSync(folderPath);

    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    console.log(`   本地图片数量: ${imageFiles.length}`);
    totalImages += imageFiles.length;

    // 检查前3个图片的GitHub访问性（避免API限制）
    const samplesToCheck = imageFiles.slice(0, 3);

    for (const filename of samplesToCheck) {
      const githubUrl = `${GITHUB_REPO_BASE}/${encodeURIComponent(
        folder
      )}/${encodeURIComponent(filename)}`;
      const result = await checkGitHubUrl(githubUrl);

      if (result.accessible) {
        console.log(`   ✅ ${filename} - 可访问`);
        accessibleImages++;
      } else {
        console.log(
          `   ❌ ${filename} - 不可访问 (${result.status || result.error})`
        );
        inaccessibleImages.push({
          folder,
          filename,
          url: githubUrl,
          error: result.error || `${result.status} ${result.statusText}`,
        });
      }

      // 添加延迟避免GitHub API限制
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (imageFiles.length > 3) {
      console.log(
        `   ℹ️  只检查了前3个图片，剩余 ${imageFiles.length - 3} 个未检查`
      );
    }

    console.log("");
  }

  console.log("=== 总结 ===");
  console.log(`总图片数量: ${totalImages}`);
  console.log(`已检查数量: ${accessibleImages + inaccessibleImages.length}`);
  console.log(`可访问: ${accessibleImages}`);
  console.log(`不可访问: ${inaccessibleImages.length}`);

  if (inaccessibleImages.length > 0) {
    console.log("\n❌ 不可访问的图片:");
    inaccessibleImages.forEach((img) => {
      console.log(`   ${img.folder}/${img.filename} - ${img.error}`);
    });
  }

  // 生成当前图片列表用于更新API
  console.log("\n=== 当前图片文件列表（用于API更新）===");
  const imagesList = {};

  folders.forEach((folder) => {
    const folderPath = path.join(imgsPath, folder);
    const files = fs.readdirSync(folderPath);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .sort();

    imagesList[folder] = imageFiles;
  });

  console.log(JSON.stringify(imagesList, null, 2));
}

verifyImages().catch(console.error);
