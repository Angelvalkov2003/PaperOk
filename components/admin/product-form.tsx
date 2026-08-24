"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "app/admin/products/actions";
import { toast } from "sonner";
import type { Image, ProductSizeVariant } from "lib/types";
import { ImageUploadButton } from "./image-upload-button";
import { FieldHint } from "./field-hint";
import { ProductVariantsEditor } from "./product-variants-editor";
import { VisibilityStatusBadge } from "./visibility-status-badge";
import {
  getProductCategoryGroups,
  type FlatCategory,
} from "lib/category-tree";
import { formatHandle, generateHandleFromTitle } from "lib/slug";
import { uploadImageFile } from "lib/upload-image";
import { IMAGE_FILE_ACCEPT } from "lib/image-file";

interface ProductFormData {
  handle: string;
  title: string;
  description: string;
  price: string;
  compare_at_price: string;
  featured_image_url: string;
  category: string;
  available: boolean;
  plantable: boolean;
  position: string;
  images: Image[];
  variants: ProductSizeVariant[];
}

interface ProductFormProps {
  product?: any;
  collections: FlatCategory[];
}

export function ProductForm({ product, collections }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const [handleError, setHandleError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    handle: product?.handle || "",
    title: product?.title || "",
    description: product?.description || "",
    price:
      product?.price !== undefined && product?.price !== null
        ? String(product.price)
        : "0",
    compare_at_price:
      product?.compare_at_price !== undefined &&
      product?.compare_at_price !== null
        ? String(product.compare_at_price)
        : "",
    featured_image_url: product?.featured_image?.url || "",
    category: product?.category || "",
    available: product?.available === true,
    plantable: product?.plantable !== false,
    position:
      product?.position !== undefined && product?.position !== null
        ? String(product.position)
        : "0",
    images: Array.isArray(product?.images)
      ? product.images.filter((img: Image) => img && img.url)
      : [],
    variants: Array.isArray(product?.variants) ? product.variants : [],
  }));

  const categoryGroups = getProductCategoryGroups(collections);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const featuredImage: Image | undefined = formData.featured_image_url
        ? {
            id: product?.featured_image?.id || "",
            url: formData.featured_image_url,
            altText: formData.title,
          }
        : undefined;

      // Ensure all images have altText set to product title
      const imagesWithAltText = formData.images.map((img) => ({
        ...img,
        altText: formData.title,
      }));

      // Generate handle from title if not provided, and trim to remove any spaces
      const finalHandle = (formData.handle.trim() || generateHandleFromTitle(formData.title)).trim();

      const productData = {
        handle: finalHandle,
        title: formData.title,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : undefined,
        featured_image: featuredImage,
        images: imagesWithAltText,
        category: formData.category || undefined,
        available: formData.available,
        plantable: formData.plantable,
        position: parseInt(formData.position) || 0,
        variants: formData.variants,
      };

      let result;
      if (product) {
        result = await updateProductAction({ ...productData, id: product.id });
      } else {
        result = await createProductAction(productData);
      }

      if (result.success) {
        toast.success(product ? "Продуктът е обновен успешно" : "Продуктът е създаден успешно");
        router.push("/admin/products");
        router.refresh();
      } else {
        const errorMessage = result.error || "Грешка при запазване на продукт";
        // Check if error is about duplicate handle
        if (errorMessage.includes("Slug") && errorMessage.includes("зает")) {
          setHandleError(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      const errorMessage = error.message || "Грешка при запазване на продукт";
      // Check if error is about duplicate handle
      if (errorMessage.includes("Slug") && errorMessage.includes("зает")) {
        setHandleError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    // Create a temporary file input to trigger file selection
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_FILE_ACCEPT;
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // Create a new image entry with temporary ID
      const tempId = `img-${Date.now()}`;
      const newImage: Image = {
        id: tempId,
        url: "",
        altText: formData.title,
      };

      // Calculate the new index before adding
      const newIndex = formData.images.length;

      // Add the image to the list immediately (will show loading state)
      setFormData((prev) => ({ ...prev, images: [...prev.images, newImage] }));
      setUploadingImages((prev) => new Set(prev).add(tempId));

      try {
        const url = await uploadImageFile(file);

        // Update the image with the uploaded URL
        setFormData((prev) => {
          const updated = [...prev.images];
          const existingImage = updated[newIndex];
          updated[newIndex] = {
            id: existingImage?.id || tempId,
            url,
            altText: prev.title,
          };
          return { ...prev, images: updated };
        });

        setUploadingImages((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });

        toast.success("Снимката е качена успешно");
      } catch (error: any) {
        console.error("[product-form] Error uploading image:", {
          message: error?.message,
          error,
          file: file
            ? { name: file.name, type: file.type, size: file.size }
            : null,
        });
        toast.error(error.message || "Грешка при качване на снимка");
        // Remove the failed image entry
        setFormData((prev) => ({
          ...prev,
          images: prev.images.filter((_, i) => i !== newIndex),
        }));
        setUploadingImages((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });
      }
    };
    input.click();
  };

  const updateImage = (index: number, field: keyof Image, value: any) => {
    const updated = [...formData.images];
    const existingImage = updated[index];
    if (existingImage) {
      updated[index] = { 
        ...existingImage, 
        [field]: value,
        id: existingImage.id, // Ensure id is always a string
      };
    }
    setFormData({ ...formData, images: updated });
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleFeaturedImageUpload = (url: string) => {
    setFormData({ ...formData, featured_image_url: url });
  };

  const handleImageUpload = (index: number, url: string) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      if (updated[index]) {
        updated[index] = { 
          ...updated[index], 
          url: url,
          altText: prev.title, // Automatically set alt text to product title
        };
      }
      return { ...prev, images: updated };
    });
  };

  // Format handle/slug: transliterate Cyrillic, lowercase, hyphens
  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHandle(e.target.value);
    setFormData({ ...formData, handle: formatted });
    // Clear error when user starts typing
    if (handleError) {
      setHandleError(null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => {
      const slugStillSynced =
        !prev.handle || prev.handle === generateHandleFromTitle(prev.title);
      if (slugStillSynced) {
        return {
          ...prev,
          title: newTitle,
          handle: generateHandleFromTitle(newTitle),
        };
      }
      return { ...prev, title: newTitle };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Име *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL Slug
          </label>
          <input
            type="text"
            value={formData.handle}
            onChange={handleHandleChange}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              handleError 
                ? "border-red-500 dark:border-red-500" 
                : "border-gray-300 dark:border-gray-700"
            }`}
            placeholder="kartichka-za-mama"
          />
          {handleError ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {handleError}
            </p>
          ) : (
            <FieldHint example="kartichka-za-mama → /product/kartichka-za-mama">
              Адресът на продукта в URL. Само латински букви, цифри и тирета.
              Ако е празно, се генерира автоматично от името.
            </FieldHint>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Картичка от семенна хартия за мама — може да се засади и да разцъфти."
        />
        <FieldHint example="Картичка от семенна хартия за мама. Ръчна изработка, може да се засади. Размери A7, A6 и A5.">
          Описанието се вижда на продуктовата страница и помага за SEO.
          Включвай какво е продуктът, за кого е и ключови ползи (2–4 изречения).
        </FieldHint>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Цена *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Стара Цена
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.compare_at_price}
            onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Категория *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Избери категория</option>
            {categoryGroups.map((group) => (
              <optgroup key={group.handle} label={group.title}>
                {group.options.map((cat) => (
                  <option key={cat.id} value={cat.handle}>
                    {"—".repeat(cat.depth)} {cat.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <FieldHint example="Бележници → под Подаръци">
            Изберете категория под Картички, Подаръци или Семенна хартия.
            Продуктът ще се вижда и при филтър по главната секция
            (/products?collection=podaraci и т.н.).
          </FieldHint>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Позиция
          </label>
          <input
            type="number"
            min="0"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="1 = най-отгоре"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            По-малко число = по-нагоре в админа и на сайта. Например 1 е преди 5.
          </p>
        </div>
      </div>

      <ProductVariantsEditor
        variants={formData.variants}
        basePrice={formData.price}
        onChange={(variants) => setFormData({ ...formData, variants })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Главна Снимка
        </label>
        <div className="flex gap-2 items-end">
          <input
            type="url"
            value={formData.featured_image_url}
            onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
          <ImageUploadButton
            onUploadComplete={handleFeaturedImageUpload}
            label="Качи Снимка"
          />
        </div>
        {formData.featured_image_url && (
          <div className="mt-2">
            <img
              src={formData.featured_image_url}
              alt={formData.title}
              className="h-32 w-32 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Допълнителни Снимки
          </label>
          <button
            type="button"
            onClick={addImage}
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            + Добави Снимка
          </button>
        </div>
        {formData.images.map((image, index) => {
          const isUploading = uploadingImages.has(image.id);
          return (
            <div key={image.id || index} className="mb-4 p-4 border border-gray-300 dark:border-gray-700 rounded-md">
              <div className="flex gap-2 mb-2 items-end">
                <input
                  type="url"
                  value={image.url}
                  onChange={(e) => updateImage(index, "url", e.target.value)}
                  placeholder="URL на снимка"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={isUploading}
                />
                <ImageUploadButton
                  onUploadComplete={(url) => handleImageUpload(index, url)}
                  label="Качи"
                  className="text-sm"
                  id={`additional-image-${index}`}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                  disabled={isUploading}
                >
                  Изтрий
                </button>
              </div>
              {isUploading ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded border flex items-center justify-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Качване...</span>
                  </div>
                </div>
              ) : image.url ? (
                <div className="mt-2">
                  <img
                    src={image.url}
                    alt={formData.title}
                    className="h-32 w-32 object-cover rounded border"
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Видимост за клиентите
          </span>
          <VisibilityStatusBadge active={formData.available} />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, available: true })}
            className={`flex-1 rounded-md border px-4 py-3 text-left text-sm transition-colors ${
              formData.available
                ? "border-green-500 bg-green-50 text-green-900 dark:border-green-600 dark:bg-green-950/30 dark:text-green-100"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <span className="font-medium">🟢 Активен</span>
            <span className="mt-0.5 block text-xs opacity-80">
              Видим в каталога и може да се поръчва
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, available: false })}
            className={`flex-1 rounded-md border px-4 py-3 text-left text-sm transition-colors ${
              !formData.available
                ? "border-gray-400 bg-gray-100 text-gray-900 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100"
                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <span className="font-medium">⚪ Неактивен</span>
            <span className="mt-0.5 block text-xs opacity-80">
              Скрит от клиентите
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="plantable"
          checked={formData.plantable}
          onChange={(e) =>
            setFormData({ ...formData, plantable: e.target.checked })
          }
          className="mr-2"
        />
        <label
          htmlFor="plantable"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Може да се засади (показва таб „Как се засажда“)
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Запазване..." : product ? "Обнови" : "Създай"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Отказ
        </button>
      </div>
    </form>
  );
}
