"use client"

import { useState } from "react"
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
import { Loader2, PlusCircle } from "lucide-react"
import { toast } from "sonner"
import { purchaseStock } from "@/app/actions/inventory"
import { Product, Account } from "@/lib/types"
import { useLanguage } from "@/context/language-context"

interface StockPurchaseDialogProps {
    products: Product[];
    accounts: Account[];
}

export function StockPurchaseDialog({ products, accounts }: StockPurchaseDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [quantity, setQuantity] = useState("")
    const [unitCost, setUnitCost] = useState("")
    const [accountId, setAccountId] = useState<string>("")
    const { t } = useLanguage()

    // Derived
    const totalCost = (parseFloat(quantity) || 0) * (parseFloat(unitCost) || 0)

    const handleProductChange = (productId: string) => {
        setSelectedProductId(productId)
        const prod = products.find(p => p.id === productId)
        if (prod) {
            setUnitCost(prod.cost_price?.toString() || "")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProductId) {
            toast.error(t("inventory.selectProduct") || "Please select a product")
            return
        }
        if (!accountId) {
            toast.error(t("dashboard.selectAccount") || "Please select an account")
            return
        }

        setIsLoading(true)
        try {
            await purchaseStock({
                productId: selectedProductId,
                quantity: Number(quantity),
                unitCost: Number(unitCost),
                totalCost,
                accountId: accountId
            })

            toast.success(t("common.success") || "Stock added and expense recorded!")
            setOpen(false)
            // Reset form
            setQuantity("")
            setUnitCost("")
            setSelectedProductId("")
            setAccountId("")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || t("common.error") || "Failed to purchase stock")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <PlusCircle size={18} />
                    {t("inventory.purchaseStock")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("inventory.purchaseStock")}</DialogTitle>
                    <DialogDescription>
                        {t("inventory.description")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* Product Select */}
                    <div className="grid gap-2">
                        <Label>{t("inventory.table.product")}</Label>
                        <Select value={selectedProductId} onValueChange={handleProductChange}>
                            <SelectTrigger>
                                <SelectValue placeholder={t("inventory.table.product")} />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} ({t("inventory.table.stock")}: {p.stock_quantity})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t("sales.list.details.qty")}</Label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0"
                                required
                                min="1"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t("inventory.table.buyingPrice")}</Label>
                            <Input
                                type="number"
                                value={unitCost}
                                onChange={(e) => setUnitCost(e.target.value)}
                                placeholder="0"
                                required
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Total Cost Display */}
                    <div className="p-3 bg-muted rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium">{t("sales.list.details.total")}:</span>
                        <span className="text-lg font-bold">৳{totalCost.toLocaleString()}</span>
                    </div>

                    {/* Account Select */}
                    <div className="grid gap-2">
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

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !selectedProductId}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("common.save")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
