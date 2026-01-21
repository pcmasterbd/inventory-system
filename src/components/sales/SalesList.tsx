"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Eye } from "lucide-react";
import { deleteInvoice } from "@/app/actions/sales";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

interface SalesListProps {
    invoices: any[];
}

export function SalesList({ invoices }: SalesListProps) {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const handleDelete = async (id: string, invoiceNumber: string) => {
        if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This will revert stock changes.`)) {
            return;
        }

        try {
            const result = await deleteInvoice(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Invoice deleted successfully");
            }
        } catch (error) {
            toast.error("Failed to delete invoice");
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                No sales found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>
                                    {format(new Date(invoice.created_at), "PPP")}
                                </TableCell>
                                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                <TableCell>
                                    {invoice.parties ? (
                                        <div>
                                            <p>{invoice.parties.name}</p>
                                            <p className="text-xs text-muted-foreground">{invoice.parties.phone}</p>
                                        </div>
                                    ) : (
                                        "Walk-in Customer"
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-bold text-green-600">
                                    ৳{Math.abs(invoice.total_amount).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {invoice.status.toUpperCase()}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedInvoice(invoice)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Invoice Details - {invoice.invoice_number}</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                                                        <div>
                                                            <p className="font-semibold">Customer</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {invoice.parties?.name || "Walk-in Customer"}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold">Date</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(new Date(invoice.created_at), "PPP p")}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Product</TableHead>
                                                                <TableHead className="text-right">Qty</TableHead>
                                                                <TableHead className="text-right">Price</TableHead>
                                                                <TableHead className="text-right">Total</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {invoice.invoice_items?.map((item: any) => (
                                                                <TableRow key={item.id}>
                                                                    <TableCell>{item.products?.name || "Unknown Product"}</TableCell>
                                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                                    <TableCell className="text-right">৳{item.unit_price}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        ৳{(item.quantity * item.unit_price).toFixed(2)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>

                                                    <div className="flex flex-col items-end gap-2 mt-4 px-4">
                                                        <div className="flex justify-between w-48 text-sm">
                                                            <span>Subtotal:</span>
                                                            <span>৳{Math.abs(invoice.total_amount + (invoice.discount || 0)).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between w-48 text-sm text-red-500">
                                                            <span>Discount:</span>
                                                            <span>-৳{invoice.discount || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between w-48 font-bold text-lg pt-2 border-t">
                                                            <span>Total:</span>
                                                            <span>৳{Math.abs(invoice.total_amount).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between w-48 text-sm text-muted-foreground">
                                                            <span>Paid:</span>
                                                            <span>৳{Math.abs(invoice.paid_amount).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                            title="Delete Invoice"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
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
