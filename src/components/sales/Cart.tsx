"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { CartItem } from "./PosInterface";

interface CartProps {
    items: CartItem[];
    customers: any[];
    selectedCustomer: string;
    onSelectCustomer: (id: string) => void;
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, delta: number) => void;
    onCheckout: (paid: number, discount: number) => void;
    isProcessing: boolean;
    mode: 'sale' | 'return';
    onModeChange: (mode: 'sale' | 'return') => void;
}

export function Cart({
    items,
    customers,
    selectedCustomer,
    onSelectCustomer,
    onRemove,
    onUpdateQuantity,
    onCheckout,
    isProcessing,
    mode,
    onModeChange
}: CartProps) {
    const [discount, setDiscount] = useState("0");
    const [paidAmount, setPaidAmount] = useState("");

    const subtotal = items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const numDiscount = parseFloat(discount) || 0;
    const total = Math.max(0, subtotal - numDiscount);

    const handleCheckoutClick = () => {
        onCheckout(parseFloat(paidAmount) || 0, numDiscount);
    }

    return (
        <Card className={`h-full flex flex-col ${mode === 'return' ? 'border-red-500/50 bg-red-50/10' : ''}`}>
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <CardTitle>{mode === 'sale' ? 'নতুন বিক্রি (New Sale)' : 'ফেরত (Return)'}</CardTitle>
                    <div className="flex bg-muted rounded-lg p-1">
                        <button
                            onClick={() => onModeChange('sale')}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${mode === 'sale' ? 'bg-background shadow font-medium' : 'text-muted-foreground'}`}
                        >
                            Sale
                        </button>
                        <button
                            onClick={() => onModeChange('return')}
                            className={`px-3 py-1 text-sm rounded-md transition-all ${mode === 'return' ? 'bg-red-100 text-red-700 shadow font-medium' : 'text-muted-foreground'}`}
                        >
                            Return
                        </button>
                    </div>
                </div>

                <Select value={selectedCustomer} onValueChange={onSelectCustomer}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Customer (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                        {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.phone})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-4">
                {items.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        Cart is empty
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">৳{item.selling_price} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, -1)}>
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, 1)}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-6 w-6 ml-1" onClick={() => onRemove(item.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>

            <Separator />

            <CardFooter className="flex-col gap-4 pt-4 bg-muted/20">
                <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>৳{subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm">Discount:</span>
                        <Input
                            type="number"
                            className="h-8 w-24 text-right"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>৳{total}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm">Paid:</span>
                        <Input
                            type="number"
                            className="h-8 w-24 text-right"
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            placeholder={total.toString()}

                        />
                    </div>
                </div>

                <Button
                    className="w-full"
                    size="lg"
                    disabled={items.length === 0 || isProcessing}
                    onClick={handleCheckoutClick}
                >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Checkout (৳{total})
                </Button>
            </CardFooter>
        </Card>
    );
}
