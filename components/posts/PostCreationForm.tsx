"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostSchema, type PostInput } from "@/lib/validations";
import { useToast } from "@/components/ui/ToastContainer";
import ImageUpload from "./ImageUpload";

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

  const handleImagesChange = (imageUrls: string[]) => {
    setUploadedImages(imageUrls);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Text Input */}
        <div>
          <textarea
            {...register("content")}
            placeholder="分享你的想法..."
            className={`w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              isOverLimit ? "border-red-500" : "border-gray-300"
            }`}
            rows={4}
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

        {/* Image Upload */}
        <ImageUpload
          onImagesChange={handleImagesChange}
          disabled={isSubmitting}
        />

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
