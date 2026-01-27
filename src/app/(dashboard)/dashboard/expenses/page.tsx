import { getExpenses } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Calendar, FileText, Trash2, Building, Coffee, UserCircle, Briefcase } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExpenseEntryDialog } from "@/components/expenses/ExpenseEntryDialog";
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const expenses = await getExpenses();

    // Categorization Logic
    const FIXED_CATS = ["office_rent", "salary", "utility", "license_purchase", "fixed"];
    const PERSONAL_CATS = ["personal_withdrawal", "family_expense", "medical", "other_personal", "personal"];
    const ASSETS_CATS = ["equipment", "furniture", "electronics", "other_asset", "assets"];

    // Filter Lists
    const fixedExpenses = expenses?.filter(e => FIXED_CATS.includes(e.expense_type)) || [];
    const personalExpenses = expenses?.filter(e => PERSONAL_CATS.includes(e.expense_type)) || [];
    const assetsExpenses = expenses?.filter(e => ASSETS_CATS.includes(e.expense_type)) || [];

    // Daily expenses are everything else
    const allDefinedCats = [...FIXED_CATS, ...PERSONAL_CATS, ...ASSETS_CATS];
    const dailyExpenses = expenses?.filter(e => !allDefinedCats.includes(e.expense_type)) || [];

    // Calculate Stats
    const totalFixed = fixedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalDaily = dailyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPersonal = personalExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalAssets = assetsExpenses.reduce((sum, item) => sum + Number(item.amount), 0);

    const grandTotal = totalFixed + totalDaily + totalPersonal + totalAssets;

    function ExpenseTable({ data, type }: { data: typeof expenses, type: string }) {
        return (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{type} তালিকা ({data?.length || 0})</h3>
                </div>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>খরচের বিবরণ</TableHead>
                            <TableHead>ক্যাটাগরি</TableHead>
                            <TableHead>তারিখ</TableHead>
                            <TableHead className="text-right">পরিমাণ</TableHead>
                            <TableHead className="text-right">অ্যাকশন</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    কোনো খরচ পাওয়া যায়নি।
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.map((expense) => (
                                <TableRow key={expense.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{expense.expense_type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">৳{expense.amount}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <ExpenseEntryDialog expense={{
                                                id: expense.id,
                                                description: expense.description,
                                                amount: expense.amount,
                                                expense_type: expense.expense_type,
                                                date: expense.date
                                            }} />
                                            <DeleteExpenseButton id={expense.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="space-y-8 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Money Out</h1>
                    <p className="text-muted-foreground mt-1">
                        Track all operational, fixed, and personal expenses.
                    </p>
                </div>
                <ExpenseEntryDialog />
            </div>

            {/* Expense Stats */}
            <div className="grid gap-6 md:grid-cols-5">
                <StatsCard
                    title="সর্বমোট খরচ (Total)"
                    value={`৳${grandTotal.toLocaleString()}`}
                    icon={Receipt}
                    trend="neutral"
                    trendValue="Total"
                    color="primary"
                />
                <StatsCard
                    title="ডেইলি (Daily)"
                    value={`৳${totalDaily.toLocaleString()}`}
                    icon={Coffee}
                    trend="neutral"
                    trendValue="Operational"
                    color="danger"
                />
                <StatsCard
                    title="ফিক্সড (Fixed)"
                    value={`৳${totalFixed.toLocaleString()}`}
                    icon={Building}
                    trend="neutral"
                    trendValue="Monthly"
                    color="warning"
                />
                <StatsCard
                    title="পার্সোনাল (Personal)"
                    value={`৳${totalPersonal.toLocaleString()}`}
                    icon={UserCircle}
                    trend="neutral"
                    trendValue="Private"
                    color="primary"
                />
                <StatsCard
                    title="সম্পদ (Assets)"
                    value={`৳${totalAssets.toLocaleString()}`}
                    icon={Briefcase}
                    trend="neutral"
                    trendValue="Long-term"
                    color="success"
                />
            </div>

            {/* Tabs for Daily vs Fixed vs Personal vs Assets */}
            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4 h-auto">
                    <TabsTrigger value="daily" className="py-2">ডেইলি খরচ (Daily)</TabsTrigger>
                    <TabsTrigger value="fixed" className="py-2">ফিক্সড খরচ (Fixed)</TabsTrigger>
                    <TabsTrigger value="personal" className="py-2">পার্সোনাল খরচ (Personal)</TabsTrigger>
                    <TabsTrigger value="assets" className="py-2">সম্পদ খরচ (Assets)</TabsTrigger>
                </TabsList>

                <TabsContent value="daily">
                    <ExpenseTable data={dailyExpenses} type="ডেইলি খরচের" />
                </TabsContent>

                <TabsContent value="fixed">
                    <ExpenseTable data={fixedExpenses} type="ফিক্সড খরচের" />
                </TabsContent>

                <TabsContent value="personal">
                    <ExpenseTable data={personalExpenses} type="পার্সোনাল খরচের" />
                </TabsContent>

                <TabsContent value="assets">
                    <ExpenseTable data={assetsExpenses} type="সম্পদ খরচের" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
