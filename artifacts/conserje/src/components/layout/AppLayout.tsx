import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Package, BarChart3, ShieldAlert, Layers } from "lucide-react";
import { useListAlertas } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  // Poll for active critical/high alerts every 30 seconds
  const { data: alerts } = useListAlertas(
    { resolvido: false },
    { query: { refetchInterval: 30000 } }
  );

  const criticalCount = alerts?.filter(a => !a.arquivado && (a.nivel_risco === 'critico' || a.nivel_risco === 'alto')).length || 0;

  const navItems = [
    { href: "/", icon: Package, label: "Encomendas" },
    { href: "/relatorios", icon: BarChart3, label: "Relatórios" },
    { href: "/defcom", icon: ShieldAlert, label: "DefCom", badge: criticalCount > 0 ? criticalCount : null },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <Layers className="w-6 h-6 text-primary mr-3" />
          <h1 className="font-display font-bold text-xl tracking-wider text-white">CONSERJE</h1>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-sidebar-foreground hover:bg-sidebar-border hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                {item.label}
                {item.badge !== null && (
                  <span className={cn(
                    "absolute right-3 px-2 py-0.5 rounded-full text-xs font-bold",
                    item.badge > 0 ? "bg-destructive text-white animate-pulse-red" : "bg-muted text-muted-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border shrink-0">
          <div className="flex items-center px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
              <span className="text-xs font-display font-bold">OP</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Operador</p>
              <p className="text-xs text-muted-foreground">Turno Alfa</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle grid background effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20"></div>
        <div className="flex-1 overflow-y-auto z-10 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
