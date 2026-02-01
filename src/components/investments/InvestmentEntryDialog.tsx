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
import { addInvestment, updateInvestment } from "@/app/actions/investments";
import { useLanguage } from "@/context/language-context";

interface InvestmentEntryDialogProps {
    investment?: {
        id: string;
        name: string;
        start_date: string;
        capital_amount: number;
        current_return: number;
        status: "active" | "closed";
    };
}

export function InvestmentEntryDialog({ investment }: InvestmentEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [capital, setCapital] = useState("");
    const [returns, setReturns] = useState("0");
    const [status, setStatus] = useState<"active" | "closed">("active");
    const { t } = useLanguage();

    useEffect(() => {
        if (open) {
            if (investment) {
                setName(investment.name);
                setStartDate(investment.start_date);
                setCapital(investment.capital_amount.toString());
                setReturns(investment.current_return.toString());
                setStatus(investment.status);
            } else {
                setName("");
                setStartDate(new Date().toISOString().split('T')[0]);
                setCapital("");
                setReturns("0");
                setStatus("active");
            }
        }
    }, [open, investment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                name,
                start_date: startDate,
                capital_amount: parseFloat(capital),
                current_return: parseFloat(returns),
                status,
            };

            if (investment) {
                await updateInvestment(investment.id, data);
            } else {
                await addInvestment(data);
            }

            setOpen(false);
            if (!investment) {
                setName("");
                setStartDate(new Date().toISOString().split('T')[0]);
                // setCapital("");
                // setReturns("0");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = !!investment;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{t("common.edit")}</span>
                    </Button>
                ) : (
                    <Button className="gap-2 shadow-lg shadow-primary/25">
                        <Plus size={18} />
                        {t("investments.addInvestment")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `${t("common.edit")} ${t("investments.table.portfolio")}` : t("investments.addInvestment")}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t("investments.description") : t("investments.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>{t("investments.table.portfolio")}</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("investments.table.portfolio")} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t("investments.table.startDate")}</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t("investments.table.capital")}</Label>
                        <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t("investments.table.currentReturn")}</Label>
                        <Input type="number" value={returns} onChange={(e) => setReturns(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t("investments.table.status")}</Label>
                        <Select onValueChange={(val: any) => setStatus(val)} value={status}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">{t("investments.table.active")}</SelectItem>
                                <SelectItem value="closed">{t("investments.table.closed")}</SelectItem>
                            </SelectContent>
                        </Select>
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
