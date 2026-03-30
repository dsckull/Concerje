import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Package, UserCheck, Wrench,
  DollarSign, CalendarDays, CalendarCheck, Scale, ShieldAlert,
  Layers, Menu, ChevronRight, Building2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/moradores", icon: Users, label: "Moradores" },
      { href: "/importar", icon: Layers, label: "Importar" },
    ]
  },
  {
    label: "Portaria",
    items: [
      { href: "/encomendas", icon: Package, label: "Encomendas" },
      { href: "/visitantes", icon: UserCheck, label: "Visitantes" },
    ]
  },
  {
    label: "Gestão",
    items: [
      { href: "/ocorrencias", icon: Wrench, label: "Ocorrências" },
      { href: "/financeiro", icon: DollarSign, label: "Financeiro" },
      { href: "/assembleias", icon: CalendarDays, label: "Assembleias" },
      { href: "/reservas", icon: CalendarCheck, label: "Reservas" },
    ]
  },
  {
    label: "Segurança & Jurídico",
    items: [
      { href: "/juridico", icon: Scale, label: "Jurídico" },
      { href: "/defcom", icon: ShieldAlert, label: "DefCom", badge: true },
    ]
  }
];

interface SidebarNavProps {
  location: string;
  criticalCount: number;
  onNavClick: () => void;
}

function SidebarNav({ location, criticalCount, onNavClick }: SidebarNavProps) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0 gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base tracking-widest text-white leading-none">CONSERJE</h2>
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Gestão Condominial</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-1.5 select-none">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location === item.href;
                const badgeCount = item.badge ? criticalCount : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavClick}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg transition-all duration-150 group relative text-sm",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/20 shadow-sm shadow-primary/10"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-border/60 hover:text-white border border-transparent"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 mr-2.5 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"
                      )}
                    />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-white animate-pulse min-w-[18px] text-center">
                        {badgeCount}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 text-primary/50 ml-1" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User badge */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-border/60 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-display font-bold text-primary">SY</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">Síndico Admin</p>
            <p className="text-[10px] text-emerald-400 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Turno Ativo
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: alerts } = useQuery<Array<{ arquivado: boolean; nivel_risco: string }>>({
    queryKey: ["alertas", "active"],
    queryFn: async () => {
      const res = await fetch("/api/alertas?resolvido=false");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 25000,
  });
  const criticalCount = Array.isArray(alerts) ? alerts.filter(
    a => !a.arquivado && (a.nivel_risco === "critico" || a.nivel_risco === "alto")
  ).length : 0;


  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-60 border-r border-sidebar-border bg-sidebar flex-col hidden md:flex shrink-0 overflow-hidden">
        <SidebarNav
          location={location}
          criticalCount={criticalCount}
          onNavClick={() => {}}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-10 shadow-2xl">
            <SidebarNav
              location={location}
              criticalCount={criticalCount}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {/* Mobile header */}
        <header className="md:hidden h-14 border-b border-border bg-sidebar flex items-center px-4 gap-3 shrink-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-white transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm tracking-widest text-white">CONSERJE</span>
          </div>
          {criticalCount > 0 && (
            <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-white animate-pulse">
              {criticalCount} alertas
            </span>
          )}
        </header>

        {/* Subtle dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(240 10% 20%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto relative z-10 mt-14 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
