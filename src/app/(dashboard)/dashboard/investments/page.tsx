import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Briefcase, DollarSign } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getInvestments } from "@/app/actions/investments";
import { InvestmentEntryDialog } from "@/components/investments/InvestmentEntryDialog";
import { DeleteInvestmentButton } from "@/components/investments/DeleteInvestmentButton";

export default async function InvestmentsPage() {
    const investments = await getInvestments();

    // Calculate Stats
    const totalCapital = investments?.reduce((sum, item) => sum + Number(item.capital_amount), 0) || 0;
    const totalReturn = investments?.reduce((sum, item) => sum + Number(item.current_return), 0) || 0;
    const currentValue = totalCapital + totalReturn;
    const roiPercentage = totalCapital > 0 ? (totalReturn / totalCapital) * 100 : 0;

    return (
        <div className="space-y-8 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects (Investments)</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your project investments and returns.
                    </p>
                </div>
                <InvestmentEntryDialog />
            </div>

            {/* Investment Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Total Investment"
                    value={`৳${totalCapital.toLocaleString()}`}
                    icon={Briefcase}
                    trend="neutral"
                    trendValue="Capital"
                    color="primary"
                />
                <StatsCard
                    title="Current Value"
                    value={`৳${currentValue.toLocaleString()}`}
                    icon={TrendingUp}
                    trend={totalReturn >= 0 ? "up" : "down"}
                    trendValue={`${roiPercentage.toFixed(1)}%`}
                    color="success"
                />
                <StatsCard
                    title="Net Profit/Loss"
                    value={`৳${totalReturn.toLocaleString()}`}
                    icon={DollarSign}
                    trend={totalReturn >= 0 ? "up" : "down"}
                    trendValue="Return"
                    color={totalReturn >= 0 ? "warning" : "danger"}
                />
            </div>

            {/* Investments Table */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>বিনিয়োগের খাত</TableHead>
                            <TableHead>শুরুর তারিখ</TableHead>
                            <TableHead className="text-right">মূলধন</TableHead>
                            <TableHead className="text-right">বর্তমান লাভ</TableHead>
                            <TableHead className="text-right">স্ট্যাটাস</TableHead>
                            <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {investments?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    কোনো বিনিয়োগ পাওয়া যায়নি।
                                </TableCell>
                            </TableRow>
                        ) : (
                            investments?.map((inv) => (
                                <TableRow key={inv.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{inv.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(inv.start_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">৳{inv.capital_amount}</TableCell>
                                    <TableCell className={`text-right font-semibold ${inv.current_return >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {inv.current_return >= 0 ? '+' : ''}৳{inv.current_return}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={inv.status === 'active' ? "default" : "secondary"} className={inv.status === 'active' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : ""}>
                                            {inv.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <InvestmentEntryDialog investment={inv} />
                                            <DeleteInvestmentButton id={inv.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
