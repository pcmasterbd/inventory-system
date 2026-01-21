import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen bg-muted/30" suppressHydrationWarning>
            <Sidebar />
            <div className="flex-1 lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 lg:p-8 animate-in fade-in duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
}
