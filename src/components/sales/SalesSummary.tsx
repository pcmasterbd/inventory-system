"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/language-context";

interface SalesSummaryProps {
    data: {
        productName: string;
        totalSold: number;
        totalReturned: number;
        revenue: number;
    }[];
}

export function SalesSummary({ data }: SalesSummaryProps) {
    const { t } = useLanguage();
    // Calculate totals
    const totalRevenue = data.reduce((acc, item) => acc + item.revenue, 0);
    const totalSold = data.reduce((acc, item) => acc + item.totalSold, 0);
    const totalReturned = data.reduce((acc, item) => acc + item.totalReturned, 0);

    return (
        <Card className="h-full border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle>{t("sales.summary.title")}</CardTitle>
                <CardDescription>
                    {t("sales.summary.description")}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("sales.summary.productName")}</TableHead>
                                <TableHead className="text-right">{t("sales.summary.totalSold")}</TableHead>
                                <TableHead className="text-right">{t("sales.summary.totalReturned")}</TableHead>
                                <TableHead className="text-right">{t("sales.summary.netQty")}</TableHead>
                                <TableHead className="text-right">{t("sales.summary.netRevenue")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        {t("sales.summary.noData")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.productName}>
                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                        <TableCell className="text-right font-medium text-emerald-600">
                                            {item.totalSold}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-red-500">
                                            {item.totalReturned}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.totalSold - item.totalReturned}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            ৳{item.revenue.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                        {data.length > 0 && (
                            <TableBody className="bg-muted/50 border-t-2 font-bold">
                                <TableRow>
                                    <TableCell>{t("sales.summary.total")}</TableCell>
                                    <TableCell className="text-right text-emerald-700">{totalSold}</TableCell>
                                    <TableCell className="text-right text-red-700">{totalReturned}</TableCell>
                                    <TableCell className="text-right">{totalSold - totalReturned}</TableCell>
                                    <TableCell className="text-right">৳{totalRevenue.toFixed(2)}</TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
