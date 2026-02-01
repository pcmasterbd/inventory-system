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
import { useLanguage } from "@/context/language-context";

interface ExpenseEntryDialogProps {
    expense?: {
        id: string;
        description: string;
        amount: number;
        expense_type: string;
        date: string;
    };
}

export function ExpenseEntryDialog({ expense }: ExpenseEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [costType, setCostType] = useState<"fixed" | "daily" | "personal" | "assets">("daily");
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("other");
    const { t } = useLanguage();

    const FIXED_CATEGORIES = [
        { value: "office_rent", label: t("expenses.categories.office_rent") },
        { value: "salary", label: t("expenses.categories.salary") },
        { value: "utility", label: t("expenses.categories.utility") },
        { value: "license_purchase", label: t("expenses.categories.license_purchase") },
    ];

    const DAILY_CATEGORIES = [
        { value: "tea_snacks", label: t("expenses.categories.tea_snacks") },
        { value: "transport", label: t("expenses.categories.transport") },
        { value: "mobile_bill", label: t("expenses.categories.mobile_bill") },
        { value: "repair", label: t("expenses.categories.repair") },
        { value: "cleaning", label: t("expenses.categories.cleaning") },
        { value: "ad_cost", label: t("expenses.categories.ad_cost") },
        { value: "other", label: t("expenses.categories.other") },
    ];

    const PERSONAL_CATEGORIES = [
        { value: "personal_withdrawal", label: t("expenses.categories.personal_withdrawal") },
        { value: "family_expense", label: t("expenses.categories.family_expense") },
        { value: "medical", label: t("expenses.categories.medical") },
        { value: "other_personal", label: t("expenses.categories.other_personal") },
    ];

    const ASSETS_CATEGORIES = [
        { value: "equipment", label: t("expenses.categories.equipment") },
        { value: "furniture", label: t("expenses.categories.furniture") },
        { value: "electronics", label: t("expenses.categories.electronics") },
        { value: "other_asset", label: t("expenses.categories.other_asset") },
    ];

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
                        {t("expenses.addExpense")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `${t("common.edit")} ${t("common.expenses")}` : t("expenses.addExpense")}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t("expenses.description") : t("expenses.description")}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Expense Type Toggle */}
                    <div className="grid gap-2">
                        <Label>{t("dashboard.type")}</Label>
                        <Tabs defaultValue="daily" value={costType} onValueChange={(v) => handleTypeChange(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 h-auto">
                                <TabsTrigger value="daily" className="text-xs py-2">{t("expenses.stats.daily")}</TabsTrigger>
                                <TabsTrigger value="fixed" className="text-xs py-2">{t("expenses.stats.fixed")}</TabsTrigger>
                                <TabsTrigger value="personal" className="text-xs py-2">{t("expenses.stats.personal")}</TabsTrigger>
                                <TabsTrigger value="assets" className="text-xs py-2">{t("expenses.stats.assets")}</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Category Select */}
                    <div className="grid gap-2">
                        <Label>{t("expenses.table.category")}</Label>
                        <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("expenses.table.category")} />
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
                        <Label>{t("expenses.table.description")}</Label>
                        <Input
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder={t("expenses.table.description")}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>{t("expenses.table.amount")}</Label>
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
                            {isEdit ? t("common.save") : t("common.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
