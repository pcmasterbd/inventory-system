"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Edit } from "lucide-react";
import { addParty, updateParty } from "@/app/actions/parties";

interface PartyEntryDialogProps {
    defaultType?: "customer" | "supplier";
    party?: {
        id: string;
        name: string;
        type: "customer" | "supplier";
        phone?: string | null;
        email?: string | null;
        address?: string | null;
    };
}

export function PartyEntryDialog({ defaultType = "customer", party }: PartyEntryDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [type, setType] = useState<"customer" | "supplier">(defaultType);

    useEffect(() => {
        if (open) {
            if (party) {
                setName(party.name);
                setPhone(party.phone || "");
                setType(party.type);
            } else {
                setName("");
                setPhone("");
                setType(defaultType); // Reset to default type for Add
            }
        }
    }, [open, party, defaultType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = {
                name,
                type,
                phone: phone || undefined,
            };

            if (party) {
                await updateParty(party.id, data);
            } else {
                await addParty(data);
            }

            setOpen(false);
            if (!party) {
                setName("");
                setPhone("");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = !!party;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                ) : (
                    <Button className="gap-2 shadow-lg shadow-primary/25">
                        <Plus size={18} />
                        নতুন {defaultType === 'customer' ? 'কাস্টমার' : 'সাপ্লায়ার'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "পার্টি আপডেট (Edit Party)" : `নতুন ${type === 'customer' ? 'কাস্টমার' : 'সাপ্লায়ার'} (New ${type === 'customer' ? 'Customer' : 'Supplier'})`}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit ? "তথ্য আপডেট করুন।" : "নতুন কাস্টমার বা সাপ্লায়ার যোগ করুন।"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">নাম (Name)</Label>
                        <Input
                            id="name"
                            placeholder="পুরো নাম / দোকানের নাম"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">মোবাইল (Phone)</Label>
                        <Input
                            id="phone"
                            placeholder="017..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">ধরণ (Type)</Label>
                        <Select onValueChange={(val: any) => setType(val)} value={type}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="customer">ক্রেতা (Customer)</SelectItem>
                                <SelectItem value="supplier">সাপ্লায়ার (Supplier)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "আপডেট করুন" : "সেভ করুন"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
