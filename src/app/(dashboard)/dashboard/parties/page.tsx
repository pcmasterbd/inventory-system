import { getParties } from "@/app/actions/parties";
import { PartiesClient } from "@/components/parties/PartiesClient";

export default async function PartiesPage() {
    const customers = await getParties("customer");
    const suppliers = await getParties("supplier");

    return <PartiesClient customers={customers || []} suppliers={suppliers || []} />;
}
