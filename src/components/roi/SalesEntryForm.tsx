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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

interface SalesEntryFormProps {
    categories: Category[];
    onSubmit: (data: any) => Promise<void>;
}

export function SalesEntryForm({ categories, onSubmit }: SalesEntryFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [categoryId, setCategoryId] = useState("");
    const [unitsSold, setUnitsSold] = useState("");
    const [returns, setReturns] = useState("0");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId) return;

        setIsLoading(true);
        try {
            await onSubmit({
                date,
                category_id: categoryId,
                units_sold: parseInt(unitsSold),
                returns: parseInt(returns),
            });
            // Reset form (keep date)
            setUnitsSold("");
            setReturns("0");
        } catch (error) {
            console.error("Failed to submit sales", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>নতুন বিক্রয় যোগ করুন (New Sale)</CardTitle>
                <CardDescription>
                    প্রতিদিনের বিক্রয়ের হিসাব এখানে দিন
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">তারিখ (Date)</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">ক্যাটাগরি (Category)</Label>
                        <Select onValueChange={setCategoryId} value={categoryId} required>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="পণ্যের ধরন নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="units">ইউনিট বিক্রি (Units)</Label>
                            <Input
                                id="units"
                                type="number"
                                placeholder="0"
                                value={unitsSold}
                                onChange={(e) => setUnitsSold(e.target.value)}
                                required
                                min="0"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="returns">ফেরত (Returns)</Label>
                            <Input
                                id="returns"
                                type="number"
                                placeholder="0"
                                value={returns}
                                onChange={(e) => setReturns(e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        সেভ করুন (Save)
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
