"use client";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { DeleteTransactionButton } from "./DeleteTransactionButton";

interface TransactionListProps {
    transactions: any[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return <div className="text-muted-foreground text-sm">No transactions yet.</div>
    }

    return (
        <Card>
            <CardContent className="p-0">
                {transactions.map((tx) => (
                    <div key={tx.id} className="group flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${tx.transaction_type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {tx.transaction_type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{tx.description || tx.transaction_type}</p>
                                <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()} • {tx.accounts?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`font-bold ${tx.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.transaction_type === 'income' ? '+' : '-'}৳{tx.amount}
                            </span>
                            <DeleteTransactionButton id={tx.id} />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
