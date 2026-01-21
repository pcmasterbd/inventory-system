"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCategory(data: { name: string; unit_price: number; cogs_per_unit: number }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("roi_categories").insert({
        ...data,
        user_id: user.id,
    });

    if (error) throw error;
    revalidatePath("/dashboard/roi");
}

export async function addSale(data: { date: string; category_id: string; units_sold: number; returns: number }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");


    const { error } = await supabase.from("roi_sales_records").insert({
        ...data,
        user_id: user.id,
    });

    if (error) throw error;
    revalidatePath("/dashboard/roi");
}

export async function addExpense(data: { date: string; description: string; amount: number; expense_type: string }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("roi_expenses").insert({
        ...data,
        user_id: user.id, // Cast to any if strictly typed enum issues arise, but DB should handle string
    });

    if (error) throw error;
    revalidatePath("/dashboard/roi");
}
