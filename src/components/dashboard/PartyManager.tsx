'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Party } from "@/lib/types"
import { addParty, deleteParty } from '@/app/actions/parties'
import { Plus, Trash2, Users } from 'lucide-react'
import { useLanguage } from '@/context/language-context'
import { toast } from 'sonner'

export function PartyManager({ parties }: { parties: Party[] }) {
    const { t } = useLanguage();
    const [showAddForm, setShowAddForm] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleAdd(formData: FormData) {
        setLoading(true)
        try {
            const data = {
                name: formData.get('name') as string,
                type: formData.get('type') as "customer" | "supplier",
                phone: formData.get('phone') as string,
                address: formData.get('address') as string,
                balance: parseFloat(formData.get('balance') as string) || 0
            }
            await addParty(data)
            toast.success(t("common.success") || "Party added")
            setShowAddForm(false)
        } catch (error) {
            console.error(error)
            toast.error(t("common.error") || "Failed to add party")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold tracking-tight">{t("dashboard.partyManagement")}</h2>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="mr-2 h-4 w-4" /> {t("dashboard.addParty")}
                </Button>
            </div>

            {showAddForm && (
                <Card className="mb-4 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>{t("dashboard.newPartyInfo")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t("common.name")}</Label>
                                    <Input id="name" name="name" required placeholder={t("common.name")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">{t("dashboard.type")}</Label>
                                    <Select name="type" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("dashboard.selectType")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="customer">{t("dashboard.customer")}</SelectItem>
                                            <SelectItem value="supplier">{t("dashboard.supplier")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t("dashboard.phone")}</Label>
                                    <Input id="phone" name="phone" placeholder="017..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="balance">{t("dashboard.balanceDue")}</Label>
                                    <Input id="balance" name="balance" type="number" step="0.01" placeholder="0" />
                                    <p className="text-xs text-muted-foreground">{t("dashboard.balanceHint")}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">{t("dashboard.addressLabel")}</Label>
                                <Input id="address" name="address" placeholder={t("dashboard.addressLabel")} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => setShowAddForm(false)}>{t("common.cancel")}</Button>
                                <Button type="submit" disabled={loading}>{loading ? t("dashboard.saving") : t("common.save")}</Button>
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
                                    <TableHead>{t("common.name")}</TableHead>
                                    <TableHead>{t("dashboard.type")}</TableHead>
                                    <TableHead>{t("dashboard.phone")}</TableHead>
                                    <TableHead>{t("dashboard.addressLabel")}</TableHead>
                                    <TableHead className="text-right">{t("common.balance")}</TableHead>
                                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            {t("dashboard.noParties")}
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
                                                    {party.type === 'customer' ? t("dashboard.customer") :
                                                        party.type === 'investor' ? t("dashboard.investor") :
                                                            t("dashboard.supplier")}
                                                </span>
                                            </TableCell>
                                            <TableCell>{party.phone || '-'}</TableCell>
                                            <TableCell>{party.address || '-'}</TableCell>
                                            <TableCell className={`text-right font-medium ${party.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ৳{party.balance}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive h-8 w-8"
                                                    disabled={loading}
                                                    onClick={async () => {
                                                        if (confirm(t("common.deleteConfirm") || "Are you sure?")) {
                                                            setLoading(true)
                                                            try {
                                                                await deleteParty(party.id)
                                                                toast.success(t("common.success") || "Party deleted")
                                                            } catch (error) {
                                                                toast.error(t("common.error") || "Failed to delete party")
                                                            } finally {
                                                                setLoading(false)
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
