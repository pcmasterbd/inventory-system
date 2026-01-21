import { getProducts } from "@/app/actions/inventory";
import { ProductEntryDialog } from "@/components/inventory/ProductEntryDialog";
import { ProductList } from "@/components/inventory/ProductList";
import { Separator } from "@/components/ui/separator";

export default async function InventoryPage() {
    const products = await getProducts();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
                    <p className="text-muted-foreground">
                        Manage your products, stock levels, and pricing.
                    </p>
                </div>
                <ProductEntryDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {/* Product List - Full Width */}
                <div className="col-span-1">
                    <ProductList initialProducts={products || []} />
                </div>
            </div>
        </div>
    );
}
