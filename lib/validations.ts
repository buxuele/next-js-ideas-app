import { z } from "zod";

// Post validation schema
export const PostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content cannot be empty")
    .max(280, "Post content cannot exceed 280 characters"),
  images: z
    .array(z.string())
    .max(5, "Cannot upload more than 5 images")
    .optional(),
});

// Image validation schema
export const ImageUploadSchema = z.object({
  file: z.instanceof(File),
  size: z.number().max(10 * 1024 * 1024, "File size cannot exceed 10MB"),
  type: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"], {
    message: "Only JPEG, PNG, WebP, and GIF images are allowed",
  }),
});

// User update schema
export const UserUpdateSchema = z.object({
  display_name: z
    .string()
    .max(100, "Display name cannot exceed 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

export type PostInput = z.infer<typeof PostSchema>;
export type ImageUploadInput = z.infer<typeof ImageUploadSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
