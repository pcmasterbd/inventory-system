"use client";

import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { createBulkSales } from "@/app/actions/sales";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Product {
    id: string;
    name: string;
    selling_price: number;
    cost_price: number;
    stock_quantity: number;
}

interface RowData {
    unitsSold: number;
    returnCount: number;
}

interface BulkSalesInterfaceProps {
    products: Product[];
}

export function BulkSalesInterface({ products }: BulkSalesInterfaceProps) {
    // State to hold input values for each product
    const [inputs, setInputs] = useState<Record<string, RowData>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Initialize inputs (optional, or just handle empty as 0)

    const handleInputChange = (productId: string, field: keyof RowData, value: string) => {
        const numVal = parseInt(value) || 0;
        setInputs(prev => {
            const current = prev[productId] || { unitsSold: 0, returnCount: 0 };
            return {
                ...prev,
                [productId]: {
                    ...current,
                    [field]: numVal >= 0 ? numVal : 0
                }
            };
        });
    };

    // Calculate derived data for display
    const tableData = useMemo(() => {
        return products.map(product => {
            const input = inputs[product.id] || { unitsSold: 0, returnCount: 0 };
            const unitsSold = input.unitsSold || 0;
            const returnCount = input.returnCount || 0;
            const actualSold = unitsSold - returnCount;
            const totalRevenue = input.unitsSold * product.selling_price; // Revenue usually based on sold, returns subtract later? 
            // Wait, "Revenue" in image likely means "Final Revenue"? 
            // Image: Units Sold 2, Return 0 -> Act 2. 
            // Let's assume Total Revenue = Actual Sold * Price 
            // OR Total Revenue = Units Sold * Price (and Return is separate refund?)
            // Let's stick to: Revenue = Actual Sold * Selling Price (Net Revenue)
            // But usually "Sales" records Gross.
            // Let's look at image again: 
            // Product | Units Sold | Return | Actual Sold | Revenue | Total Revenue
            // If Units=2, Price=1990 -> Total=3980.
            // So Total Revenue = Units Sold * Price. (Gross Sales).
            // Returns will separate.

            // Corrected Logic per user request:
            // Revenue should be based on Actual Sold (Net Sales)
            const grossRevenue = actualSold * (product.selling_price || 0);
            // COGS should be based on Actual Sold
            const netCOGS = actualSold * (product.cost_price || 0);
            // Wait, if I return, COGS is credited back.
            // Image shows "Total COGS". If I sell 10 and return 2, my COGS is for 8.
            // Let's calculate Net COGS and Net Revenue for Profit.

            // Gross Profit = Revenue - COGS
            const grossProfit = grossRevenue - netCOGS;

            return {
                ...product,
                ...input,
                actualSold,
                grossRevenue, // Displayed as "Total Revenue" to match image?
                // Actually image "Total Revenue" for row 2 (Std) is 3980 (2 * 1990).
                // So column "Total Revenue" is Gross Sales.

                netCOGS,
                // Image "Total COGS": Std (2 sold) * 755 = 1510. Matches.
                // So Image cols are based on "Units Sold" or "Actual Sold"?
                // Let's assume Actual Sold for COGS if tracking profit.
                // But if Units Sold = 2, Return = 0.

                grossProfit
            };
        });
    }, [products, inputs]);

    // Calculate Grand Totals
    const totals = useMemo(() => {
        return tableData.reduce((acc, curr) => ({
            unitsSold: acc.unitsSold + curr.unitsSold,
            returnCount: acc.returnCount + curr.returnCount,
            actualSold: acc.actualSold + curr.actualSold,
            grossRevenue: acc.grossRevenue + curr.grossRevenue,
            netCOGS: acc.netCOGS + curr.netCOGS, // Wait, if image implies COGS on SOLD units logic?
            grossProfit: acc.grossProfit + curr.grossProfit
        }), {
            unitsSold: 0, returnCount: 0, actualSold: 0, grossRevenue: 0, netCOGS: 0, grossProfit: 0
        });
    }, [tableData]);

    // Expenses State
    const [expenses, setExpenses] = useState({
        office_rent: 0,
        marketing_bill: 0,
        content_bill: 0,
        consultancy: 0,
        skill_dev: 0,
        salary: 0,
        license: 0,
        utility: 0,
        food: 0,
        transport: 0,
        other: 0
    });

    // Funds State
    const [funds, setFunds] = useState({
        property_fund: 0,
        others_fund: 0,
        per_spend: 0
    });

    // Dollar ROI State
    const [dollarInfo, setDollarInfo] = useState({
        dollar_cost: 0,
        conversion_rate: 120
    });

    const handleExpenseChange = (field: string, val: string) => {
        setExpenses(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
    };

    const handleFundChange = (field: string, val: string) => {
        setFunds(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
    };

    const handleDollarChange = (field: string, val: string) => {
        setDollarInfo(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
    };

    // Derived Ledger Values
    const totalExpense = Object.values(expenses).reduce((a, b) => a + b, 0);

    // User Request: ROI calculation based on Gross Profit - Total Expense (Net Profit)
    const netProfit = totals.grossProfit - totalExpense;

    // Dollar Analysis
    const dollarCostBD = dollarInfo.dollar_cost * dollarInfo.conversion_rate;

    // ROI = (Net Profit / Dollar Cost in BDT) * 100
    const dollarROI = dollarCostBD > 0 ? (netProfit / dollarCostBD) * 100 : 0;

    const onSave = async () => {
        // Filter out rows with no activity
        const items = tableData.filter(d => d.unitsSold > 0 || d.returnCount > 0);

        if (items.length === 0) {
            toast.error("No data entered.");
            return;
        }

        setIsSaving(true);
        try {
            await createBulkSales({
                items: items.map(item => ({
                    product_id: item.id,
                    quantity_sold: item.unitsSold,
                    quantity_returned: item.returnCount
                })),
                expenses,
                funds,
                dollarInfo,
                totals: {
                    revenue: totals.grossRevenue,
                    cogs: totals.netCOGS,
                    gross_profit: totals.grossProfit,
                    net_profit: netProfit
                }
            });

            toast.success("Daily sales saved successfully!");
            setInputs({});
            setExpenses({
                office_rent: 0, marketing_bill: 0, content_bill: 0, consultancy: 0, skill_dev: 0,
                salary: 0, license: 0, utility: 0, food: 0, transport: 0, other: 0
            });
            setFunds({ property_fund: 0, others_fund: 0, per_spend: 0 });
            setDollarInfo({ dollar_cost: 0, conversion_rate: 120 });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const today = new Date().toISOString().split('T')[0];

        // 1. Prepare Sales Data
        const salesData = tableData.filter(d => d.unitsSold > 0 || d.returnCount > 0).map(d => ({
            Product: d.name,
            "Units Sold": d.unitsSold,
            "Return": d.returnCount,
            "Actual Sold": d.actualSold,
            "Price": d.selling_price,
            "Total Revenue": d.grossRevenue,
            "COGS": d.netCOGS,
            "Gross Profit": d.grossProfit
        }));

        // 2. Prepare Expenses Data
        const expenseData = Object.entries(expenses).filter(([_, val]) => val > 0).map(([key, val]) => ({
            "Expense Item": key,
            "Amount": val
        }));

        // 3. Prepare Summary Data
        const summaryData = [
            { Item: "Total Revenue", Value: totals.grossRevenue },
            { Item: "Total COGS", Value: totals.netCOGS },
            { Item: "Gross Profit", Value: totals.grossProfit },
            { Item: "Total Expenses", Value: totalExpense },
            { Item: "Net Profit", Value: netProfit },
            { Item: "Dollar ROI", Value: `${dollarROI.toFixed(2)}%` }
        ];

        // Create Sheets
        if (salesData.length > 0) {
            const wsSales = XLSX.utils.json_to_sheet(salesData);
            XLSX.utils.book_append_sheet(wb, wsSales, "Sales");
        }

        if (expenseData.length > 0) {
            const wsExpenses = XLSX.utils.json_to_sheet(expenseData);
            XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");
        }

        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // Save
        XLSX.writeFile(wb, `Daily_Sheet_${today}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString();

        doc.setFontSize(18);
        doc.text(`Daily Sales Sheet - ${today}`, 14, 20);

        doc.setFontSize(12);
        doc.text("Summary", 14, 30);

        // Summary Table
        autoTable(doc, {
            startY: 35,
            head: [['Metric', 'Value']],
            body: [
                ['Gross Profit', `BDT ${totals.grossProfit.toLocaleString()}`],
                ['Total Expenses', `BDT ${totalExpense.toLocaleString()}`],
                ['Net Profit', `BDT ${netProfit.toLocaleString()}`],
                ['Dollar ROI', `${dollarROI.toFixed(2)}%`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [126, 34, 206] } // Purple
        });

        // Sales Table
        const salesRows = tableData
            .filter(d => d.unitsSold > 0 || d.returnCount > 0)
            .map(d => [
                d.name,
                d.unitsSold,
                d.returnCount,
                d.actualSold,
                d.grossRevenue.toLocaleString(),
                d.grossProfit.toLocaleString()
            ]);

        if (salesRows.length > 0) {
            doc.text("Sales Breakdown", 14, (doc as any).lastAutoTable.finalY + 10);
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 15,
                head: [['Product', 'Sold', 'Ret', 'Net', 'Revenue', 'Profit']],
                body: salesRows,
                theme: 'grid',
                headStyles: { fillColor: [40, 40, 40] }
            });
        }

        doc.save(`Daily_Sheet_${today}.pdf`);
        toast.success("PDF exported successfully!");
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">দৈনিক বিক্রি (Daily Sales Sheet)</CardTitle>
                        <CardDescription>Enter today's sales and returns in bulk.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportToExcel} className="border-green-200 hover:bg-green-50 text-green-700">
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>
                        <Button variant="outline" onClick={exportToPDF} className="border-red-200 hover:bg-red-50 text-red-700">
                            <FileText className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button onClick={onSave} disabled={isSaving} className="bg-purple-700 hover:bg-purple-800">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Data
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-purple-50">
                            <TableRow>
                                <TableHead className="w-[180px] font-bold text-purple-900">Product</TableHead>
                                <TableHead className="text-center font-bold bg-yellow-50 text-yellow-900 border-l">Units Sold</TableHead>
                                <TableHead className="text-center font-bold bg-yellow-50 text-yellow-900">Return</TableHead>
                                <TableHead className="text-center font-bold bg-yellow-50 text-yellow-900 border-r">Actual Sold</TableHead>

                                <TableHead className="text-right font-bold">Price</TableHead>
                                <TableHead className="text-right font-bold border-r">Total Revenue</TableHead>

                                <TableHead className="text-right font-bold bg-orange-50 text-orange-900">Per COGS</TableHead>
                                <TableHead className="text-right font-bold bg-orange-50 text-orange-900 border-r">Total COGS</TableHead>

                                <TableHead className="text-right font-bold bg-green-50 text-green-900">Gross Profit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{row.name}</TableCell>

                                    {/* Inputs */}
                                    <TableCell className="p-1 border-l bg-yellow-50/10">
                                        <Input
                                            type="number"
                                            className="h-8 text-center bg-transparent border-transparent hover:border-input focus:border-primary"
                                            value={inputs[row.id]?.unitsSold || ''}
                                            onChange={(e) => handleInputChange(row.id, 'unitsSold', e.target.value)}
                                            placeholder="0"
                                        />
                                    </TableCell>
                                    <TableCell className="p-1 bg-yellow-50/10">
                                        <Input
                                            type="number"
                                            className="h-8 text-center text-red-600 bg-transparent border-transparent hover:border-input focus:border-red-500"
                                            value={inputs[row.id]?.returnCount || ''}
                                            onChange={(e) => handleInputChange(row.id, 'returnCount', e.target.value)}
                                            placeholder="0"
                                        />
                                    </TableCell>

                                    {/* Calculated */}
                                    <TableCell className="text-center font-bold border-r bg-yellow-50/10">{row.actualSold}</TableCell>

                                    <TableCell className="text-right text-muted-foreground">৳{row.selling_price}</TableCell>
                                    <TableCell className="text-right font-medium border-r">
                                        {row.grossRevenue > 0 ? `৳${row.grossRevenue.toLocaleString()}` : '-'}
                                    </TableCell>

                                    <TableCell className="text-right text-muted-foreground bg-orange-50/10">৳{row.cost_price || 0}</TableCell>
                                    <TableCell className="text-right text-orange-700 bg-orange-50/10 border-r">
                                        {row.netCOGS > 0 ? `৳${row.netCOGS.toLocaleString()}` : '-'}
                                    </TableCell>

                                    <TableCell className={`text-right font-bold bg-green-50/10 ${row.grossProfit > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                        {!isNaN(row.grossProfit) && row.grossProfit !== 0 ? `৳${row.grossProfit.toLocaleString()}` : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Sticky Footer for Totals */}
                            <TableRow className="bg-purple-100 hover:bg-purple-100 font-bold sticky bottom-0">
                                <TableCell>Grand Total</TableCell>
                                <TableCell className="text-center border-l border-purple-200">{totals.unitsSold}</TableCell>
                                <TableCell className="text-center text-red-600">{totals.returnCount}</TableCell>
                                <TableCell className="text-center border-r border-purple-200">{totals.actualSold}</TableCell>

                                <TableCell className="text-right">-</TableCell>
                                <TableCell className="text-right border-r border-purple-200">৳{totals.grossRevenue.toLocaleString()}</TableCell>

                                <TableCell className="text-right">-</TableCell>
                                <TableCell className="text-right border-r border-purple-200">৳{totals.netCOGS.toLocaleString()}</TableCell>

                                <TableCell className="text-right text-green-700">৳{totals.grossProfit.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Expenses Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(expenses).map((key) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-sm font-medium capitalize">{key.replace('_', ' ')}</label>
                                    <Input
                                        type="number"
                                        value={expenses[key as keyof typeof expenses] || ''}
                                        onChange={(e) => handleExpenseChange(key, e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                            <div className="col-span-2 pt-2 border-t mt-2 flex justify-between font-bold">
                                <span>Total Expense:</span>
                                <span>৳{totalExpense.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Funds & Dollar ROI */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Funds & Saving</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Property Fund</label>
                                    <Input
                                        type="number"
                                        value={funds.property_fund || ''}
                                        onChange={(e) => handleFundChange('property_fund', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Others Fund</label>
                                    <Input
                                        type="number"
                                        value={funds.others_fund || ''}
                                        onChange={(e) => handleFundChange('others_fund', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Personal Spend</label>
                                    <Input
                                        type="number"
                                        value={funds.per_spend || ''}
                                        onChange={(e) => handleFundChange('per_spend', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dollar Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Dollar Cost ($)</label>
                                    <Input
                                        type="number"
                                        value={dollarInfo.dollar_cost || ''}
                                        onChange={(e) => handleDollarChange('dollar_cost', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Rate (BDT)</label>
                                    <Input
                                        type="number"
                                        value={dollarInfo.conversion_rate}
                                        onChange={(e) => handleDollarChange('conversion_rate', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Dollar Cost (BDT):</span>
                                    <span>৳{dollarCostBD.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-purple-900 border-t pt-2 border-purple-200">
                                    <span>Dollar ROI:</span>
                                    <span>{dollarROI.toFixed(2)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Day Summary */}
            <Card className="mt-6 bg-slate-900 text-white">
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wider">Gross Profit</p>
                            <p className="text-3xl font-bold text-green-400">৳{totals.grossProfit.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wider">Total Expense</p>
                            <p className="text-3xl font-bold text-red-400">৳{totalExpense.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wider">Net Profit</p>
                            <p className="text-3xl font-bold text-white">৳{netProfit.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm uppercase tracking-wider">ROI</p>
                            <p className="text-3xl font-bold text-yellow-400">{dollarROI.toFixed(1)}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Card>
    );
}
