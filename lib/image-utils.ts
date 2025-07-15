export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${
        file.type
      }. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size (2MB limit for base64 storage)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large: ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB. Maximum allowed: 2MB`,
    };
  }

  return { valid: true };
}

export function generateImageFilename(
  userId: string,
  originalName: string
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${userId}/${timestamp}-${randomString}.${extension}`;
}
