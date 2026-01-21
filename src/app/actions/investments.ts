"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getInvestments() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("investments").select("*").order("start_date", { ascending: false });

    if (error) {
        console.error("Error fetching investments:", error);
        return [];
    }

    return data;
}

export async function addInvestment(data: {
    name: string;
    start_date: string;
    capital_amount: number;
    current_return: number;
    status: "active" | "closed";
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("investments").insert({
        ...data,
        user_id: user.id,
    });

    if (error) throw error;
    revalidatePath("/dashboard/investments");
}

export async function updateInvestment(id: string, data: {
    name: string;
    start_date: string;
    capital_amount: number;
    current_return: number;
    status: "active" | "closed";
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("investments").update(data).eq("id", id).eq("user_id", user.id);

    if (error) throw error;
    revalidatePath("/dashboard/investments");
}

export async function deleteInvestment(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("investments").delete().eq("id", id).eq("user_id", user.id);

    if (error) throw error;
    revalidatePath("/dashboard/investments");
}
