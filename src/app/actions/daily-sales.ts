"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DailySaleEntry = {
    product_id: string;
    quantity_sold: number;
    quantity_returned: number;
    ad_cost_dollar: number;
};

export async function saveDailySales(date: string, entries: DailySaleEntry[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // We use upsert based on (date, product_id) if we had a unique constraint.
    // However, our schema `daily_sales` has a surrogate key `id`.
    // We should probably check if an entry exists for that date and product and update it, otherwise insert.
    // Or simpler: delete all entries for that date and insert new ones (replace mode).
    // Let's go with "Delete all for date -> Insert new" for simplicity and avoiding complex upsert logic with IDs,
    // ASSUMING this form submits ALL data for the day. 
    // BUT the user might want to edit just one product.
    // Better approach: Upsert. But we need to find existing ID.

    // Let's implement Upsert logic:
    // 1. Fetch existing entries for this date.
    // 2. Map them.
    // 3. Update or Insert.

    // Actually, Supabase `upsert` works if we have a unique constraint on (date, product_id).
    // We didn't add that constraint in the migration explicitly, but we should have.
    // Let's rely on application logic: Delete existing for these products on this date, then insert.
    // That handles "update" effectively.

    const productIds = entries.map(e => e.product_id);

    // 1. Delete existing entries for these products on this date
    const { error: deleteError } = await supabase
        .from("daily_sales")
        .delete()
        .eq("date", date)
        .in("product_id", productIds)
        .eq("user_id", user.id);

    if (deleteError) {
        console.error("Error deleting old entries:", deleteError);
        throw deleteError;
    }

    // 2. Insert new entries (only those with non-zero values)
    const validEntries = entries.filter(e =>
        e.quantity_sold > 0 || e.quantity_returned > 0 || e.ad_cost_dollar > 0
    ).map(e => ({
        date,
        product_id: e.product_id,
        quantity_sold: e.quantity_sold,
        quantity_returned: e.quantity_returned,
        ad_cost_dollar: e.ad_cost_dollar,
        user_id: user.id
    }));

    if (validEntries.length > 0) {
        const { error: insertError } = await supabase
            .from("daily_sales")
            .insert(validEntries);

        if (insertError) {
            console.error("Error inserting daily sales:", insertError);
            throw insertError;
        }
    }

    revalidatePath("/dashboard/sales/daily");
    revalidatePath("/dashboard"); // For dashboard stats
}

export async function getDailySales(date: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("daily_sales")
        .select("*")
        .eq("date", date);

    if (error) throw error;
    return data;
}

// Fetch products with their stats for the form
export async function getProductsForDailyEntry() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("products")
        .select("id, name, type, selling_price, cost_price, stock_quantity")
        .order("name");

    if (error) throw error;
    return data;
}
