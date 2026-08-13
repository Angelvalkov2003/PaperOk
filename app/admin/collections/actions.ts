"use server";

import {
  createCollection,
  updateCollection,
  deleteCollection,
  getAllCollectionsForAdmin,
  type CreateCollectionData,
  type UpdateCollectionData,
} from "lib/supabase/admin-collections";
import { isUnderMainMenu, type FlatCategory } from "lib/category-tree";
import { MAIN_MENU_SECTIONS } from "lib/constants";
import { revalidatePath } from "next/cache";

const MAIN_HANDLES = new Set(
  MAIN_MENU_SECTIONS.map((s) => s.handle as string),
);

function toFlat(collections: any[]): FlatCategory[] {
  return collections.map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    position: c.position ?? 0,
    parent_id: c.parent_id || null,
  }));
}

async function assertValidParent(parentId: string | null | undefined) {
  if (!parentId) {
    throw new Error(
      "Изберете главно меню: Картички, Подаръци или Семенна хартия",
    );
  }

  const all = toFlat(await getAllCollectionsForAdmin());
  const parent = all.find((c) => c.id === parentId);
  if (!parent) {
    throw new Error("Избраната родителска категория не съществува");
  }

  if (MAIN_HANDLES.has(parent.handle) && !parent.parent_id) {
    return;
  }

  if (!isUnderMainMenu(all, parentId)) {
    throw new Error(
      "Категорията трябва да е под Картички, Подаръци или Семенна хартия",
    );
  }
}

export async function createCollectionAction(data: CreateCollectionData) {
  try {
    await assertValidParent(data.parent_id ?? null);
    const collection = await createCollection(data);
    revalidatePath("/admin/collections");
    revalidatePath("/admin");
    revalidatePath("/products");
    revalidatePath("/api/collections");
    revalidatePath("/");
    return { success: true, collection };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create collection",
    };
  }
}

export async function updateCollectionAction(data: UpdateCollectionData) {
  try {
    const all = toFlat(await getAllCollectionsForAdmin());
    const existing = all.find((c) => c.id === data.id);
    const isRoot =
      existing &&
      !existing.parent_id &&
      MAIN_HANDLES.has(existing.handle);

    if (!isRoot) {
      await assertValidParent(data.parent_id ?? null);
    } else if (data.parent_id) {
      throw new Error("Главните менюта не могат да имат родител");
    }

    const collection = await updateCollection(data);
    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${data.id}`);
    revalidatePath("/admin");
    revalidatePath("/products");
    revalidatePath("/api/collections");
    revalidatePath("/");
    return { success: true, collection };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update collection",
    };
  }
}

export async function deleteCollectionAction(collectionId: string) {
  try {
    const all = toFlat(await getAllCollectionsForAdmin());
    const existing = all.find((c) => c.id === collectionId);
    if (
      existing &&
      !existing.parent_id &&
      MAIN_HANDLES.has(existing.handle)
    ) {
      throw new Error(
        "Главните менюта (Картички / Подаръци / Семенна хартия) не могат да се изтриват",
      );
    }

    await deleteCollection(collectionId);
    revalidatePath("/admin/collections");
    revalidatePath("/admin");
    revalidatePath("/products");
    revalidatePath("/api/collections");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete collection",
    };
  }
}
