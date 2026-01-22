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
        setInputs(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: numVal >= 0 ? numVal : 0 // Prevent negative inputs here, use return column
            }
        }));
    };

    // Calculate derived data for display
    const tableData = useMemo(() => {
        return products.map(product => {
            const input = inputs[product.id] || { unitsSold: 0, returnCount: 0 };
            const actualSold = input.unitsSold - input.returnCount;
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

            const grossRevenue = input.unitsSold * (product.selling_price || 0);
            const totalCOGS = input.unitsSold * (product.cost_price || 0); // COGS on Gross Sales
            // Wait, if I return, COGS is credited back.
            // Image shows "Total COGS". If I sell 10 and return 2, my COGS is for 8.
            // Let's calculate Net COGS and Net Revenue for Profit.

            const netRevenue = actualSold * (product.selling_price || 0);
            const netCOGS = actualSold * (product.cost_price || 0);
            const grossProfit = netRevenue - netCOGS;

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

    const onSave = async () => {
        // Filter out rows with no activity
        const items = tableData.filter(d => d.unitsSold > 0 || d.returnCount > 0);

        if (items.length === 0) {
            toast.error("No data entered.");
            return;
        }

        setIsSaving(true);
        try {
            await createBulkSales(items.map(item => ({
                product_id: item.id,
                quantity_sold: item.unitsSold,
                quantity_returned: item.returnCount
            })));

            toast.success("Daily sales saved successfully!");
            setInputs({}); // Reset
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
        </Card>
    );
}
