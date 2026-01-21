"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
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
            setError("Invalid username. Only 'pcmasterbd1122' is allowed.");
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

            // Auto-fix: If invalid credentials, maybe user doesn't exist? Try to create it.
            if (err.message.includes("Invalid login credentials")) {
                try {
                    console.log("Attempting auto-creation of admin user...");
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: emailToUse,
                        password: password,
                    });

                    if (!signUpError && signUpData.user) {
                        // If we are here, it means the user DID NOT exist and we just made it.
                        // But we might need email verification depending on settings.
                        // Let's try to login AGAIN immediately if auto-confirm is on.
                        const { error: retryError } = await supabase.auth.signInWithPassword({
                            email: emailToUse,
                            password: password,
                        });

                        if (!retryError) {
                            router.push("/dashboard");
                            router.refresh();
                            return; // Success!
                        } else {
                            setError("Admin account created! Please check email to confirm, then login.");
                            setLoading(false);
                            return;
                        }
                    } else if (signUpError?.message.includes("already registered")) {
                        // User exists, so password MUST be wrong.
                        setError("Incorrect password for pcmasterbd1122.");
                        setLoading(false);
                        return;
                    }
                } catch (innerErr: any) {
                    console.error("Auto-signup failed:", innerErr);
                    setError(`Auto-setup failed: ${innerErr?.message || innerErr}`);
                    return;
                }
            }

            // If we get here, it means we didn't return from the auto-fix blocks
            if (err.message.includes("Invalid login credentials")) {
                // If we are here, it means auto-signup didn't trigger 'return' (maybe signUpError was vague?)
                setError("Invalid login credentials. User might exist with different password, or signup failed.");
            } else {
                setError(err.message || "An error occurred during login");
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        PC MASTER BD
                    </CardTitle>
                    <CardDescription>
                        Enter your admin credentials to access the dashboard
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
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    placeholder="Enter username"
                                    className="pl-9"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
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
                            {loading ? "Verifying..." : "Login to Dashboard"}
                        </Button>
                    </CardFooter>
                </form>

            </Card>
        </div>
    );
}
