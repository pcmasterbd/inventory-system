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
import { Product } from "@/lib/types"

interface StockPurchaseDialogProps {
    products: Product[];
}

export function StockPurchaseDialog({ products }: StockPurchaseDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [quantity, setQuantity] = useState("")
    const [unitCost, setUnitCost] = useState("")
    const [account, setAccount] = useState("cash") // Default to cash for now, ideally fetch accounts

    // Derived
    const selectedProduct = products.find(p => p.id === selectedProductId)
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
            toast.error("Please select a product")
            return
        }

        setIsLoading(true)
        try {
            await purchaseStock({
                productId: selectedProductId,
                quantity: Number(quantity),
                unitCost: Number(unitCost),
                totalCost,
                accountName: account
            })

            toast.success("Stock added and expense recorded!")
            setOpen(false)
            // Reset form
            setQuantity("")
            setUnitCost("")
            setSelectedProductId("")
        } catch (error) {
            console.error(error)
            toast.error("Failed to purchase stock")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <PlusCircle size={18} />
                    স্টক ইন (Purchase Stock)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>স্টক কিনুন (Stock Purchase)</DialogTitle>
                    <DialogDescription>
                        পণ্যের স্টক বাড়ান এবং খরচ (Expense) হিসেবে রেকর্ড করুন।
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    {/* Product Select */}
                    <div className="grid gap-2">
                        <Label>পণ্য নির্বাচন করুন (Select Product)</Label>
                        <Select value={selectedProductId} onValueChange={handleProductChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="পণ্য খুঁজুন..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} (Current: {p.stock_quantity})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>পরিমাণ (Quantity)</Label>
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
                            <Label>ইউনিট খরচ (Unit Cost)</Label>
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
                        <span className="text-sm font-medium">মোট খরচ (Total Cost):</span>
                        <span className="text-lg font-bold">৳{totalCost.toLocaleString()}</span>
                    </div>

                    {/* Account Select (Simplified) */}
                    <div className="grid gap-2">
                        <Label>পেমেন্ট মাধ্যম (Payment Account)</Label>
                        <Select value={account} onValueChange={setAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Account" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="bank">Bank</SelectItem>
                                <SelectItem value="bkash">Bkash</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !selectedProductId}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Purchase
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
