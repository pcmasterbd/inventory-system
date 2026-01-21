"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is "Row not found"
        console.error("Error fetching settings:", error);
    }

    return data;
}

export async function updateSettings(data: {
    dollar_rate: number;
    office_rent: number;
    monthly_salaries: number;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if settings exist, if not insert, else update
    const existing = await getSettings();

    let error;
    if (existing) {
        ({ error } = await supabase
            .from("settings")
            .update(data)
            .eq("id", existing.id));
    } else {
        ({ error } = await supabase
            .from("settings")
            .insert({ ...data, user_id: user.id }));
    }

    if (error) {
        console.error("Error updating settings:", error);
        throw error;
    }

    revalidatePath("/dashboard/settings");
}
