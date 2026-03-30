import { useState } from "react";
import { useListAlertas, useUpdateAlerta } from "@workspace/api-client-react";
import { ShieldAlert, AlertOctagon, CheckCircle2, Siren, Archive, RefreshCcw } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListAlertasQueryKey } from "@workspace/api-client-react";

const NIVEL_CONFIG: Record<string, { label: string; class: string; icon: any }> = {
  critico: { label: "Crítico", class: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertOctagon },
  alto: { label: "Alto", class: "bg-orange-500/10 text-orange-400 border-orange-500/30", icon: AlertOctagon },
  medio: { label: "Médio", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: AlertOctagon },
  baixo: { label: "Baixo", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
};

export default function DefComPage() {
  const [filterAtivos, setFilterAtivos] = useState(true);
  const qc = useQueryClient();

  const { data: alertas, isLoading, isFetching } = useListAlertas(
    { resolvido: filterAtivos ? false : undefined },
    { query: { refetchInterval: 15000, queryKey: getListAlertasQueryKey() } as any }
  );
  const { mutate: updateAlerta, isPending: isUpdating } = useUpdateAlerta({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListAlertasQueryKey() }) } });

  const criticos = alertas?.filter(a => !a.arquivado && (a.nivel_risco === "critico" || a.nivel_risco === "alto")) || [];
  const todos = alertas || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3">
            <ShieldAlert className={cn("w-7 h-7", criticos.length > 0 ? "text-destructive animate-pulse" : "text-primary")} />
            Módulo DefCom
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestão de ameaças e segurança perimetral</p>
        </div>

        <button 
          onClick={() => setFilterAtivos(!filterAtivos)}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
            filterAtivos 
              ? "bg-primary/20 border-primary text-primary" 
              : "bg-secondary border-border text-muted-foreground hover:text-white"
          )}
        >
          {filterAtivos ? "Mostrando Ativos" : "Mostrando Todos"}
        </button>
      </div>

      {criticos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {criticos.map(alerta => (
            <div 
              key={`crit-${alerta.id}`} 
              className={cn(
                "bg-black/50 rounded-xl p-5 relative overflow-hidden group border-2",
                alerta.nivel_risco === "critico" 
                  ? "border-destructive/50 shadow-[0_0_20px_rgba(255,0,0,0.3)] animate-pulse" 
                  : "border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
              )}
            >
              <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none", alerta.nivel_risco === "critico" ? "bg-destructive/20" : "bg-orange-500/10")}></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <AlertOctagon className={cn("w-5 h-5", alerta.nivel_risco === "critico" ? "text-destructive" : "text-orange-500")} />
                  <span className="font-display font-bold uppercase text-white tracking-widest text-sm">{alerta.tipo_ameaca}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{formatDateTime(alerta.data_alerta)}</span>
              </div>
              
              <p className="text-gray-300 text-sm mb-6 relative z-10 leading-relaxed">{alerta.descricao}</p>

              <div className="flex gap-2 relative z-10">
                <button
                  onClick={() => updateAlerta({ id: alerta.id, data: { arquivado: true } })}
                  disabled={isUpdating}
                  className="flex-1 bg-secondary/80 hover:bg-secondary border border-border text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Archive className="w-3.5 h-3.5" /> Arquivar
                </button>
                <button
                  onClick={() => updateAlerta({ id: alerta.id, data: { autoridades_acionadas: true } })}
                  disabled={alerta.autoridades_acionadas || isUpdating}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-white shadow-[0_0_10px_rgba(255,0,0,0.4)] text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Siren className="w-3.5 h-3.5" /> {alerta.autoridades_acionadas ? "Acionado" : "Acionar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-lg shadow-black/20 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-secondary/30 flex justify-between items-center">
          <h3 className="font-display font-semibold text-lg text-white">Registro de Ocorrências</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isFetching && <RefreshCcw className="w-3.5 h-3.5 animate-spin" />}
            <span>{todos.length} alerta{todos.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Data/Hora</th>
                <th className="px-6 py-4 font-semibold">Nível</th>
                <th className="px-6 py-4 font-semibold">Ameaça</th>
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /></td></tr>
              ) : todos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground"><CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-500" />Nenhum alerta ativo. Perímetro seguro.</td></tr>
              ) : (
                todos.map((alerta) => {
                  const nivelConf = NIVEL_CONFIG[alerta.nivel_risco] || NIVEL_CONFIG.baixo;
                  const NivelIcon = nivelConf.icon;
                  return (
                    <tr key={alerta.id} className={cn("hover:bg-secondary/30 transition-colors", alerta.arquivado && "opacity-60")}>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{formatDateTime(alerta.data_alerta)}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded border text-xs font-bold uppercase inline-flex items-center gap-1.5", nivelConf.class)}>
                          <NivelIcon className="w-3 h-3" />{nivelConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{alerta.tipo_ameaca}</td>
                      <td className="px-6 py-4 text-gray-300 truncate max-w-xs" title={alerta.descricao}>{alerta.descricao}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {alerta.arquivado && <span className="bg-secondary px-2 py-0.5 rounded text-[10px] text-muted-foreground text-center">Arquivado</span>}
                          {alerta.autoridades_acionadas && <span className="bg-destructive/20 text-destructive border border-destructive/20 px-2 py-0.5 rounded text-[10px] font-bold text-center">Polícia Acionada</span>}
                          {!alerta.arquivado && !alerta.autoridades_acionadas && <span className="text-emerald-500 text-xs text-center">Pendente</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!alerta.arquivado && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateAlerta({ id: alerta.id, data: { arquivado: true } })}
                              className="text-muted-foreground hover:text-white p-1.5 rounded hover:bg-secondary transition-colors"
                              title="Arquivar"
                              disabled={isUpdating}
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateAlerta({ id: alerta.id, data: { autoridades_acionadas: true } })}
                              disabled={alerta.autoridades_acionadas || isUpdating}
                              className="text-destructive hover:text-destructive/80 p-1.5 rounded hover:bg-destructive/10 transition-colors disabled:opacity-30"
                              title="Acionar Autoridades"
                            >
                              <Siren className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
