import { getProducts } from "@/app/actions/inventory";
import { getParties } from "@/app/actions/parties";
import { getInvoices, getSalesSummary } from "@/app/actions/sales";
import { getFinancialData } from "@/app/actions/financials";
import { SalesPageClient } from "@/components/sales/SalesPageClient";

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ range?: string, account?: string, category?: string }> }) {
    const params = await searchParams;
    const products = await getProducts();
    const customers = await getParties("customer");
    const invoices = await getInvoices();
    const summaryData = await getSalesSummary();

    const { accounts, categories, snapshot } = await getFinancialData({
        range: params.range,
        account_id: params.account,
        category: params.category
    });

    return (
        <SalesPageClient
            products={products || []}
            customers={customers || []}
            invoices={invoices || []}
            summaryData={summaryData || []}
            accounts={accounts}
            categories={categories}
            snapshot={snapshot}
        />
    );
}
