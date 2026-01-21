import { Avatar } from "@/components/ui/avatar"; // We will need to create Avatar or just use div for now
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const transactions = [
    {
        id: 1,
        name: "রহিম স্টোর",
        type: "বিক্রয়",
        amount: "+৳২৫,০০০",
        date: "আজ, ১০:৪৫ সকাল",
        status: "income",
    },
    {
        id: 2,
        name: "সিটি ডিস্ট্রিবিউটর",
        type: "ক্রয়",
        amount: "-৳১২,৫০০",
        date: "আজ, ০৯:৩০ সকাল",
        status: "expense",
    },
    {
        id: 3,
        name: "করিম শপ",
        type: "বিক্রয়",
        amount: "+৳৮,২০০",
        date: "গতকাল, ০৫:২০ বিকাল",
        status: "income",
    },
    {
        id: 4,
        name: "অফিস ভাড়া",
        type: "খরচ",
        amount: "-৳১৫,০০০",
        date: "১৫ জানু, ২০২৪",
        status: "expense",
    },
];

export function RecentTransactions() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-1 border-none bg-white/50 backdrop-blur-sm dark:bg-card/50">
            <CardHeader>
                <CardTitle>সাম্প্রতিক লেনদেন</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                                        tx.status === "income"
                                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                            : "bg-rose-100 text-rose-600 dark:bg-rose-900/30"
                                    )}
                                >
                                    {tx.status === "income" ? (
                                        <ArrowDownRight size={20} />
                                    ) : (
                                        <ArrowUpRight size={20} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{tx.name}</p>
                                    <p className="text-xs text-muted-foreground">{tx.type}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p
                                    className={cn(
                                        "font-bold text-sm",
                                        tx.status === "income" ? "text-emerald-600" : "text-rose-600"
                                    )}
                                >
                                    {tx.amount}
                                </p>
                                <p className="text-xs text-muted-foreground">{tx.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
