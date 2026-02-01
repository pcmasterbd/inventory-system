"use client";

import { useState } from "react";
import { addTransaction } from "@/app/actions/accounts";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
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
import { useLanguage } from "@/context/language-context";

interface TransactionEntryFormProps {
    accounts: any[];
}

export function TransactionEntryForm({ accounts }: TransactionEntryFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [accountId, setAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [desc, setDesc] = useState("");
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId) return;

        setIsLoading(true);
        try {
            await addTransaction({
                account_id: accountId,
                amount: parseFloat(amount),
                transaction_type: type,
                description: desc
            });
            setAmount("");
            setDesc("");
        } catch (error) {
            console.error("Failed to add transaction", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-l-4 border-l-primary">
            <CardHeader>
                <CardTitle>{t("accounts.transactionForm")}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>{t("dashboard.account")}</Label>
                        <Select onValueChange={setAccountId} value={accountId}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("dashboard.account")} />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.name} (৳{acc.balance})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t("dashboard.type")}</Label>
                            <Select onValueChange={(v: any) => setType(v)} value={type}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">{t("dashboard.out")}</SelectItem>
                                    <SelectItem value="income">{t("dashboard.in")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>{t("accounts.table.amount")}</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>{t("accounts.table.description")}</Label>
                        <Input
                            placeholder={t("accounts.table.description")}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>

                    <Button className="w-full" type="submit" disabled={isLoading} variant={type === 'income' ? 'default' : 'destructive'}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {type === 'income' ? t("common.save") : t("common.save")}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
