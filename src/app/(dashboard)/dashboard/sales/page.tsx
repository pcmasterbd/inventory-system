import { getProducts } from "@/app/actions/inventory";
import { getParties } from "@/app/actions/parties";
import { getInvoices, getSalesSummary } from "@/app/actions/sales";
import { PosInterface } from "@/components/sales/PosInterface";
import { SalesList } from "@/components/sales/SalesList";
import { SalesSummary } from "@/components/sales/SalesSummary";
import { BulkSalesInterface } from "@/components/sales/BulkSalesInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SalesPage() {
    const products = await getProducts();
    const customers = await getParties("customer");
    const invoices = await getInvoices();
    const summaryData = await getSalesSummary();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Money In (Sales)</h2>
                    <p className="text-muted-foreground">
                        Manage invoices, daily sales, and view transaction history.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="bulk" className="flex-1 flex flex-col">
                <div className="shrink-0 mb-4">
                    <TabsList>
                        <TabsTrigger value="bulk">Daily Sheet</TabsTrigger>
                        <TabsTrigger value="pos">New Sale (POS)</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="bulk" className="flex-1 mt-0 border rounded-lg p-4 bg-card data-[state=inactive]:hidden">
                    <BulkSalesInterface products={products || []} />
                </TabsContent>

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
