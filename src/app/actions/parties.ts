"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addParty(data: {
    name: string;
    type: "customer" | "supplier";
    phone?: string;
    email?: string;
    address?: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("parties").insert({
        ...data,
        user_id: user.id,
    });

    if (error) {
        console.error("Error adding party:", error);
        throw error;
    }
    revalidatePath("/dashboard/parties");
}

export async function updateParty(id: string, data: {
    name: string;
    type: "customer" | "supplier";
    phone?: string;
    email?: string;
    address?: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("parties").update(data).eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error updating party:", error);
        throw error;
    }
    revalidatePath("/dashboard/parties");
}

export async function deleteParty(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("parties").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error deleting party:", error);
        throw error;
    }
    revalidatePath("/dashboard/parties");
}

export async function getParties(type?: "customer" | "supplier") {
    const supabase = await createClient();
    let query = supabase.from('parties').select('*');
    if (type) {
        query = query.eq('type', type);
    }
    const { data } = await query.order('name');
    return data;
}
