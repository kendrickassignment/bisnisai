import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sprout } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const uname = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
      return toast.error("Username 3-20 karakter (huruf, angka, _)");
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: uname },
      },
    });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    // auto-confirm enabled — try sign in immediately
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInErr) {
      toast.success("Akun dibuat! Silakan masuk.");
      navigate({ to: "/login" });
      return;
    }
    toast.success("Selamat datang di BisnisAI!");
    navigate({ to: "/" });
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
          <Sprout className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Daftar BisnisAI</h1>
        <p className="text-sm text-muted-foreground">Gratis untuk pelaku UMKM</p>
      </div>
      <form onSubmit={onSubmit} className="w-full space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="contoh: tokobudi"
            autoCapitalize="none"
          />
          <p className="mt-1 text-xs text-muted-foreground">3-20 karakter, huruf/angka/_</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="nama@contoh.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kata sandi</label>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="Minimal 6 karakter"
          />
        </div>
        <button
          disabled={busy}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Memproses…" : "Buat Akun"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-primary">Masuk</Link>
        </p>
      </form>
    </div>
  );
}
