"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Edit } from "lucide-react";
import { addExpense, updateExpense } from "@/app/actions/expenses";
import { toast } from "sonner";

interface ExpenseEntryDialogProps {
    expense?: {
        id: string;
        description: string;
        amount: number;
        expense_type: string;
        date: string; // ISO string
    };
}

export function ExpenseEntryDialog({ expense }: ExpenseEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("other");

    // Initialize/Reset form when opening or when expense changes
    useEffect(() => {
        if (open) {
            if (expense) {
                setDesc(expense.description);
                setAmount(expense.amount.toString());
                setType(expense.expense_type);
            } else {
                setDesc("");
                setAmount("");
                setType("other");
            }
        }
    }, [open, expense]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                date: expense ? expense.date : new Date().toISOString(), // Keep original date if editing, else new
                description: desc,
                amount: parseFloat(amount),
                expense_type: type
            };

            let result;
            if (expense) {
                result = await updateExpense(expense.id, data);
            } else {
                result = await addExpense(data);
            }

            if (result.success) {
                setOpen(false);
                if (!expense) {
                    setDesc("");
                    setAmount("");
                }
                toast.success(expense ? "খরচ আপডেট হয়েছে (Expense Updated)" : "খরচ যুক্ত হয়েছে (Expense Added)");
            } else {
                console.error(result.error);
                toast.error(`Error: ${result.message || "Something went wrong"}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন (Failed)");
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = !!expense;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                ) : (
                    <Button className="gap-2 shadow-lg shadow-primary/25">
                        <Plus size={18} />
                        নতুন খরচ যুক্ত করুন
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "খরচ আপডেট করুন (Update Expense)" : "নতুন খরচ (New Expense)"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "খরচের বিবরণ পরিবর্তন করুন।" : "আপনার দৈনিক খরচের বিবরণ নিচে দিন।"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>বিবরণ (Description)</Label>
                        <Input
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="যেমন: দোকান ভাড়া, ইন্টারনেট বিল..."
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>পরিমাণ (Amount)</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>খরচের ধরণ (Category)</Label>
                        <Select onValueChange={setType} value={type}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="office_rent">অফিস ভাড়া (Office Rent)</SelectItem>
                                <SelectItem value="salary">বেতন (Salaries)</SelectItem>
                                <SelectItem value="ad_cost">বিজ্ঞাপন খরচ (Ad Cost)</SelectItem>
                                <SelectItem value="license_purchase">লাইসেন্স ক্রয় (License Key)</SelectItem>
                                <SelectItem value="utility">বিদ্যুৎ/ইন্টারনেট (Utility)</SelectItem>
                                <SelectItem value="other">অন্যান্য (Others)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "আপডেট করুন" : "জমা দিন"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
