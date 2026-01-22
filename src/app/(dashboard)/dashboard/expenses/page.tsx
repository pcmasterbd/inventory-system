import { getExpenses } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Calendar, FileText, Trash2, Building, Coffee } from "lucide-react";
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

    // Filter Lists
    const fixedExpenses = expenses?.filter(e => FIXED_CATS.includes(e.expense_type)) || [];
    const dailyExpenses = expenses?.filter(e => !FIXED_CATS.includes(e.expense_type)) || [];

    // Calculate Stats
    const totalFixed = fixedExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalDaily = dailyExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const grandTotal = totalFixed + totalDaily;

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
                    <h1 className="text-3xl font-bold tracking-tight">খরচ ব্যবস্থাপনা (Expense Manager)</h1>
                    <p className="text-muted-foreground mt-1">
                        ডেইলি এবং ফিক্সড খরচ আলাদাভাবে দেখুন।
                    </p>
                </div>
                <ExpenseEntryDialog />
            </div>

            {/* Expense Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="সর্বমোট খরচ (Total)"
                    value={`৳${grandTotal.toLocaleString()}`}
                    icon={Receipt}
                    trend="neutral"
                    trendValue="Total Expense"
                    color="primary"
                />
                <StatsCard
                    title="ফিক্সড খরচ (Monthly)"
                    value={`৳${totalFixed.toLocaleString()}`}
                    icon={Building}
                    trend="neutral"
                    trendValue="Rent, Salary, etc."
                    color="warning"
                />
                <StatsCard
                    title="ডেইলি খরচ (Daily)"
                    value={`৳${totalDaily.toLocaleString()}`}
                    icon={Coffee}
                    trend="neutral"
                    trendValue="Tea, Transport, etc."
                    color="danger"
                />
            </div>

            {/* Tabs for Daily vs Fixed */}
            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="daily">ডেইলি খরচ (Daily Expenses)</TabsTrigger>
                    <TabsTrigger value="fixed">ফিক্সড খরচ (Fixed Expenses)</TabsTrigger>
                </TabsList>

                <TabsContent value="daily">
                    <ExpenseTable data={dailyExpenses} type="ডেইলি খরচের" />
                </TabsContent>

                <TabsContent value="fixed">
                    <ExpenseTable data={fixedExpenses} type="ফিক্সড খরচের" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
