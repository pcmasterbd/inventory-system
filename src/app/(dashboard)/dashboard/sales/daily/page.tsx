import { getProductsForDailyEntry } from "@/app/actions/daily-sales";
import { DailySalesForm } from "@/components/sales/DailySalesForm";
import { Separator } from "@/components/ui/separator";

export default async function DailySalesPage() {
    const products = await getProductsForDailyEntry();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DailySalesForm products={products || []} />
        </div>
    );
}
