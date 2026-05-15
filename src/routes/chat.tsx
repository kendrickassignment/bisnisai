import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { generateReplies } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Copy, Loader2, MessageCircle, Share2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/chat")({ component: ChatPage });

const TONES = ["Ramah", "Profesional", "Singkat"] as const;

function ChatPage() {
  const fn = useServerFn(generateReplies);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);

  const onGenerate = async () => {
    if (!question.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fn({ data: { question: question.trim() } });
      setReplies(r.replies);
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat balasan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Balas Pelanggan" subtitle="Dapat 3 opsi balasan profesional">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium">
        <MessageCircle className="h-4 w-4 text-primary" /> Pertanyaan dari pembeli
      </label>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        placeholder='Contoh: "Harga berapa kak? Bisa COD?"'
        className="w-full resize-none rounded-2xl border border-input bg-card px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        disabled={!question.trim() || busy}
        onClick={onGenerate}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? "Menyusun balasan…" : "Buat Balasan"}
      </button>

      {replies.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold">Pilihan balasan</h3>
          {replies.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <span className="inline-block rounded-full bg-accent/25 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
                {TONES[i] ?? `Opsi ${i + 1}`}
              </span>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{r}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(r); toast.success("Disalin"); }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                >
                  <Copy className="h-3.5 w-3.5" /> Salin
                </button>
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button
                    onClick={() => navigator.share?.({ text: r }).catch(() => {})}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-accent/20 px-2.5 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/30"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Bagikan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
