"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBlogPostAction,
  updateBlogPostAction,
} from "app/admin/blog/actions";
import { toast } from "sonner";
import type { Image } from "lib/types";
import { ImageUploadButton } from "./image-upload-button";
import { FieldHint } from "./field-hint";
import { uploadImageFile } from "lib/upload-image";
import { IMAGE_FILE_ACCEPT } from "lib/image-file";

interface BlogFormData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
  images: Image[];
}

export function BlogForm({ post }: { post?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    slug: post?.slug || "",
    title: post?.title || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featured_image_url: post?.featured_image?.url || "",
    seo_title: post?.seo_title || "",
    seo_description: post?.seo_description || "",
    published: post?.published ?? false,
    images: post?.images || [],
  });

  const formatSlug = (v: string) =>
    v
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const featuredImage: Image | undefined = formData.featured_image_url
      ? {
          id: post?.featured_image?.id || "",
          url: formData.featured_image_url,
          altText: formData.title,
        }
      : undefined;

    const payload = {
      slug: formatSlug(formData.slug || formData.title),
      title: formData.title,
      excerpt: formData.excerpt || undefined,
      content: formData.content,
      featured_image: featuredImage,
      images: formData.images.map((img) => ({
        ...img,
        altText: formData.title,
      })),
      seo_title: formData.seo_title || undefined,
      seo_description: formData.seo_description || undefined,
      published: formData.published,
    };

    const result = post
      ? await updateBlogPostAction({ ...payload, id: post.id })
      : await createBlogPostAction(payload);

    if (result.success) {
      toast.success(post ? "Статията е обновена" : "Статията е създадена");
      router.push("/admin/blog");
      router.refresh();
    } else {
      toast.error(result.error || "Грешка");
    }
    setLoading(false);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...formData.images];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newImages.length) return;
    [newImages[index], newImages[target]] = [
      newImages[target]!,
      newImages[index]!,
    ];
    setFormData({ ...formData, images: newImages });
  };

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_FILE_ACCEPT;
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const url = await uploadImageFile(file);
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            { id: crypto.randomUUID(), url, altText: prev.title },
          ],
        }));
        toast.success("Снимката е качена успешно");
      } catch (error: any) {
        console.error("[blog-form] Error uploading image:", {
          message: error?.message,
          error,
          file: file
            ? { name: file.name, type: file.type, size: file.size }
            : null,
        });
        toast.error(error.message || "Грешка при качване на снимка");
      }
    };
    input.click();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Заглавие *</label>
          <input
            required
            value={formData.title}
            onChange={(e) => {
              const title = e.target.value;
              setFormData({
                ...formData,
                title,
                slug: formData.slug || formatSlug(title),
              });
            }}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Slug (URL) *</label>
          <input
            required
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: formatSlug(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            placeholder="kakvo-e-semenna-hartia"
          />
          <FieldHint example="kakvo-e-semenna-hartia → /blog/kakvo-e-semenna-hartia">
            Кратък адрес на статията в URL. Само латински букви, цифри и тирета.
            Без интервали и кирилица. Включвай 1–2 ключови думи.
          </FieldHint>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Кратко описание</label>
        <textarea
          rows={2}
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          placeholder="Кратко резюме на статията за списъка в блога"
        />
        <FieldHint>
          Показва се в списъка с публикации. Не е същото като SEO описанието.
        </FieldHint>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Съдържание *</label>
        <textarea
          required
          rows={12}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 font-mono text-sm"
        />
      </div>

      <div className="rounded-lg border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 space-y-4">
        <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
          SEO настройки — как Google показва страницата
        </p>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">SEO заглавие</label>
            <span
              className={`text-xs ${
                formData.seo_title.length > 60
                  ? "text-amber-600"
                  : "text-gray-500"
              }`}
            >
              {formData.seo_title.length}/60
            </span>
          </div>
          <input
            value={formData.seo_title}
            onChange={(e) =>
              setFormData({ ...formData, seo_title: e.target.value })
            }
            maxLength={70}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            placeholder="Какво е семенна хартия? | PaperOK"
          />
          <FieldHint example="Какво е семенна хартия и как се засажда | PaperOK">
            Заглавието в Google (около 50–60 символа). Сложи основната ключова
            дума в началото. Ако е празно, се ползва заглавието на статията.
          </FieldHint>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">SEO описание</label>
            <span
              className={`text-xs ${
                formData.seo_description.length > 160
                  ? "text-amber-600"
                  : "text-gray-500"
              }`}
            >
              {formData.seo_description.length}/160
            </span>
          </div>
          <textarea
            rows={3}
            value={formData.seo_description}
            onChange={(e) =>
              setFormData({ ...formData, seo_description: e.target.value })
            }
            maxLength={180}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            placeholder="Научи какво е семенна хартия, как се засажда и защо е идеален еко подарък. Съвети от PaperOK."
          />
          <FieldHint example="Научи какво е семенна хартия, как се засажда и защо е идеален еко подарък. Идеи и съвети от PaperOK.">
            Текстът под заглавието в Google (около 140–160 символа). Опиши
            ползата за читателя и включи ключови думи естествено. Ако е празно,
            се ползва краткото описание.
          </FieldHint>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Главна снимка</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={formData.featured_image_url}
            onChange={(e) =>
              setFormData({ ...formData, featured_image_url: e.target.value })
            }
            className="flex-1 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          />
          <ImageUploadButton
            onUploadComplete={(url) =>
              setFormData({ ...formData, featured_image_url: url })
            }
            label="Качи"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Допълнителни снимки</label>
          <button
            type="button"
            onClick={addImage}
            className="text-sm text-indigo-600"
          >
            + Добави
          </button>
        </div>
        {formData.images.map((img, i) => (
          <div
            key={img.id || i}
            className="flex items-center gap-2 mb-2 p-2 border rounded"
          >
            <img src={img.url} alt="" className="h-16 w-16 object-cover rounded" />
            <span className="flex-1 text-sm truncate">{img.url}</span>
            <button type="button" onClick={() => moveImage(i, "up")} className="text-sm px-2">
              ↑
            </button>
            <button type="button" onClick={() => moveImage(i, "down")} className="text-sm px-2">
              ↓
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  images: formData.images.filter((_, idx) => idx !== i),
                })
              }
              className="text-red-600 text-sm"
            >
              Изтрий
            </button>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.published}
          onChange={(e) =>
            setFormData({ ...formData, published: e.target.checked })
          }
        />
        <span className="text-sm">Публикувана</span>
      </label>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? "Запазване..." : post ? "Обнови" : "Създай"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
        >
          Отказ
        </button>
      </div>
    </form>
  );
}
