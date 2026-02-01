'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addFundTransaction } from '@/app/(dashboard)/dashboard/funds/actions'
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useLanguage } from "@/context/language-context"

export function AddTransactionModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { t } = useLanguage()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const result = await addFundTransaction(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(t("accounts.modal.success"))
            setOpen(false)
            // Reset form? The dialog unmounts or we can reset specifically if needed, but closing handles it mostly.
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> {t("accounts.addTransaction")}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("accounts.modal.title")}</DialogTitle>
                    <DialogDescription>
                        {t("accounts.modal.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                {t("accounts.modal.type")}
                            </Label>
                            <div className="col-span-3">
                                <Select name="transaction_type" defaultValue="deposit" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("accounts.modal.type")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="deposit">{t("accounts.types.deposit")}</SelectItem>
                                        <SelectItem value="withdrawal">{t("accounts.types.withdrawal")}</SelectItem>
                                        <SelectItem value="expense_payment">{t("accounts.types.expense_payment")}</SelectItem>
                                        <SelectItem value="sales_deposit">{t("accounts.types.sales_deposit")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                {t("accounts.modal.amount")}
                            </Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                {t("accounts.modal.date")}
                            </Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                {t("accounts.modal.descriptionLabel")}
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder={t("accounts.modal.placeholder")}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? t("accounts.modal.saving") : t("accounts.modal.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
