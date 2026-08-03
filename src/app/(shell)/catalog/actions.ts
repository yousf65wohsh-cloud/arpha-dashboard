"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";

/**
 * Stock and price edits only.
 *
 * `name` is deliberately not editable here. Renaming an item is how the
 * catalog item limit would be gamed, so the design routes name changes
 * through the separate ingestion channel. Adding it to this form would
 * quietly undo that control.
 */
export async function updateItem(formData: FormData) {
  const table = String(formData.get("table"));
  const id = String(formData.get("id"));
  if (table !== "products" && table !== "services") {
    throw new Error("Unknown table");
  }

  const price = formData.get("price");
  const qty = formData.get("qty");
  const description = formData.get("description");

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (price !== null && price !== "") patch.price = Number(price);
  if (description !== null) patch.description = String(description);
  if (qty !== null && qty !== "") {
    patch[table === "products" ? "stock" : "available"] = Number(qty);
  }

  const { error } = await db().from(table).update(patch).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/catalog");
}
