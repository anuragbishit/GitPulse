"use client";

import { Github } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000").trim();

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, token: password }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid username or password");
      }
      
      window.location.href = "/dashboard";
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-elevated p-8 shadow-2xl shadow-indigo-950/20">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">GitPulse</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Sign in with GitHub</h1>
        </div>

        {!showForm ? (
          <div className="space-y-4">
            <p className="text-center text-sm leading-6 text-ink-3">
              GitHub will securely handle your username and password. GitPulse never sees them.
            </p>
            <Button onClick={() => setShowForm(true)} variant="primary" size="lg" className="w-full">
              <Github className="size-4" />
              Continue with GitHub
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-negative/30 bg-negative/10 px-3 py-2 text-center text-sm text-negative">
                {error}
              </p>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">GitHub Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="octocat"
                className="w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Password / PAT</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full rounded-md border border-hairline bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="w-full">
              Cancel
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
