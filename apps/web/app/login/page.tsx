"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, LogIn, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("adminpass123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.loginReviewer({ username, password });
      localStorage.setItem("gcc_reviewer_token", res.access_token);
      router.push("/review");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your reviewer details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-container)]/20 border border-[var(--color-primary)]/30 text-[var(--color-primary)] flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">
            Sign In to GCC Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Enter your authorized auditor credentials to access the editorial review workspace and moderation pipeline.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-4 border border-[var(--color-outline-variant)]/20 shadow-xl bg-[var(--color-surface-container)]">
          {error && (
            <div className="p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-[var(--color-on-surface)] mb-1">
                Auditor Username
              </label>
              <Input
                id="login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--color-on-surface)] mb-1">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 shadow-[0_0_20px_rgba(197,192,255,0.25)]"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Authenticating…" : "Sign In to Workspace"}</span>
            </Button>
          </form>

          <div className="pt-3 border-t border-[var(--color-surface-container-high)] text-center space-y-1">
            <span className="text-[11px] font-mono text-[var(--color-outline)] block">
              Default Dev Credentials: <code className="text-[var(--color-primary)]">admin</code> / <code className="text-[var(--color-primary)]">adminpass123</code>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
