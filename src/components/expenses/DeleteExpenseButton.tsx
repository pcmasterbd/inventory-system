"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteExpense } from "@/app/actions/expenses";
import { toast } from "sonner";

export function DeleteExpenseButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(async () => {
                try {
                    await deleteExpense(id);
                    toast.success("খরচ ডিলিট হয়েছে");
                } catch (e) {
                    toast.error("ডিলিট করা যায়নি");
                }
            })}
            className="text-destructive hover:bg-destructive/10"
        >
            <Trash2 size={16} />
        </Button>
    )
}
