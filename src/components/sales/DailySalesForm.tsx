"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getDailySales, saveDailySales, DailySaleEntry } from "@/app/actions/daily-sales";
import { getSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Product = {
    id: string;
    name: string;
    selling_price: number;
    cost_price: number;
    stock_quantity: number;
    type?: string;
};

interface DailySalesFormProps {
    products: Product[];
}

export function DailySalesForm({ products }: DailySalesFormProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [entries, setEntries] = useState<Record<string, DailySaleEntry>>({});
    const [dollarRate, setDollarRate] = useState(120);

    // Fetch settings (dollar rate)
    useEffect(() => {
        getSettings().then(settings => {
            if (settings) {
                setDollarRate(settings.dollar_rate);
            }
        });
    }, []);

    // Fetch existing sales for the date
    useEffect(() => {
        async function fetchSales() {
            setIsLoading(true);
            try {
                const dateStr = format(date, "yyyy-MM-dd");
                const sales = await getDailySales(dateStr);

                const newEntries: Record<string, DailySaleEntry> = {};
                if (sales) {
                    sales.forEach((sale: any) => {
                        newEntries[sale.product_id] = {
                            product_id: sale.product_id,
                            quantity_sold: sale.quantity_sold,
                            quantity_returned: sale.quantity_returned,
                            ad_cost_dollar: sale.ad_cost_dollar
                        };
                    });
                }
                setEntries(newEntries);
            } catch (error) {
                console.error("Error fetching sales:", error);
                toast.error("Failed to load sales data");
            } finally {
                setIsLoading(false);
            }
        }
        fetchSales();
    }, [date]);

    const handleEntryChange = (productId: string, field: keyof DailySaleEntry, value: string) => {
        const numValue = parseFloat(value) || 0;
        setEntries(prev => {
            const current = prev[productId] || {
                product_id: productId,
                quantity_sold: 0,
                quantity_returned: 0,
                ad_cost_dollar: 0
            };
            return {
                ...prev,
                [productId]: {
                    ...current,
                    [field]: numValue
                }
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const dateStr = format(date, "yyyy-MM-dd");
            const entriesList = Object.values(entries);
            await saveDailySales(dateStr, entriesList);
            toast.success("Sales saved successfully");
        } catch (error) {
            console.error("Error saving sales:", error);
            toast.error("Failed to save sales");
        } finally {
            setIsSaving(false);
        }
    };

    // Calculations helper
    const calculateProfit = (product: Product, entry?: DailySaleEntry) => {
        if (!entry) return 0;
        const netSold = entry.quantity_sold - entry.quantity_returned;
        const revenue = netSold * product.selling_price;
        const cogs = netSold * product.cost_price;
        const adCostInfo = entry.ad_cost_dollar * dollarRate;
        return revenue - cogs - adCostInfo;
    };

    const totalStats = products.reduce((acc, product) => {
        const entry = entries[product.id];
        if (!entry) return acc;
        const netSold = entry.quantity_sold - entry.quantity_returned;
        const profit = calculateProfit(product, entry);
        return {
            sold: acc.sold + entry.quantity_sold,
            returned: acc.returned + entry.quantity_returned,
            adCost: acc.adCost + entry.ad_cost_dollar,
            profit: acc.profit + profit
        };
    }, { sold: 0, returned: 0, adCost: 0, profit: 0 });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <div className="text-sm text-muted-foreground">
                        Dollar Rate: ৳{dollarRate}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-right hidden lg:block">
                        <div className="font-medium text-emerald-600">Total Profit: ৳{totalStats.profit.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Ad Cost: ${totalStats.adCost}</div>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving || isLoading} className="gap-2">
                        {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[250px]">Product</TableHead>
                            <TableHead className="text-center w-[100px]">Sold</TableHead>
                            <TableHead className="text-center w-[100px]">Return</TableHead>
                            <TableHead className="text-center w-[100px]">Ad Cost ($)</TableHead>
                            <TableHead className="text-right w-[120px]">Net Sold</TableHead>
                            <TableHead className="text-right">Profit (est)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    <span className="sr-only">Loading...</span>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                const entry = entries[product.id] || { product_id: product.id, quantity_sold: 0, quantity_returned: 0, ad_cost_dollar: 0 };
                                const netSold = entry.quantity_sold - entry.quantity_returned;
                                const profit = calculateProfit(product, entry);

                                return (
                                    <TableRow key={product.id} className="hover:bg-muted/10">
                                        <TableCell className="font-medium">
                                            <div>
                                                {product.name}
                                                <div className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                className="text-center h-8"
                                                value={entry.quantity_sold || ""}
                                                onChange={(e) => handleEntryChange(product.id, "quantity_sold", e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                className="text-center h-8"
                                                value={entry.quantity_returned || ""}
                                                onChange={(e) => handleEntryChange(product.id, "quantity_returned", e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell className="p-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1.5 text-xs text-muted-foreground">$</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="pl-5 text-center h-8"
                                                    value={entry.ad_cost_dollar || ""}
                                                    onChange={(e) => handleEntryChange(product.id, "ad_cost_dollar", e.target.value)}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {netSold}
                                        </TableCell>
                                        <TableCell className={cn("text-right font-bold", profit >= 0 ? "text-emerald-600" : "text-red-500")}>
                                            ৳{profit.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
