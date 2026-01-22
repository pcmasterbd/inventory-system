"use client";

import { useState } from "react";
import { createInvoice } from "@/app/actions/sales";
import { ProductSearch } from "./ProductSearch";
import { Cart } from "./Cart";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    selling_price: number;
    stock_quantity: number;
}

interface Customer {
    id: string;
    name: string;
    phone: string | null;
}

interface PosInterfaceProps {
    products: any[];
    customers: any[];
}

export interface CartItem extends Product {
    quantity: number;
}

export function PosInterface({ products, customers }: PosInterfaceProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                // If adding same item, just increment. If it was negative (return), it approaches 0.
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    const newQty = item.quantity + delta;
                    // Allow negative for Return/Exchange. 
                    // If 0, we can remove or keep. Let's keep smooth transition: 1 -> 0 -> -1.
                    // User can remove using Trash icon if they want to clear.
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const clearCart = () => setCart([]);

    const handleCheckout = async (paidAmount: number, discount: number) => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);

        try {
            await createInvoice({
                customer_id: (selectedCustomer && selectedCustomer !== 'walk-in') ? selectedCustomer : undefined,
                items: cart.filter(i => i.quantity !== 0).map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.selling_price
                })),
                paid_amount: paidAmount,
                discount: discount
            });

            clearCart();
            toast.success("Transaction Completed!");
        } catch (error) {
            console.error("Checkout failed", error);
            toast.error("Checkout failed. Check console.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-10">
            {/* Product Section (Left 2 cols) */}
            <Card className="md:col-span-2 p-4 overflow-y-auto">
                <ProductSearch
                    products={products}
                    onAdd={addToCart}
                />
            </Card>

            {/* Cart Section (Right 1 col) */}
            <div className="h-full">
                <Cart
                    items={cart}
                    customers={customers}
                    selectedCustomer={selectedCustomer}
                    onSelectCustomer={setSelectedCustomer}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    onCheckout={handleCheckout}
                    isProcessing={isCheckingOut}
                />
            </div>
        </div>
    );
}
