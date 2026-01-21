'use client'

import { useState } from 'react' // If we add client-side filtering later
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteFundTransaction } from '@/app/(dashboard)/dashboard/funds/actions'
import { toast } from "sonner"

interface Transaction {
    id: string
    date: string
    amount: number
    transaction_type: string
    description: string | null
}

export function FundsTransactionList({ initialTransactions }: { initialTransactions: Transaction[] }) {

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        const res = await deleteFundTransaction(id);
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Transaction deleted")
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>তারিখ (Date)</TableHead>
                    <TableHead>ধরণ (Type)</TableHead>
                    <TableHead>বিবরণ (Description)</TableHead>
                    <TableHead className="text-right">পরিমাণ (Amount)</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {initialTransactions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">কোনো লেনদেন পাওয়া যায়নি।</TableCell>
                    </TableRow>
                ) : (
                    initialTransactions.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    t.transaction_type === 'deposit' || t.transaction_type === 'sales_deposit' ? 'default' :
                                        t.transaction_type === 'withdrawal' || t.transaction_type === 'expense_payment' ? 'destructive' : 'secondary'
                                }>
                                    {t.transaction_type.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell>{t.description || '-'}</TableCell>
                            <TableCell className={`text-right font-medium ${t.transaction_type === 'deposit' || t.transaction_type === 'sales_deposit' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {t.transaction_type === 'withdrawal' || t.transaction_type === 'expense_payment' ? '-' : '+'}
                                ৳{Number(t.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}
