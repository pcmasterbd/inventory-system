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

interface ExpenseEntryFormProps {
    onSubmit: (data: any) => Promise<void>;
}

export function ExpenseEntryForm({ onSubmit }: ExpenseEntryFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("variable");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit({
                date,
                description,
                amount: parseFloat(amount),
                expense_type: type,
            });
            // Reset form
            setDescription("");
            setAmount("");
            setType("variable");
        } catch (error) {
            console.error("Failed to submit expense", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>নতুন খরচ যোগ করুন (New Expense)</CardTitle>
                <CardDescription>
                    অফিস, অ্যাড বা অন্য খরচের হিসাব
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="exp-date">তারিখ (Date)</Label>
                        <Input
                            id="exp-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">খরচের ধরন (Type)</Label>
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="খরচের ধরন" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="variable">Variable Cost (অন্যান্য)</SelectItem>
                                <SelectItem value="ad_cost">Ad Cost (বিজ্ঞাপন)</SelectItem>
                                <SelectItem value="salary">Salary (বেতন)</SelectItem>
                                <SelectItem value="fixed">Fixed Cost (স্থায়ী খরচ)</SelectItem>
                                <SelectItem value="personal">Personal (ব্যক্তিগত)</SelectItem>
                                <SelectItem value="assets">Assets (সম্পদ)</SelectItem>
                                <SelectItem value="other">Other (অন্যান্য)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">বিবরণ (Description)</Label>
                        <Input
                            id="description"
                            placeholder="খরচের বিবরণ..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">টাকার পরিমাণ (Amount)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" type="submit" variant="secondary" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        খরচ যোগ করুন (Add Expense)
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
