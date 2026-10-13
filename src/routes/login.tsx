import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, isAdminEmail } from "@/lib/auth";
import {
  Trophy, Eye, EyeOff, Loader2, CheckCircle, UserPlus, LogIn,
  Mail, Lock, User, Phone, Zap, ShieldCheck
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    tab: typeof search.tab === "string" ? search.tab : "login",
  }),
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Turfly" }] }),
});

function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { redirect, tab: initialTab } = Route.useSearch();
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    initialTab === "register" ? "register" : "login"
  );
  const [loading, setLoading] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const r = login(email, password);
    setLoading(false);
    if (!r.ok) { toast.error(r.error ?? "Login failed"); return; }
    toast.success("Welcome back!");
    if (isAdminEmail(email)) navigate({ to: "/admin" });
    else if (redirect?.startsWith("/turfs/")) navigate({ to: "/turfs/$turfId", params: { turfId: redirect.replace("/turfs/", "") } });
    else navigate({ to: "/" });
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPass) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const r = register(regEmail, regPassword, regName, regPhone || undefined);
    setLoading(false);
    if (!r.ok) { toast.error(r.error ?? "Registration failed"); return; }
    toast.success("Account created! Welcome to Turfly 🎉");
    navigate({ to: "/" });
  };

  const DEMO_ACCOUNTS = [
    { label: "Customer", email: "customer@test.com", password: "password", desc: "Browse & book turfs" },
    { label: "Admin", email: "turfadmin@gmail.com", password: "TurfAdmin@123", desc: "Full admin access" },
  ];

  const fill = (e: string, p: string) => { setEmail(e); setPassword(p); };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900">
      {/* Left panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white">
        <Link to="/" className="mb-10 flex items-center gap-3 self-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Turfly</span>
        </Link>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Your game,<br />
            <span className="text-emerald-400">your courts.</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            Book premium sports venues in seconds. Real-time availability, instant confirmation, zero hassle.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Zap, title: "Instant booking confirmation", desc: "No waiting, no calls — book and play." },
              { icon: ShieldCheck, title: "Verified premium venues", desc: "Every venue is quality-checked." },
              { icon: CheckCircle, title: "Flexible cancellations", desc: "Cancel up to 2 hours before your slot." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15">
                  <Icon className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{title}</div>
                  <div className="text-sm text-white/60">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-bold text-white">Turfly</span>
          </Link>

          <Card className="border-border/40 shadow-2xl bg-white/95 backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8">
              {/* Tab switcher */}
              <div className="mb-6 flex rounded-xl bg-muted p-1">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === "login" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === "register" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <UserPlus className="h-4 w-4" /> Register
                </button>
              </div>

              {activeTab === "login" ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">Welcome back</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Sign in to your Turfly account</p>
                  </div>

                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="pl-9"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="pl-9 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full gap-2 mt-2" disabled={loading} size="lg">
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : <><LogIn className="h-4 w-4" /> Sign in</>}
                    </Button>
                  </form>

                  {/* Demo accounts */}
                  <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                    <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Accounts</p>
                    <div className="space-y-2">
                      {DEMO_ACCOUNTS.map(a => (
                        <button
                          key={a.email}
                          type="button"
                          onClick={() => fill(a.email, a.password)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-muted transition-colors border border-transparent hover:border-border"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {a.label[0]}
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-foreground">{a.label}</div>
                              <div className="text-[11px] text-muted-foreground">{a.desc}</div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Click to fill</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">Create account</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Join thousands of players on Turfly</p>
                  </div>

                  <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Full name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          className="pl-9"
                          placeholder="Rahul Sharma"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="pl-9"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Phone (optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          className="pl-9"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showRegPass ? "text" : "password"}
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            className="pl-9 pr-8"
                            placeholder="Min 6 chars"
                            required
                          />
                          <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-2.5 top-2.5 text-muted-foreground">
                            {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Confirm</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            value={regConfirmPass}
                            onChange={e => setRegConfirmPass(e.target.value)}
                            className={`pl-9 ${regConfirmPass && regConfirmPass !== regPassword ? "border-red-300" : ""}`}
                            placeholder="Repeat"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {regConfirmPass && regConfirmPass !== regPassword && (
                      <p className="text-xs text-red-500">Passwords don't match</p>
                    )}

                    <Button type="submit" className="w-full gap-2 mt-2" disabled={loading || !regName || !regEmail} size="lg">
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : <><UserPlus className="h-4 w-4" /> Create account</>}
                    </Button>
                  </form>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    By registering you agree to our{" "}
                    <Link to="/" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-sm text-white/60">
            {activeTab === "login" ? (
              <>Don't have an account? <button onClick={() => setActiveTab("register")} className="text-white font-medium hover:underline">Register free</button></>
            ) : (
              <>Already have an account? <button onClick={() => setActiveTab("login")} className="text-white font-medium hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
