import { useGetDashboardStats, useListAlertas } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Package, UserCheck, Wrench, DollarSign, CalendarDays,
  ShieldAlert, Users, TrendingUp, TrendingDown, RefreshCcw, ArrowRight
} from "lucide-react";
import { cn, formatDateTime, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats({ query: { refetchInterval: 30000, queryKey: ['dashStats'] } as any });
  const { data: alerts } = useListAlertas({ resolvido: false }, { query: { refetchInterval: 30000, queryKey: ['dashAlerts'] } as any });

  const criticalAlerts = alerts?.filter(a => !a.arquivado && (a.nivel_risco === "critico" || a.nivel_risco === "alto")) || [];

  const kpiCards = [
    { label: "Encomendas Pendentes", value: stats?.encomendas_pendentes ?? "—", icon: Package, color: "text-amber-400", bg: "bg-amber-500/10", href: "/encomendas" },
    { label: "Visitantes no Condomínio", value: stats?.visitantes_dentro ?? "—", icon: UserCheck, color: "text-sky-400", bg: "bg-sky-500/10", href: "/visitantes" },
    { label: "Ocorrências Abertas", value: stats?.ocorrencias_abertas ?? "—", icon: Wrench, color: "text-orange-400", bg: "bg-orange-500/10", href: "/ocorrencias" },
    { label: "Moradores Inadimplentes", value: stats?.inadimplentes ?? "—", icon: Users, color: "text-red-400", bg: "bg-red-500/10", href: "/moradores" },
    { label: "Saldo do Caixa", value: stats ? formatCurrency(stats.saldo_caixa) : "—", icon: stats?.saldo_caixa && stats.saldo_caixa >= 0 ? TrendingUp : TrendingDown, color: stats?.saldo_caixa && stats.saldo_caixa >= 0 ? "text-emerald-400" : "text-red-400", bg: stats?.saldo_caixa && stats.saldo_caixa >= 0 ? "bg-emerald-500/10" : "bg-red-500/10", href: "/financeiro" },
    { label: "Alertas Críticos Ativos", value: stats?.alertas_criticos ?? "—", icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", href: "/defcom" },
    { label: "Total de Moradores Ativos", value: stats?.total_moradores ?? "—", icon: Users, color: "text-violet-400", bg: "bg-violet-500/10", href: "/moradores" },
    { label: "Próxima Assembleia", value: stats?.proxima_assembleia ? new Date(stats.proxima_assembleia).toLocaleDateString("pt-BR") : "Nenhuma", icon: CalendarDays, color: "text-blue-400", bg: "bg-blue-500/10", href: "/assembleias" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3">
            <span className="text-primary">●</span> Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Visão geral do condomínio em tempo real</p>
        </div>
        {isLoading && <RefreshCcw className="w-4 h-4 text-muted-foreground animate-spin" />}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all cursor-pointer group hover:shadow-lg hover:shadow-black/20">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-lg border border-border", card.bg)}>
                  <card.icon className={cn("w-4 h-4", card.color)} />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors mt-1" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className={cn("text-2xl font-display font-bold", card.color)}>{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Critical alerts */}
      {criticalAlerts.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-destructive animate-pulse" />
            <h3 className="font-display font-semibold text-destructive uppercase tracking-wide text-sm">Alertas Críticos Ativos</h3>
          </div>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="flex items-center gap-3 bg-black/30 rounded-lg px-4 py-3 border border-destructive/20">
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase", alert.nivel_risco === "critico" ? "bg-destructive/20 text-destructive" : "bg-orange-500/20 text-orange-400")}>
                  {alert.nivel_risco}
                </span>
                <span className="text-sm font-medium text-white">{alert.tipo_ameaca}</span>
                <span className="text-xs text-muted-foreground ml-auto">{formatDateTime(alert.data_alerta)}</span>
              </div>
            ))}
          </div>
          <Link href="/defcom" className="mt-3 flex items-center gap-1 text-xs text-destructive hover:underline">
            Ver todos no DefCom <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Quick access */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Registrar Visitante", href: "/visitantes", color: "bg-sky-500/10 border-sky-500/20 hover:border-sky-500/50 text-sky-400" },
          { label: "Ver Encomendas", href: "/encomendas", color: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50 text-amber-400" },
          { label: "Nova Ocorrência", href: "/ocorrencias", color: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50 text-orange-400" },
          { label: "Área Jurídica", href: "/juridico", color: "bg-violet-500/10 border-violet-500/20 hover:border-violet-500/50 text-violet-400" },
        ].map(item => (
          <Link key={item.label} href={item.href}>
            <div className={cn("border rounded-xl p-4 text-center text-sm font-semibold transition-all cursor-pointer", item.color)}>
              {item.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
