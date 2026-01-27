"use client";

import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions";
import {
    LayoutDashboard,
    Wallet,
    Package,
    Users,
    Settings,
    Menu,
    X,
    LogOut,
    User,
    BarChart3,
    ShoppingCart,
    Receipt,
    PiggyBank,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    ListOrdered
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
    href: string;
    label: string;
    icon: any;
    children?: { href: string; label: string; icon?: any }[]; // Sub-menu interface
};

const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
        href: "/dashboard/sales",
        label: "Money In",
        icon: Wallet, // Or ArrowDownLeft from lucide if available, closest common: Wallet/TrendingUp
        children: [
            { href: "/dashboard/sales", label: "Invoices (Sales)", icon: ListOrdered },
            { href: "/dashboard/sales/daily", label: "Daily Sales Entry", icon: ClipboardList },
        ]
    },
    { href: "/dashboard/expenses", label: "Money Out", icon: Receipt },
    { href: "/dashboard/funds", label: "Accounts", icon: PiggyBank }, // Funds -> Accounts
    { href: "/dashboard/parties", label: "Vendors", icon: Users }, // Parties -> Vendors
    { href: "/dashboard/investments", label: "Projects", icon: BarChart3 }, // Investments -> Projects
    { href: "/dashboard/inventory", label: "Inventory", icon: Package }, // Keep Inventory but maybe lower priority or same
    { href: "/dashboard/reports", label: "Reports", icon: ClipboardList },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>("Sales"); // Default expand Sales or null

    const toggleSubMenu = (label: string) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-full shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen w-72 bg-card/80 backdrop-blur-md border-r border-border transition-transform duration-300 lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-8 border-b border-border">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            PC MASTER<span className="text-foreground"> BD</span>
                        </h1>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || item.children?.some(child => pathname === child.href);
                            const hasChildren = item.children && item.children.length > 0;
                            const isExpanded = expandedMenu === item.label || isActive; // Auto-expand if active

                            if (hasChildren) {
                                return (
                                    <div key={item.label} className="space-y-1">
                                        <button
                                            onClick={() => toggleSubMenu(item.label)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={20} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"} />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>

                                        {isExpanded && (
                                            <div className="pl-4 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                                {item.children!.map((child) => {
                                                    const isChildActive = pathname === child.href;
                                                    return (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            onClick={() => setIsOpen(false)}
                                                            className={cn(
                                                                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors relative",
                                                                isChildActive
                                                                    ? "text-primary font-medium bg-primary/5"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                            )}
                                                        >
                                                            {/* Vertical connection line */}
                                                            <div className={cn(
                                                                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full",
                                                                isChildActive ? "bg-primary" : "bg-muted-foreground/30"
                                                            )} />

                                                            {child.icon ? <child.icon size={16} /> : null}
                                                            <span>{child.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon
                                        size={20}
                                        className={cn(
                                            "transition-transform group-hover:scale-110",
                                            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                                        )}
                                    />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Summary (Bottom) */}
                    <div className="p-4 border-t border-border">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">PCM Admin</p>
                                <p className="text-xs text-muted-foreground">Owner</p>
                            </div>
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
