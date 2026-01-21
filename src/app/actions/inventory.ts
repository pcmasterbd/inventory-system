"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProduct(id: string, data: {
    name: string;
    selling_price: number;
    cost_price: number;
    stock_quantity: number;
    type: 'physical' | 'digital';
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("products").update(data).eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error updating product:", error);
        throw error;
    }
    revalidatePath("/dashboard/inventory");
}

export async function deleteProduct(id: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
    revalidatePath("/dashboard/inventory");
}

export async function addProduct(data: {
    name: string;
    selling_price: number;
    cost_price: number;
    stock_quantity: number;
    type: 'physical' | 'digital';
}) {
    console.log("Started addProduct action", data);
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("addProduct: User not found");
            throw new Error("Unauthorized");
        }

        const { error } = await supabase.from("products").insert({
            ...data,
            user_id: user.id,
        });

        if (error) {
            console.error("Error adding product:", error);
            throw error;
        }
        revalidatePath("/dashboard/inventory");
    } catch (e) {
        console.error("CRITICAL ERROR in addProduct:", e);
        throw e;
    }
}

export async function getProducts() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').order('name');

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return data;
}

export async function updateStock(productId: string, quantity: number, type: 'purchase' | 'sale' | 'adjustment', reason?: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Record Transaction
    const { error: txError } = await supabase.from('inventory_transactions').insert({
        product_id: productId,
        quantity,
        transaction_type: type,
        reason,
        user_id: user.id
    });

    if (txError) throw txError;

    // 2. Update Product Stock (Simple increment/decrement)
    // Note: For high concurrency, use an RPC function. For now, we fetch and update.
    const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', productId).single();

    if (product) {
        const newStock = product.stock_quantity + quantity;
        await supabase.from('products').update({ stock_quantity: newStock }).eq('id', productId);
    }

    revalidatePath("/dashboard/inventory");
}
