"use client";

import { useLanguage } from "@/context/language-context";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExpenseEntryDialog } from "@/components/expenses/ExpenseEntryDialog";
import { DeleteExpenseButton } from "@/components/expenses/DeleteExpenseButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Calendar, FileText, Building, Coffee, UserCircle, Briefcase } from "lucide-react";

interface ExpensesClientProps {
    expenses: any[];
}

export function ExpensesClient({ expenses }: ExpensesClientProps) {
    const { t } = useLanguage();

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

    function ExpenseTable({ data, typeLabel }: { data: any[], typeLabel: string }) {
        return (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{typeLabel} {t("expenses.table.list")} ({data?.length || 0})</h3>
                </div>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>{t("expenses.table.description")}</TableHead>
                            <TableHead>{t("expenses.table.category")}</TableHead>
                            <TableHead>{t("expenses.table.date")}</TableHead>
                            <TableHead className="text-right">{t("expenses.table.amount")}</TableHead>
                            <TableHead className="text-right">{t("common.actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    {t("common.noData")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.map((expense) => (
                                <TableRow key={expense.id} className="hover:bg-muted/30">
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {t(`expenses.categories.${expense.expense_type}`) || expense.expense_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(expense.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">৳{expense.amount}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <ExpenseEntryDialog expense={expense} />
                                            <DeleteExpenseButton id={expense.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("expenses.title")}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t("expenses.description")}
                    </p>
                </div>
                <ExpenseEntryDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-5">
                <StatsCard
                    title={t("expenses.stats.total")}
                    value={`৳${grandTotal.toLocaleString()}`}
                    icon={Receipt}
                    trend="neutral"
                    trendValue={t("reports.roiChart.revenue")}
                    color="primary"
                />
                <StatsCard
                    title={t("expenses.stats.daily")}
                    value={`৳${totalDaily.toLocaleString()}`}
                    icon={Coffee}
                    trend="neutral"
                    trendValue={t("expenses.stats.operational")}
                    color="danger"
                />
                <StatsCard
                    title={t("expenses.stats.fixed")}
                    value={`৳${totalFixed.toLocaleString()}`}
                    icon={Building}
                    trend="neutral"
                    trendValue={t("expenses.stats.monthly")}
                    color="warning"
                />
                <StatsCard
                    title={t("expenses.stats.personal")}
                    value={`৳${totalPersonal.toLocaleString()}`}
                    icon={UserCircle}
                    trend="neutral"
                    trendValue={t("expenses.stats.private")}
                    color="primary"
                />
                <StatsCard
                    title={t("expenses.stats.assets")}
                    value={`৳${totalAssets.toLocaleString()}`}
                    icon={Briefcase}
                    trend="neutral"
                    trendValue={t("expenses.stats.longTerm")}
                    color="success"
                />
            </div>

            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4 h-auto">
                    <TabsTrigger value="daily" className="py-2">{t("expenses.stats.daily")}</TabsTrigger>
                    <TabsTrigger value="fixed" className="py-2">{t("expenses.stats.fixed")}</TabsTrigger>
                    <TabsTrigger value="personal" className="py-2">{t("expenses.stats.personal")}</TabsTrigger>
                    <TabsTrigger value="assets" className="py-2">{t("expenses.stats.assets")}</TabsTrigger>
                </TabsList>

                <TabsContent value="daily">
                    <ExpenseTable data={dailyExpenses} typeLabel={t("expenses.stats.daily")} />
                </TabsContent>

                <TabsContent value="fixed">
                    <ExpenseTable data={fixedExpenses} typeLabel={t("expenses.stats.fixed")} />
                </TabsContent>

                <TabsContent value="personal">
                    <ExpenseTable data={personalExpenses} typeLabel={t("expenses.stats.personal")} />
                </TabsContent>

                <TabsContent value="assets">
                    <ExpenseTable data={assetsExpenses} typeLabel={t("expenses.stats.assets")} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
