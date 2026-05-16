import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  Camera,
  Wallet,
  MessageSquareHeart,
  Sparkles,
  X,
  ArrowRight,
  Check,
} from "lucide-react";

interface Step {
  icon: typeof Camera;
  badge: string;
  title: string;
  desc: string;
  example: string;
  goTo?: "/" | "/finance" | "/chat";
  goLabel?: string;
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    badge: "Halo!",
    title: "Selamat datang di BisnisAI 👋",
    desc: "Asisten AI yang bantu kamu jualan online: bikin konten promosi, catat keuangan, dan balas pelanggan — semua pakai bahasa sehari-hari.",
    example:
      "Tur singkat ini hanya 4 langkah. Kamu bisa lewati kapan saja dengan tombol Lewati di pojok.",
  },
  {
    icon: Camera,
    badge: "Langkah 1 dari 3",
    title: "Konten Pintar",
    desc: "Ambil/unggah foto produkmu. Tambahkan catatan singkat seperti harga atau bahan. AI bikin 3 caption, deskripsi, dan hashtag siap pakai.",
    example: 'Contoh: foto keripik + catatan "keripik pisang manis 15rb"',
    goTo: "/",
    goLabel: "Buka Konten",
  },
  {
    icon: Wallet,
    badge: "Langkah 2 dari 3",
    title: "Kasir Ngobrol",
    desc: "Catat pemasukan & pengeluaran dengan mengetik biasa. Tidak perlu kategori atau form ribet — AI yang pilihkan.",
    example: 'Coba ketik: "jual 3 keripik 20rb" atau "beli minyak 25rb"',
    goTo: "/finance",
    goLabel: "Buka Keuangan",
  },
  {
    icon: MessageSquareHeart,
    badge: "Langkah 3 dari 3",
    title: "Balas Pelanggan",
    desc: "Salin pertanyaan pelanggan dari WhatsApp/DM. AI menyiapkan 3 gaya balasan: ramah, profesional, dan singkat. Tinggal salin & kirim.",
    example:
      "Tips: isi panel Info Produk sekali, balasan AI jadi makin akurat soal harga/COD/pengiriman.",
    goTo: "/chat",
    goLabel: "Buka Chat",
  },
];

const STORAGE_KEY = "bisnisai_onboarded";

export function OnboardingTour() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (loading || !user) return;
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY}_${user.id}`;
    if (!localStorage.getItem(key)) setOpen(true);
  }, [user, loading]);

  if (!user || !open) return null;

  const finish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, "1");
    }
    setOpen(false);
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-6 backdrop-blur-sm sm:items-center"
    >
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl bg-card shadow-card animate-in fade-in slide-in-from-bottom-4">
        {/* Skip */}
        <button
          onClick={finish}
          className="absolute right-3 top-3 z-10 flex h-8 items-center gap-1 rounded-full bg-muted/70 px-3 text-[11px] font-medium text-muted-foreground hover:bg-muted"
          aria-label="Lewati tur"
        >
          Lewati <X className="h-3 w-3" />
        </button>

        {/* Hero */}
        <div className="bg-gradient-primary px-6 pb-8 pt-10 text-center text-primary-foreground">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon className="h-7 w-7" />
          </div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-80">
            {current.badge}
          </p>
          <h2 id="onboarding-title" className="text-xl font-bold">
            {current.title}
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-3 px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground">{current.desc}</p>
          <p className="rounded-xl bg-muted/60 px-3 py-2.5 text-[12px] leading-relaxed text-muted-foreground">
            {current.example}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-primary"
                    : i < step
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                Kembali
              </button>
            )}
            {current.goTo && (
              <button
                onClick={() => {
                  navigate({ to: current.goTo! });
                }}
                className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/15"
              >
                {current.goLabel}
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
            >
              {isLast ? (
                <>
                  <Check className="h-4 w-4" /> Mulai pakai
                </>
              ) : (
                <>
                  Lanjut <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
