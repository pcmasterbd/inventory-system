import { getProducts } from "@/app/actions/inventory";
import { getParties } from "@/app/actions/parties";
import { getInvoices, getSalesSummary } from "@/app/actions/sales";
import { PosInterface } from "@/components/sales/PosInterface";
import { SalesList } from "@/components/sales/SalesList";
import { SalesSummary } from "@/components/sales/SalesSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SalesPage() {
    const products = await getProducts();
    const customers = await getParties("customer");
    const invoices = await getInvoices();
    const summaryData = await getSalesSummary();

    return (
        <div className="flex-1 p-4 md:p-6 h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-2xl font-bold tracking-tight">বিক্রয় ব্যবস্থাপনা (Sales Management)</h2>
            </div>

            <Tabs defaultValue="pos" className="flex-1 flex flex-col overflow-hidden">
                <div className="shrink-0 mb-4">
                    <TabsList>
                        <TabsTrigger value="pos">নতুন বিক্রয় (Point of Sale)</TabsTrigger>
                        <TabsTrigger value="history">বিক্রয় ইতিহাস (Sales History)</TabsTrigger>
                        <TabsTrigger value="summary">সারসংক্ষেপ (Summary)</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pos" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                    <PosInterface
                        products={products || []}
                        customers={customers || []}
                    />
                </TabsContent>

                <TabsContent value="history" className="flex-1 overflow-auto mt-0 border rounded-lg p-4 bg-card h-full data-[state=inactive]:hidden">
                    <SalesList invoices={invoices || []} />
                </TabsContent>

                <TabsContent value="summary" className="flex-1 overflow-auto mt-0 border rounded-lg p-4 bg-card h-full data-[state=inactive]:hidden">
                    <SalesSummary data={summaryData || []} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
