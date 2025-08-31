"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ImageInfo } from "@/lib/image-manager";
import ThreeColumnGallery from "@/components/gallery/ThreeColumnGallery";

const PAGE_LIMIT = 30;

// 加载指示器组件
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 0",
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
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <p style={{ color: "#4b5563", margin: 0 }}>加载图片中...</p>
    </div>
    <style jsx>{`
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

export default function HomePage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [folder, setFolder] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver>();
  const lastImageElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore]
  );

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const foldersResponse = await fetch("/api/folders");
      if (!foldersResponse.ok) throw new Error("Failed to fetch folders");
      const foldersData = await foldersResponse.json();
      const firstFolder = foldersData.folders?.[0];

      if (firstFolder) {
        setFolder(firstFolder);
      } else {
        setImages([]);
        setHasMore(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError(error instanceof Error ? error.message : "获取初始化数据失败");
      setIsLoading(false);
    }
  };

  const fetchMoreImages = useCallback(async () => {
    if (!folder || !hasMore) return;

    setIsFetchingMore(true);
    try {
      const response = await fetch(
        `/api/images?folder=${encodeURIComponent(
          folder
        )}&page=${page}&limit=${PAGE_LIMIT}`
      );
      if (!response.ok) throw new Error("Failed to fetch images");

      const data = await response.json();
      setImages((prevImages) => [...prevImages, ...(data.images || [])]);
      setHasMore(images.length + (data.images || []).length < data.total);
    } catch (error) {
      console.error("Error fetching more images:", error);
      setError(error instanceof Error ? error.message : "获取更多图片失败");
    } finally {
      setIsFetchingMore(false);
      if (page === 1) setIsLoading(false);
    }
  }, [folder, page, hasMore, images.length]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (folder) {
      if (page === 1) setIsLoading(true);
      fetchMoreImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, page]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && images.length === 0) {
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
            onClick={fetchInitialData}
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

  return (
    <>
      <ThreeColumnGallery images={images} ref={lastImageElementRef} />
      {isFetchingMore && <LoadingSpinner />}
      {!hasMore && images.length > 0 && (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "#6b7280" }}>
          <p>没有更多图片了</p>
        </div>
      )}
    </>
  );
}
