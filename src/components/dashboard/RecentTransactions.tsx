import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Receipt, ShoppingCart, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const { t } = useLanguage();

    const getIcon = (type: string) => {
        switch (type) {
            case 'income': return <ArrowDownRight size={20} />;
            case 'expense': return <ArrowUpRight size={20} />;
            default: return <ArrowRightLeft size={20} />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'income': return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30";
            case 'expense': return "bg-rose-100 text-rose-600 dark:bg-rose-900/30";
            default: return "bg-blue-100 text-blue-600 dark:bg-blue-900/30";
        }
    };

    return (
        <Card className="h-full border-none bg-white/50 backdrop-blur-sm dark:bg-card/50 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">{t("dashboard.recentTransactions")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions?.length === 0 ? (
                        <p className="text-center py-10 text-muted-foreground text-sm">{t("common.noData")}</p>
                    ) : (
                        transactions.slice(0, 8).map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between group p-2 rounded-xl hover:bg-white/80 dark:hover:bg-muted/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm", getBgColor(tx.transaction_type))}>
                                        {getIcon(tx.transaction_type)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{tx.description || t("dashboard.transaction")}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                            {tx.category ? (t(`expenses.categories.${tx.category}`) || tx.category) : tx.transaction_type}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn("font-bold text-sm whitespace-nowrap", tx.transaction_type === "income" ? "text-emerald-600" : "text-rose-600")}>
                                        {tx.transaction_type === "income" ? "+" : "-"}৳{Number(tx.amount).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{format(new Date(tx.date), "dd MMM, yyyy")}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
