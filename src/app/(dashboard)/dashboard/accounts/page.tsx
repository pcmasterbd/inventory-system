import { getAccounts, getTransactions } from "@/app/actions/accounts";
import { AccountsClient } from "@/components/accounts/AccountsClient";

export default async function AccountsPage() {
    const accounts = await getAccounts();
    const transactions = await getTransactions();

    return <AccountsClient accounts={accounts || []} transactions={transactions || []} />;
}
