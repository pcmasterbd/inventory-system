"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, Loader2, RefreshCcw } from "lucide-react";
import { CartItem } from "./PosInterface";
import { Badge } from "@/components/ui/badge";

interface CartProps {
    items: CartItem[];
    customers: any[];
    selectedCustomer: string;
    onSelectCustomer: (id: string) => void;
    onRemove: (id: string) => void;
    onUpdateQuantity: (id: string, delta: number) => void;
    onCheckout: (paid: number, discount: number) => void;
    isProcessing: boolean;
}

export function Cart({
    items,
    customers,
    selectedCustomer,
    onSelectCustomer,
    onRemove,
    onUpdateQuantity,
    onCheckout,
    isProcessing
}: CartProps) {
    const [discount, setDiscount] = useState("0");
    const [paidAmount, setPaidAmount] = useState("");

    const subtotal = items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const numDiscount = parseFloat(discount) || 0;
    const total = subtotal - numDiscount;
    // Total can be negative (Refund Due)

    // Update default paid amount when total changes
    useEffect(() => {
        setPaidAmount(total.toString());
    }, [total]);

    const handleCheckoutClick = () => {
        onCheckout(parseFloat(paidAmount) || 0, numDiscount);
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <CardTitle>চলমান বিক্রি (Current Bill)</CardTitle>
                    <Badge variant={total >= 0 ? "default" : "destructive"}>
                        {total >= 0 ? "Sale" : "Refund/Exchange"}
                    </Badge>
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
                    items.map(item => {
                        const isReturn = item.quantity < 0;
                        return (
                            <div key={item.id} className={`flex items-center justify-between p-2 rounded-lg ${isReturn ? 'bg-red-50 border border-red-100' : ''}`}>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ৳{item.selling_price} x {item.quantity}
                                    </p>
                                    {isReturn && <span className="text-xs text-red-600 font-bold">Return</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, -1)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className={`text-sm w-6 text-center font-bold ${isReturn ? 'text-red-600' : ''}`}>
                                        {item.quantity}
                                    </span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, 1)}>
                                        <Plus className="h-3 w-3" />
                                    </Button>

                                    {/* Quick Toggle for Return? No space, just use +/- */}

                                    <Button size="icon" variant="destructive" className="h-6 w-6 ml-1" onClick={() => onRemove(item.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })
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
                    <div className={`flex justify-between font-bold text-lg ${total < 0 ? 'text-red-600' : ''}`}>
                        <span>{total >= 0 ? 'Net Payable:' : 'Refund Due:'}</span>
                        <span>৳{Math.abs(total)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm">{total >= 0 ? 'Paid:' : 'Refunded:'}</span>
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
                    className={`w-full ${total < 0 ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    size="lg"
                    disabled={items.length === 0 || isProcessing}
                    onClick={handleCheckoutClick}
                >
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {total >= 0 ? 'Complete Sale' : 'Process Refund/Exchange'}
                </Button>
            </CardFooter>
        </Card>
    );
}
