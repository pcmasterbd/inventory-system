import { getExpenses } from "@/app/actions/expenses";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const expenses = await getExpenses();

    return <ExpensesClient expenses={expenses || []} />;
}
