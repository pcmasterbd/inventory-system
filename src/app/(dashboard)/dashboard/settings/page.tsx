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
import { useLanguage } from "@/context/language-context";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [dollarRate, setDollarRate] = useState("120");
    const [officeRent, setOfficeRent] = useState("0");
    const [monthlySalaries, setMonthlySalaries] = useState("0");
    const { t } = useLanguage();

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
            toast.success(t("settings.financials.saveSuccess") || "Settings saved successfully");
        } catch (error) {
            toast.error(t("settings.financials.saveError") || "Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t("settings.description")}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="financials" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="financials">{t("settings.tabs.financials")}</TabsTrigger>
                    <TabsTrigger value="profile">{t("settings.tabs.profile")}</TabsTrigger>
                    <TabsTrigger value="account">{t("settings.tabs.account")}</TabsTrigger>
                </TabsList>

                {/* Financial Settings */}
                <TabsContent value="financials">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settings.financials.title")}</CardTitle>
                            <CardDescription>
                                {t("settings.financials.description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="dollarRate">{t("settings.financials.dollarRate")}</Label>
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
                                    {t("sales.bulk.description")}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="officeRent">{t("settings.financials.officeRent")}</Label>
                                    <Input
                                        id="officeRent"
                                        value={officeRent}
                                        onChange={(e) => setOfficeRent(e.target.value)}
                                        placeholder="5000"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="salaries">{t("settings.financials.salaries")}</Label>
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
                                {t("common.save")}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Profile Settings */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settings.profile.title")}</CardTitle>
                            <CardDescription>
                                {t("settings.profile.description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">{t("settings.profile.name")}</Label>
                                <Input id="name" defaultValue="Admin User" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="business">{t("settings.profile.business")}</Label>
                                <Input id="business" defaultValue="Hishab Nikash Store" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">{t("settings.profile.phone")}</Label>
                                <Input id="phone" defaultValue="01700000000" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="address">{t("settings.profile.address")}</Label>
                                <Input id="address" defaultValue={t("settings.profile.addressDefault") || "Dhaka, Bangladesh"} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="gap-2">
                                <Save size={16} />
                                {t("common.save")}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Account Settings */}
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("settings.account.title")}</CardTitle>
                            <CardDescription>
                                {t("settings.account.description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="current">{t("settings.account.currentPassword")}</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="new">{t("settings.account.newPassword")}</Label>
                                <Input id="new" type="password" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="confirm">{t("settings.account.confirmPassword")}</Label>
                                <Input id="confirm" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="gap-2">
                                <Save size={16} />
                                {t("settings.account.update")}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
