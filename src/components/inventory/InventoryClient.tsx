"use client";

import { useLanguage } from "@/context/language-context";
import { ProductEntryDialog } from "@/components/inventory/ProductEntryDialog";
import { StockPurchaseDialog } from "@/components/inventory/StockPurchaseDialog";
import { ProductList } from "@/components/inventory/ProductList";
import { Account, Product } from "@/lib/types";

interface InventoryClientProps {
    products: Product[];
    accounts: Account[];
}

export function InventoryClient({ products, accounts }: InventoryClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("inventory.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("inventory.description")}
                    </p>
                </div>
                <div className="flex gap-2">
                    <StockPurchaseDialog products={products || []} accounts={accounts || []} />
                    <ProductEntryDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <div className="col-span-1">
                    <ProductList initialProducts={products || []} />
                </div>
            </div>
        </div>
    );
}
