import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename: rawFilename } = await params;
    const filename = decodeURIComponent(rawFilename);
    const imagePath = path.join(
      process.cwd(),
      "public/imgs/good_art",
      filename
    );

    // 检查文件是否存在
    if (!fs.existsSync(imagePath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // 读取文件
    const imageBuffer = fs.readFileSync(imagePath);

    // 获取文件扩展名来设置正确的MIME类型
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg"; // 默认

    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
