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

export function AddTransactionModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const result = await addFundTransaction(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Transaction added successfully")
            setOpen(false)
            // Reset form? The dialog unmounts or we can reset specifically if needed, but closing handles it mostly.
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> লেনদেন যোগ করুন (Add Transaction)</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>তহবিলের লেনদেন যোগ করুন</DialogTitle>
                    <DialogDescription>
                        আপনার হাতে নগদ (তহবিল) সামঞ্জস্য করতে একটি জমা বা উত্তোলন রেকর্ড করুন।
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                ধরণ (Type)
                            </Label>
                            <div className="col-span-3">
                                <Select name="transaction_type" defaultValue="deposit" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="ধরণ নির্বাচন করুন" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="deposit">জমা (Deposit)</SelectItem>
                                        <SelectItem value="withdrawal">উত্তোলন (Withdrawal)</SelectItem>
                                        <SelectItem value="expense_payment">খরচ প্রদান (Expense Payment)</SelectItem>
                                        <SelectItem value="sales_deposit">বিক্রয় লব্ধ অর্থ (Sales Deposit)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                পরিমাণ (Amount)
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
                                তারিখ (Date)
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
                                বিবরণ (Description)
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="উদাঃ প্রাথমিক মূলধন"
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন (Save)'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
