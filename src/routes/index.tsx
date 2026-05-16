import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { TutorialAbout } from "@/components/TutorialAbout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { generateContent } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Camera, Copy, Loader2, Share2, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/")({ component: KontenPage });

interface ContentResult {
  captions: string[];
  description: string;
  hashtags: string[];
}

function KontenPage() {
  const { user } = useAuth();
  const fnGenerate = useServerFn(generateContent);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ContentResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("File harus berupa gambar");
    if (f.size > 8 * 1024 * 1024) return toast.error("Ukuran maksimal 8MB");
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
  };

  const handleGenerate = async () => {
    if (!file || !user) return;
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const r = await fnGenerate({ data: { imageUrl: pub.publicUrl, note: note || undefined } });
      setResult(r);
      toast.success("Konten siap!");
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat konten");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Konten Pintar" subtitle="Foto produk → caption siap pakai">
      {!previewUrl ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 text-center transition hover:bg-primary/10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Camera className="h-7 w-7" />
          </div>
          <div>
            <p className="text-base font-semibold">Unggah foto produk</p>
            <p className="text-xs text-muted-foreground">Ketuk untuk pilih dari galeri / kamera</p>
          </div>
        </button>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-card">
          <img src={previewUrl} alt="Pratinjau produk" className="h-64 w-full object-cover" />
          <button
            onClick={() => { setFile(null); setPreviewUrl(null); setResult(null); }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-soft"
            aria-label="Hapus"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Catatan (opsional)
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Misal: keripik pisang manis, harga 15rb"
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        disabled={!file || busy}
        onClick={handleGenerate}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? "AI sedang berkarya…" : "Buat Konten"}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <ResultBlock title="Caption" tone="3 variasi gaya">
            {result.captions.map((c, i) => (
              <CopyCard key={i} text={c} label={["Santai", "Formal", "Persuasif"][i]} />
            ))}
          </ResultBlock>
          <ResultBlock title="Deskripsi Produk">
            <CopyCard text={result.description} />
          </ResultBlock>
          <ResultBlock title="Hashtag">
            <div className="rounded-xl bg-muted/60 p-3">
              <p className="break-words text-sm leading-relaxed text-accent-foreground">
                {result.hashtags.map((h) => `#${h}`).join(" ")}
              </p>
              <CopyButton text={result.hashtags.map((h) => `#${h}`).join(" ")} className="mt-2" />
            </div>
          </ResultBlock>
        </div>
      )}
      <div className="mt-6">
        <TutorialAbout variant="home" />
      </div>
    </AppShell>
  );
}

function ResultBlock({ title, tone, children }: { title: string; tone?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        {tone && <span className="text-[11px] text-muted-foreground">{tone}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function CopyCard({ text, label }: { text: string; label?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-soft">
      {label && <span className="mb-1 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">{label}</span>}
      <p className="text-sm leading-relaxed">{text}</p>
      <div className="mt-2 flex gap-2">
        <CopyButton text={text} />
        <ShareButton text={text} />
      </div>
    </div>
  );
}

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.success("Disalin");
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 ${className}`}
    >
      <Copy className="h-3.5 w-3.5" /> Salin
    </button>
  );
}

function ShareButton({ text }: { text: string }) {
  if (typeof navigator === "undefined" || !("share" in navigator)) return null;
  return (
    <button
      onClick={() => navigator.share?.({ text }).catch(() => {})}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent/20 px-2.5 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/30"
    >
      <Share2 className="h-3.5 w-3.5" /> Bagikan
    </button>
  );
}
