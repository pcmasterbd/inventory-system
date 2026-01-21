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
                        <span className="sr-only">Edit</span>
                    </Button>
                ) : (
                    <Button className="gap-2 shadow-lg shadow-primary/25">
                        <Plus size={18} />
                        নতুন বিনিয়োগ
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Investment" : "New Investment"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update investment details." : "Add a new investment portfolio."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Investment Name (খাত)</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Share Market" required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Start Date (শুরুর তারিখ)</Label>
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Capital (মূলধন)</Label>
                        <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} required />
                    </div>
                    <div className="grid gap-2">
                        <Label>Current Return (বর্তমান লাভ/ক্ষতি)</Label>
                        <Input type="number" value={returns} onChange={(e) => setReturns(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select onValueChange={(val: any) => setStatus(val)} value={status}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active (চালু)</SelectItem>
                                <SelectItem value="closed">Closed (বন্ধ)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "Update" : "Add Investment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
