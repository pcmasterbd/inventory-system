"use client";

import { useLanguage } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartyEntryDialog } from "@/components/parties/PartyEntryDialog";
import { PartyList } from "@/components/parties/PartyList";

interface PartiesClientProps {
    customers: any[];
    suppliers: any[];
}

export function PartiesClient({ customers, suppliers }: PartiesClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("parties.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("parties.description")}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="customers" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="customers">{t("parties.tabs.customers")}</TabsTrigger>
                        <TabsTrigger value="suppliers">{t("parties.tabs.suppliers")}</TabsTrigger>
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
