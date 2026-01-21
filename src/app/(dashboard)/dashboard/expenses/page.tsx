import { getExpenses } from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Calendar, FileText, Trash2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExpenseEntryDialog } from "@/components/expenses/ExpenseEntryDialog";
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    const expenses = await getExpenses();

    // Calculate Stats
    const totalExpenses = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    // Simple logic for "Today" and "This Month"
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const todayExpenses = expenses?.filter(e => e.date >= startOfDay)
        .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    const monthExpenses = expenses?.filter(e => e.date >= startOfMonth)
        .reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    return (
        <div className="space-y-8 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">খরচ (Expenses)</h1>
                    <p className="text-muted-foreground mt-1">
                        আপনার প্রতিদিনের ব্যবসার খরচ ট্র্যাক করুন।
                    </p>
                </div>
                <ExpenseEntryDialog />
            </div>

            {/* Expense Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="আজকের খরচ"
                    value={`৳${todayExpenses.toLocaleString()}`}
                    icon={Receipt}
                    trend="neutral"
                    trendValue="Today"
                    color="primary"
                />
                <StatsCard
                    title="এই মাসের খরচ"
                    value={`৳${monthExpenses.toLocaleString()}`}
                    icon={Calendar}
                    trend="neutral"
                    trendValue="This Month"
                    color="warning"
                />
                <StatsCard
                    title="মোট খরচ"
                    value={`৳${totalExpenses.toLocaleString()}`}
                    icon={FileText}
                    trend="neutral"
                    trendValue="Total"
                    color="danger"
                />
            </div>

            {/* Expenses List */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">খরচের তালিকা ({expenses?.length || 0})</h3>
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
                        {expenses?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    কোনো খরচ পাওয়া যায়নি।
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses?.map((expense) => (
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
        </div>
    );
}
