import { useState } from "react";
import {
  Camera,
  Wallet,
  MessageSquareHeart,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  ChevronDown,
  BookOpen,
  Info,
} from "lucide-react";

interface Props {
  /** "login" hides the bottom-nav reference; "home" shows it. */
  variant?: "login" | "home";
}

const steps = [
  {
    icon: Camera,
    title: "1. Konten Pintar",
    desc: "Ketuk tab Konten, unggah foto produk, tambahkan catatan singkat (misal: keripik pisang 15rb). AI akan membuatkan 3 caption, deskripsi, dan hashtag siap pakai untuk media sosial.",
  },
  {
    icon: Wallet,
    title: "2. Kasir Ngobrol",
    desc: "Buka tab Keuangan, ketik transaksi pakai bahasa sehari-hari, misal \"jual 3 keripik 20rb\" atau \"beli minyak 25rb\". AI otomatis mencatat sebagai pemasukan/pengeluaran.",
  },
  {
    icon: MessageSquareHeart,
    title: "3. Balas Pelanggan",
    desc: "Masuk tab Balas, salin chat pelanggan, AI memberi 3 pilihan balasan: ramah, profesional, dan singkat. Tinggal salin & kirim ke WhatsApp.",
  },
];

const values = [
  {
    icon: Sparkles,
    title: "Untuk UMKM Indonesia",
    desc: "Dibuat khusus untuk pelaku usaha mikro: bahasa Indonesia, contoh nyata, tanpa istilah teknis.",
  },
  {
    icon: ShieldCheck,
    title: "Aman & Pribadi",
    desc: "Data transaksi dan akun Anda tersimpan aman. Hanya Anda yang bisa melihat catatan keuangan Anda.",
  },
  {
    icon: HeartHandshake,
    title: "Mudah Dipakai",
    desc: "Tidak perlu keahlian khusus. Cukup ketik atau ambil foto — AI yang kerjakan sisanya.",
  },
];

export function TutorialAbout({ variant = "home" }: Props) {
  const [openTut, setOpenTut] = useState(variant === "login");
  const [openAbout, setOpenAbout] = useState(false);

  return (
    <section className="space-y-3">
      {/* Tutorial */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <button
          onClick={() => setOpenTut((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={openTut}
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Tutorial Singkat</span>
              <span className="block text-[11px] text-muted-foreground">
                3 langkah pakai BisnisAI
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${openTut ? "rotate-180" : ""}`}
          />
        </button>
        {openTut && (
          <div className="space-y-3 border-t border-border px-4 py-4">
            {steps.map((s) => (
              <div key={s.title} className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <s.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
            {variant === "home" && (
              <p className="rounded-xl bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                💡 Gunakan menu bawah untuk berpindah antar fitur kapan saja.
              </p>
            )}
            {variant === "login" && (
              <p className="rounded-xl bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                💡 Daftar gratis dulu, lalu masuk untuk mulai mencoba semua fitur.
              </p>
            )}
          </div>
        )}
      </div>

      {/* About */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <button
          onClick={() => setOpenAbout((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          aria-expanded={openAbout}
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
              <Info className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Tentang Kami</span>
              <span className="block text-[11px] text-muted-foreground">
                Apa itu BisnisAI?
              </span>
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${openAbout ? "rotate-180" : ""}`}
          />
        </button>
        {openAbout && (
          <div className="space-y-3 border-t border-border px-4 py-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">BisnisAI</span> adalah
              asisten berbasis kecerdasan buatan (AI) yang dibuat untuk membantu
              pelaku <span className="font-semibold">Usaha Mikro, Kecil, dan
              Menengah (UMKM)</span> di Indonesia. Kami percaya teknologi modern
              harus bisa dipakai siapa saja — bahkan yang baru pertama kali pegang
              smartphone untuk berjualan.
            </p>
            <div className="space-y-2.5">
              {values.map((v) => (
                <div key={v.title} className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
                    <v.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{v.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="rounded-xl bg-muted/60 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Misi kami: bantu jutaan UMKM Indonesia naik kelas lewat AI yang
              mudah, ramah, dan berbahasa Indonesia.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
