"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, TrendingUp, ShieldCheck } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="h-20 border-b border-border/50 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    PC MASTER BD
                </div>
                <Link href="/login">
                    <Button variant="outline" className="gap-2">
                        লগইন (Login)
                    </Button>
                </Link>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-muted/30 to-background">
                <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        অত্যাধুনিক ইনভেন্টরি সিস্টেম
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground/60 bg-clip-text text-transparent">
                        আপনার টেক ব্যবসা <br /> পরিচালনা করুন
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        <span className="font-semibold text-foreground mx-1">PC MASTER BD</span>
                        এর জন্য চূড়ান্ত ইনভেন্টরি এবং আর্থিক ব্যবস্থাপনা সমাধান।
                        এক জায়গায় বিক্রি, স্টক এবং লাভের হিসাব রাখুন।
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/login">
                            <Button size="lg" className="h-12 px-8 text-lg shadow-xl shadow-primary/20 gap-2">
                                অ্যাডমিন ড্যাশবোর্ড <ArrowRight size={18} />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full text-left">
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <ShoppingBag size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">ইনভেন্টরি ট্র্যাকিং</h3>
                        <p className="text-muted-foreground">মাস্টার বুটেবল পেন ড্রাইভ এবং অন্যান্য টেক পণ্যের রিয়েল-টাইম ট্র্যাকিং।</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">আর্থিক ইনসাইটস</h3>
                        <p className="text-muted-foreground">দৈনিক আয়, ব্যয় এবং নিট লাভের হিসাব দেখুন সহজ চার্টের মাধ্যমে।</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">সুরক্ষিত অ্যাডমিন</h3>
                        <p className="text-muted-foreground">শুধুমাত্র অ্যাডমিনিস্ট্রেটরদের জন্য সুরক্ষিত অ্যাক্সেস। আপনার তথ্য নিরাপদ।</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
                © ২০২৬ PC MASTER BD. সর্বস্বত্ব সংরক্ষিত।
            </footer>
        </div>
    );
}
