import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { generateReplies } from "@/lib/ai.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookText,
  Check,
  ChevronDown,
  Copy,
  Eye,
  Loader2,
  MessageCircle,
  Save,
  Share2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/chat")({ component: ChatPage });

const TONES = ["Ramah", "Profesional", "Singkat"] as const;

const KNOWLEDGE_TEMPLATE = `Nama toko: 
Produk utama: 
Harga: 
Lokasi / pengiriman: 
Metode pembayaran: 
Jam operasional: 
Promo / catatan khusus: `;

function ChatPage() {
  const { user } = useAuth();
  const fn = useServerFn(generateReplies);

  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);

  // product knowledge
  const storageKey = user ? `bisnisai_knowledge_${user.id}` : "bisnisai_knowledge";
  const [knowledge, setKnowledge] = useState("");
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setKnowledge(stored);
      setKnowledgeOpen(false);
    } else {
      setKnowledge(KNOWLEDGE_TEMPLATE);
      setKnowledgeOpen(true);
    }
  }, [storageKey]);

  const saveKnowledge = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, knowledge);
    setSavedAt(Date.now());
    toast.success("Info produk disimpan di perangkat ini");
  };

  const clearKnowledge = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(storageKey);
    setKnowledge(KNOWLEDGE_TEMPLATE);
    toast.message("Info produk dihapus");
  };

  const fillExample = () => {
    setKnowledge(
      `Nama toko: Keripik Mama Sari
Produk utama: Keripik pisang manis & asin, keripik singkong balado
Harga: Rp 15.000 / 200gr, Rp 25.000 / 500gr
Lokasi / pengiriman: Bandung, kirim via JNE/J&T seluruh Indonesia
Metode pembayaran: Transfer BCA, GoPay, ShopeePay, COD area Bandung
Jam operasional: Senin–Sabtu, 08.00–17.00
Promo / catatan khusus: Beli 3 gratis ongkir Jabodetabek`,
    );
    setKnowledgeOpen(true);
  };

  const onGenerate = async () => {
    if (!question.trim() || busy) return;
    setBusy(true);
    try {
      const trimmedKnowledge = knowledge.trim();
      const useKnowledge =
        trimmedKnowledge && trimmedKnowledge !== KNOWLEDGE_TEMPLATE.trim()
          ? trimmedKnowledge
          : undefined;
      const r = await fn({
        data: { question: question.trim(), knowledge: useKnowledge },
      });
      setReplies(r.replies);
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat balasan");
    } finally {
      setBusy(false);
    }
  };

  const knowledgeSaved =
    typeof window !== "undefined" && !!localStorage.getItem(storageKey);

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

      {/* Product knowledge panel */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <button
          onClick={() => setKnowledgeOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={knowledgeOpen}
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
              <BookText className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                Info Produk / Toko
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase text-muted-foreground">
                  opsional
                </span>
                {knowledgeSaved && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
                    <Check className="h-2.5 w-2.5" /> aktif
                  </span>
                )}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Bantu AI menjawab harga, stok, COD, dll lebih akurat
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${knowledgeOpen ? "rotate-180" : ""}`}
          />
        </button>

        {knowledgeOpen && (
          <div className="space-y-3 border-t border-border px-4 py-4">
            <p className="rounded-xl bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              💡 Isi info dasar tokomu sekali saja. AI akan pakai info ini setiap
              membuat balasan, jadi jawaban lebih cocok & nggak ngarang. Tersimpan
              di perangkat ini.
            </p>
            <textarea
              value={knowledge}
              onChange={(e) => setKnowledge(e.target.value)}
              rows={9}
              placeholder={KNOWLEDGE_TEMPLATE}
              className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveKnowledge}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-3.5 w-3.5" /> Simpan
              </button>
              <button
                onClick={fillExample}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                <Wand2 className="h-3.5 w-3.5" /> Isi contoh
              </button>
              {knowledgeSaved && (
                <button
                  onClick={clearKnowledge}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80"
                >
                  Hapus
                </button>
              )}
              {savedAt && (
                <span className="ml-auto self-center text-[10px] text-muted-foreground">
                  Tersimpan ✓
                </span>
              )}
            </div>
          </div>
        )}
      </div>

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
