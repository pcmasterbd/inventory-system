"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export default function LoginPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Enforce single admin user
        if (username !== "pcmasterbd1122") {
            setError(t("login.invalidUser"));
            setLoading(false);
            return;
        }

        const emailToUse = "admin@pcmasterbd.com";

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: emailToUse,
                password: password,
            });

            if (authError) {
                throw authError;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            console.error("Login error:", err);

            // User exists, so password MUST be wrong.
            if (err.message.includes("Invalid login credentials")) {
                setError(t("login.incorrectPassword"));
                setLoading(false);
                return;
            }

            setError(err.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {t("login.title")}
                    </CardTitle>
                    <CardDescription>
                        {t("login.description")}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">{t("login.username")}</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    placeholder={t("login.username")}
                                    className="pl-9"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t("login.password")}</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t("login.password")}
                                    className="pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full gap-2" type="submit" disabled={loading}>
                            {loading ? t("login.verifying") : t("login.loginButton")}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
