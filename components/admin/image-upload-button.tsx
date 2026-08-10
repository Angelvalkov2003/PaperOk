"use client";

import { useState, useRef, useId } from "react";
import { toast } from "sonner";
import { uploadImageFile } from "lib/upload-image";
import { IMAGE_FILE_ACCEPT } from "lib/image-file";

interface ImageUploadButtonProps {
  onUploadComplete: (url: string) => void;
  label?: string;
  className?: string;
  id?: string; // Allow custom ID to avoid conflicts
}

export function ImageUploadButton({
  onUploadComplete,
  label = "Качи Снимка",
  className = "",
  id,
}: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id || `image-upload-${generatedId}`;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImageFile(file);
      onUploadComplete(url);
      toast.success("Снимката е качена успешно");
    } catch (error: any) {
      console.error("[upload-button] Error uploading image:", {
        message: error?.message,
        error,
        file: file
          ? { name: file.name, type: file.type, size: file.size }
          : null,
      });
      toast.error(error.message || "Грешка при качване на снимка");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        onChange={handleFileSelect}
        className="hidden"
        id={inputId}
        disabled={uploading}
      />
      <label
        htmlFor={inputId}
        className={`inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {uploading ? "Качване..." : label}
      </label>
    </div>
  );
}
