'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Product } from "@/lib/types"
import { addProduct, deleteProduct } from '@/app/actions'
import { Plus, Trash2 } from 'lucide-react'
import { ProductEntryDialog } from '../inventory/ProductEntryDialog'

export function ProductManager({ products }: { products: Product[] }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">প্রোডাক্ট লিস্ট (Inventory)</h2>
                    <p className="text-muted-foreground">আপনার সব পণ্যের তালিকা</p>
                </div>
                <ProductEntryDialog />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>নাম (Name)</TableHead>
                                    <TableHead>স্টক (Stock)</TableHead>
                                    <TableHead>ক্রয় মূল্য (Cost)</TableHead>
                                    <TableHead>বিক্রয় মূল্য (Sale)</TableHead>
                                    <TableHead className="text-right">অ্যাকশন (Action)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                            কোনো প্রোডাক্ট পাওয়া যায়নি। নতুন প্রোডাক্ট যোগ করুন।
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.stock_quantity}</TableCell>
                                            <TableCell>৳{product.cost_price}</TableCell>
                                            <TableCell>৳{product.selling_price}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <ProductEntryDialog product={product} />
                                                    <form action={async () => {
                                                        await deleteProduct(product.id)
                                                    }}>
                                                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </form>
                                                </div>
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
