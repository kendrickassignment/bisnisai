import { Link, useLocation } from "@tanstack/react-router";
import { Sparkles, Wallet, MessageCircle } from "lucide-react";

const tabs = [
  { to: "/", label: "Konten", Icon: Sparkles },
  { to: "/finance", label: "Keuangan", Icon: Wallet },
  { to: "/chat", label: "Pelanggan", Icon: MessageCircle },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <ul className="mx-auto flex max-w-[430px] items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-9 w-12 items-center justify-center rounded-full transition-all ${
                    active ? "bg-primary/10" : ""
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
