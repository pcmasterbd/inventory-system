"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CategoryEntryFormProps {
    onSubmit: (data: any) => Promise<void>;
}

export function CategoryEntryForm({ onSubmit }: CategoryEntryFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [cogs, setCogs] = useState("0");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit({
                name,
                unit_price: parseFloat(price),
                cogs_per_unit: parseFloat(cogs),
            });
            setName("");
            setPrice("");
            setCogs("0");
        } catch (error) {
            console.error("Failed to submit category", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>নতুন পণ্য/ক্যাটাগরি (Add Product)</CardTitle>
                <CardDescription>
                    পণ্যের নাম এবং দাম নির্ধারণ করুন
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cat-name">পণ্যের নাম (Name)</Label>
                        <Input
                            id="cat-name"
                            placeholder="Ex: Premium Package"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">বিক্রয় মূল্য (Unit Price)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                min="0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cogs">কেনা দাম (Cost/COGS)</Label>
                            <Input
                                id="cogs"
                                type="number"
                                placeholder="0.00"
                                value={cogs}
                                onChange={(e) => setCogs(e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" type="submit" variant="outline" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        সেভ করুন (Save Product)
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
