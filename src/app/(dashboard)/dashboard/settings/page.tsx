"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [dollarRate, setDollarRate] = useState("120");
    const [officeRent, setOfficeRent] = useState("0");
    const [monthlySalaries, setMonthlySalaries] = useState("0");

    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await getSettings();
                if (data) {
                    setDollarRate(data.dollar_rate.toString());
                    setOfficeRent(data.office_rent.toString());
                    setMonthlySalaries(data.monthly_salaries.toString());
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        }
        fetchSettings();
    }, []);

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            await updateSettings({
                dollar_rate: parseFloat(dollarRate) || 0,
                office_rent: parseFloat(officeRent) || 0,
                monthly_salaries: parseFloat(monthlySalaries) || 0,
            });
            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">সেটিংস (Settings)</h1>
                    <p className="text-muted-foreground mt-1">
                        আপনার প্রোফাইল এবং অ্যাপলিকেশন সেটিংস পরিবর্তন করুন।
                    </p>
                </div>
            </div>

            <Tabs defaultValue="financials" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="financials">আর্থিক (Financials)</TabsTrigger>
                    <TabsTrigger value="profile">প্রোফাইল (Profile)</TabsTrigger>
                    <TabsTrigger value="account">অ্যাকাউন্ট (Account)</TabsTrigger>
                </TabsList>

                {/* Financial Settings */}
                <TabsContent value="financials">
                    <Card>
                        <CardHeader>
                            <CardTitle>আর্থিক সেটিংস (Financial Settings)</CardTitle>
                            <CardDescription>
                                ডলার রেট এবং মাসিক খরচ সেট করুন। এটি প্রফিট ক্যালকুলেশনে ব্যবহৃত হবে।
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="dollarRate">ডলার রেট (Dollar Rate)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="dollarRate"
                                        value={dollarRate}
                                        onChange={(e) => setDollarRate(e.target.value)}
                                        className="pl-9"
                                        placeholder="120"
                                    />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    এড কস্ট এবং অন্যান্য ডলার পেমেন্টের জন্য এই রেট ব্যবহার করা হবে।
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="officeRent">অফিস ভাড়া (Monthly Office Rent)</Label>
                                    <Input
                                        id="officeRent"
                                        value={officeRent}
                                        onChange={(e) => setOfficeRent(e.target.value)}
                                        placeholder="5000"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="salaries">মাসিক স্যালারি (Monthly Salaries)</Label>
                                    <Input
                                        id="salaries"
                                        value={monthlySalaries}
                                        onChange={(e) => setMonthlySalaries(e.target.value)}
                                        placeholder="10000"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSettings} disabled={isLoading} className="gap-2">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                সেভ করুন
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Profile Settings */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>প্রোফাইল তথ্য</CardTitle>
                            <CardDescription>
                                আপনার ব্যক্তিগত এবং ব্যবসার তথ্য আপডেট করুন।
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">আপনার নাম</Label>
                                <Input id="name" defaultValue="Admin User" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="business">ব্যবসার নাম</Label>
                                <Input id="business" defaultValue="Hishab Nikash Store" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">ফোন নম্বর</Label>
                                <Input id="phone" defaultValue="01700000000" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="address">ঠিকানা</Label>
                                <Input id="address" defaultValue="ঢাকা, বাংলাদেশ" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="gap-2">
                                <Save size={16} />
                                সেভ করুন
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Account Settings */}
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
                            <CardDescription>
                                আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন।
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="current">বর্তমান পাসওয়ার্ড</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new">নতুন পাসওয়ার্ড</Label>
                                <Input id="new" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="confirm">পাসওয়ার্ড নিশ্চিত করুন</Label>
                                <Input id="confirm" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="gap-2">
                                <Save size={16} />
                                পাসওয়ার্ড আপডেট করুন
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
