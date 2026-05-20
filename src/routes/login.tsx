import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Turfly" }] }),
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("customer@test.com");
  const [password, setPassword] = useState("password");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, password);
    if (!r.ok) { toast.error(r.error ?? "Login failed"); return; }
    toast.success("Welcome back!");
    if (email === "admin@test.com") navigate({ to: "/admin" });
    else if (redirect?.startsWith("/turfs/")) navigate({ to: "/turfs/$turfId", params: { turfId: redirect.replace("/turfs/", "") } });
    else navigate({ to: "/" });
  };

  const fill = (e: string) => { setEmail(e); setPassword("password"); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Turfly</span>
        </Link>
        <Card>
          <CardContent className="p-6">
            <h1 className="text-xl font-bold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back. Please sign in to continue.</p>
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
            </form>

            <div className="mt-6 rounded-lg border border-dashed border-border p-3 text-xs">
              <div className="mb-2 font-semibold text-muted-foreground">Demo accounts</div>
              <div className="space-y-1.5">
                <button type="button" onClick={() => fill("customer@test.com")} className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-muted">
                  <span><b>Customer:</b> customer@test.com</span><span className="text-muted-foreground">password</span>
                </button>
                <button type="button" onClick={() => fill("admin@test.com")} className="flex w-full items-center justify-between rounded px-2 py-1.5 hover:bg-muted">
                  <span><b>Admin:</b> admin@test.com</span><span className="text-muted-foreground">password</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
