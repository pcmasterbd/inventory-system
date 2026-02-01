'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addTransaction } from '@/app/actions/accounts'
import { useLanguage } from '@/context/language-context'
import { Account } from '@/lib/types'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface TransactionManagerProps {
    accounts: Account[];
}

export function TransactionManager({ accounts }: TransactionManagerProps) {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('income')
    const [accountId, setAccountId] = useState<string>('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!accountId) {
            toast.error(t("dashboard.selectAccount") || "Please select an account")
            return
        }

        const formData = new FormData(e.currentTarget)
        const amount = parseFloat(formData.get('amount') as string)
        const description = formData.get('description') as string

        setLoading(true)
        try {
            await addTransaction({
                account_id: accountId,
                amount,
                transaction_type: type,
                description,
                category: type === 'income' ? 'Quick Income' : 'Quick Expense'
            })
            toast.success(t("common.success") || "Transaction saved")
            e.currentTarget.reset()
            setAccountId('')
        } catch (error) {
            console.error(error)
            toast.error(t("common.error") || "Failed to save transaction")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{t("dashboard.quickTransaction")}</CardTitle>
                <CardDescription>{t("dashboard.recordDaily")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income" className="w-full" onValueChange={(v) => setType(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="income">{t("dashboard.income")}</TabsTrigger>
                        <TabsTrigger value="expense">{t("dashboard.expense")}</TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("dashboard.account")}</Label>
                                <Select value={accountId} onValueChange={setAccountId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("dashboard.selectAccount") || "Select Account"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name} (৳{acc.balance.toLocaleString()})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">{t("dashboard.amountLabel")}</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">৳</span>
                                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" className="pl-8" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">{t("dashboard.descriptionLabel")}</Label>
                                <Input id="description" name="description" placeholder={t("dashboard.enterDescription")} required />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? t("dashboard.saving") : t("dashboard.saveTransaction")}
                            </Button>
                        </form>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    )
}
