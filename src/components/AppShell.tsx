import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "./BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut, Sprout } from "lucide-react";
import { OnboardingTour } from "./OnboardingTour";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: Props) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Memuat…
      </div>
    );
  }

  return (
    <div className="app-shell flex flex-col">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={async () => {
            await signOut();
            navigate({ to: "/login" });
          }}
          aria-label="Keluar"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
