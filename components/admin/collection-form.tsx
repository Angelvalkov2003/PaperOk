"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCollectionAction,
  updateCollectionAction,
} from "app/admin/collections/actions";
import { toast } from "sonner";
import {
  buildCategoryTree,
  flattenCategoryTree,
  getMainMenuRoots,
  getRootOfCategory,
  isUnderMainMenu,
  type FlatCategory,
} from "lib/category-tree";
import { MAIN_MENU_SECTIONS } from "lib/constants";
import { formatHandle, generateHandleFromTitle } from "lib/slug";
import { FieldHint } from "./field-hint";
import { VisibilityStatusBadge } from "./visibility-status-badge";

interface CollectionFormData {
  handle: string;
  title: string;
  description: string;
  position: string;
  main_menu_id: string;
  nested_parent_id: string;
  available: boolean;
}

interface CollectionFormProps {
  collection?: any;
  allCollections?: FlatCategory[];
}

function resolveInitialPlacement(
  collection: any | undefined,
  allCollections: FlatCategory[],
): Pick<CollectionFormData, "main_menu_id" | "nested_parent_id"> {
  if (!collection?.parent_id) {
    return { main_menu_id: "", nested_parent_id: "" };
  }

  const root = getRootOfCategory(allCollections, collection.id);
  if (!root) {
    return { main_menu_id: "", nested_parent_id: "" };
  }

  const parentIsRoot = collection.parent_id === root.id;
  return {
    main_menu_id: root.id,
    nested_parent_id: parentIsRoot ? "" : collection.parent_id,
  };
}

export function CollectionForm({
  collection,
  allCollections = [],
}: CollectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [handleError, setHandleError] = useState<string | null>(null);
  const initialPlacement = resolveInitialPlacement(collection, allCollections);
  const [formData, setFormData] = useState<CollectionFormData>({
    handle: collection?.handle || "",
    title: collection?.title || "",
    description: collection?.description || "",
    position: collection?.position?.toString() || "0",
    main_menu_id: initialPlacement.main_menu_id,
    nested_parent_id: initialPlacement.nested_parent_id,
    available: collection?.available === true,
  });

  const isEditingRoot = Boolean(
    collection &&
      !collection.parent_id &&
      MAIN_MENU_SECTIONS.some((s) => s.handle === collection.handle),
  );

  const rootCategories = useMemo(() => getMainMenuRoots(allCollections), [allCollections]);

  const missingMainMenus = useMemo(() => {
    const present = new Set(rootCategories.map((r) => r.handle));
    return MAIN_MENU_SECTIONS.filter((s) => !present.has(s.handle));
  }, [rootCategories]);

  const nestedOptions = useMemo(() => {
    if (!formData.main_menu_id) return [];
    const tree = buildCategoryTree(
      allCollections.filter((c) => c.id !== collection?.id),
    );
    const rootNode = tree.find((n) => n.id === formData.main_menu_id);
    if (!rootNode) return [];
    return flattenCategoryTree(rootNode.children, 1);
  }, [allCollections, collection?.id, formData.main_menu_id]);

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, handle: formatHandle(e.target.value) });
    if (handleError) setHandleError(null);
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

  const handleMainMenuChange = (mainMenuId: string) => {
    setFormData({
      ...formData,
      main_menu_id: mainMenuId,
      nested_parent_id: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isEditingRoot && !formData.main_menu_id) {
        toast.error(
          "Първо изберете главно меню: Картички, Подаръци или Семенна хартия",
        );
        setLoading(false);
        return;
      }

      if (!isEditingRoot && formData.main_menu_id) {
        if (!isUnderMainMenu(allCollections, formData.main_menu_id)) {
          toast.error(
            "Категорията трябва да е под Картички, Подаръци или Семенна хартия",
          );
          setLoading(false);
          return;
        }
      }

      const finalHandle = (
        formData.handle.trim() || generateHandleFromTitle(formData.title)
      ).trim();

      if (!finalHandle) {
        toast.error(
          "Попълнете латински slug (напр. beleshnici). Кирилицата се преобразува автоматично от името.",
        );
        setLoading(false);
        return;
      }

      const parent_id = isEditingRoot
        ? null
        : formData.nested_parent_id || formData.main_menu_id || null;

      if (parent_id && formData.nested_parent_id) {
        const nestedRoot = getRootOfCategory(
          allCollections,
          formData.nested_parent_id,
        );
        const mainRoot = allCollections.find(
          (c) => c.id === formData.main_menu_id,
        );
        if (
          nestedRoot &&
          mainRoot &&
          nestedRoot.handle !== mainRoot.handle
        ) {
          toast.error("Подкатегорията трябва да е в избраното главно меню");
          setLoading(false);
          return;
        }
      }

      const collectionData = {
        handle: finalHandle,
        title: formData.title,
        description: formData.description.trim() || undefined,
        position: parseInt(formData.position) || 0,
        parent_id,
        available: formData.available,
      };

      let result;
      if (collection) {
        result = await updateCollectionAction({
          ...collectionData,
          id: collection.id,
        });
      } else {
        result = await createCollectionAction(collectionData);
      }

      if (result.success) {
        toast.success(
          collection
            ? "Категорията е обновена успешно"
            : "Категорията е създадена успешно",
        );
        router.push("/admin/collections");
        router.refresh();
      } else {
        const errorMessage = result.error || "Грешка при запазване";
        if (errorMessage.includes("Slug") && errorMessage.includes("зает")) {
          setHandleError(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Грешка при запазване");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slug (URL)
          </label>
          <input
            type="text"
            value={formData.handle}
            onChange={handleHandleChange}
            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              handleError
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            placeholder="nastolni-lampi"
          />
          {handleError ? (
            <p className="mt-1 text-xs text-red-600">{handleError}</p>
          ) : (
            <FieldHint example="za-neya → /products?collection=za-neya">
              Адресът на категорията в URL. Само латински букви, цифри и тирета.
              Ако е празно, се генерира автоматично от името.
            </FieldHint>
          )}
        </div>

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

        {isEditingRoot ? (
          <div className="md:col-span-2 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100">
            Това е <strong>главно меню</strong> в горната навигация на сайта
            (Картички / Подаръци / Семенна хартия). Подкатегориите се закачат
            към него чрез полето „Главно меню“ при създаване. Продуктите в
            цялото дърво се показват на{" "}
            <code className="rounded bg-white/60 px-1">
              /products?collection={collection?.handle}
            </code>
            .
          </div>
        ) : (
          <>
            {missingMainMenus.length > 0 && (
              <div className="md:col-span-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Липсват главни секции в базата:{" "}
                <strong>
                  {missingMainMenus.map((m) => m.title).join(", ")}
                </strong>
                . Създайте ги от админ панела или пуснете{" "}
                <code>seed_data.sql</code> в Supabase.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                1. Главно меню *
              </label>
              <select
                required
                value={formData.main_menu_id}
                onChange={(e) => handleMainMenuChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">— Изберете: Картички / Подаръци / Семенна хартия —</option>
                {rootCategories.map((root) => (
                  <option key={root.id} value={root.id}>
                    {root.title}
                  </option>
                ))}
              </select>
              <FieldHint example="Бележници → Подаръци">
                Задължително. Първо изберете една от трите секции в навбара.
                После продуктите в подкатегориите ще се виждат и при филтър
                по тази секция (напр. /products?collection=podaraci).
              </FieldHint>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                2. Под-категория (по избор)
              </label>
              <select
                value={formData.nested_parent_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nested_parent_id: e.target.value,
                  })
                }
                disabled={!formData.main_menu_id}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="">— Директно под главното меню —</option>
                {nestedOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {"—".repeat(opt.depth)} {opt.title}
                  </option>
                ))}
              </select>
              <FieldHint>
                Оставете празно, за да е директно под избраното главно меню.
                Или изберете съществуваща подкатегория за по-дълбоко влагане.
              </FieldHint>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Позиция
          </label>
          <input
            type="number"
            min="0"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            По-малко число = по-нагоре в менюто и в списъка. Например 1 е преди 2.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Картички от семенна хартия за любимите хора — мама, татко, баба и дядо."
        />
        <FieldHint example="Картички от семенна хартия за мама. Ръчна изработка в София.">
          Кратко описание на категорията. Помага на клиентите и за SEO —
          опиши за кого са продуктите и каква е ползата.
        </FieldHint>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Видимост за клиентите
          </label>
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
              Видим за клиентите
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
        <div className="mt-3">
          <FieldHint>
            Новите категории са скрити по подразбиране. Активирайте, когато
            описанието, снимките и продуктите са готови.
          </FieldHint>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Запазване..." : collection ? "Обнови" : "Създай"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
        >
          Отказ
        </button>
      </div>
    </form>
  );
}
