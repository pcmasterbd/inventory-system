"use client";

import { useState, useEffect } from "react";
import { addProduct, updateProduct } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Edit } from "lucide-react";
import { toast } from "sonner";

interface ProductEntryDialogProps {
    product?: {
        id: string;
        name: string;
        selling_price: number;
        cost_price: number;
        stock_quantity: number;
        type?: 'physical' | 'digital';
    };
}

export function ProductEntryDialog({ product }: ProductEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [costPrice, setCostPrice] = useState("");
    const [stock, setStock] = useState("");
    const [type, setType] = useState<"physical" | "digital">("physical");

    useEffect(() => {
        if (open) {
            if (product) {
                setName(product.name);
                setSellingPrice(product.selling_price.toString());
                setCostPrice(product.cost_price.toString());
                setStock(product.stock_quantity.toString());
                setType(product.type || "physical");
            } else {
                setName("");
                setSellingPrice("");
                setCostPrice("");
                setStock("");
                setType("physical");
            }
        }
    }, [open, product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                name,
                selling_price: parseFloat(sellingPrice) || 0,
                cost_price: parseFloat(costPrice) || 0,
                stock_quantity: parseInt(stock) || 0,
                type,
            };

            if (product) {
                await updateProduct(product.id, data);
            } else {
                await addProduct(data);
            }

            setOpen(false);
            if (!product) {
                setName("");
                setSellingPrice("");
                setCostPrice("");
                setStock("");
                setType("physical");
            }
            toast.success(product ? "Product updated" : "Product created");
        } catch (error: any) {
            console.error("Failed to save product", error);
            toast.error(error.message || "Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = !!product;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">সম্পাদনা (Edit)</span>
                    </Button>
                ) : (
                    <Button className="gap-2 shadow-lg shadow-primary/25">
                        <Plus size={18} />
                        নতুন পণ্য যোগ করুন
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "পণ্য সম্পাদনা (Edit Product)" : "নতুন পণ্য যোগ করুন (Add Product)"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "পণ্যের তথ্য পরিবর্তন করুন।" : "আপনার ইনভেন্টরিতে নতুন পণ্য যোগ করুন।"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">পণ্যের নাম (Product Name)</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="উদাহরণ: Rice 25kg"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>পণ্যের ধরণ (Product Type)</Label>
                        <Select value={type} onValueChange={(value: "physical" | "digital") => setType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="physical">ফিজিক্যাল (Physical)</SelectItem>
                                <SelectItem value="digital">ডিজিটাল (Digital - License/Key)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sellingPrice">বিক্রয় মূল্য (Sales Price)</Label>
                            <Input
                                id="sellingPrice"
                                type="number"
                                value={sellingPrice}
                                onChange={(e) => setSellingPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="costPrice">ক্রয় মূল্য (Cost Price)</Label>
                            <Input
                                id="costPrice"
                                type="number"
                                value={costPrice}
                                onChange={(e) => setCostPrice(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock">বর্তমান স্টক (Stock)</Label>
                        <Input
                            id="stock"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "আপডেট করুন" : "সেভ করুন"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
