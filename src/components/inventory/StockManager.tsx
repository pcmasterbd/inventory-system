"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adjustStock } from "@/app/actions/inventory";
import { toast } from "sonner";
import { PackagePlus, PackageMinus, Search } from "lucide-react";

interface Product {
    id: string;
    name: string;
    stock_quantity: number;
}

interface StockManagerProps {
    products: Product[];
}

export function StockManager({ products }: StockManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<string>("");
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    const handleStockUpdate = async (type: 'in' | 'out') => {
        if (!selectedProduct || !quantity) return;

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        setIsLoading(true);
        try {
            const result = await adjustStock(
                selectedProduct.id,
                qty,
                type,
                reason || (type === 'in' ? 'Stock Refill' : 'Manual Adjustment')
            );

            if (result.success) {
                toast.success(`Stock ${type === 'in' ? 'Added' : 'Removed'} Successfully!`);
                setIsOpen(false);
                // Reset form
                setSelectedProduct(null);
                setQuantity("");
                setReason("");
                setSearchTerm("");
            } else {
                toast.error("Failed to update stock");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <PackagePlus className="h-4 w-4" />
                    Stock Management
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Stock Management</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="in" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="in" className="gap-2">
                            <PackagePlus className="h-4 w-4" /> Stock In
                        </TabsTrigger>
                        <TabsTrigger value="out" className="gap-2">
                            <PackageMinus className="h-4 w-4" /> Stock Out
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 space-y-4">
                        {/* Product Search */}
                        <div className="space-y-2">
                            <Label>Select Product</Label>
                            {!selectedProduct ? (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search product..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    {searchTerm && (
                                        <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                                            {filteredProducts.map(product => (
                                                <div
                                                    key={product.id}
                                                    className="p-2 cursor-pointer hover:bg-accent flex justify-between items-center"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setSearchTerm("");
                                                    }}
                                                >
                                                    <span className="font-medium">{product.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        Current: {product.stock_quantity}
                                                    </span>
                                                </div>
                                            ))}
                                            {filteredProducts.length === 0 && (
                                                <div className="p-2 text-sm text-muted-foreground text-center">
                                                    No products found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 border rounded-md bg-accent/20">
                                    <div>
                                        <div className="font-semibold">{selectedProduct.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Current Stock: {selectedProduct.stock_quantity}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedProduct(null)}
                                    >
                                        Change
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Quantity Input */}
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                placeholder="Enter quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                        </div>

                        <TabsContent value="in">
                            <Button
                                className="w-full mt-2"
                                onClick={() => handleStockUpdate('in')}
                                disabled={isLoading || !selectedProduct || !quantity}
                            >
                                {isLoading ? "Updating..." : "Add Stock"}
                            </Button>
                        </TabsContent>

                        <TabsContent value="out">
                            <div className="space-y-2 mb-4">
                                <Label>Reason (Optional)</Label>
                                <Input
                                    placeholder="e.g. Damaged, Expired, Theft"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => handleStockUpdate('out')}
                                disabled={isLoading || !selectedProduct || !quantity}
                            >
                                {isLoading ? "Updating..." : "Remove Stock"}
                            </Button>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
