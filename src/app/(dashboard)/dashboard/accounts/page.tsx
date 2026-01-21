import { getAccounts, getTransactions } from "@/app/actions/accounts";
import { AccountEntryDialog } from "@/components/accounts/AccountEntryDialog";
import { AccountList } from "@/components/accounts/AccountList";
import { TransactionEntryForm } from "@/components/accounts/TransactionEntryForm";
import { TransactionList } from "@/components/accounts/TransactionList";

export default async function AccountsPage() {
    const accounts = await getAccounts();
    const transactions = await getTransactions();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">অ্যাকাউন্টস এবং তহবিল (Funds)</h2>
                    <p className="text-muted-foreground">
                        ক্যাশ, ব্যাংক এবং অন্যান্য ব্যালেন্স ম্যানেজ করুন।
                    </p>
                </div>
                <AccountEntryDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Left Side: Accounts & Recent Transactions */}
                <div className="col-span-4 md:col-span-4 space-y-4">
                    <AccountList accounts={accounts || []} />
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">সাম্প্রতিক লেনদেন (Transactions)</h3>
                        <TransactionList transactions={transactions || []} />
                    </div>
                </div>

                {/* Right Side: Forms */}
                <div className="col-span-4 md:col-span-3 space-y-4">
                    <TransactionEntryForm accounts={accounts || []} />
                </div>
            </div>
        </div>
    );
}
