'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Party } from "@/lib/types"
import { addParty, deleteParty } from '@/app/actions'
import { Plus, Trash2, Users } from 'lucide-react'

export function PartyManager({ parties }: { parties: Party[] }) {
    const [showAddForm, setShowAddForm] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleAdd(formData: FormData) {
        setLoading(true)
        await addParty(formData)
        setLoading(false)
        setShowAddForm(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold tracking-tight">পার্টি ম্যানেজমেন্ট (CRM)</h2>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="mr-2 h-4 w-4" /> পার্টি যুক্ত করুন
                </Button>
            </div>

            {showAddForm && (
                <Card className="mb-4 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>নতুন পার্টি তথ্য</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">নাম</Label>
                                    <Input id="name" name="name" required placeholder="নাম লিখুন" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">ধরন</Label>
                                    <Select name="type" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="সিলেক্ট করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="customer">কাস্টমার (Customer)</SelectItem>
                                            <SelectItem value="supplier">সাপ্লায়ার (Supplier)</SelectItem>
                                            <SelectItem value="investor">ইনভেস্টর (Investor)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">মোবাইল</Label>
                                    <Input id="phone" name="phone" placeholder="017..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="balance">ব্যালেন্স / বাকি</Label>
                                    <Input id="balance" name="balance" type="number" step="0.01" placeholder="0" />
                                    <p className="text-xs text-muted-foreground">পজিটিভ (+) মানে পাবে, নেগেটিভ (-) মানে দিতে হবে</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">ঠিকানা</Label>
                                <Input id="address" name="address" placeholder="ঠিকানা" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>বাতিল</Button>
                                <Button type="submit" disabled={loading}>{loading ? 'সেভ করা হচ্ছে...' : 'সেভ করুন'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>নাম</TableHead>
                                    <TableHead>ধরন</TableHead>
                                    <TableHead>মোবাইল</TableHead>
                                    <TableHead>ঠিকানা</TableHead>
                                    <TableHead className="text-right">ব্যালেন্স</TableHead>
                                    <TableHead className="text-right">অ্যাকশন</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            কোনো পার্টি যুক্ত করা নেই।
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    parties.map((party) => (
                                        <TableRow key={party.id}>
                                            <TableCell className="font-medium">{party.name}</TableCell>
                                            <TableCell className="capitalize">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                    ${party.type === 'customer' ? 'bg-blue-100 text-blue-700' :
                                                        party.type === 'investor' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-orange-100 text-orange-700'}`}>
                                                    {party.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>{party.phone || '-'}</TableCell>
                                            <TableCell>{party.address || '-'}</TableCell>
                                            <TableCell className={`text-right font-medium ${party.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ৳{party.balance}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <form action={async (formData) => {
                                                    await deleteParty(party.id, formData)
                                                }}>
                                                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
