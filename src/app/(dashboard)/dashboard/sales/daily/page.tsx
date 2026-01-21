import { getProductsForDailyEntry } from "@/app/actions/daily-sales";
import { DailySalesForm } from "@/components/sales/DailySalesForm";
import { Separator } from "@/components/ui/separator";

export default async function DailySalesPage() {
    const products = await getProductsForDailyEntry();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daily Sales Entry</h2>
                    <p className="text-muted-foreground">
                        Record daily sales, returns, and ad spend for all products.
                    </p>
                </div>
            </div>
            <Separator />
            <div className="py-4">
                <DailySalesForm products={products || []} />
            </div>
        </div>
    );
}
