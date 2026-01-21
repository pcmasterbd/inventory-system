"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductEntryDialog } from "./ProductEntryDialog";
import { DeleteProductButton } from "./DeleteProductButton";

interface Product {
    id: string;
    name: string;
    stock_quantity: number;
    selling_price: number;
    cost_price: number;
}

interface ProductListProps {
    initialProducts: any[]; // relaxed type for now
}

export function ProductList({ initialProducts }: ProductListProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Product List ({initialProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-right">৳{product.cost_price}</TableCell>
                                    <TableCell className="text-right">৳{product.selling_price}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={product.stock_quantity < 10 ? "destructive" : "secondary"}>
                                            {product.stock_quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <ProductEntryDialog product={product} />
                                            <DeleteProductButton id={product.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
