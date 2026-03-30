import { useState } from "react";
import { useListVisitantes, useCreateVisitante, useRegistrarSaida } from "@workspace/api-client-react";
import { UserCheck, Plus, LogOut, RefreshCcw, Clock, CheckCircle2 } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListVisitantesQueryKey } from "@workspace/api-client-react";

const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  visitante: { label: "Visitante", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  entregador: { label: "Entregador", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  prestador: { label: "Prestador", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
  tecnico: { label: "Técnico", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
};

export default function VisitantesPage() {
  const [filtro, setFiltro] = useState<"todos" | "dentro">("dentro");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", documento: "", telefone: "", destino_apartamento: "", destino_bloco: "", motivo: "visita", tipo: "visitante" });
  const qc = useQueryClient();

  const { data: visitantes, isLoading, isFetching } = useListVisitantes(
    { dentro: filtro === "dentro" ? true : undefined },
    { query: { refetchInterval: 15000, queryKey: getListVisitantesQueryKey() } as any }
  );
  const { mutate: createVisitante, isPending: isCreating } = useCreateVisitante({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListVisitantesQueryKey() }); setShowForm(false); setForm({ nome: "", documento: "", telefone: "", destino_apartamento: "", destino_bloco: "", motivo: "visita", tipo: "visitante" }); } } });
  const { mutate: registrarSaida, isPending: isSaindo } = useRegistrarSaida({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListVisitantesQueryKey() }) } });

  const dentro = visitantes?.filter(v => !v.saida).length || 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3"><UserCheck className="w-7 h-7 text-primary" /> Portaria — Visitantes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Controle de entrada e saída em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && <RefreshCcw className="w-4 h-4 animate-spin text-muted-foreground" />}
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-display font-bold text-sky-400">{dentro}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">No Cond.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Registrar Entrada
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-white">Registrar Entrada</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[["nome","Nome Completo*"],["documento","CPF/RG"],["telefone","Telefone"],["destino_apartamento","Apartamento Destino*"],["destino_bloco","Bloco*"],["motivo","Motivo"]].map(([key, label]) => (
              <input key={key} placeholder={label} value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            ))}
            <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="visitante">Visitante</option>
              <option value="entregador">Entregador</option>
              <option value="prestador">Prestador de Serviço</option>
              <option value="tecnico">Técnico</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createVisitante({ data: form })} disabled={isCreating || !form.nome || !form.destino_apartamento || !form.destino_bloco}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {isCreating ? "Registrando..." : "Confirmar Entrada"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-secondary text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(["dentro","todos"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)} className={cn("px-4 py-2 rounded-lg text-sm font-medium border transition-colors", filtro === f ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white")}>
            {f === "dentro" ? "No Condomínio" : "Todos (hoje)"}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-xs">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Destino</th>
              <th className="px-5 py-3">Entrada</th>
              <th className="px-5 py-3">Saída</th>
              <th className="px-5 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />Carregando...</td></tr>
            ) : visitantes?.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>
            ) : visitantes?.map(v => {
              const conf = TIPO_CONFIG[v.tipo] || TIPO_CONFIG.visitante;
              return (
                <tr key={v.id} className={cn("hover:bg-secondary/20 transition-colors", v.saida && "opacity-60")}>
                  <td className="px-5 py-3 font-medium text-white">{v.nome}</td>
                  <td className="px-5 py-3"><span className={cn("px-2.5 py-1 rounded-full border text-xs font-semibold", conf.color)}>{conf.label}</span></td>
                  <td className="px-5 py-3 text-muted-foreground">{v.destino_morador || `Apto ${v.destino_apartamento}/${v.destino_bloco}`}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{formatDateTime(v.entrada)}</td>
                  <td className="px-5 py-3">
                    {v.saida ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="w-3 h-3" />{formatDateTime(v.saida)}</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-400"><Clock className="w-3 h-3" />No condomínio</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!v.saida && (
                      <button onClick={() => registrarSaida({ id: v.id })} disabled={isSaindo}
                        className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ml-auto disabled:opacity-50">
                        <LogOut className="w-3 h-3" /> Registrar Saída
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
