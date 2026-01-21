"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addExpense(data: {
    date: string;
    description: string;
    amount: number;
    expense_type: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.from("roi_expenses").insert({
        ...data,
        user_id: user.id,
    });

    if (error) {
        console.error("Error adding expense:", error);
        return { success: false, message: error.message, error };
    }
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/roi");
    return { success: true };
}

export async function updateExpense(id: string, data: {
    date: string;
    description: string;
    amount: number;
    expense_type: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.from("roi_expenses").update({
        ...data
    }).eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error updating expense:", error);
        return { success: false, message: error.message, error };
    }
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/roi");
    return { success: true };
}

export async function getExpenses() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("roi_expenses")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            console.error("getExpenses Raw Error:", error);
            console.error("getExpenses Error Details:", JSON.stringify(error, null, 2));
            return [];
        }
        return data || [];
    } catch (e) {
        console.error("Unknown error in getExpenses:", e);
        return [];
    }
}

export async function deleteExpense(id: string) {
    const supabase = await createClient(); // Fixed missing client
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("roi_expenses").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
    revalidatePath("/dashboard/expenses");
    revalidatePath("/dashboard/roi");
}
