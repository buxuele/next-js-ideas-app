"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostSchema, type PostInput } from "@/lib/validations";
import { useToast } from "@/components/ui/ToastContainer";
import Image from "next/image";

interface PostCreationFormProps {
  onPostCreated?: () => void;
}

export default function PostCreationForm({
  onPostCreated,
}: PostCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      content: "",
      images: [],
    },
  });

  const content = watch("content");
  const characterCount = content?.length || 0;
  const isOverLimit = characterCount > 280;

  const onSubmit = async (data: PostInput) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: data.content,
          images: uploadedImages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      // Reset form
      reset();
      setUploadedImages([]);

      // Show success toast
      showSuccess("发布成功", "你的帖子已成功发布");

      // Reset file input
      const fileInput = document.getElementById(
        "image-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Notify parent component
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMessage =
        error instanceof Error ? error.message : "发布失败，请重试";
      showError("发布失败", errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      showError("上传失败", "最多只能上传5张图片");
      return;
    }

    const newImages: string[] = [];
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        showError("上传失败", `文件 ${file.name} 太大，最大2MB`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newImages.push(result);
        if (newImages.length === files.length) {
          setUploadedImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-amber-50 rounded-lg shadow-sm border-2 border-amber-200 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Text Input */}
        <div>
          <textarea
            {...register("content")}
            placeholder="分享你的想法..."
            className={`w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              isOverLimit ? "border-red-500" : "border-gray-300"
            }`}
            rows={3}
            disabled={isSubmitting}
          />

          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {errors.content && (
                <span className="text-red-500">{errors.content.message}</span>
              )}
            </div>
            <div
              className={`text-sm font-medium ${
                isOverLimit
                  ? "text-red-500"
                  : characterCount > 250
                  ? "text-yellow-500"
                  : "text-gray-500"
              }`}
            >
              {characterCount}/280
            </div>
          </div>
        </div>

        {/* Image Upload Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={isSubmitting}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={isSubmitting}
            />
            {uploadedImages.length > 0 && (
              <span className="text-sm text-gray-500">
                {uploadedImages.length} 张图片
              </span>
            )}
          </div>
        </div>

        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {uploadedImages.map((imageUrl, index) => (
              <div key={index} className="relative">
                <Image
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content?.trim() || isOverLimit}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isSubmitting || !content?.trim() || isOverLimit
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "发布中..." : "发布"}
          </button>
        </div>
      </form>
    </div>
  );
}
