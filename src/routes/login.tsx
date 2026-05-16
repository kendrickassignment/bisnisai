import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Sprout } from "lucide-react";
import { toast } from "sonner";
import { TutorialAbout } from "@/components/TutorialAbout";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const id = identifier.trim();
    if (!id) return toast.error("Masukkan email atau username");
    setBusy(true);
    let email = id;
    if (!id.includes("@")) {
      const { data, error } = await supabase.rpc("get_email_by_username", { p_username: id });
      if (error || !data) {
        setBusy(false);
        return toast.error("Username tidak ditemukan");
      }
      email = data as string;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error("Email/username atau kata sandi salah");
    toast.success("Selamat datang kembali!");
    navigate({ to: "/" });
  };

  return (
    <div className="app-shell flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
          <Sprout className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">BisnisAI</h1>
        <p className="text-sm text-muted-foreground">Asisten serba bisa untuk UMKM Indonesia</p>
      </div>
      <form onSubmit={onSubmit} className="w-full space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-lg font-semibold">Masuk</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Email atau Username</label>
          <input
            type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="nama@contoh.com atau tokobudi"
            autoCapitalize="none"
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
          {busy ? "Memproses…" : "Masuk"}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link to="/signup" className="font-semibold text-primary">Daftar</Link>
        </p>
      </form>
    </div>
  );
}
