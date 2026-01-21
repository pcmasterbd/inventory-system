"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Wallet } from "lucide-react";

import { AccountEntryDialog } from "./AccountEntryDialog";
import { DeleteAccountButton } from "./DeleteAccountButton";

interface AccountListProps {
    accounts: any[];
}

export function AccountList({ accounts }: AccountListProps) {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="space-y-4">
            {/* Total Balance Card */}
            <Card className="bg-primary text-primary-foreground">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">মোট বর্তমান ব্যালেন্স (Total Balance)</CardTitle>
                    <Wallet className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">৳{totalBalance}</div>
                </CardContent>
            </Card>

            {/* Individual Accounts */}
            <div className="grid grid-cols-2 gap-4">
                {accounts.map((acc) => (
                    <Card key={acc.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{acc.name}</CardTitle>
                            <div className="flex gap-1">
                                <AccountEntryDialog account={acc} />
                                <DeleteAccountButton id={acc.id} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">৳{acc.balance}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
