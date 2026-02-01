"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/actions/inventory";
import { useLanguage } from "@/context/language-context";

export function DeleteProductButton({ id }: { id: string }) {
    const { t } = useLanguage();
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => {
                if (confirm(t("common.deleteConfirm") || "Are you sure?")) {
                    startTransition(async () => { await deleteProduct(id); });
                }
            }}
            className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
        >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t("common.delete")}</span>
        </Button>
    )
}
