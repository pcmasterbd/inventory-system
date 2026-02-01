'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Product } from "@/lib/types"
import { deleteProduct } from '@/app/actions/inventory'
import { Trash2 } from 'lucide-react'
import { ProductEntryDialog } from '../inventory/ProductEntryDialog'
import { useLanguage } from '@/context/language-context'

export function ProductManager({ products }: { products: Product[] }) {
    const { t } = useLanguage();

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{t("dashboard.productList")}</h2>
                    <p className="text-muted-foreground">{t("dashboard.allProducts")}</p>
                </div>
                <ProductEntryDialog />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("common.name")}</TableHead>
                                    <TableHead>{t("inventory.product.stock")}</TableHead>
                                    <TableHead>{t("inventory.product.costPrice")}</TableHead>
                                    <TableHead>{t("inventory.product.sellingPrice")}</TableHead>
                                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                            {t("dashboard.noProducts")}
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
