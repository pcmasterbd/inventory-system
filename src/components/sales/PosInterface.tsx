"use client";

import { useState } from "react";
import { createInvoice } from "@/app/actions/sales";
import { ProductSearch } from "./ProductSearch";
import { Cart } from "./Cart";
import { StockManager } from "../inventory/StockManager";
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

    // Filter out products with no ID to be safe
    const validProducts = products.filter(p => p.id);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + 1;

            if (newQty > product.stock_quantity) {
                toast.warning(`Low Stock Warning: Only ${product.stock_quantity} available`);
            }

            if (existing) {
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

                    // Check stock limit if increasing
                    const product = products.find(p => p.id === productId);
                    if (delta > 0 && product && newQty > product.stock_quantity) {
                        toast.warning(`Low Stock Warning: Only ${product.stock_quantity} available`);
                    }

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
            // Check for potential stock outs
            const outOfStockItems: string[] = [];
            cart.forEach(item => {
                if (item.stock_quantity - item.quantity <= 0) {
                    outOfStockItems.push(item.name);
                }
            });

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

            // Trigger Out of Stock Notifications
            if (outOfStockItems.length > 0) {
                outOfStockItems.forEach(name => {
                    toast.error(`Alert: ${name} is now Out of Stock!`, {
                        duration: 5000,
                        className: "bg-destructive text-destructive-foreground"
                    });
                });
            }

        } catch (error) {
            console.error("Checkout failed", error);
            toast.error("Checkout failed. Check console.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
                <h2 className="text-xl font-bold tracking-tight">Point of Sale</h2>
                <div className="flex items-center gap-2">
                    <StockManager products={validProducts} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-10">
                {/* Product Section (Left 2 cols) */}
                <Card className="md:col-span-2 p-4 overflow-y-auto">
                    <ProductSearch
                        products={validProducts}
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
        </div>
    );
}
