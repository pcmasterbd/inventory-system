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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addAdSpend } from "@/app/actions/marketing";
import { useLanguage } from "@/context/language-context";

interface Product {
    id: string;
    name: string;
}

interface AdSpendDialogProps {
    products: Product[];
}

export function AdSpendDialog({ products }: AdSpendDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();

    // Form
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [productId, setProductId] = useState("");
    const [amountDollar, setAmountDollar] = useState("");
    const [rate, setRate] = useState("120");
    const [amountBdt, setAmountBdt] = useState(0);

    // Auto-calc BDT
    useEffect(() => {
        const dollar = parseFloat(amountDollar) || 0;
        const exchange = parseFloat(rate) || 0;
        setAmountBdt(Math.round(dollar * exchange));
    }, [amountDollar, rate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await addAdSpend({
                product_id: productId,
                date: date,
                amount_dollar: parseFloat(amountDollar),
                exchange_rate: parseFloat(rate),
            });

            if (res.success) {
                toast.success(t("reports.ads.success"));
                setOpen(false);
                setAmountDollar("");
                // Keep rate and date for convenience
            } else {
                toast.error(t("reports.ads.error"));
                console.error(res.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(t("common.error") || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={16} />
                    {t("reports.ads.button")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("reports.ads.title")}</DialogTitle>
                    <DialogDescription>
                        {t("reports.ads.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>{t("reports.ads.date")}</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t("reports.ads.product")}</Label>
                        <Select onValueChange={setProductId} value={productId} required>
                            <SelectTrigger>
                                <SelectValue placeholder={t("reports.ads.selectProduct")} />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t("reports.ads.amountDollar")}</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amountDollar}
                                onChange={(e) => setAmountDollar(e.target.value)}
                                min="0"
                                step="any"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t("reports.ads.rate")}</Label>
                            <Input
                                type="number"
                                placeholder="120"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">{t("reports.ads.bdtAmount")}</p>
                        <p className="text-2xl font-bold">৳{amountBdt.toLocaleString()}</p>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !productId}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("reports.ads.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
