"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ProductStat {
    name: string;
    unitsSold: number;
    returnCount: number;
    actualSold: number;
    revenue: number;
    totalRevenue: number;
    perUnitCOGS: number;
    totalCOGS: number;
    grossProfit: number;
}

interface SalesBreakdownProps {
    data: ProductStat[];
}

export function SalesBreakdown({ data }: SalesBreakdownProps) {
    // Calculate Totals
    const totals = data.reduce((acc, curr) => ({
        unitsSold: acc.unitsSold + curr.unitsSold,
        returnCount: acc.returnCount + curr.returnCount,
        actualSold: acc.actualSold + curr.actualSold,
        revenue: acc.revenue + curr.revenue,
        totalCOGS: acc.totalCOGS + curr.totalCOGS,
        grossProfit: acc.grossProfit + curr.grossProfit
    }), {
        unitsSold: 0,
        returnCount: 0,
        actualSold: 0,
        revenue: 0,
        totalCOGS: 0,
        grossProfit: 0
    });

    return (
        <Card>
            <CardHeader className="bg-purple-700 text-white rounded-t-xl">
                <CardTitle>Sales Breakdown</CardTitle>
                <CardDescription className="text-purple-100">Product-wise performance analysis</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[200px] font-bold">Product</TableHead>
                            <TableHead className="text-center bg-yellow-50 text-yellow-900 font-bold border-l">Units Sold</TableHead>
                            <TableHead className="text-center bg-yellow-50 text-yellow-900 font-bold">Return</TableHead>
                            <TableHead className="text-center bg-yellow-50 text-yellow-900 font-bold border-r">Actual Sold</TableHead>

                            <TableHead className="text-right font-bold">Revenue</TableHead>
                            <TableHead className="text-right font-bold border-r">Total Revenue</TableHead>

                            <TableHead className="text-right bg-orange-50 text-orange-900 font-bold">Per COGS</TableHead>
                            <TableHead className="text-right bg-orange-50 text-orange-900 font-bold border-r">Total COGS</TableHead>

                            <TableHead className="text-right bg-green-50 text-green-900 font-bold">Gross Profit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                                    No sales data found for this period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow key={index} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-center bg-yellow-50/30 border-l">{item.unitsSold}</TableCell>
                                    <TableCell className="text-center bg-yellow-50/30 text-red-600">{item.returnCount > 0 ? item.returnCount : '-'}</TableCell>
                                    <TableCell className="text-center bg-yellow-50/30 font-bold border-r">{item.actualSold}</TableCell>

                                    <TableCell className="text-right">৳{(item.revenue / (item.actualSold || 1)).toFixed(0)}*</TableCell>
                                    <TableCell className="text-right font-medium border-r">৳{item.revenue.toLocaleString()}</TableCell>

                                    <TableCell className="text-right bg-orange-50/30">৳{item.perUnitCOGS}</TableCell>
                                    <TableCell className="text-right bg-orange-50/30 font-medium border-r">৳{item.totalCOGS.toLocaleString()}</TableCell>

                                    <TableCell className="text-right bg-green-50/30 font-bold text-green-700">৳{item.grossProfit.toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>

                    {/* Footer / Grand Total */}
                    {data.length > 0 && (
                        <TableBody className="border-t-2 border-purple-200">
                            <TableRow className="bg-purple-50 hover:bg-purple-50 font-bold">
                                <TableCell>Grand Total</TableCell>
                                <TableCell className="text-center border-l">{totals.unitsSold}</TableCell>
                                <TableCell className="text-center text-red-600">{totals.returnCount}</TableCell>
                                <TableCell className="text-center border-r">{totals.actualSold}</TableCell>

                                <TableCell className="text-right">-</TableCell>
                                <TableCell className="text-right border-r">৳{totals.revenue.toLocaleString()}</TableCell>

                                <TableCell className="text-right">-</TableCell>
                                <TableCell className="text-right border-r">৳{totals.totalCOGS.toLocaleString()}</TableCell>

                                <TableCell className="text-right text-green-700">৳{totals.grossProfit.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    )}
                </Table>
            </CardContent>
        </Card>
    );
}
