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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Edit } from "lucide-react";
import { addExpense, updateExpense } from "@/app/actions/expenses";
import { toast } from "sonner";

interface ExpenseEntryDialogProps {
    expense?: {
        id: string;
        description: string;
        amount: number;
        expense_type: string;
        date: string;
    };
}

const FIXED_CATEGORIES = [
    { value: "office_rent", label: "অফিস ভাড়া (Office Rent)" },
    { value: "salary", label: "বেতন (Salaries)" },
    { value: "utility", label: "বিদ্যুৎ/ইন্টারনেট (Utility)" },
    { value: "license_purchase", label: "লাইসেন্স/সফটওয়্যার (License/Software)" },
];

const DAILY_CATEGORIES = [
    { value: "tea_snacks", label: "চা/নাস্তা (Tea/Snacks)" },
    { value: "transport", label: "যাতায়াত (Transport)" },
    { value: "mobile_bill", label: "মোবাইল বিল (Mobile Bill)" },
    { value: "repair", label: "মেরামত (Repair)" },
    { value: "cleaning", label: "পরিচ্ছন্নতা (Cleaning)" },
    { value: "ad_cost", label: "বিজ্ঞাপন (Ad Cost)" },
    { value: "other", label: "অন্যান্য (Others)" },
];

const PERSONAL_CATEGORIES = [
    { value: "personal_withdrawal", label: "হাত খরচ (Personal Withdrawal)" },
    { value: "family_expense", label: "পরিবার (Family)" },
    { value: "medical", label: "চিকিৎসা (Medical)" },
    { value: "other_personal", label: "অন্যান্য (Other Personal)" },
];

const ASSETS_CATEGORIES = [
    { value: "equipment", label: "যন্ত্রপাতি (Equipment)" },
    { value: "furniture", label: "আসবাবপত্র (Furniture)" },
    { value: "electronics", label: "ইলেকট্রনিক্স (Electronics)" },
    { value: "other_asset", label: "অন্যান্য (Other Asset)" },
];

export function ExpenseEntryDialog({ expense }: ExpenseEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [costType, setCostType] = useState<"fixed" | "daily" | "personal" | "assets">("daily");
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("other");

    // Initialize/Reset
    useEffect(() => {
        if (open) {
            if (expense) {
                setDesc(expense.description);
                setAmount(expense.amount.toString());

                // Try to infer type from existing category
                const isFixed = FIXED_CATEGORIES.some(c => c.value === expense.expense_type);
                const isPersonal = PERSONAL_CATEGORIES.some(c => c.value === expense.expense_type);
                const isAssets = ASSETS_CATEGORIES.some(c => c.value === expense.expense_type);

                if (isFixed) setCostType("fixed");
                else if (isPersonal) setCostType("personal");
                else if (isAssets) setCostType("assets");
                else setCostType("daily");

                setCategory(expense.expense_type);
            } else {
                setDesc("");
                setAmount("");
                setCostType("daily");
                setCategory("other");
            }
        }
    }, [open, expense]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                date: expense ? expense.date : new Date().toISOString(),
                description: desc,
                amount: parseFloat(amount),
                expense_type: category // Storing the specific category in existing column
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
                toast.success(expense ? "খরচ আপডেট হয়েছে" : "খরচ যুক্ত হয়েছে");
            } else {
                console.error(result.error);
                toast.error(`Error: ${result.message || "Something went wrong"}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("সমস্যা হয়েছে, আবার চেষ্টা করুন");
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = !!expense;
    let currentCategories = DAILY_CATEGORIES;
    if (costType === "fixed") currentCategories = FIXED_CATEGORIES;
    else if (costType === "personal") currentCategories = PERSONAL_CATEGORIES;
    else if (costType === "assets") currentCategories = ASSETS_CATEGORIES;

    // Reset category when switching types if current selection is invalid for new type
    const handleTypeChange = (val: "fixed" | "daily" | "personal" | "assets") => {
        setCostType(val);
        let cats = DAILY_CATEGORIES;
        if (val === "fixed") cats = FIXED_CATEGORIES;
        else if (val === "personal") cats = PERSONAL_CATEGORIES;
        else if (val === "assets") cats = ASSETS_CATEGORIES;

        setCategory(cats[0].value);
    };

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
                        নতুন খরচ (Add Expense)
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "খরচ আপডেট করুন" : "নতুন খরচ যুক্ত করুন"}</DialogTitle>
                    <DialogDescription>
                        খরচের ধরণ নির্বাচন করে বিবরণ দিন।
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Expense Type Toggle */}
                    <div className="grid gap-2">
                        <Label>খরচের ধরণ (Expense Type)</Label>
                        <Tabs defaultValue="daily" value={costType} onValueChange={(v) => handleTypeChange(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 h-auto">
                                <TabsTrigger value="daily" className="text-xs py-2">ডেইলি (Daily)</TabsTrigger>
                                <TabsTrigger value="fixed" className="text-xs py-2">ফিক্সড (Fixed)</TabsTrigger>
                                <TabsTrigger value="personal" className="text-xs py-2">পার্সোনাল (Personal)</TabsTrigger>
                                <TabsTrigger value="assets" className="text-xs py-2">সম্পদ (Assets)</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Category Select */}
                    <div className="grid gap-2">
                        <Label>ক্যাটাগরি (Category)</Label>
                        <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger>
                                <SelectValue placeholder="ক্যাটাগরি সিলেক্ট করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {currentCategories.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>বিবরণ (Description)</Label>
                        <Input
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="বিস্তারিত লিখুন..."
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
