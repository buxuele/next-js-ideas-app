"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ImageInfo } from "@/lib/image-manager";
import ThreeColumnGallery from "@/components/gallery/ThreeColumnGallery";

export default function FolderPage() {
  const params = useParams();
  const folder = decodeURIComponent(params.folder as string);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/images?folder=${encodeURIComponent(folder)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError(error instanceof Error ? error.message : "获取图片失败");
    } finally {
      setIsLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    if (folder) {
      fetchImages();
    }
  }, [folder, fetchImages]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "2px solid #d97706",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              margin: "0 auto 16px auto",
            }}
          ></div>
          <p style={{ color: "#4b5563", margin: 0 }}>加载图片中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={fetchImages}
            style={{
              padding: "8px 16px",
              backgroundColor: "#d97706",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return <ThreeColumnGallery images={images} />;
}
