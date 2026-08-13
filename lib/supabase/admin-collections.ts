import { createServiceClient } from "./service";

// Helper to check if error is React.postpone()
function isReactPostpone(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "$$typeof" in error &&
    error.$$typeof === Symbol.for("react.postpone")
  );
}

export interface CreateCollectionData {
  handle: string;
  title: string;
  description?: string;
  position?: number;
  parent_id?: string | null;
  available?: boolean;
}

export interface UpdateCollectionData extends Partial<CreateCollectionData> {
  id: string;
}

/**
 * Get all collections for admin
 */
export async function getAllCollectionsForAdmin() {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("position", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching collections:", error);
      throw new Error("Failed to fetch collections");
    }

    return data || [];
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getAllCollectionsForAdmin:", error);
    throw error;
  }
}

/**
 * Get collection by ID for admin
 */
export async function getCollectionByIdForAdmin(collectionId: string) {
  try {
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .single();

    if (error) {
      // PGRST116 means no rows returned (not found)
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        return null;
      }
      console.error("Error fetching collection:", error);
      throw new Error("Failed to fetch collection");
    }

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in getCollectionByIdForAdmin:", error);
    throw error;
  }
}

/**
 * Check if handle already exists for collections
 */
async function checkCollectionHandleExists(handle: string, excludeId?: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const trimmedHandle = handle.trim();
    
    let query = supabase
      .from("collections")
      .select("id")
      .eq("handle", trimmedHandle)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking handle:", error);
      return false;
    }

    return (data && data.length > 0) || false;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in checkCollectionHandleExists:", error);
    return false;
  }
}

/**
 * Create a new collection
 */
export async function createCollection(data: CreateCollectionData) {
  try {
    const supabase = createServiceClient();
    
    const trimmedHandle = data.handle.trim();
    
    // Check if handle already exists
    const handleExists = await checkCollectionHandleExists(trimmedHandle);
    if (handleExists) {
      throw new Error(`Slug "${trimmedHandle}" вече е зает. Моля, изберете друг slug.`);
    }
    
    const collectionData = {
      handle: trimmedHandle,
      title: data.title,
      description: data.description || null,
      position: data.position ?? 0,
      parent_id: data.parent_id || null,
      available: data.available === true,
      updated_at: new Date().toISOString(),
    };

    const { data: collection, error } = await supabase
      .from("collections")
      .insert(collectionData)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        throw new Error(`Slug "${trimmedHandle}" вече е зает. Моля, изберете друг slug.`);
      }
      console.error("Error creating collection:", error);
      throw new Error("Failed to create collection");
    }

    return collection;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in createCollection:", error);
    throw error;
  }
}

/**
 * Update a collection
 */
export async function updateCollection(data: UpdateCollectionData) {
  try {
    const supabase = createServiceClient();
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.handle !== undefined) {
      const trimmedHandle = data.handle.trim();
      
      // Check if handle already exists for another collection
      const handleExists = await checkCollectionHandleExists(trimmedHandle, data.id);
      if (handleExists) {
        throw new Error(`Slug "${trimmedHandle}" вече е зает. Моля, изберете друг slug.`);
      }
      
      updateData.handle = trimmedHandle;
    }
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.parent_id !== undefined) updateData.parent_id = data.parent_id || null;
    if (data.available !== undefined) updateData.available = data.available === true;

    const { data: collection, error } = await supabase
      .from("collections")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        throw new Error(`Slug "${updateData.handle || data.handle}" вече е зает. Моля, изберете друг slug.`);
      }
      console.error("Error updating collection:", error);
      throw new Error("Failed to update collection");
    }

    return collection;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in updateCollection:", error);
    throw error;
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId: string) {
  try {
    const supabase = createServiceClient();
    
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (error) {
      console.error("Error deleting collection:", error);
      throw new Error("Failed to delete collection");
    }

    return true;
  } catch (error) {
    // Don't catch React.postpone() - let it propagate for PPR
    if (isReactPostpone(error)) {
      throw error;
    }
    console.error("Error in deleteCollection:", error);
    throw error;
  }
}
