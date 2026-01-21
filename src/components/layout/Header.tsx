"use client";

import { Bell, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    return (
        <header className="h-20 sticky top-0 z-30 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border">
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-xl relative">
                <Search className="absolute left-3 text-muted-foreground" size={20} />
                <input
                    type="text"
                    placeholder="Search products, orders, or customers..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-background"></span>
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm">
                            <Plus size={18} />
                            <span className="font-medium">Quick Add</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/sales/daily" className="cursor-pointer">
                                <span>Daily Sales Entry</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/inventory" className="cursor-pointer">
                                <span>Add Product / Inventory</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="cursor-pointer">
                                <span>Financial Settings</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
