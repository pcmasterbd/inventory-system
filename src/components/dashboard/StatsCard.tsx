import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    color?: "primary" | "success" | "warning" | "danger";
}

export function StatsCard({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
    trendValue,
    color = "primary",
}: StatsCardProps) {
    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-none bg-white/50 backdrop-blur-sm dark:bg-card/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {title}
                        </p>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {value}
                        </h3>
                        {subValue && (
                            <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
                        )}
                    </div>
                    <div
                        className={cn(
                            "p-3 rounded-xl shadow-lg",
                            color === "primary" && "bg-blue-100 text-blue-600 shadow-blue-200/50 dark:bg-blue-900/30 dark:shadow-blue-900/20",
                            color === "success" && "bg-emerald-100 text-emerald-600 shadow-emerald-200/50 dark:bg-emerald-900/30 dark:shadow-emerald-900/20",
                            color === "warning" && "bg-amber-100 text-amber-600 shadow-amber-200/50 dark:bg-amber-900/30 dark:shadow-amber-900/20",
                            color === "danger" && "bg-rose-100 text-rose-600 shadow-rose-200/50 dark:bg-rose-900/30 dark:shadow-rose-900/20"
                        )}
                    >
                        <Icon size={24} />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center text-sm">
                        <span
                            className={cn(
                                "font-medium px-2 py-0.5 rounded-full text-xs",
                                trend === "up"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                                    : trend === "down"
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                            )}
                        >
                            {trend === "up" ? "+" : ""}
                            {trendValue}
                        </span>
                        <span className="text-muted-foreground ml-2">গত মাস থেকে</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
