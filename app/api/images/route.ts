import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// GitHub 仓库的基础 URL
const GITHUB_REPO_BASE =
  "https://raw.githubusercontent.com/buxuele/next-js-ideas-app/main/public/imgs";

// 预定义的图片文件列表（生产环境使用）
const PRODUCTION_IMAGES = {
  art: [
    "20250711_090014_Kopiec_9.jpg",
    "20250711_090015_Panthera_uncia_(33172899150).jpg",
    "20250711_090015_Peter_Ilsted_-_En_ung_pige,_der_renser_kantareller_-_1892_-_Statens_Museum_for_Kunst_-_2020903_KMS1817.jpg",
    "20250712_222145_La Corniche bij Monaco.jpeg",
    "20250712_222151_Lady in an Interiorlabel QSLen,Lady in an Interior.jpg",
    "20250712_222203_Polski Portret Marii Bobrzeckiej (1898–1957)..jpg",
    "20250712_222206_Porta Nolanalabel QSLen,Porta Nolana.jpg",
    "20250712_223421_Children in the garden label QSLfr,Enfants dans un jardin. label QSLen,Children in the garden. label.jpg",
    "20250712_223424_Clearing in Provence (study for The Clearing)label QSLen,Clearing in Provence (study for The Clea.jpg",
    "20250712_234120_A Gotthelf readerlabel QSLen,A Gotthelf reader label QSLde,Eine Gotthelf-Leserin.jpg",
    "20250712_234129_An Evening in Moret, End of Octoberlabel QSLen,An Evening in Moret, End of October label QSLfr,Un so.jpg",
    "20250712_235427_Maternal Affection.jpg",
    "Peach_Blossoms—Villiers-le-Bel_MET_DT4572.jpg",
    "The Mediterranean at Le Lavandoutitle QSP1476,enThe Mediterranean at Le Lavandou label QSLen,The Med.jpg",
  ],
  good_art: [
    "021b2f43eb2e.jpg",
    "03ae7e8008c6.jpg",
    "20250710_071827_GvUiQzGXAAAHWnu.jpg",
    "20250710_071827_GvUl_j5XMAAHYgi.jpg",
    "24535d69630f.jpg",
    "4b11ceef2075.jpg",
    "688c6bc7c28a.jpg",
  ],
  "t-恤--收集": [
    "12541048536082291760_2048.jpg",
    "5f02dbae0f91.jpg",
    "c2f7185ce9d440c12bb55d2bd47aa5c6.jpg",
    "F69F5E78-EF6E-4E3F-B0E5-3CCE24B441F4.jpg",
    "il_1588xN.6514690562_kq9o.jpg",
  ],
  top10: [
    "674d1581cfcff9c608132162f5a6e3ad.jpg",
    "a2.jpg",
    "b073e042dfb8.jpg",
    "bbc1302f4351c9b04289930f1cb9a557.jpg",
    "c2.jpg",
    "d40b2ebff8740055d4f9b598e002435f.jpg",
    "dc2ca5a895719c4b6e88a99ccdfd9b5b.jpg",
    "hanna.jpg",
    "teeth_卡通.jpg",
  ],
};

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

    // 在生产环境中，使用预定义的图片列表和 GitHub URL
    if (process.env.NODE_ENV === "production") {
      const imageFiles =
        PRODUCTION_IMAGES[folder as keyof typeof PRODUCTION_IMAGES] || [];

      const images = imageFiles.map((filename) => ({
        filename,
        url: `${GITHUB_REPO_BASE}/${encodeURIComponent(
          folder
        )}/${encodeURIComponent(filename)}`,
        folder: folder,
      }));

      return NextResponse.json({ images });
    }

    // 在开发环境中，读取本地文件系统
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
