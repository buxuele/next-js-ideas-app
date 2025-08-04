import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");

    if (!folder) {
      return NextResponse.json(
        { error: "Folder parameter is required" },
        { status: 400 }
      );
    }

    const folderPath = path.join(process.cwd(), "public", "imgs", folder);

    // 检查文件夹是否存在
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ images: [] });
    }

    // 读取文件夹中的所有文件
    const files = fs.readdirSync(folderPath);

    // 过滤出图片文件
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // 构建图片信息数组
    const images = imageFiles.map((filename) => ({
      filename,
      url: `/imgs/${folder}/${filename}`,
      folder: folder,
    }));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error reading images:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
}
