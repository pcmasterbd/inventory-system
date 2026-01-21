"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductTableProps {
    products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[300px]">পণ্যের নাম (Product Name)</TableHead>
                        <TableHead>ক্যাটাগরি (Category)</TableHead>
                        <TableHead>এসকিউ (SKU)</TableHead>
                        <TableHead className="text-right">দাম (Price)</TableHead>
                        <TableHead className="text-center">স্টক (Stock)</TableHead>
                        <TableHead className="text-right">অ্যাকশন (Actions)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{product.name}</div>
                                        {product.type === 'digital' && (
                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
                                                Digital
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{product.supplier || "সাপ্লায়ার নেই"}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
                                    {product.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex flex-col items-end">
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] text-muted-foreground">বিক্রয়:</span>
                                        <span className="font-semibold text-emerald-600">৳{product.sellingPrice}</span>
                                    </div>
                                    <div className="flex flex-col text-right mt-1">
                                        <span className="text-[10px] text-muted-foreground">ক্রয়:</span>
                                        <span className="text-xs text-muted-foreground line-through">৳{product.purchasePrice}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-col items-center">
                                    <div className={`font-bold ${product.stock <= product.minStockAlert ? "text-red-500" : "text-foreground"}`}>
                                        {product.stock}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground uppercase">{product.unit}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash size={16} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div >
    );
}
