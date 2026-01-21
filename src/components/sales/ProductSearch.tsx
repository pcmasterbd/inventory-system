"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductSearchProps {
    products: any[];
    onAdd: (product: any) => void;
}

export function ProductSearch({ products, onAdd }: ProductSearchProps) {
    const [query, setQuery] = useState("");

    const filteredProducts = useMemo(() => {
        if (!query) return products;
        const lower = query.toLowerCase();
        return products.filter((p) =>
            p.name.toLowerCase().includes(lower) ||
            p.sku?.toLowerCase().includes(lower)
        );
    }, [products, query]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products by name or SKU..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-8"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="group cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col justify-between"
                        onClick={() => onAdd(product)}
                    >
                        <div>
                            <h3 className="font-semibold truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <span className="font-bold text-primary">৳{product.selling_price}</span>
                            <Badge variant={product.stock_quantity > 0 ? "secondary" : "destructive"}>
                                {product.stock_quantity} in stock
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
