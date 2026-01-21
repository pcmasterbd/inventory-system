'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addTransaction } from '@/app/actions'
import { PlusCircle, MinusCircle } from 'lucide-react'

export function TransactionManager() {
    // Simple form state
    const [loading, setLoading] = useState(false)

    async function clientAction(formData: FormData) {
        setLoading(true)
        await addTransaction(formData)
        setLoading(false)
        // resetting form could be done by ref or vanilla js, simple way for now
        const form = document.getElementById('transaction-form') as HTMLFormElement
        form?.reset()
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>দ্রুত লেনদেন (Quick Transaction)</CardTitle>
                <CardDescription>দৈনিক আয় বা ব্যয় রেকর্ড করুন</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="income" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="income">আয় (Income)</TabsTrigger>
                        <TabsTrigger value="expense">ব্যয় (Expense)</TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        <form id="transaction-form" action={clientAction} className="space-y-4">
                            <input type="hidden" name="type" id="type-input" value="income" />

                            <TabsContent value="income" className="mt-0">
                                <input type="hidden" name="type" value="income" />
                            </TabsContent>
                            <TabsContent value="expense" className="mt-0">
                                <input type="hidden" name="type" value="expense" />
                            </TabsContent>

                            <div className="space-y-2">
                                <Label htmlFor="amount">পরিমাণ (Amount)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">৳</span>
                                    <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" className="pl-8" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">বিবরণ (Description)</Label>
                                <Input id="description" name="description" placeholder="লেনদেনের বিবরণ লিখুন..." required />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'সেভ হচ্ছে...' : 'লেনদেন সেভ করুন'}
                            </Button>
                        </form>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    )
}
