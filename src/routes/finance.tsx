import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { recordFinance } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Loader2, Send, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export const Route = createFileRoute("/finance")({ component: FinancePage });

interface Tx {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  created_at: string;
}

const fmtIDR = (n: number) =>
  "Rp" + n.toLocaleString("id-ID");

function FinancePage() {
  const { user } = useAuth();
  const fnRecord = useServerFn(recordFinance);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [transactions, setTransactions] = useState<Tx[]>([]);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return toast.error(error.message);
    setTransactions((data ?? []) as Tx[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id]);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todays = transactions.filter((t) => new Date(t.created_at) >= today);
  const income = todays.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = todays.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const profit = income - expense;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fnRecord({ data: { text: text.trim() } });
      toast.success(`Tercatat ${r.transactions.length} transaksi`);
      setText("");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Gagal mencatat");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Kasir Ngobrol" subtitle="Catat transaksi pakai bahasa sehari-hari">
      <div className="mb-4 rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-card">
        <p className="text-xs opacity-90">Ringkasan hari ini</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{fmtIDR(profit)}</p>
        <p className="text-[11px] opacity-80">{profit >= 0 ? "Laba" : "Rugi"}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/15 p-2">
            <p className="opacity-80">Masuk</p>
            <p className="text-base font-semibold">{fmtIDR(income)}</p>
          </div>
          <div className="rounded-lg bg-white/15 p-2">
            <p className="opacity-80">Keluar</p>
            <p className="text-base font-semibold">{fmtIDR(expense)}</p>
          </div>
        </div>
      </div>

      <h3 className="mb-2 text-sm font-bold">Riwayat</h3>
      <div className="space-y-2 pb-32">
        {transactions.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            Belum ada transaksi. Tulis transaksi di bawah ↓
          </p>
        )}
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.type === "income" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              {t.type === "income" ? <ArrowDownCircle className="h-5 w-5" /> : <ArrowUpCircle className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t.description || t.category}</p>
              <p className="text-[11px] uppercase text-muted-foreground">{t.category}</p>
            </div>
            <p className={`whitespace-nowrap text-sm font-bold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
              {t.type === "income" ? "+" : "−"}{fmtIDR(t.amount)}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="fixed bottom-[68px] left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card/95 p-3 backdrop-blur"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Contoh: jual 3 keripik pisang 20rb, beli minyak 35rb"
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={busy || !text.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft transition disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </AppShell>
  );
}
