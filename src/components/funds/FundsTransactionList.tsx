'use client'

import { useState } from 'react'
import { useLanguage } from "@/context/language-context"
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
    const { t } = useLanguage()

    const handleDelete = async (id: string) => {
        if (!confirm(t("accounts.deleteConfirm"))) return;

        const res = await deleteFundTransaction(id);
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(t("accounts.deleteSuccess"))
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t("accounts.modal.date")}</TableHead>
                    <TableHead>{t("accounts.modal.type")}</TableHead>
                    <TableHead>{t("accounts.modal.descriptionLabel")}</TableHead>
                    <TableHead className="text-right">{t("accounts.modal.amount")}</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {initialTransactions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">{t("common.noData")}</TableCell>
                    </TableRow>
                ) : (
                    initialTransactions.map((transaction) => {
                        const t_type = transaction.transaction_type;
                        return (
                            <TableRow key={transaction.id}>
                                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        t_type === 'deposit' || t_type === 'sales_deposit' ? 'default' :
                                            t_type === 'withdrawal' || t_type === 'expense_payment' ? 'destructive' : 'secondary'
                                    }>
                                        {t(`accounts.types.${t_type as any}`) || t_type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>{transaction.description || '-'}</TableCell>
                                <TableCell className={`text-right font-medium ${t_type === 'deposit' || t_type === 'sales_deposit' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {t_type === 'withdrawal' || t_type === 'expense_payment' ? '-' : '+'}
                                    ৳{Number(transaction.amount).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                )}
            </TableBody>
        </Table>
    )
}
