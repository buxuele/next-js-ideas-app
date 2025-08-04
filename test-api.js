// 测试API是否正常工作的脚本
const BASE_URL = "http://localhost:3000";

async function testAPI() {
  try {
    console.log("=== 测试文件夹API ===");
    const foldersResponse = await fetch(`${BASE_URL}/api/folders`);
    const foldersData = await foldersResponse.json();
    console.log("文件夹列表:", foldersData.folders);

    console.log("\n=== 测试图片API ===");
    for (const folder of foldersData.folders) {
      console.log(`\n--- ${folder} 文件夹 ---`);
      const imagesResponse = await fetch(
        `${BASE_URL}/api/images?folder=${encodeURIComponent(folder)}`
      );
      const imagesData = await imagesResponse.json();

      console.log(`图片数量: ${imagesData.images.length}`);
      imagesData.images.forEach((image, index) => {
        console.log(`  ${index + 1}. ${image.filename}`);
        console.log(`     URL: ${image.url}`);
      });
    }

    console.log("\n=== 测试特定图片URL ===");
    const testImageUrl = `${BASE_URL}/imgs/art/52dc3c5c188e.jpg`;
    console.log(`测试图片URL: ${testImageUrl}`);

    const imageResponse = await fetch(testImageUrl, { method: "HEAD" });
    console.log(
      `图片访问状态: ${imageResponse.status} ${imageResponse.statusText}`
    );
  } catch (error) {
    console.error("测试失败:", error);
  }
}

testAPI();
