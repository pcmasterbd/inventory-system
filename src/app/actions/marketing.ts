"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAdSpend(data: {
    product_id: string;
    date: string;
    amount_dollar: number;
    exchange_rate: number;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.from("product_ad_spends").insert({
        ...data,
        user_id: user.id,
    });

    if (error) {
        console.error("Error adding ad spend:", error);
        return { success: false, message: error.message, error };
    }
    revalidatePath("/dashboard/roi");
    return { success: true };
}

export async function getAdSpends(startDate: string, endDate: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("product_ad_spends")
        .select(`
            *,
            products ( name )
        `)
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching ad spends:", error);
        return [];
    }
    return data;
}

export async function deleteAdSpend(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.from("product_ad_spends").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error deleting ad spend:", error);
        return { success: false, message: error.message };
    }
    revalidatePath("/dashboard/roi");
    return { success: true };
}
