"use client";

import { useState, useEffect } from "react";
import { addAccount, updateAccount } from "@/app/actions/accounts";
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
import { Loader2, Plus, Edit } from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface AccountEntryDialogProps {
    account?: {
        id: string;
        name: string;
        balance: number;
    };
}

export function AccountEntryDialog({ account }: AccountEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [balance, setBalance] = useState("");
    const { t } = useLanguage();

    useEffect(() => {
        if (open) {
            if (account) {
                setName(account.name);
                setBalance(account.balance.toString());
            } else {
                setName("");
                setBalance("");
            }
        }
    }, [open, account]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                name,
                balance: parseFloat(balance) || 0,
            };

            if (account) {
                await updateAccount(account.id, data);
            } else {
                await addAccount(data);
            }

            setOpen(false);
            if (!account) {
                setName("");
                setBalance("");
            }
        } catch (error) {
            console.error("Failed to save account", error);
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = !!account;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                ) : (
                    <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("accounts.addAccount")}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `${t("common.edit")} ${t("common.accounts")}` : t("accounts.addAccount")}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t("accounts.description") : t("accounts.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t("accounts.table.accountName")}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("accounts.table.accountName")}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="balance">{t("accounts.table.balance")}</Label>
                        <Input
                            id="balance"
                            type="number"
                            placeholder="0.00"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
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
