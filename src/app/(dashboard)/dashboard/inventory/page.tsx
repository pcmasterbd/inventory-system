import { getProducts } from "@/app/actions/inventory";
import { getAccounts } from "@/app/actions/accounts";
import { InventoryClient } from "@/components/inventory/InventoryClient";

export default async function InventoryPage() {
    const products = await getProducts();
    const accounts = await getAccounts();

    return <InventoryClient products={products || []} accounts={accounts || []} />;
}
