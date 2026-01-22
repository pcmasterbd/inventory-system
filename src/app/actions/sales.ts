"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface InvoiceItemInput {
    product_id: string;
    quantity: number;
    unit_price: number;
}

export async function createInvoice(data: {
    customer_id?: string;
    items: InvoiceItemInput[];
    paid_amount: number;
    discount: number;
    type?: 'sale' | 'return'; // Kept for optional tagging, but logic derives from items
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Calculate totals directly from signed quantities
    // If quantity is negative (Return), the amount effectively subtracts from total.
    const total_amount = data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Determine status. If total is negative (Refund), check if paid_amount equals total (Refunded).
    // Note: paid_amount should follow the sign of total usually, but UI might send positive 'Paid' for negative total?
    // Let's assume paid_amount matches the sign of valid transaction.
    // Logic: If (total - paid - discount) ~= 0 then paid.
    // BEWARE: Discount on negative total? 
    // Usually Discount reduces the absolute magnitude.
    // Let's rely on Net Due calculation.
    const net_due = total_amount - data.discount - data.paid_amount;
    const status = Math.abs(net_due) < 1 ? 'paid' : 'partial';

    // 1. Create Invoice Header
    const { data: invoice, error: invoiceError } = await supabase.from("invoices").insert({
        invoice_number: `INV-${Date.now()}`,
        customer_id: data.customer_id,
        total_amount: total_amount,
        discount: data.discount,
        paid_amount: data.paid_amount,
        status,
        user_id: user.id
    }).select().single();

    if (invoiceError) {
        console.error("Error creating invoice:", invoiceError.message, invoiceError.details || "");
        throw invoiceError;
    }

    // 2. Create Invoice Items
    const itemsToInsert = data.items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        user_id: user.id
    }));

    const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);

    if (itemsError) {
        console.error("Error creating invoice items:", itemsError);
        throw itemsError;
    }

    // 3. Update Product Stock
    for (const item of data.items) {
        const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
        if (product) {
            // General formula: NewStock = CurrentStock - SoldQuantity
            // If SoldQuantity is positive (Sale), Stock Decreases.
            // If SoldQuantity is negative (Return), Stock Increases ( - (-5) = +5 ).
            const newStock = product.stock_quantity - item.quantity;

            await supabase.from('products').update({
                stock_quantity: newStock
            }).eq('id', item.product_id);
        }
    }

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/inventory"); // Update inventory counts too
}

export async function getInvoices() {
    const supabase = await createClient();

    // 1. Fetch Invoices
    const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

    if (invoiceError) {
        console.error('Error fetching invoices:', invoiceError.message);
        return [];
    }

    if (!invoices || invoices.length === 0) return [];

    // 2. Fetch Parties (Customers)
    const customerIds = Array.from(new Set(invoices.map(inv => inv.customer_id).filter(Boolean)));
    let partiesMap = new Map();

    if (customerIds.length > 0) {
        const { data: parties } = await supabase
            .from('parties')
            .select('id, name, phone')
            .in('id', customerIds);

        if (parties) {
            parties.forEach(p => partiesMap.set(p.id, p));
        }
    }

    // 3. Fetch Invoice Items
    const invoiceIds = invoices.map(inv => inv.id);
    const { data: invoiceItems } = await supabase
        .from('invoice_items')
        .select('*')
        .in('invoice_id', invoiceIds);

    // 4. Fetch Products for Items
    let productMap = new Map();
    if (invoiceItems && invoiceItems.length > 0) {
        const productIds = Array.from(new Set(invoiceItems.map(item => item.product_id)));
        const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);

        if (products) {
            products.forEach(p => productMap.set(p.id, p));
        }
    }

    // 5. Assemble Data
    const formattedInvoices = invoices.map(invoice => {
        const customer = invoice.customer_id ? partiesMap.get(invoice.customer_id) : null;
        const items = invoiceItems?.filter(item => item.invoice_id === invoice.id) || [];
        const itemsWithProducts = items.map(item => ({
            ...item,
            products: productMap.get(item.product_id) || { name: 'Unknown Product' }
        }));

        return {
            ...invoice,
            parties: customer,
            invoice_items: itemsWithProducts
        };
    });

    return formattedInvoices;
}

export async function deleteInvoice(id: string) {
    const supabase = await createClient();

    // 1. Get invoice items to revert stock
    const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id);

    if (itemsError) return { error: itemsError.message };

    // 2. Revert stock changes
    // We need to check if the invoice itself was a Sale or Return to know how to revert
    const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('id', id)
        .single();

    const isReturn = invoice && invoice.total_amount < 0; // Heuristic: negative total means return

    for (const item of items) {
        const { data: product } = await supabase
            .from('products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

        if (product) {
            // If it was a SALE, we subtracted stock, so now we ADD it back.
            // If it was a RETURN, we added stock, so now we SUBTRACT it.
            const reversalQuantity = isReturn
                ? product.stock_quantity - item.quantity
                : product.stock_quantity + item.quantity;

            await supabase
                .from('products')
                .update({ stock_quantity: reversalQuantity })
                .eq('id', item.product_id);
        }
    }

    // 3. Delete Invoice (Cascading delete should handle items if configured, but let's be safe)
    // Deleting the invoice usually deletes items if ON DELETE CASCADE is set.
    // If not, we'd delete items first. Assuming simplified flow + cascade or manual clean up:
    const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

    if (deleteError) return { error: deleteError.message };

    revalidatePath('/dashboard/sales');
    revalidatePath('/dashboard/inventory');
    return { success: true };
}


export async function getSalesSummary() {
    const supabase = await createClient();

    // 1. Fetch Items
    const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('product_id, quantity, unit_price, invoice_id');

    if (itemsError) {
        console.error("Error fetching sales summary:", itemsError.message);
        return [];
    }

    if (!items || items.length === 0) return [];

    // 2. Fetch Products
    const productIds = Array.from(new Set(items.map(i => i.product_id)));
    const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

    const productMap = new Map();
    products?.forEach(p => productMap.set(p.id, p.name));

    // 3. Fetch Invoices (to check for returns)
    const invoiceIds = Array.from(new Set(items.map(i => i.invoice_id)));
    const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount')
        .in('id', invoiceIds);

    const invoiceMap = new Map();
    invoices?.forEach(inv => invoiceMap.set(inv.id, inv));

    // 4. Aggregate
    const summaryMap = new Map<string, {
        productName: string;
        totalSold: number;
        totalReturned: number;
        revenue: number;
    }>();

    items.forEach((item: any) => {
        const productName = productMap.get(item.product_id) || 'Unknown Product';
        const invoice = invoiceMap.get(item.invoice_id);
        const isReturn = invoice && invoice.total_amount < 0;

        if (!summaryMap.has(productName)) {
            summaryMap.set(productName, {
                productName,
                totalSold: 0,
                totalReturned: 0,
                revenue: 0
            });
        }

        const entry = summaryMap.get(productName)!;

        // Ensure numbers
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;

        if (isReturn) {
            entry.totalReturned += qty;
            entry.revenue -= (qty * price);
        } else {
            entry.totalSold += qty;
            entry.revenue += (qty * price);
        }
    });

    return Array.from(summaryMap.values());
}

// Updated createBulkSales to handle full ledger payload
export async function createBulkSales(data: {
    items: { product_id: string, quantity_sold: number, quantity_returned: number }[];
    expenses?: Record<string, number>;
    funds?: { property_fund: number; others_fund: number; per_spend: number };
    dollarInfo?: { dollar_cost: number; conversion_rate: number };
    totals?: { revenue: number; cogs: number; gross_profit: number; net_profit: number };
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const today = new Date().toISOString().split('T')[0];

    // 1. Handle Sales Invoices
    const items = data.items;
    if (items && items.length > 0) {
        // Fetch Products to get prices
        const productIds = items.map(i => i.product_id);
        const { data: products } = await supabase
            .from('products')
            .select('id, selling_price')
            .in('id', productIds);

        const productMap = new Map();
        products?.forEach(p => productMap.set(p.id, p));

        // Prepare Sales Items
        const salesItems = items
            .filter(i => i.quantity_sold > 0)
            .map(i => {
                const product = productMap.get(i.product_id);
                return {
                    product_id: i.product_id,
                    quantity: i.quantity_sold,
                    unit_price: product?.selling_price || 0
                };
            });

        // Prepare Return Items
        const returnItems = items
            .filter(i => i.quantity_returned > 0)
            .map(i => {
                const product = productMap.get(i.product_id);
                return {
                    product_id: i.product_id,
                    quantity: -i.quantity_returned,
                    unit_price: product?.selling_price || 0
                };
            });

        if (salesItems.length > 0) {
            await createInvoice({
                items: salesItems,
                paid_amount: salesItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0),
                discount: 0
            });
        }

        if (returnItems.length > 0) {
            await createInvoice({
                items: returnItems,
                paid_amount: returnItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0),
                discount: 0
            });
        }
    }

    // 2. Handle Expenses
    if (data.expenses) {
        const expenseEntries = Object.entries(data.expenses)
            .filter(([_, amount]) => amount > 0)
            .map(([type, amount]) => ({
                date: today,
                description: `Daily Ledger: ${type}`,
                amount: amount,
                expense_type: type, // e.g. 'office_rent', 'salary' matching DB assumption or free text
                user_id: user.id
            }));

        if (expenseEntries.length > 0) {
            await supabase.from("roi_expenses").insert(expenseEntries);
        }
    }

    // 3. Handle Funds
    if (data.funds) {
        // Update Property Fund
        if (data.funds.property_fund > 0) {
            // Check if exists, update or insert?? Schema has 'funds' table with 'name' and 'balance'
            // We want to ADD to balance.

            // Fetch current
            const { data: existingProp } = await supabase.from('funds').select('balance').eq('name', 'property_fund').single();
            const currentProp = existingProp?.balance || 0;

            await supabase.from('funds').upsert({
                name: 'property_fund',
                balance: Number(currentProp) + Number(data.funds.property_fund),
                updated_at: new Date().toISOString()
            }, { onConflict: 'name' });
        }

        // Update Others Fund
        if (data.funds.others_fund > 0) {
            const { data: existingOther } = await supabase.from('funds').select('balance').eq('name', 'others_fund').single();
            const currentOther = existingOther?.balance || 0;

            await supabase.from('funds').upsert({
                name: 'others_fund',
                balance: Number(currentOther) + Number(data.funds.others_fund),
                updated_at: new Date().toISOString()
            }, { onConflict: 'name' });
        }
    }

    // 4. Create Daily Ledger Summary
    if (data.totals || data.dollarInfo) {
        await supabase.from('daily_ledger').upsert({
            date: today,
            dollar_cost: data.dollarInfo?.dollar_cost || 0,
            total_revenue: data.totals?.revenue || 0,
            total_expense: Object.values(data.expenses || {}).reduce((a, b) => a + b, 0),
            net_profit: data.totals?.net_profit || 0,
            property_fund_added: data.funds?.property_fund || 0,
            others_fund_added: data.funds?.others_fund || 0,
            user_id: user.id
        }, { onConflict: 'date' });
    }

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/reports");
    revalidatePath("/dashboard");
}
