"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PartyEntryDialog } from "./PartyEntryDialog";
import { DeletePartyButton } from "./DeletePartyButton";

interface PartyListProps {
    parties: any[];
    type: "customer" | "supplier";
}

export function PartyList({ parties, type }: PartyListProps) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{type === 'customer' ? 'Customer' : 'Supplier'} List</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parties.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No {type}s found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            parties.map((party) => (
                                <TableRow key={party.id}>
                                    <TableCell className="font-medium">{party.name}</TableCell>
                                    <TableCell>{party.phone || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={party.balance < 0 ? "destructive" : "outline"}>
                                            ৳{party.balance}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <PartyEntryDialog party={party} defaultType={type} />
                                            <DeletePartyButton id={party.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
