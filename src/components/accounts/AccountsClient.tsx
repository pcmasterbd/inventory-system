"use client";

import { useLanguage } from "@/context/language-context";
import { AccountList } from "@/components/accounts/AccountList";
import { AccountEntryDialog } from "@/components/accounts/AccountEntryDialog";
import { TransactionEntryForm } from "@/components/accounts/TransactionEntryForm";
import { TransactionList } from "@/components/accounts/TransactionList";

interface AccountsClientProps {
    accounts: any[];
    transactions: any[];
}

export function AccountsClient({ accounts, transactions }: AccountsClientProps) {
    const { t } = useLanguage();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t("accounts.title")}</h2>
                    <p className="text-muted-foreground">
                        {t("accounts.description")}
                    </p>
                </div>
                <AccountEntryDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <div className="col-span-4 md:col-span-4 space-y-4">
                    <AccountList accounts={accounts || []} />
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{t("accounts.recentTransactions")}</h3>
                        <TransactionList transactions={transactions || []} />
                    </div>
                </div>

                <div className="col-span-4 md:col-span-3 space-y-4">
                    <TransactionEntryForm accounts={accounts || []} />
                </div>
            </div>
        </div>
    );
}
