"use client";

import { useState, useRef, useCallback } from "react";
import { validateImageFile } from "@/lib/image-utils";
import { useToast } from "@/components/ui/ToastContainer";
import Image from "next/image";

interface ImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
}

export default function ImageUpload({
  onImagesChange,
  disabled = false,
  maxImages = 5,
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  const updateImages = useCallback(
    (newImages: UploadedImage[]) => {
      setImages(newImages);
      onImagesChange(newImages.map((img) => img.url));
    },
    [onImagesChange]
  );

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      showError("上传失败", `最多只能上传 ${maxImages} 张图片`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Validate all files first
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      const newImages = data.images.map((img: any) => ({
        url: img.url,
        filename: img.filename,
        size: img.size,
      }));

      updateImages([...images, ...newImages]);
      showSuccess("上传成功", `成功上传 ${newImages.length} 张图片`);
    } catch (error) {
      console.error("Error uploading images:", error);
      const errorMessage =
        error instanceof Error ? error.message : "上传失败，请重试";
      showError("上传失败", errorMessage);
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      uploadFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    updateImages(newImages);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : disabled
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {isUploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">上传中...</span>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2">
              <button
                type="button"
                onClick={openFileDialog}
                disabled={disabled}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
              >
                点击上传图片
              </button>
              <span className="text-gray-500"> 或拖拽到此处</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              支持 JPEG, PNG, WebP, GIF 格式，最大 10MB，最多 {maxImages} 张
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={image.url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                ×
              </button>

              {/* File Info */}
              <div className="mt-1 text-xs text-gray-500 truncate">
                {image.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500">
          已上传 {images.length}/{maxImages} 张图片
        </div>
      )}
    </div>
  );
}
