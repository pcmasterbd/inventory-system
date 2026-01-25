"use client";

import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, FileSpreadsheet, FileText, Settings } from "lucide-react";
import { toast } from "sonner";
import { createBulkSales } from "@/app/actions/sales";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    adCostDollar: number; // Per product ad spend in Dollar
    costPrice: number; // Editable COGS
}

interface BulkSalesInterfaceProps {
    products: Product[];
}

export function BulkSalesInterface({ products }: BulkSalesInterfaceProps) {
    // State to hold input values for each product
    const [inputs, setInputs] = useState<Record<string, RowData>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Dollar Rate State - Global for this session
    const [dollarRate, setDollarRate] = useState(120);

    // Initialize/Pre-fill COGS
    useEffect(() => {
        const initialInputs: Record<string, RowData> = {};
        products.forEach(p => {
            initialInputs[p.id] = {
                unitsSold: 0,
                returnCount: 0,
                adCostDollar: 0,
                costPrice: p.cost_price // Default to master cost
            };
        });
        // Merge with existing inputs to avoid overwriting user changes? 
        // Actually, just set defaults if missing.
        setInputs(prev => {
            const next = { ...prev };
            products.forEach(p => {
                if (!next[p.id]) {
                    next[p.id] = { unitsSold: 0, returnCount: 0, adCostDollar: 0, costPrice: p.cost_price };
                }
            });
            return next;
        });
    }, [products]);


    const handleInputChange = (productId: string, field: keyof RowData, value: string) => {
        const numVal = parseFloat(value) || 0; // Use parseFloat for cost/dollar
        setInputs(prev => {
            const current = prev[productId] || { unitsSold: 0, returnCount: 0, adCostDollar: 0, costPrice: 0 };
            return {
                ...prev,
                [productId]: {
                    ...current,
                    [field]: numVal // Allow negative? No.
                }
            };
        });
    };

    // Calculate derived data for display
    const tableData = useMemo(() => {
        return products.map(product => {
            const input = inputs[product.id] || { unitsSold: 0, returnCount: 0, adCostDollar: 0, costPrice: product.cost_price };
            const unitsSold = input.unitsSold || 0;
            const returnCount = input.returnCount || 0;
            const actualSold = unitsSold - returnCount;

            const grossRevenue = actualSold * (product.selling_price || 0);

            // COGS based on EDITABLE cost price
            const netCOGS = actualSold * (input.costPrice || 0);

            // Ad Spend in BDT
            const adSpendBDT = (input.adCostDollar || 0) * dollarRate;

            // Product Net Profit (Revenue - COGS - Ads)
            const productNetProfit = grossRevenue - netCOGS - adSpendBDT;

            // ROI Calculation
            const totalInvestment = netCOGS + adSpendBDT;
            const roi = totalInvestment > 0 ? (productNetProfit / totalInvestment) * 100 : 0;

            return {
                ...product,
                ...input,
                actualSold,
                grossRevenue,
                netCOGS,
                adSpendBDT,
                productNetProfit,
                roi
            };
        });
    }, [products, inputs, dollarRate]);

    // Calculate Grand Totals
    const totals = useMemo(() => {
        return tableData.reduce((acc, curr) => ({
            unitsSold: acc.unitsSold + curr.unitsSold,
            returnCount: acc.returnCount + curr.returnCount,
            actualSold: acc.actualSold + curr.actualSold,
            grossRevenue: acc.grossRevenue + curr.grossRevenue,
            netCOGS: acc.netCOGS + curr.netCOGS,
            adSpendDollar: acc.adSpendDollar + (curr.adCostDollar || 0),
            adSpendBDT: acc.adSpendBDT + curr.adSpendBDT,
            productNetProfit: acc.productNetProfit + curr.productNetProfit
        }), {
            unitsSold: 0, returnCount: 0, actualSold: 0, grossRevenue: 0, netCOGS: 0, adSpendDollar: 0, adSpendBDT: 0, productNetProfit: 0
        });
    }, [tableData]);

    // Operational Expenses State (Shared Expenses)
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


    const handleExpenseChange = (field: string, val: string) => {
        setExpenses(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
    };

    const handleFundChange = (field: string, val: string) => {
        setFunds(prev => ({ ...prev, [field]: parseFloat(val) || 0 }));
    };

    // Derived Ledger Values
    const totalOpExpense = Object.values(expenses).reduce((a, b) => a + b, 0);

    // Final Net Profit = Product Net Profit - Operational Expenses
    const finalNetProfit = totals.productNetProfit - totalOpExpense;

    // Overall ROI (All Products + Ops)
    // Inv = Total COGS + Total Ads + Total Ops? 
    // Usually ROI in this context is Marketing ROI, but let's show overall Business ROI
    const totalBusinessInvestment = totals.netCOGS + totals.adSpendBDT + totalOpExpense;
    const overallROI = totalBusinessInvestment > 0 ? (finalNetProfit / totalBusinessInvestment) * 100 : 0;


    const onSave = async () => {
        // Filter out rows with no sales/returns AND no ad spend (someone might spend ads but sell 0 today)
        const activeItems = tableData.filter(d => d.unitsSold > 0 || d.returnCount > 0 || d.adCostDollar > 0);

        if (activeItems.length === 0) {
            toast.error("No data entered.");
            return;
        }

        setIsSaving(true);
        try {
            await createBulkSales({
                items: activeItems.map(item => ({
                    product_id: item.id,
                    quantity_sold: item.unitsSold,
                    quantity_returned: item.returnCount,
                    cost_price: item.costPrice,
                    ad_cost_dollar: item.adCostDollar
                })),
                expenses,
                funds,
                dollarInfo: { conversion_rate: dollarRate },
                totals: {
                    revenue: totals.grossRevenue,
                    cogs: totals.netCOGS,
                    gross_profit: totals.productNetProfit, // Product Gross (Rev - COGS - Ads)
                    net_profit: finalNetProfit // Final Net after Ops
                }
            });

            toast.success("Daily sales saved successfully!");
            // Reset logic if needed, but maybe keep previous day inputs? No, clear mostly.
            setInputs({}); // Reset inputs
            setExpenses({
                office_rent: 0, marketing_bill: 0, content_bill: 0, consultancy: 0, skill_dev: 0,
                salary: 0, license: 0, utility: 0, food: 0, transport: 0, other: 0
            });
            setFunds({ property_fund: 0, others_fund: 0, per_spend: 0 });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const today = new Date().toISOString().split('T')[0];

        // Sales Data
        const salesData = tableData.filter(d => d.unitsSold > 0 || d.returnCount > 0 || d.adCostDollar > 0).map(d => ({
            Product: d.name,
            "Sold": d.unitsSold,
            "Return": d.returnCount,
            "Net Sold": d.actualSold,
            "Selling Price": d.selling_price,
            "Unit Cost": d.costPrice,
            "Revenue": d.grossRevenue,
            "COGS": d.netCOGS,
            "Ad Cost ($)": d.adCostDollar,
            "Ad Cost (BDT)": d.adSpendBDT,
            "Net Profit": d.productNetProfit,
            "ROI %": `${d.roi.toFixed(2)}%`
        }));

        if (salesData.length > 0) {
            const ws = XLSX.utils.json_to_sheet(salesData);
            XLSX.utils.book_append_sheet(wb, ws, "Sales");
        }

        XLSX.writeFile(wb, `Daily_Sheet_${today}.xlsx`);
        toast.success("Exported Excel");
    };

    return (
        <Card className="border-none shadow-none flex flex-col">
            <CardHeader className="px-0 pt-0 pb-6 shrink-0">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl">দৈনিক বিক্রি ও লাভ রিপোর্ট (Daily Sales & Profit)</CardTitle>
                        <CardDescription>Enter sales, updated cost prices, and ad spend per product.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
                            <span className="text-sm font-semibold text-slate-600">Dollar Rate:</span>
                            <Input
                                type="number"
                                className="w-24 h-8 bg-white"
                                value={dollarRate}
                                onChange={(e) => setDollarRate(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={exportToExcel}>
                            <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button onClick={onSave} disabled={isSaving} size="sm" className="bg-purple-700 hover:bg-purple-800">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border relative">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <TableRow>
                                <TableHead className="w-[180px] font-bold">Product</TableHead>
                                <TableHead className="text-center font-bold bg-blue-50/50 w-[80px]">Sold</TableHead>
                                <TableHead className="text-center font-bold bg-red-50/50 w-[80px]">Return</TableHead>
                                <TableHead className="text-center font-bold border-r w-[60px]">Net</TableHead>

                                <TableHead className="text-right font-bold w-[100px]">Revenue</TableHead>

                                <TableHead className="text-right font-bold bg-orange-50/50 w-[90px] border-l">Unit Cost</TableHead>
                                <TableHead className="text-right font-bold bg-orange-50/50 w-[100px] border-r">Total COGS</TableHead>

                                <TableHead className="text-center font-bold bg-indigo-50/50 w-[90px]">Ads ($)</TableHead>
                                <TableHead className="text-right font-bold bg-indigo-50/50 w-[100px] border-r">Ads (BDT)</TableHead>

                                <TableHead className="text-right font-bold bg-green-50/50 text-green-700">Profit</TableHead>
                                <TableHead className="text-right font-bold bg-green-50/50 text-green-700">ROI %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium p-2 text-xs md:text-sm">{row.name}</TableCell>

                                    {/* Sold Input */}
                                    <TableCell className="p-1 bg-blue-50/20">
                                        <Input
                                            type="number"
                                            className="h-8 text-center"
                                            value={inputs[row.id]?.unitsSold || ''}
                                            onChange={(e) => handleInputChange(row.id, 'unitsSold', e.target.value)}
                                            placeholder="0"
                                        />
                                    </TableCell>

                                    {/* Return Input */}
                                    <TableCell className="p-1 bg-red-50/20">
                                        <Input
                                            type="number"
                                            className="h-8 text-center text-red-600"
                                            value={inputs[row.id]?.returnCount || ''}
                                            onChange={(e) => handleInputChange(row.id, 'returnCount', e.target.value)}
                                            placeholder="0"
                                        />
                                    </TableCell>

                                    {/* Net Sold */}
                                    <TableCell className="text-center text-xs border-r">{row.actualSold}</TableCell>

                                    {/* Revenue */}
                                    <TableCell className="text-right text-xs font-semibold">
                                        {row.grossRevenue > 0 ? `৳${row.grossRevenue.toLocaleString()}` : '-'}
                                    </TableCell>

                                    {/* Editable Unit Cost */}
                                    <TableCell className="p-1 bg-orange-50/20 border-l">
                                        <Input
                                            type="number"
                                            className="h-8 text-right text-xs"
                                            value={row.costPrice ?? ''}
                                            onChange={(e) => handleInputChange(row.id, 'costPrice', e.target.value)}
                                        />
                                    </TableCell>

                                    {/* Total COGS */}
                                    <TableCell className="text-right text-xs text-orange-700 border-r bg-orange-50/20">
                                        {row.netCOGS > 0 ? `৳${row.netCOGS.toLocaleString()}` : '-'}
                                    </TableCell>

                                    {/* Ad Cost Dollar Input */}
                                    <TableCell className="p-1 bg-indigo-50/20">
                                        <Input
                                            type="number"
                                            className="h-8 text-center text-indigo-700 font-medium"
                                            value={inputs[row.id]?.adCostDollar || ''}
                                            onChange={(e) => handleInputChange(row.id, 'adCostDollar', e.target.value)}
                                            placeholder="$0"
                                        />
                                    </TableCell>

                                    {/* Ad Cost BDT */}
                                    <TableCell className="text-right text-xs text-indigo-700 border-r bg-indigo-50/20">
                                        {row.adSpendBDT > 0 ? `৳${row.adSpendBDT.toLocaleString()}` : '-'}
                                    </TableCell>

                                    {/* Net Profit */}
                                    <TableCell className={`text-right font-bold text-xs bg-green-50/20 ${row.productNetProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                        {`৳${row.productNetProfit.toLocaleString()}`}
                                    </TableCell>

                                    {/* ROI */}
                                    <TableCell className="text-right text-xs font-bold bg-green-50/20">
                                        <span className={`px-1 rounded ${row.roi > 20 ? 'bg-green-200 text-green-800' : row.roi < 0 ? 'bg-red-200 text-red-800' : 'bg-gray-200'}`}>
                                            {row.roi.toFixed(0)}%
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Sticky Footer */}
                            <TableRow className="bg-slate-900 text-white hover:bg-slate-900 font-bold sticky bottom-0">
                                <TableCell>TOTAL</TableCell>
                                <TableCell className="text-center">{totals.unitsSold}</TableCell>
                                <TableCell className="text-center">{totals.returnCount}</TableCell>
                                <TableCell className="text-center border-r">{totals.actualSold}</TableCell>
                                <TableCell className="text-right">৳{totals.grossRevenue.toLocaleString()}</TableCell>
                                <TableCell className="text-right border-l"></TableCell>
                                <TableCell className="text-right border-r">৳{totals.netCOGS.toLocaleString()}</TableCell>
                                <TableCell className="text-center">${totals.adSpendDollar}</TableCell>
                                <TableCell className="text-right border-r">৳{totals.adSpendBDT.toLocaleString()}</TableCell>
                                <TableCell className="text-right">৳{totals.productNetProfit.toLocaleString()}</TableCell>
                                <TableCell className="text-right">-</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Expenses Section Below Table */}
            <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <Card className="md:col-span-2">
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">Operational Expenses (অফিস খরচ)</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.keys(expenses).map((key) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-xs font-medium capitalize text-slate-500">{key.replace('_', ' ')}</label>
                                    <Input
                                        type="number"
                                        className="h-8"
                                        value={expenses[key as keyof typeof expenses] || ''}
                                        onChange={(e) => handleExpenseChange(key, e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t font-bold">
                            <span>Total Ops Expense</span>
                            <span className="text-red-600">৳{totalOpExpense.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">Final Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 py-2">
                        <div className="flex justify-between text-sm">
                            <span>Product Profit</span>
                            <span className="font-semibold">৳{totals.productNetProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-600">
                            <span>(-) Ops Expense</span>
                            <span>৳{totalOpExpense.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Net Profit</span>
                            <span className={finalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ৳{finalNetProfit.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm items-center bg-yellow-50 p-2 rounded">
                            <span>Overall ROI</span>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                {overallROI.toFixed(2)}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Card>
    );
}
