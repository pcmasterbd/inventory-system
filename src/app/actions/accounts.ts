"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAccount(data: { name: string; balance: number }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("accounts").insert({
        ...data,
        user_id: user.id,
    });

    if (error) {
        console.error("Error adding account:", error);
        throw error;
    }
    revalidatePath("/dashboard/accounts");
}

export async function addTransaction(data: {
    account_id: string;
    amount: number;
    transaction_type: "income" | "expense" | "transfer";
    category?: string;
    description?: string;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Record Transaction
    const { error } = await supabase.from("transactions").insert({
        ...data,
        user_id: user.id,
    });

    if (error) {
        console.error("Error adding transaction:", error);
        throw error;
    }

    // 2. Update Account Balance
    const { data: account } = await supabase.from("accounts").select("balance").eq("id", data.account_id).single();

    if (account) {
        let newBalance = account.balance;
        if (data.transaction_type === "income") {
            newBalance += data.amount;
        } else {
            newBalance -= data.amount;
        }

        await supabase.from("accounts").update({ balance: newBalance }).eq("id", data.account_id);
    }

    revalidatePath("/dashboard/accounts");
}

export async function updateAccount(id: string, data: { name: string; balance: number }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("accounts").update(data).eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error updating account:", error);
        throw error;
    }
    revalidatePath("/dashboard/accounts");
}

export async function deleteAccount(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Transactions will cascade if DB is set up that way, otherwise might error.
    // Assuming cascade or we delete transactions first? 
    // For now simple delete.
    const { error } = await supabase.from("accounts").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error deleting account:", error);
        throw error;
    }
    revalidatePath("/dashboard/accounts");
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Get Transaction to know amount/type
    const { data: tx } = await supabase.from("transactions").select("*").eq("id", id).single();
    if (!tx) throw new Error("Transaction not found");

    // 2. Delete Transaction
    const { error } = await supabase.from("transactions").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
        console.error("Error deleting transaction:", error);
        throw error;
    }

    // 3. Rollback Balance
    const { data: account } = await supabase.from("accounts").select("balance").eq("id", tx.account_id).single();
    if (account) {
        let newBalance = account.balance;
        // Reverse logic: if it WAS income, we subtract. If it WAS expense, we add.
        if (tx.transaction_type === "income") {
            newBalance -= tx.amount;
        } else {
            newBalance += tx.amount;
        }
        await supabase.from("accounts").update({ balance: newBalance }).eq("id", tx.account_id);
    }

    revalidatePath("/dashboard/accounts");
}

export async function getAccounts() {
    const supabase = await createClient();
    const { data } = await supabase.from('accounts').select('*').order('name');
    return data;
}

export async function getTransactions() {
    const supabase = await createClient();
    const { data } = await supabase.from('transactions').select('*, accounts(name)').order('date', { ascending: false });
    return data;
}
