import { getParties } from "@/app/actions/parties";
import { PartyEntryDialog } from "@/components/parties/PartyEntryDialog";
import { PartyList } from "@/components/parties/PartyList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function PartiesPage() {
    const customers = await getParties("customer");
    const suppliers = await getParties("supplier");

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vendors & Customers</h2>
                    <p className="text-muted-foreground">
                        Manage your customer and supplier relationships.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="customers" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="customers">Customers (ক্রেতা)</TabsTrigger>
                        <TabsTrigger value="suppliers">Suppliers (সাপ্লায়ার)</TabsTrigger>
                    </TabsList>
                    <PartyEntryDialog />
                </div>

                <TabsContent value="customers" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-1">
                        <PartyList parties={customers || []} type="customer" />
                    </div>
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-1">
                        <PartyList parties={suppliers || []} type="supplier" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
